// File: frontend/src/pages/StorePage.js (Versi Final dengan Semua Perbaikan)

import React, { useState, useEffect } from 'react'; // <-- useMemo sudah dihapus
import API from '../api'; // <-- PENTING: Gunakan instance API kita, bukan axios
import '../App.css'; 

function StorePage({ user }) { // Menerima data user yang sebenarnya dari App.js
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000); 
  };

  useEffect(() => {
    // Fungsi untuk mengambil semua produk
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await API.get('/api/pelanggan/products'); // Menggunakan API
        if (response.data && Array.isArray(response.data.data)) {
          const productsWithImages = response.data.data.map(product => ({
            ...product,
            imageUrl: product.image_url || `https://via.placeholder.com/200x180?text=${product.name.replace(/\s/g, '+')}` 
          }));
          setProducts(productsWithImages);
        }
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
        showNotification("Gagal memuat produk.", "error");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    // Fungsi untuk mengambil rekomendasi personal
    const fetchUserRecommendations = async () => {
      if (!user) return;
      try {
        const response = await API.get(`/api/pelanggan/recommendations?userId=${user.id}`); // Menggunakan API
        if (response.data && Array.isArray(response.data.data)) {
          const recommendedProductsWithImages = response.data.data.map(product => ({
            ...product,
            imageUrl: product.image_url || `https://via.placeholder.com/200x180?text=${product.name.replace(/\s/g, '+')}` 
          }));
          setRecommendations(recommendedProductsWithImages);
        }
      } catch (error) {
        console.error("Gagal mengambil rekomendasi dari backend:", error);
      }
    };

    fetchProducts();
    fetchUserRecommendations();
  }, [user]);

  // --- Fungsi-fungsi Keranjang (menggunakan functional update yang aman) ---
  const addToCart = (productToAdd) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === productToAdd.id);
      if (existingItem) {
        if (existingItem.quantity < productToAdd.stock) {
          showNotification(`${productToAdd.name} ditambahkan ke keranjang!`, "success");
          return currentCart.map(item =>
            item.id === productToAdd.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          showNotification(`Stok ${productToAdd.name} tidak mencukupi!`, "warning");
          return currentCart;
        }
      } else {
        if (productToAdd.stock > 0) {
          showNotification(`${productToAdd.name} ditambahkan ke keranjang!`, "success");
          return [...currentCart, { ...productToAdd, quantity: 1 }];
        } else {
          showNotification(`${productToAdd.name} sedang tidak tersedia.`, "error");
          return currentCart;
        }
      }
    });
  };
  
  const handleIncreaseQuantity = (productId) => {
    setCart(currentCart => {
      const itemToIncrease = currentCart.find(item => item.id === productId);
      if (itemToIncrease && itemToIncrease.quantity < itemToIncrease.stock) {
        return currentCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else if (itemToIncrease) {
        showNotification(`Stok ${itemToIncrease.name} tidak mencukupi!`, "warning");
      }
      return currentCart;
    });
  };

  const handleDecreaseQuantity = (productId) => {
    setCart(currentCart => {
      const itemToDecrease = currentCart.find(item => item.id === productId);
      if (itemToDecrease && itemToDecrease.quantity > 1) {
        return currentCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return currentCart.filter(item => item.id !== productId);
      }
    });
  };
  
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification("Keranjang Anda masih kosong!", "warning");
      return;
    }
    setIsProcessingCheckout(true);
    try {
      const orderItems = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
      const orderData = { 
        items: orderItems,
        shipping_address: 'Jalan Kemenangan No. 11, Surabaya' 
        // userId tidak perlu dikirim, karena backend mengambilnya dari token
      };

      // Panggilan API ini sekarang akan otomatis menyertakan token
      const response = await API.post('/api/pelanggan/orders/checkout', orderData); // Menggunakan API
      
      const { token } = response.data;
      if (token && window.snap) {
        window.snap.pay(token, {
          onSuccess: function(result){ showNotification("Pembayaran sukses!", "success"); setCart([]); },
          onPending: function(result){ showNotification("Pembayaran Anda tertunda.", "info"); },
          onError: function(result){ showNotification("Pembayaran gagal! Coba lagi.", "error"); },
          onClose: function(){ showNotification('Anda menutup popup pembayaran.', "warning"); }
        });
      } else {
        showNotification('Gagal mendapatkan token pembayaran dari server.', "error");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Terjadi kesalahan saat checkout.";
      showNotification(message, "error");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Lainnya';
    if (!acc[category]) { acc[category] = []; }
    acc[category].push(product);
    return acc;
  }, {});
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Selamat Datang di KopiKir!</h1>
        
        {notification.message && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="cart-summary">
            <h3>Keranjang Belanja ({totalCartItems} item)</h3>
            {cart.length > 0 ? (
                <>
                  <ul>
                    {cart.map(item => (
                      <li key={item.id}>
                        <span className="cart-item-name">{item.name}</span>
                        <div className="quantity-controls">
                          <button onClick={() => handleDecreaseQuantity(item.id)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleIncreaseQuantity(item.id)}>+</button>
                        </div>
                        <span className="cart-item-price">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </li>
                    ))}
                    <li className="cart-total">
                      <span>**Total Belanja**</span>
                      <span>**Rp {totalCartAmount.toLocaleString('id-ID')}**</span>
                    </li>
                  </ul>
                  <button 
                    className="checkout-button" 
                    onClick={handleCheckout}
                    disabled={isProcessingCheckout || cart.length === 0}
                  >
                    {isProcessingCheckout ? 'Memproses...' : 'Checkout Sekarang'}
                  </button>
                </>
            ) : ( <p>Keranjang Anda kosong. Yuk, pilih kopi favoritmu!</p> )}
        </div>
        
        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h2>Rekomendasi untuk Anda:</h2>
            <div className="product-list">
              {recommendations.map(product => (
                <div key={product.id} className="product-card">
                  <img src={product.imageUrl} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>Rp {product.price.toLocaleString('id-ID')}</p>
                  <button onClick={() => addToCart(product)}>Tambah ke Keranjang</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoadingProducts ? (
          <div className="loading-indicator">Memuat produk...</div>
        ) : (
          <div>
            {Object.keys(groupedProducts).map(category => (
              <div key={category} className="category-section">
                <h2 className="category-title">{category}</h2>
                <div className="product-list">
                  {groupedProducts[category].map(product => (
                    <div key={product.id} className="product-card">
                      <img src={product.imageUrl} alt={product.name} />
                      <h3>{product.name}</h3>
                      <p>Rp {product.price.toLocaleString('id-ID')}</p>
                      <p>Stok: {product.stock}</p>
                      <button onClick={() => addToCart(product)} disabled={product.stock === 0}>
                        {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>
    </div>
  );
} 

export default StorePage;