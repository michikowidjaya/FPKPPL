// File: controllers/pelanggan.controller.js

const pool = require('../config/db'); // Pastikan Anda mengimpor koneksi database dari konfigurasinya
const axios = require('axios'); // <-- TAMBAHKAN INI untuk membuat HTTP request ke Midtrans

// Konfigurasi Midtrans Anda (sangat disarankan untuk menggunakan .env)
// Pastikan Anda telah mengatur MIDTRANS_SERVER_KEY di file .env Anda
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-opCWhiWrsxrtPcs_lwzvx-1K'; // Ganti dengan Server Key Midtrans Anda
const MIDTRANS_SNAP_API_URL = process.env.MIDTRANS_SNAP_API_URL || 'https://app.sandbox.midtrans.com/snap/v1/transactions'; // URL Snap API (Sandbox untuk development)

/**
 * @desc    Melihat semua produk yang tersedia
 * @route   GET /api/pelanggan/products
 * @access  Public
 */
exports.lihatSemuaProduk = async (req, res) => {
    try {
        // Ambil produk yang stoknya masih ada
        const [products] = await pool.query(
            'SELECT id, name, description, price, stock, image_url, category FROM products WHERE stock > 0'
        );
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error saat mengambil semua produk:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Melihat detail satu produk
 * @route   GET /api/pelanggan/products/:id
 * @access  Public
 */
exports.lihatDetailProduk = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        res.status(200).json({ success: true, data: products[0] });
    } catch (error) {
        console.error('Error saat mengambil detail produk:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Membuat pesanan baru (Checkout)
 * @route   POST /api/pelanggan/orders/checkout
 * @access  Private (Membutuhkan Login)
 */

exports.buatPesanan = async (req, res) => {
    const { items, shipping_address } = req.body;
    
    // Asumsi user sudah login dan ID-nya 1. Ganti dengan req.user.id jika sudah ada sistem login.
    // Jika req.user tidak ada, ini akan menggunakan dummy ID 1.
    const userId = req.user ? req.user.id : 1; 

    if (!items || items.length === 0 || !shipping_address) {
        return res.status(400).json({ success: false, message: 'Keranjang belanja atau alamat tidak boleh kosong.' });
    }

    let connection;
    try {
        // 1. Dapatkan koneksi dari pool untuk memulai transaksi
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 2. Ambil data produk dari DB untuk validasi stok dan harga
        const productIds = items.map(item => item.productId);
        const [products] = await connection.query(`SELECT * FROM products WHERE id IN (?)`, [productIds]);
        
        if (products.length !== items.length) {
            throw new Error('Beberapa produk di keranjang tidak ditemukan di database.');
        }

        const productMap = {};
        products.forEach(p => productMap[p.id] = p);

        let total_amount = 0;
        const itemDetails = []; // Untuk payload Midtrans
        for (const item of items) {
            const product = productMap[item.productId];
            if (product.stock < item.quantity) {
                throw new Error(`Stok produk ${product.name} tidak mencukupi. Sisa: ${product.stock}`);
            }
            total_amount += product.price * item.quantity;

            // Tambahkan detail item untuk payload Midtrans
            itemDetails.push({ 
                id: String(product.id), // ID produk harus string
                price: product.price,
                quantity: item.quantity,
                name: product.name
            });
        }

        // 3. Buat entri di tabel 'orders' dengan status 'pending' atau 'unpaid'
        // Status awal harus pending/unpaid sampai Midtrans mengkonfirmasi pembayaran
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
            [userId, total_amount, shipping_address, 'pending'] // <-- UBAH STATUS INI KE PENDING/UNPAID
        );
        const orderId = orderResult.insertId;

        // 4. Masukkan setiap item ke tabel 'order_items'
        const orderItemsPromises = items.map(item => {
            const product = productMap[item.productId];
            return connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_per_item) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, product.price]
            );
        });
        await Promise.all(orderItemsPromises);

        // =======================================================
        // === LANGKAH BARU: PANGGIL MIDTRANS SNAP API ===
        // =======================================================
        const transactionDetails = {
            transaction_details: {
                order_id: `ORDER-${orderId}-${Date.now()}`, // ID unik untuk Midtrans
                gross_amount: total_amount,
            },
            credit_card: {
                secure: true
            },
            item_details: itemDetails, // Detail produk
            customer_details: { // Detail pelanggan (opsional, tapi disarankan)
                first_name: req.user ? req.user.name.split(' ')[0] : 'Pelanggan',
                last_name: req.user && req.user.name.split(' ').length > 1 ? req.user.name.split(' ').slice(1).join(' ') : 'Toko',
                email: req.user ? req.user.email : `pelanggan${userId}@example.com`,
                phone: '081234567890', // Nomor telepon dummy (ganti dengan data asli jika ada)
                shipping_address: {
                    address: shipping_address,
                    city: 'Surabaya', // Ganti dengan kota yang relevan
                    postal_code: '60111',
                    country_code: 'IDN'
                }
            }
        };

        // Panggil Midtrans Snap API
        const midtransResponse = await axios.post(MIDTRANS_SNAP_API_URL, transactionDetails, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64') // Encoding Server Key
            }
        });

        const midtransToken = midtransResponse.data.token; // Dapatkan token dari respons Midtrans

        // Opsional: Simpan Midtrans transaction ID atau status ke tabel orders jika perlu
        await connection.query('UPDATE orders SET midtrans_transaction_id = ?, status = ? WHERE id = ?', [transactionDetails.transaction_details.order_id, 'pending', orderId]);

        // 5. Kurangi stok produk (tetap di sini, sebelum commit final)
        const updateStockPromises = items.map(item => {
            return connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.productId]
            );
        });
        await Promise.all(updateStockPromises);

        // 6. Jika semua berhasil, commit transaksi
        await connection.commit();

        // Kirim respon sukses ke frontend DENGAN TOKEN MIDTRANS
        res.status(201).json({ 
            success: true, 
            message: 'Pesanan berhasil dibuat. Menunggu pembayaran.', 
            orderId: orderId,
            token: midtransToken // <--- SANGAT PENTING: KIRIM TOKEN INI KE FRONTEND
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error saat membuat pesanan atau memanggil Midtrans:', error.response ? error.response.data : error.message); // Log error yang lebih detail
        res.status(500).json({ 
            success: false, 
            message: error.response && error.response.data && error.response.data.error_messages ? 
                     error.response.data.error_messages.join(', ') : 
                     (error.message || 'Gagal membuat pesanan atau mendapatkan token pembayaran.') 
        });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @desc    Melihat riwayat pesanan milik pengguna yang login
 * @route   GET /api/pelanggan/orders/me
 * @access  Private (Membutuhkan Login)
 */
exports.lihatRiwayatPesanan = async (req, res) => {
    try {
        // Asumsi: ID pengguna didapat dari middleware autentikasi
        // Ganti '1' dengan req.user.id sesungguhnya
        const userId = 1; // req.user.id;
        
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error saat mengambil riwayat pesanan:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};