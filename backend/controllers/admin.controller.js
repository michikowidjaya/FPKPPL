// File: controllers/admin.controller.js

const pool = require('../config/db'); // Impor koneksi database

/**
 * @desc    Admin menambah produk baru
 * @route   POST /api/admin/products
 * @access  Private (Admin)
 */
exports.tambahProdukBaru = async (req, res) => {
    const { name, description, price, stock, image_url, category } = req.body;

    if (!name || !price || stock === undefined) {
        return res.status(400).json({ success: false, message: 'Nama, harga, dan stok wajib diisi.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?)',
            [
                name,
                description,
                price,
                stock,
                image_url || 'images/default.jpg',
                category || 'Umum'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan',
            productId: result.insertId
        });

    } catch (error) {
        console.error("Error saat menambah produk:", error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

/**
 * @desc    Admin mengubah data produk
 * @route   PUT /api/admin/products/:id
 * @access  Private (Admin)
 */
exports.updateProduk = async (req, res) => {
    // Logika untuk mengubah data produk akan ditulis di sini nanti
    // Anda akan membutuhkan: id produk dari req.params.id, dan data update dari req.body
    res.status(200).json({ message: `Fungsi update produk untuk ID ${req.params.id} belum diimplementasikan.` });
};

/**
 * @desc    Admin menghapus produk
 * @route   DELETE /api/admin/products/:id
 * @access  Private (Admin)
 */
exports.hapusProduk = async (req, res) => {
    // Logika untuk menghapus produk akan ditulis di sini nanti
    // Anda akan membutuhkan: id produk dari req.params.id
    res.status(200).json({ message: `Fungsi hapus produk untuk ID ${req.params.id} belum diimplementasikan.` });
};

/**
 * @desc    Admin melihat semua pesanan yang masuk
 * @route   GET /api/admin/orders
 * @access  Private (Admin)
 */
exports.lihatSemuaPesanan = async (req, res) => {
    try {
        // Query untuk mengambil semua pesanan, termasuk nama pelanggan (jika ada tabel users)
        // Asumsi ada tabel 'users' dengan 'id' dan 'name'
        // Jika tidak ada tabel users, Anda bisa hapus JOIN dan ambil hanya data dari tabel orders
        const [orders] = await pool.query(
            `SELECT 
                o.id, 
                o.user_id, 
                u.name AS customer_name, -- Nama pelanggan dari tabel users
                o.total_amount, 
                o.shipping_address, 
                o.status, 
                o.created_at,
                o.midtrans_transaction_id -- Jika ada kolom ini
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id -- Gabungkan dengan tabel users untuk nama pelanggan
            ORDER BY o.created_at DESC`
        );
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error saat melihat semua pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil semua pesanan.' });
    }
};

/**
 * @desc    Admin mengubah status pesanan
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private (Admin)
 */
exports.updateStatusPesanan = async (req, res) => {
    const { id } = req.params; // ID pesanan dari URL
    const { status } = req.body; // Status baru dari body request

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status wajib diisi.' });
    }

    try {
        // Lakukan validasi status (opsional tapi disarankan)
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid.' });
        }

        const [result] = await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
        }

        res.status(200).json({ success: true, message: `Status pesanan ID ${id} berhasil diubah menjadi ${status}.` });
    } catch (error) {
        console.error('Error saat mengubah status pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah status pesanan.' });
    }
};