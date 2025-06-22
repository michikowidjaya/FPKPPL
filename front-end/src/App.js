// File: frontend/src/App.js (Versi Perbaikan)

import React, { useState, useEffect } from 'react';
// 1. Tambahkan useNavigate ke dalam import
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Impor semua halaman dan komponen Anda
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

// ====================================================================
// KITA PINDAHKAN SEMUA LOGIKA KE DALAM KOMPONEN BARU INI
// ====================================================================
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // 2. Inisialisasi hook useNavigate di sini
  const navigate = useNavigate(); 

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  // Efek ini untuk memeriksa status login saat aplikasi pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLogin = (authData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userRole', authData.user.role);
    setIsLoggedIn(true);
    setUserRole(authData.user.role);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
    
    if (confirmLogout) {
      showNotification("Logging out...", "info");
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setUserRole(null);
      
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
          <Link to="/">
            <span>Kopikir</span>
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/store">Halaman Toko</Link> 
          {isLoggedIn && userRole === 'admin' && <Link to="/admin">Halaman Admin</Link>}
          
          {!isLoggedIn ? (
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
        
        {/* Melindungi halaman toko */}
        <Route 
          path="/store" 
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <StorePage />
            </PrivateRoute>
          } 
        />
        {/* Melindungi halaman default (root) juga */}
        <Route 
          path="/" 
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <StorePage />
            </PrivateRoute>
          } 
        />
        
        {/* Rute Admin */}
        <Route 
          path="/admin" 
          element={isLoggedIn && userRole === 'admin' ? <AdminPage /> : <LoginPage onLogin={handleLogin} />} 
        />
      </Routes>
    </div>
  );
}

// ====================================================================
// KOMPONEN APP UTAMA SEKARANG HANYA BERTUGAS MEMBUNGKUS DENGAN ROUTER
// ====================================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;