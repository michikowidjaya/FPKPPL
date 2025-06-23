// File: routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Rute untuk admin menambah produk baru
router.post('/products', adminController.tambahProdukBaru);

module.exports = router;