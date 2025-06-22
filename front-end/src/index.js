import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Di dalam file index.js

// --- KODE DEBUG ANDA ---
console.log('--- Memeriksa Environment Variables ---');
console.log('Nilai JWT_SECRET saat ini adalah:', process.env.JWT_SECRET);

// --- TAMBAHKAN BARIS INI UNTUK MEMERIKSA API KEY ---
console.log('Nilai OPENROUTER_API_KEY adalah:', process.env.OPENROUTER_API_KEY); 
// -----------------------------------------------

console.log('------------------------------------');

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
