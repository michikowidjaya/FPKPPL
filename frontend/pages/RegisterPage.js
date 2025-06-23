// File: src/pages/RegisterPage.js (Versi yang Sudah Diperbaiki)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import '../AuthPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/api/auth/register', { name, email, password });
      
      setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registrasi gagal. Silakan coba lagi.');
      }
      console.error("Register failed:", err);
    }
  };

  // --- TIDAK ADA PERUBAHAN PADA LOGIKA DI ATAS ---

  return (
    <div className="auth-page-wrapper">
      {/* Menggunakan className dari AuthPage.css */ }
      <div className="auth-form-container">
        
        {/* Logo kita tambahkan di sini agar konsisten dengan halaman Login */}
        <img src="/logo-kopikir.png" alt="Logo Kopikir" className="auth-logo" />

        <h2>Buat Akun Baru</h2>
        <p>Isi data diri Anda untuk mendaftar.</p>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nama Lengkap</label> 
            <input
              type="text"
              placeholder="Masukkan nama lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label> 
            <input
              type="email"
              placeholder="Masukkan alamat email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Buat password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          {/* PERBAIKAN 1: Hapus inline style dari pesan sukses */}
          {success && <p className="success-message">{success}</p>}
          
          {/* Tombol ini akan otomatis mengambil style dari .auth-button di AuthPage.css */}
          <button type="submit" className="auth-button">Register</button>
        </form>

        {/* Menggunakan className dari AuthPage.css */ }
        <div className="auth-link-container">
          <p>
            Sudah punya akun? 
            {/* PERBAIKAN 2: Hapus inline style dari Link */}
            <Link to="/login">Login di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;