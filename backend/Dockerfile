# --- Tahap 1: Base Image ---
# Gunakan image Node.js versi 18 yang ringan (Alpine) sebagai dasar.
FROM node:18-alpine

# --- Tahap 2: Setup Lingkungan Kerja ---
# Buat folder '/app' di dalam container sebagai direktori kerja.
WORKDIR /app

# --- Tahap 3: Instalasi Dependencies ---
# Salin package.json dan package-lock.json terlebih dahulu.
# Docker akan menyimpan cache layer ini, jadi 'npm install' tidak akan berjalan setiap kali Anda mengubah kode.
COPY package*.json ./

# Jalankan 'npm install' untuk mengunduh semua library yang dibutuhkan oleh backend.
# '--production' berarti hanya dependensi utama yang diinstall, bukan devDependencies.
RUN npm install --production

# --- Tahap 4: Salin Kode Aplikasi ---
# Salin semua file dari folder 'backend' Anda ke dalam container.
COPY . .

# --- Tahap 5: Buka Port ---
# Beri tahu Docker bahwa aplikasi ini akan berjalan di port yang ditentukan oleh Railway.
# Railway akan secara otomatis menyediakan variabel $PORT.
EXPOSE 3001

# --- Tahap 6: Jalankan Aplikasi ---
# Perintah ini akan dieksekusi saat container dimulai.
# Ini sama dengan menjalankan 'npm start' di terminal Anda.
CMD ["npm", "start"]