# LMS SMAN 3 MALANG

## Menjalankan server

```bash
cd server
npm ci
npm start
```

Server membaca `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` dari environment. File `server/.env` atau `server/src/.env` dapat digunakan untuk konfigurasi lokal. Jangan commit file `.env`.

Endpoint server tersedia di:

- `/api/v1/banks`
- `/api/v1/quizzes`
- `/api/v1/master`

## Menjalankan client

```bash
cd client
npm ci
npm run dev
```
