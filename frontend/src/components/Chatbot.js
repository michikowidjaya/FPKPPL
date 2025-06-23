// File: src/components/Chatbot.js (Versi dengan Perbaikan Fungsi Submit)

import React, { useState, useEffect, useRef } from 'react';

// Komponen untuk ikon SVG (tidak ada perubahan)
const ChatIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg> );


const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // --- PENTING: GANTI DENGAN API KEY ANDA ---
    const OPENROUTER_API_KEY = "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"; // <-- LETAKKAN API KEY ANDA DI SINI

    const KOPIMENU_CONTEXT = `
        Nama Kedai: Kopikir. Jam Buka: Setiap hari, 08:00 - 22:00. Lokasi: Surabaya.
        Menu Kopi: Americano Klasik, Kopi Susu Aren 'Nostalgia', Caramel Macchiato Asin, Kopi Kelapa Gemetar, Avocado Latte.
        Menu Non-Kopi: Matcha Latte Premium, Cokelat Klasik Belgia, Teh Tarik, Leci Tea, Milo Dinosaurus.
        Menu Makanan: Croissant Cokelat Lumer, Roti Bakar Srikaya Tradisional, Donat Kampung, French Toast.
        Best Seller: Kopi Susu Aren 'Nostalgia', Croissant Cokelat Lumer.
    `;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    // Pesan selamat datang (Logika ini sudah benar)
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ sender: 'ai', text: 'Halo! Ada yang bisa saya bantu dengan menu Kopikir?' }]);
        }
    }, [isOpen, messages.length]);

    const callOpenRouterAPI = async (userMessage) => {
        setIsLoading(true);
        setMessages(prev => [...prev, { sender: 'ai', text: '...', isLoading: true }]);

        const prompt = `Anda adalah AI asisten yang ramah untuk kedai kopi "Kopikir". Jawab pertanyaan pelanggan dengan singkat dan ramah berdasarkan konteks berikut. Jangan menjawab pertanyaan di luar konteks ini. Konteks: ${KOPIMENU_CONTEXT}. Pertanyaan Pelanggan: "${userMessage}"`;
        
        console.log("Mencoba memanggil API OpenRouter..."); // Log Debug 1

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            
            console.log("Status Respons API:", response.status); // Log Debug 2

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }
            
            const data = await response.json();
            const aiMessage = data.choices[0].message.content;

            // Hapus pesan "loading" dan ganti dengan pesan dari AI
            setMessages(prev => {
                const newMessages = prev.filter(msg => !msg.isLoading);
                return [...newMessages, { sender: 'ai', text: aiMessage }];
            });

        } catch (error) {
            console.error("Error saat memanggil OpenRouter API:", error);
            // Hapus pesan "loading" dan ganti dengan pesan error
             setMessages(prev => {
                const newMessages = prev.filter(msg => !msg.isLoading);
                return [...newMessages, { sender: 'ai', text: 'Maaf, ada sedikit gangguan. Coba lagi nanti.' }];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Mencegah form dari reload halaman
        const userMessage = inputValue.trim();

        if (userMessage && !isLoading) {
            setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
            callOpenRouterAPI(userMessage);
            setInputValue('');
        }
    };

    // --- Kode JSX tidak ada perubahan, hanya untuk kelengkapan ---
    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="chatbot-toggle-button"
                aria-label="Toggle Chat"
            >
                <ChatIcon />
            </button>

            <div className={`chat-window ${isOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <div>
                        <h3 className="chat-title">Asisten KopiKir</h3>
                        <p className="chat-subtitle">Siap membantu Anda!</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="chat-close-button" aria-label="Close Chat">
                        <CloseIcon />
                    </button>
                </div>

                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                            <div className={`message-bubble ${msg.isLoading ? 'loading-bubble' : ''}`}>
                                {msg.isLoading ? <span className="animate-pulse">...</span> : msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <form onSubmit={handleSubmit} className="chat-form">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Tanyakan sesuatu..."
                            className="chat-input"
                            autoComplete="off"
                            disabled={isLoading}
                        />
                        <button type="submit" className="chat-send-button" aria-label="Send Message" disabled={isLoading}>
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
