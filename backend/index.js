// File: backend/index.js (Versi Gabungan)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- TAMBAHKAN INI

// Impor rute yang sudah kita buat
const authRoutes = require('./routes/auth.routes'); 
const pelangganRoutes = require('./routes/pelanggan.routes');
const adminRoutes = require('./routes/admin.routes.js');

const app = express();
const PORT = process.env.PORT || 3001; 

// Middleware
app.use(cors());
app.use(express.json());

// --- BAGIAN BARU UNTUK MENYAJIKAN FRONTEND ---
// Memberi tahu Express untuk menyajikan file-file statis (hasil build React)
// dari folder 'build' yang akan kita buat nanti.
app.use(express.static(path.join(__dirname, 'build')));
// ---------------------------------------------

// Menggunakan Rute API
// Semua rute API kita letakkan di bawah prefix '/api' agar tidak bentrok
app.use('/api/auth', authRoutes); 
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/admin', adminRoutes);

// --- BAGIAN BARU: CATCH-ALL ROUTE ---
// Rute ini akan menangkap semua request yang bukan ke '/api'
// dan mengembalikannya ke file index.html milik React.
// Ini penting agar routing di sisi frontend (React Router) bisa bekerja.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// ------------------------------------

app.listen(PORT, () => {
    console.log(`Server berjalan di port http://localhost:${PORT}`);
});