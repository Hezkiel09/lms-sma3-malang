# LMS SMAN 3 MALANG

## Menjalankan aplikasi lokal

1. Salin template konfigurasi backend lalu isi nilainya dari pemilik proyek Supabase:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

   Isi `SUPABASE_URL` dan `SUPABASE_SECRET_KEY` di `server\.env`. Jangan membagikan atau memasukkan secret key ke frontend maupun Git.

2. Jalankan backend di terminal pertama:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. Jalankan frontend di terminal kedua:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

Frontend memakai `client/.env.local` untuk mengakses `http://localhost:5000/api/v1`. Template-nya tersedia di `client/.env.example`.

Halaman Guru dan Siswa mengambil data dari:

- `GET /master/users/teachers`
- `GET /master/users/students`
