// File: routes/pelanggan.routes.js

const express = require('express');
const router = express.Router();

// Impor semua controller yang dibutuhkan
const pelangganController = require('../controllers/pelanggan.controller');
const recommendationController = require('../controllers/recommendation.controller'); // <-- (BARU) Impor controller rekomendasi

// Middleware otentikasi (dinonaktifkan sementara sesuai permintaan Anda)
// const { authMiddleware } = require('../middleware/auth'); 

/*
|--------------------------------------------------------------------------
| Rute Publik (Tidak Memerlukan Login)
|--------------------------------------------------------------------------
| Rute-rute ini bisa diakses oleh siapa saja.
*/

// Melihat semua produk
router.get('/products', pelangganController.lihatSemuaProduk);

// Melihat detail satu produk berdasarkan ID
router.get('/products/:id', pelangganController.lihatDetailProduk);

// --- RUTE BARU UNTUK REKOMENDASI AI ---
// Mendapatkan rekomendasi produk berdasarkan userId (bisa untuk user baru/lama)
router.get('/recommendations', recommendationController.getRecommendations);


/*
|--------------------------------------------------------------------------
| Rute Terproteksi (Otentikasi Dinonaktifkan Sementara)
|--------------------------------------------------------------------------
| Seharusnya rute ini menggunakan authMiddleware untuk memastikan hanya
| pelanggan yang sudah login yang bisa mengaksesnya.
*/

// Membuat pesanan / checkout
// SEMULA: router.post('/orders/checkout', authMiddleware, pelangganController.buatPesanan);
router.post('/orders/checkout', pelangganController.buatPesanan); // authMiddleware dihapus sementara

// Melihat riwayat pesanan milik pelanggan yang sedang login
// SEMULA: router.get('/orders/me', authMiddleware, pelangganController.lihatRiwayatPesanan);
router.get('/orders/me', pelangganController.lihatRiwayatPesanan); // authMiddleware dihapus sementara


module.exports = router;