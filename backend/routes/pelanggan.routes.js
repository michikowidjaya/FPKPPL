// File: routes/pelanggan.routes.js (Versi Final dengan Auth Middleware Aktif)

const express = require('express');
const router = express.Router();

const pelangganController = require('../controllers/pelanggan.controller');
const recommendationController = require('../controllers/recommendation.controller');
const { authMiddleware } = require('../middleware/auth'); // <-- SEKARANG KITA AKTIFKAN

/* Rute Publik */
router.get('/products', pelangganController.lihatSemuaProduk);
router.get('/products/:id', pelangganController.lihatDetailProduk);
router.get('/recommendations', recommendationController.getRecommendations);

/* Rute Terproteksi */
// Sekarang rute ini akan memeriksa token JWT yang dikirim oleh front-end
router.post('/orders/checkout', authMiddleware, pelangganController.buatPesanan);
router.get('/orders/me', authMiddleware, pelangganController.lihatRiwayatPesanan);

module.exports = router;