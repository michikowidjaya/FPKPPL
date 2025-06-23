// Cuplikan dari backend/middleware/auth.js
const authMiddleware = (req, res, next) => {
    // ... (Logika dummy autentikasi JWT) ...
    req.user = {
        id: 1,
        name: 'Chiko User',
        email: 'chiko@example.com',
        role: 'admin' // <--- PASTIKAN INI ADA DAN BERNILAI 'admin'
    };
    next();
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') { // <--- Ini yang diperiksa oleh middleware
        next();
    } else {
        res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
};

module.exports = { authMiddleware, adminMiddleware };