import axios from 'axios';

// Buat instance Axios
const API = axios.create({
  /**
   * PERUBAHAN UTAMA DI SINI:
   * - process.env.REACT_APP_API_URL: Ini akan mengambil nilai dari variabel lingkungan
   * yang akan kita atur di Railway (misalnya: https://kopikir-backend-123.up.railway.app/).
   * - 'http://localhost:3001/': Ini adalah fallback. Jika variabel di atas tidak ada
   * (seperti saat Anda menjalankan 'npm start' di komputer lokal), maka alamat ini
   * yang akan digunakan.
   */
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/', 
  
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor untuk menambahkan token otentikasi secara otomatis
API.interceptors.request.use((config) => {
  // Ambil token dari localStorage
  const token = localStorage.getItem('token');
  
  // Jika token ada, tambahkan ke header setiap request
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  // Lakukan sesuatu jika ada error pada request
  return Promise.reject(error);
});

export default API;