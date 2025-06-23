// File: proyek-kopi-backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rute untuk registrasi user baru
// Ini akan membuat endpoint: POST /api/auth/register
router.post('/register', authController.register);

// Rute untuk login user
// Ini akan membuat endpoint: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
