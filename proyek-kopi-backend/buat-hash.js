const bcrypt = require('bcrypt');
const passwordAsli = 'admin1234'; // <-- Ganti dengan password yang Anda inginkan
const saltRounds = 10;

bcrypt.hash(passwordAsli, saltRounds, function(err, hash) {
    if (err) {
        console.error("Gagal membuat hash:", err);
        return;
    }
    console.log('Password Asli:', passwordAsli);
    console.log('Hash Bcrypt  :', hash);
});