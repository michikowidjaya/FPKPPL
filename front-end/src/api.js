import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/', 
  headers: {
    'Content-Type': 'application/json',
  }
});

// AKTIFKAN (UNCOMMENT) BAGIAN INI
// Interceptor ini akan berjalan sebelum setiap request dikirim
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Jika ada token, tambahkan ke header Authorization
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;