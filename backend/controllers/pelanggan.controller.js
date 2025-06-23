// File: controllers/pelanggan.controller.js (Versi dengan Perbaikan Syntax Error)

const pool = require('../config/db');
const axios = require('axios');

// Konfigurasi Midtrans dari .env
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-opCWhiWrsxrtPcs_lwzvx-1K';
const MIDTRANS_SNAP_API_URL = process.env.MIDTRANS_SNAP_API_URL || 'https://app.sandbox.midtrans.com/snap/v1/transactions';

// Fungsi untuk melihat produk (tidak ada perubahan)
exports.lihatSemuaProduk = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE stock > 0');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error saat mengambil semua produk:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Fungsi untuk melihat detail produk (tidak ada perubahan)
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

// --- FUNGSI BUAT PESANAN (CHECKOUT) YANG DIPERBARUI ---
exports.buatPesanan = async (req, res) => {
    // 1. Ambil data dari body dan dari middleware otentikasi
    const { items, shipping_address } = req.body;
    const user = req.user; // <-- Data user dari authMiddleware

    // Jika middleware aktif, seharusnya req.user selalu ada.
    if (!user || !user.id) {
        return res.status(401).json({ success: false, message: 'User tidak terautentikasi. Silakan login kembali.' });
    }
    if (!items || items.length === 0 || !shipping_address) {
        return res.status(400).json({ success: false, message: 'Keranjang belanja atau alamat tidak boleh kosong.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const productIds = items.map(item => item.productId);
        const [products] = await connection.query(`SELECT * FROM products WHERE id IN (?)`, [productIds]);
        
        if (products.length !== items.length) {
            throw new Error('Beberapa produk di keranjang tidak ditemukan.');
        }

        const productMap = {};
        products.forEach(p => productMap[p.id] = p);

        let total_amount = 0;
        const itemDetailsForMidtrans = [];
        for (const item of items) {
            const product = productMap[item.productId];
            if (product.stock < item.quantity) {
                throw new Error(`Stok produk ${product.name} tidak mencukupi.`);
            }
            total_amount += product.price * item.quantity;
            itemDetailsForMidtrans.push({ 
                id: String(product.id),
                price: product.price,
                quantity: item.quantity,
                name: product.name
            });
        }

        // PERBAIKAN UTAMA: Menggunakan user.id dari middleware
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
            [user.id, total_amount, shipping_address, 'pending']
        );
        const orderId = orderResult.insertId;

        const orderItemsPromises = items.map(item => {
            const product = productMap[item.productId];
            return connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_per_item) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, product.price]
            );
        });
        await Promise.all(orderItemsPromises);

        const transactionDetails = {
            transaction_details: {
                order_id: `KPK-${orderId}-${Date.now()}`,
                gross_amount: total_amount,
            },
            item_details: itemDetailsForMidtrans,
            customer_details: {
                first_name: user.name.split(' ')[0],
                email: user.email,
            }
        };

        const midtransResponse = await axios.post(MIDTRANS_SNAP_API_URL, transactionDetails, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')
            }
        });

        const midtransToken = midtransResponse.data.token;

        const updateStockPromises = items.map(item => {
            return connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
        });
        await Promise.all(updateStockPromises);

        await connection.commit();

        res.status(201).json({ 
            success: true, 
            message: 'Pesanan berhasil dibuat, menunggu pembayaran.', 
            orderId: orderId,
            token: midtransToken
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error saat membuat pesanan:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: error.message || 'Gagal membuat pesanan.' });
    } finally {
        if (connection) connection.release();
    }
};

// Fungsi untuk melihat riwayat pesanan (juga diperbaiki)
exports.lihatRiwayatPesanan = async (req, res) => {
    try {
        const userId = req.user.id; // <-- Ambil dari middleware, bukan lagi nilai statis
        
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