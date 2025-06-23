// File: routes/admin.routes.js  (nama file asli: admin.routers.js)

const express = require('express');
const router = express.Router();
// PERUBAHAN DI BARIS INI: Sesuaikan path agar sesuai dengan struktur folder
const adminController = require('../controllers/admin.controller'); // <--- PERBAIKAN DI SINI!
const { authMiddleware, adminMiddleware } = require('../middleware/auth'); 

// Semua rute di sini dilindungi, harus login sebagai admin
router.use(authMiddleware, adminMiddleware);

router.post('/products', adminController.tambahProdukBaru);
router.put('/products/:id', adminController.updateProduk);
router.delete('/products/:id', adminController.hapusProduk);

router.get('/orders', adminController.lihatSemuaPesanan);
router.put('/orders/:id/status', adminController.updateStatusPesanan);

module.exports = router;