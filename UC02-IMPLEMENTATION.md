# UC-02 — Menambah Materi (Backend)

## Endpoint

`POST /api/v1/b5/materials`

Header wajib:

`Authorization: Bearer <supabase_access_token>`

Request menggunakan `multipart/form-data`, bukan JSON, ketika mengirim lampiran.

## Field request

| Field | Tipe | Wajib | Keterangan |
|---|---|---:|---|
| `section_id` | text (UUID) | Ya | Section tujuan materi. |
| `title` | text | Ya | Maksimal 255 karakter. |
| `description` | text | Tidak | Deskripsi/konten materi. |
| `status` | text | Tidak | `draft` atau `published`; default `draft`. |
| `files` | file, berulang | Tidak | Lampiran. Gunakan nama field `files` untuk setiap file. |

Format file yang diterima: PDF, DOC, DOCX, ZIP, PPT, dan PPTX. Maksimal 10 MB per file dan maksimal 5 file dalam satu request.

## Konfigurasi Supabase Storage

1. Buat atau gunakan bucket Storage untuk lampiran materi di project Supabase.
2. Disarankan menggunakan bucket **private**.
3. Tambahkan nama bucket yang benar ke environment backend (file `.env` lokal, jangan commit):

```env
SUPABASE_STORAGE_BUCKET_MATERIALS=nama_bucket_yang_dipakai
SUPABASE_SIGNED_URL_TTL_SECONDS=3600
```

`SUPABASE_STORAGE_BUCKET_MATERIALS` wajib diisi jika request membawa file. `SUPABASE_SIGNED_URL_TTL_SECONDS` opsional dan default-nya 3600 detik (1 jam).

Operasi Storage di backend memakai `supabaseAdmin` (Service Role Key). Pastikan Service Role Key hanya disimpan di environment server dan tidak pernah dikirim ke frontend.

## Proses backend

1. `authenticateUser` memverifikasi access token Supabase.
2. `requireTeacher` memastikan `master.users.role = 'teacher'` dan mencari `master.teachers.id` berdasarkan `master.teachers.user_id = auth user id`.
3. Middleware upload membaca `multipart/form-data`, membatasi ukuran, ekstensi, tipe konten, dan signature file.
4. Backend mencari Section dari `section_id`, lalu Course dari `section.course_id`.
5. Backend memastikan `master.courses.teacher_id` sama dengan ID Guru yang terverifikasi.
6. `subject_id` dan `class_id` diturunkan dari Course; client tidak boleh mengirim `teacher_id`, `subject_id`, atau `class_id`.
7. Backend membuat record `b5.materials`, menyimpan relasi kompatibilitas `b5.material_classes`, mengunggah file ke Storage, kemudian menyimpan metadata ke `b5.material_files`.
8. Jika upload atau penyimpanan metadata gagal, backend berusaha menghapus object Storage dan record terkait agar tidak meninggalkan data parsial.
9. Kolom `b5.material_files.file_url` menyimpan **storage path**, bukan URL publik. Endpoint GET materi mengubah path tersebut menjadi signed URL saat dikirim ke client.

## Contoh request cURL

```bash
curl -X POST http://localhost:5000/api/v1/b5/materials \
  -H "Authorization: Bearer SUPABASE_ACCESS_TOKEN" \
  -F "section_id=UUID_SECTION" \
  -F "title=Materi Persamaan Garis Lurus" \
  -F "description=Pengantar dan contoh persamaan garis lurus" \
  -F "status=published" \
  -F "files=@./materi.pdf" \
  -F "files=@./latihan.docx"
```

Untuk membuat materi tanpa lampiran, kirim field yang sama tanpa field `files`.

## Batasan pengujian

Pemeriksaan syntax dan parser multipart dapat dilakukan secara lokal. Upload sungguhan tetap perlu diuji pada project Supabase yang memiliki bucket sesuai konfigurasi dan tabel `b5.material_files` yang dapat diakses oleh Service Role Key.
