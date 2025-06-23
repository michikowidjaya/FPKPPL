# === TAHAP 1: BUILD FRONTEND ===
# Kita sebut tahap ini 'builder'
FROM node:18-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Perintah penting: Ubah baseURL di api.js saat build
# Ini akan mengganti http://localhost:3001/api menjadi '/api'
RUN sed -i "s|baseURL:.*|baseURL: '/api',|" src/api.js

# Jalankan proses build React
RUN npm run build


# === TAHAP 2: SETUP BACKEND & GABUNGKAN ===
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# INI BAGIAN KUNCINYA:
# Salin hasil build frontend dari tahap 'builder' ke dalam folder 'build' di backend
COPY --from=builder /app/frontend/build ./build

# Buka port yang akan digunakan oleh Railway
EXPOSE 8080

# Jalankan server backend
CMD ["npm", "start"]