// File: frontend/src/App.js (Versi dengan Aliran Data User yang Benar)

import React, { useState, useEffect } from 'react';
// 1. Tambahkan useNavigate ke dalam import
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Impor semua halaman dan komponen Anda
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import Chatbot from './components/Chatbot';

import './App.css';

// ====================================================================
// Kita pindahkan semua logika ke dalam komponen baru ini agar bisa menggunakan useNavigate
// ====================================================================
function AppContent() {
  const [user, setUser] = useState(null); // State untuk menyimpan seluruh objek user {id, name, role}
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // 2. Inisialisasi hook useNavigate di sini
  const navigate = useNavigate(); 

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  // Efek ini untuk memeriksa status login dari localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Gagal mem-parsing data user dari localStorage:", error);
      // Bersihkan localStorage jika datanya korup untuk mencegah error berulang
      localStorage.clear();
    }
  }, []);

  // Fungsi yang akan dipanggil oleh LoginPage setelah login berhasil
  const handleLogin = (authData) => {
    localStorage.setItem('token', authData.token);
    // Simpan seluruh objek user sebagai string JSON untuk menjaga integritas data
    localStorage.setItem('user', JSON.stringify(authData.user)); 
    setUser(authData.user);
    
    // Arahkan ke halaman yang sesuai setelah login
    if (authData.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/store');
    }
  };

  const handleLogout = () => {
    // Gunakan konfirmasi browser standar
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      showNotification("Anda berhasil logout.", "info");
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Hapus juga data user dari localStorage
      setUser(null);
      
      // 3. Gunakan navigate() untuk redirect yang lebih halus tanpa reload halaman
      setTimeout(() => {
        navigate('/login'); 
      }, 500); 
    }
  };

  return (
    <div>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <nav className="main-nav">
        <div className="nav-brand">
          <Link to="/"><span>Kopikir</span></Link>
        </div>
        <div className="nav-links">
          <Link to="/store">Halaman Toko</Link> 
          {user && user.role === 'admin' && <Link to="/admin">Halaman Admin</Link>}
          {!user ? (
            <Link to="/login">Login</Link>
          ) : (
            <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
          )}
        </div>
        <div className="nav-utilities">
          <input type="text" placeholder="Cari kopi..." className="search-bar"/>
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Melindungi Halaman Toko dan meneruskan data user yang sebenarnya */}
        <Route 
          path="/store" 
          element={
            <PrivateRoute isLoggedIn={!!user}>
              <StorePage user={user} />
            </PrivateRoute>
          } 
        />
        {/* Melindungi Halaman Default (Root) juga */}
        <Route 
          path="/" 
          element={
            <PrivateRoute isLoggedIn={!!user}>
              <StorePage user={user} />
            </PrivateRoute>
          } 
        />
        
        {/* Melindungi Halaman Admin */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute isLoggedIn={!!user} requiredRole="admin" userRole={user?.role}>
              <AdminPage />
            </PrivateRoute>
          } 
        />
      </Routes>
      <Chatbot />
    </div>
  );
}

// ====================================================================
// Komponen App utama sekarang hanya bertugas membungkus dengan Router
// ====================================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;