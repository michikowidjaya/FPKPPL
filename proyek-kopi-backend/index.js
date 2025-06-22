    // File: proyek-kopi-backend/index.js

    require('dotenv').config();

    // --- KODE DEBUG DITAMBAHKAN DI SINI ---
    console.log('--- Memeriksa Environment Variables ---');
    console.log('Nilai JWT_SECRET saat ini adalah:', process.env.JWT_SECRET);
    console.log('------------------------------------');
    // ------------------------------------

    const express = require('express');
    const cors = require('cors');

    // Impor rute yang sudah kita buat
    const authRoutes = require('./routes/auth.routes'); 
    const pelangganRoutes = require('./routes/pelanggan.routes');
    const adminRoutes = require('./routes/admin.routers.js'); // Tambahkan .js secara eksplisit

    const app = express();
    // Gunakan port 5000 agar konsisten dengan frontend
    const PORT = process.env.PORT || 3001; 

    // Middleware
    app.use(cors()); // Mengizinkan akses dari frontend
    app.use(express.json()); // Membaca body request sebagai JSON

    // Menggunakan Rute
    app.use('/api/auth', authRoutes); 
    app.use('/api/pelanggan', pelangganRoutes);
    app.use('/api/admin', adminRoutes);

    // Rute sederhana untuk tes
    app.get('/', (req, res) => {
        res.send('Selamat datang di API Toko Kopi!');
    });

    app.listen(PORT, () => {
        console.log(`Server berjalan di port http://localhost:${PORT}`);
    });