// File: frontend/src/AdminPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css'; // Pastikan Anda sudah membuat file CSS ini

function AdminPage() {
    // State untuk form tambah produk
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        category: ''
    });

    // State untuk daftar pesanan
    const [orders, setOrders] = useState([]);

    // State untuk notifikasi (digunakan juga di StorePage)
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Fungsi untuk menampilkan notifikasi
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' }); // Sembunyikan setelah beberapa detik
        }, 3000); // Notifikasi akan hilang setelah 3 detik
    };

    // Fungsi untuk mengambil data pesanan
    const fetchOrders = async () => {
        try {
            // Kita gunakan cache buster untuk memaksa permintaan baru
            const url = `http://localhost:3001/api/admin/orders?cache_buster=${Date.now()}`;
            // Penting: Di sini kita menggunakan API instance dengan token jika user login
            const token = localStorage.getItem('token');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.clear(); 
            console.log(`--- DATA PESANAN DITERIMA PUKUL ${new Date().toLocaleTimeString()} ---`);
            console.table(response.data.data); // Tampilkan data dalam bentuk tabel yang rapi

            const newOrders = JSON.parse(JSON.stringify(response.data.data));
            setOrders(newOrders);

        } catch (error) {
            console.error('Gagal mengambil data pesanan:', error.response ? error.response.data : error.message);
            showNotification('Gagal mengambil data pesanan. Pastikan Anda login sebagai admin.', 'error');
        }
    };

    // useEffect untuk polling pesanan
    useEffect(() => {
        fetchOrders(); // Panggil pertama kali
        const intervalId = setInterval(fetchOrders, 5000); // Polling setiap 5 detik
        return () => clearInterval(intervalId); // Cleanup interval saat komponen unmount
    }, []);

    // Handler perubahan status pesanan
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/admin/orders/${orderId}/status`, 
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            showNotification(`Status pesanan ID ${orderId} berhasil diubah menjadi ${newStatus}!`, 'success');
            fetchOrders(); // Refresh daftar pesanan setelah status diubah
        } catch (error) {
            console.error('Gagal mengubah status pesanan:', error.response ? error.response.data : error.message);
            showNotification('Gagal mengubah status pesanan.', 'error');
        }
    };
    
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Ambil token
            const response = await axios.post('http://localhost:3001/api/admin/products', form, {
                headers: {
                    Authorization: `Bearer ${token}` // Sertakan token di header
                }
            });

            if (response.data.success) {
                showNotification('Produk berhasil ditambahkan!', 'success');
                setForm({ name: '', description: '', price: '', stock: '', image_url: '', category: '' });
                // Opsional: refresh daftar produk di StorePage jika AdminPage ini juga menampilkan daftar produk
            }
        } catch (error) {
            console.error('Gagal menambah produk:', error.response ? error.response.data : error.message);
            showNotification('Gagal menambah produk. Cek konsol untuk detail.', 'error');
        }
    };

    return (
        <div className="admin-container">
            {/* Notifikasi */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Bagian Tambah Produk Baru */}
            <div className="admin-section">
                <h1>Panel Admin - Tambah Produk Baru</h1>
                <form onSubmit={handleSubmit} className="admin-form">
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Nama Produk" required />
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi Produk" />
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Harga" required />
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stok" required />
                    <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="URL Gambar (opsional)" />
                    <input name="category" value={form.category} onChange={handleChange} placeholder="Kategori (opsional)" />
                    <button type="submit">Simpan Produk</button>
                </form>
            </div>
            
            {/* Bagian Daftar Pesanan Masuk */}
            <div className="admin-section">
                <h2>Daftar Pesanan Masuk</h2>
                {orders.length > 0 ? (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Pelanggan</th>
                                <th>Total Bayar</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.customer_name || 'N/A'}</td> {/* Asumsi ada customer_name dari join */}
                                    <td>Rp {order.total_amount ? order.total_amount.toLocaleString('id-ID') : '0'}</td>
                                    <td className={`status-${order.status}`}>{order.status}</td>
                                    <td>{new Date(order.created_at).toLocaleString('id-ID')}</td>
                                    <td>
                                        <select 
                                            className="status-dropdown" 
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Tidak ada pesanan masuk saat ini.</p>
                )}
            </div>
        </div>
    );
}

export default AdminPage;