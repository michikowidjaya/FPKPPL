# === TAHAP 1: BUILD FRONTEND ===
FROM node:18-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Pastikan path ke api.js sudah benar, yaitu di dalam src
RUN sed -i "s|baseURL:.*|baseURL: '/api',|" src/api.js
RUN npm run build

# === TAHAP 2: SETUP BACKEND & GABUNGKAN ===
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
COPY --from=builder /app/frontend/build ./build

# PERUBAHAN DI SINI:
# Biarkan Railway tahu bahwa port yang digunakan adalah dinamis
EXPOSE $PORT

# Jalankan server backend
CMD ["npm", "start"]