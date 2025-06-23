// File: src/pages/LoginPage.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api'; // Pastikan import API sudah benar
import '../AuthPage.css'; // Impor CSS baru dari root src/

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await API.post('/api/auth/login', { email, password });
      onLogin(response.data); // Panggil fungsi onLogin dari App.js
      
      const userRole = response.data.user.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/store'); // Arahkan ke /store
      }
      
    } catch (err) {
      setError('Email atau password salah. Silakan coba lagi.');
      console.error("Login failed:", err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-form-container"> {/* Ganti login-form dengan auth-form-container */}
        <img src="logo-kopikir1.png" alt="Logo Kopikir" className="auth-logo"/> {/* Placeholder Logo */}
        <h2>Selamat Datang</h2>
        <p>Silakan login untuk melanjutkan</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label> {/* Tambah htmlFor */}
            <input
              type="email"
              id="email" // Tambah id
              placeholder="Masukkan alamat email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label> {/* Tambah htmlFor */}
            <input
              type="password"
              id="password" // Tambah id
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="auth-button">Login</button> {/* Tambah auth-button */}
        </form>
        
        <div className="auth-link-container"> {/* Ganti register-link dengan auth-link-container */}
          <p>Belum punya akun? <Link to="/register">Register di sini</Link></p> {/* Hapus style inline */}
          {/* Opsional: <p><Link to="/forgot-password">Lupa Password?</Link></p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;