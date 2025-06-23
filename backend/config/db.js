// File: config/db.js (Versi yang Sudah Diperbarui)

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',      // Alamat server database Anda
    user: 'root',           // User default XAMPP
    password: '',           // Password default XAMPP adalah kosong
    database: 'db_tokokopi',// Nama database yang sudah Anda buat
});

console.log("Koneksi ke database berhasil dibuat.");

module.exports = pool;
