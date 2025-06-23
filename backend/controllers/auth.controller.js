// File: proyek-kopi-backend/controllers/auth.controller.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- FUNGSI REGISTER DENGAN DEBUG ---
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`\n[BACKEND-REGISTER] Permintaan diterima untuk email: ${email}`);

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
        }

        console.log('[BACKEND-REGISTER] Mencoba cek apakah email sudah ada...');
        const [existingUser] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        console.log('[BACKEND-REGISTER] Pengecekan email selesai.');

        if (existingUser.length > 0) {
            console.log(`[BACKEND-REGISTER] Email '${email}' sudah terdaftar.`);
            return res.status(409).json({ message: 'Email sudah terdaftar.' });
        }
        
        console.log('[BACKEND-REGISTER] Lanjut hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('[BACKEND-REGISTER] Mencoba memasukkan user baru ke DB...');
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'user']
        );
        console.log('[BACKEND-REGISTER] User baru berhasil dimasukkan.');

        res.status(201).json({
            message: 'Registrasi berhasil! Silakan login.',
            userId: result.insertId
        });

    } catch (error) {
        console.error("[BACKEND-REGISTER] ERROR KRITIS:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// --- FUNGSI LOGIN DENGAN DEBUG ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`\n[BACKEND-LOGIN] Permintaan diterima untuk email: ${email}`);

        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi.' });
        }

        console.log('[BACKEND-LOGIN] Mencoba menjalankan query SELECT...');
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('[BACKEND-LOGIN] Query SELECT berhasil dijalankan.');

        if (users.length === 0) {
            console.log(`[BACKEND-LOGIN] Email '${email}' tidak ditemukan.`);
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const user = users[0];
        console.log('[BACKEND-LOGIN] User ditemukan, lanjut membandingkan password.');
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            console.log(`[BACKEND-LOGIN] Password salah untuk '${email}'.`);
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        console.log(`[BACKEND-LOGIN] Login berhasil untuk ${email}. Membuat token...`);
        const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("[BACKEND-LOGIN] ERROR KRITIS:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};
