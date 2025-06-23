const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', // Railway provides DB_HOST
    user: process.env.DB_USER || 'root',     // Railway provides DB_USER
    password: process.env.DB_PASSWORD || '', // Railway provides DB_PASSWORD
    database: process.env.DB_NAME || 'FPKPPL_db', // Railway provides DB_NAME
    port: process.env.DB_PORT || 3306 // Railway provides DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

module.exports = db;