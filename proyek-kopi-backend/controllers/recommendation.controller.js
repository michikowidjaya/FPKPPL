// file: controllers/recommendation.controller.js
const pool = require('../config/db'); // Koneksi database Anda
const axios = require('axios');

exports.getRecommendations = async (req, res) => {
    const { userId } = req.query; // Ambil userId dari query URL

    if (!userId) {
        return res.status(400).json({ message: 'User ID dibutuhkan.' });
    }

    try {
        // Cek apakah user punya riwayat pesanan
        const [orders] = await pool.query(
            `SELECT oi.product_id, p.name, p.category, p.description 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id IN (SELECT id FROM orders WHERE user_id = ?)`, 
            [userId]
        );

        let recommendedProducts;

        if (orders.length === 0) {
            // --- SKENARIO 1: USER BARU (TIDAK BUTUH AI) ---
            console.log(`User ${userId} adalah user baru. Mengambil best seller.`);
            const [bestSellers] = await pool.query(
                `SELECT p.*, COUNT(oi.product_id) as purchase_count 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 GROUP BY oi.product_id 
                 ORDER BY purchase_count DESC 
                 LIMIT 5`
            );
            recommendedProducts = bestSellers;
            
        } else {
            // --- SKENARIO 2: USER LAMA (MENGGUNAKAN AI OPENROUTER) ---
            console.log(`User ${userId} memiliki riwayat. Menyiapkan prompt untuk AI.`);

            // 1. Ambil semua produk untuk dijadikan konteks
            const [allProducts] = await pool.query('SELECT name, category, description FROM products');
            const menuAsString = allProducts.map(p => `${p.name} (Kategori: ${p.category})`).join(', ');
            const historyAsString = [...new Set(orders.map(o => o.name))].join(', ');

            // 2. Susun Prompt untuk AI
            const prompt = `Anda adalah AI barista yang ramah di kedai kopi "Kopikir". Seorang pelanggan sebelumnya pernah memesan: ${historyAsString}.
            Menu lengkap kami saat ini adalah: ${menuAsString}.
            Berdasarkan riwayatnya, berikan 3 rekomendasi PRODUK LAIN yang mungkin ia sukai. 
            Jawab HANYA dengan format array JSON berisi nama produk, contoh: ["Caramel Macchiato Asin", "Roti Bakar Srikaya", "Kopi Kelapa Gemetar"]`;

            // 3. Panggil API OpenRouter
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: "openai/gpt-4o-mini", // Anda bisa ganti dengan model lain, misal dari Mistral atau Llama
                messages: [{ role: "user", content: prompt }],
            }, {
                headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
            });

            const aiResponseContent = response.data.choices[0].message.content;
            console.log("Jawaban mentah dari AI:", aiResponseContent);

            // 4. Parse jawaban AI dan ambil data dari DB
            const recommendedNames = JSON.parse(aiResponseContent);
            if (Array.isArray(recommendedNames) && recommendedNames.length > 0) {
                const [productsFromAI] = await pool.query(
                    `SELECT * FROM products WHERE name IN (?)`,
                    [recommendedNames]
                );
                recommendedProducts = productsFromAI;
            } else {
                recommendedProducts = []; // Fallback jika AI tidak memberi jawaban valid
            }
        }
        
        res.status(200).json({ data: recommendedProducts });

    } catch (error) {
        console.error("Error di Recommendation Controller:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Gagal mendapatkan rekomendasi.' });
    }
};