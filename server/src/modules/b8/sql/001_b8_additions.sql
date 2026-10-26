-- ============================================================
-- Tambahan skema untuk modul B8 (Pemantauan Orang Tua & Presensi)
-- Jalankan di Supabase SQL Editor (Project > SQL Editor > New query).
--
-- Script ini CUMA nambahin hal baru (CREATE TABLE IF NOT EXISTS /
-- ALTER ... ADD COLUMN IF NOT EXISTS), gak nyentuh/drop apa pun yang
-- udah ada - aman dijalankan di DB yang sudah terisi tabel b5/b6/b7.
--
-- Semua perubahan di sini cuma nyentuh schema `b8` (punya kita
-- sendiri), JADI AMAN dijalankan sendiri tanpa nunggu konfirmasi tim.
-- Bagian paling bawah (opsional, shared) beda - baca catatannya.
-- ============================================================

-- 1) Tabel baru: push_subscriptions
-- Dipakai buat Web Push Notification (PWA). Belum ada sama sekali di
-- skema tim.
CREATE TABLE IF NOT EXISTS b8.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES master.users(id)
);

-- Aktifin RLS tanpa policy dulu: backend kita connect pakai service
-- role / connection string langsung (bukan lewat PostgREST), jadi gak
-- kena RLS. Yang kena blokir cuma anon/authenticated key kalau
-- misalnya tabel ini kebuka ke publik - jadi ini aman & disarankan.
ALTER TABLE b8.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2) b8.reports.subject_id
-- Supaya laporan bisa di-scope ke 1 mapel (null = laporan umum/semua
-- mapel).
ALTER TABLE b8.reports
  ADD COLUMN IF NOT EXISTS subject_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reports_subject_id_fkey'
  ) THEN
    ALTER TABLE b8.reports
      ADD CONSTRAINT reports_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES master.subjects(id);
  END IF;
END $$;

-- 3) b8.attendances.recorded_by
-- Audit trail: guru mana yang input/konfirmasi presensi ini.
ALTER TABLE b8.attendances
  ADD COLUMN IF NOT EXISTS recorded_by uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendances_recorded_by_fkey'
  ) THEN
    ALTER TABLE b8.attendances
      ADD CONSTRAINT attendances_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES master.teachers(id);
  END IF;
END $$;

-- 4) b8.attendances - cegah 1 siswa ke-absen dobel di jadwal & tanggal
-- yang sama.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendances_student_schedule_date_key'
  ) THEN
    ALTER TABLE b8.attendances
      ADD CONSTRAINT attendances_student_schedule_date_key UNIQUE (student_id, schedule_id, date);
  END IF;
END $$;

-- 5) b8.parent_teacher_chats.is_read
-- Badge "pesan belum dibaca" di chat ortu-guru.
ALTER TABLE b8.parent_teacher_chats
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- 6) CHECK constraint buat kolom yang sekarang bebas varchar (opsional,
-- tapi disarankan biar data gak "nyasar" nilai di luar yang app layer
-- harapkan). Dibungkus DO block + cek pg_constraint biar bisa
-- dijalankan berkali-kali tanpa error "constraint already exists".

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendances_status_check') THEN
    ALTER TABLE b8.attendances
      ADD CONSTRAINT attendances_status_check
      CHECK (status IS NULL OR status = ANY (ARRAY['hadir','izin','sakit','alpha']));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'general_grades_type_check') THEN
    ALTER TABLE b8.general_grades
      ADD CONSTRAINT general_grades_type_check
      CHECK (type IS NULL OR type = ANY (ARRAY['tugas','ulangan','uts','uas','lainnya']));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'parent_teacher_chats_sender_check') THEN
    ALTER TABLE b8.parent_teacher_chats
      ADD CONSTRAINT parent_teacher_chats_sender_check
      CHECK (sender IS NULL OR sender = ANY (ARRAY['teacher','parent']));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_type_check') THEN
    ALTER TABLE b8.notifications
      ADD CONSTRAINT notifications_type_check
      CHECK (type IS NULL OR type = ANY (ARRAY['presensi','nilai','chat','pengumuman','sistem']));
  END IF;
END $$;

-- ============================================================
-- BAGIAN OPSIONAL - nyentuh schema `master` (shared sama B5-B7)
-- JANGAN dijalankan sendiri tanpa konfirmasi tim, soalnya kalau di
-- data yang sudah ada ternyata ada username/nis yang kembar, perintah
-- di bawah ini bakal GAGAL (constraint violation) dan perlu
-- dibersihkan datanya dulu bareng-bareng.
-- ============================================================

-- UNIQUE (username) di master.users - dibutuhkan karena login (termasuk
-- NIS buat akun ortu) bergantung ke username yang unik, tapi sekarang
-- gak ada constraint-nya sama sekali.
-- ALTER TABLE master.users
--   ADD CONSTRAINT users_username_key UNIQUE (username);

-- UNIQUE (nis) di master.students - NIS dipakai sebagai username akun
-- ortu, jadi harus unik juga di level data siswa.
-- ALTER TABLE master.students
--   ADD CONSTRAINT students_nis_key UNIQUE (nis);
