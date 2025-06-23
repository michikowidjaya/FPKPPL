// File: controllers/recommendation.controller.js (Versi dengan Perbaikan Syntax)

const pool = require('../config/db');
const axios = require('axios');

exports.getRecommendations = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID dibutuhkan.' });
    }

    try {
        const [orders] = await pool.query(
            `SELECT p.name, p.category 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id IN (SELECT id FROM orders WHERE user_id = ?)`,
            [userId]
        );

        let recommendedProducts;

        if (orders.length === 0) {
            console.log(`User ${userId} adalah user baru. Mengambil best seller.`);
            const bestSellerIds = [1, 3, 5]; // Pastikan ID ini valid di database Anda
            const [bestSellers] = await pool.query(
                `SELECT * FROM products WHERE id IN (?)`,
                [bestSellerIds]
            );
            recommendedProducts = bestSellers;
            
        } else {
            console.log(`User ${userId} memiliki riwayat. Menyiapkan prompt untuk AI.`);
            const [allProducts] = await pool.query('SELECT name, category FROM products');
            const menuAsString = allProducts.map(p => `${p.name} (Kategori: ${p.category})`).join(', ');
            const historyAsString = [...new Set(orders.map(o => o.name))].join(', ');

            const prompt = `Anda adalah AI barista yang ramah di kedai kopi "Kopikir". Seorang pelanggan sebelumnya pernah memesan: ${historyAsString}.
            Menu lengkap kami saat ini adalah: ${menuAsString}.
            Berdasarkan riwayatnya, berikan 3 rekomendasi PRODUK LAIN yang mungkin ia sukai. 
            Jawab HANYA dengan format array JSON berisi nama produk, contoh: ["Caramel Macchiato Asin", "Roti Bakar Srikaya", "Kopi Kelapa Gemetar"]`;

            console.log("Mengirim prompt ke AI...");
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            }, {
                headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
            });

            const aiResponseContent = response.data.choices[0].message.content;
            console.log("Jawaban mentah dari AI:", aiResponseContent);

            const jsonMatch = aiResponseContent.match(/(\[.*\])/s);
            const jsonString = jsonMatch ? jsonMatch[1] : null;

            if (jsonString) {
                try {
                    const recommendedNames = JSON.parse(jsonString);
                    if (Array.isArray(recommendedNames) && recommendedNames.length > 0) {
                        const [productsFromAI] = await pool.query(
                            `SELECT * FROM products WHERE name IN (?)`,
                            [recommendedNames]
                        );
                        recommendedProducts = productsFromAI;
                    } else {
                        recommendedProducts = [];
                    }
                } catch (parseError) {
                    console.error("Gagal mem-parsing JSON dari AI:", parseError);
                    recommendedProducts = []; 
                }
            } else {
                console.error("Tidak ditemukan format JSON array pada jawaban AI.");
                recommendedProducts = [];
            }
        }
        
        res.status(200).json({ data: recommendedProducts });

    } catch (error) {
        console.error("Error di Recommendation Controller:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Gagal mendapatkan rekomendasi.' });
    }
};