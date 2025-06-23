# === TAHAP 1: BUILD STAGE ===
# Tahap ini bertugas untuk membangun aplikasi React Anda.
FROM node:18-alpine AS builder

# Set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json untuk caching
COPY package*.json ./

# Install semua dependencies (termasuk devDependencies untuk proses build)
RUN npm install

# Salin sisa kode aplikasi frontend
COPY . .

# Jalankan perintah build dari React Scripts
# Ini akan membuat folder '/app/build' yang berisi file statis
RUN npm run build

# === TAHAP 2: SERVE STAGE ===
# Tahap ini hanya bertugas menyajikan (serve) hasil build dari tahap sebelumnya.
# Kita mulai lagi dari image yang ringan untuk hasil akhir yang kecil.
FROM node:18-alpine

# Set direktori kerja
WORKDIR /app

# Install 'serve', sebuah server statis yang sangat ringan
RUN npm install -g serve

# Salin HANYA folder 'build' dari tahap 'builder' sebelumnya
COPY --from=builder /app/build .

# Buka port 3000, port default yang digunakan oleh 'serve'
EXPOSE 3000

# Perintah untuk menjalankan server statis
# '-s' flag penting agar semua request diarahkan ke index.html (untuk Single-Page App)
CMD ["serve", "-s", ".", "-l", "3000"]