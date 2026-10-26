-- ============================================================
-- Presensi model baru: guru buka SESI presensi (per jadwal+tanggal),
-- siswa check-in sendiri ke sesi itu, guru bisa override kapan aja.
-- Jalankan di Supabase SQL Editor setelah 001_b8_additions.sql.
--
-- CATATAN ASUMSI (belum kamu konfirmasi, tapi dipakai di script ini):
-- - "izin" tetap cuma guru yang bisa set (siswa cuma punya opsi
--   Hadir / Sakit di sisi dia). Kalau ternyata siswa juga boleh ajuin
--   izin sendiri, gampang diubah - tinggal validasi app layer-nya
--   yang berubah, bukan struktur tabelnya.
-- - Durasi/auto-close sesi (poin 3 yang masih didiskusikan) SENGAJA
--   belum dikunci di sini. `closed_at` nullable & `status` open/closed
--   manual dulu - gampang ditambah logic auto-close belakangan tanpa
--   ubah struktur tabel.
-- - schedule_id & date yang lama di b8.attendances TIDAK di-drop,
--   cuma di-deprecate (biar data lama/manual-entry yang udah sempat
--   kesimpen gak ilang). Boleh di-drop belakangan kalau udah yakin
--   gak dipakai.
-- ============================================================

-- 1) Tabel baru: sesi presensi yang dibuka guru
CREATE TABLE IF NOT EXISTS b8.attendance_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL,
  date date NOT NULL,
  opened_by uuid,
  opened_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  -- Nilai valid: open | closed
  status character varying NOT NULL DEFAULT 'open',
  CONSTRAINT attendance_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_sessions_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES master.schedules(id),
  CONSTRAINT attendance_sessions_opened_by_fkey FOREIGN KEY (opened_by) REFERENCES master.teachers(id),
  -- Cegah guru buka 2 sesi buat jadwal & tanggal yang sama.
  CONSTRAINT attendance_sessions_schedule_date_key UNIQUE (schedule_id, date)
);

-- Sama kayak push_subscriptions di 001: aktifin RLS tanpa policy,
-- karena backend akses lewat connection string langsung (bukan
-- PostgREST), jadi gak kena blokir.
ALTER TABLE b8.attendance_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_sessions_status_check') THEN
    ALTER TABLE b8.attendance_sessions
      ADD CONSTRAINT attendance_sessions_status_check
      CHECK (status = ANY (ARRAY['open','closed']));
  END IF;
END $$;

-- 2) b8.attendances: tambah session_id + source (siapa yang isi
-- status - siswa sendiri atau guru yang override).
ALTER TABLE b8.attendances
  ADD COLUMN IF NOT EXISTS session_id uuid,
  ADD COLUMN IF NOT EXISTS source character varying;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendances_session_id_fkey') THEN
    ALTER TABLE b8.attendances
      ADD CONSTRAINT attendances_session_id_fkey FOREIGN KEY (session_id) REFERENCES b8.attendance_sessions(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendances_source_check') THEN
    ALTER TABLE b8.attendances
      ADD CONSTRAINT attendances_source_check
      CHECK (source IS NULL OR source = ANY (ARRAY['siswa','guru']));
  END IF;
END $$;

-- 3) Ganti unique constraint lama (student_id, schedule_id, date) ->
-- (session_id, student_id): 1 siswa cuma 1 baris per sesi presensi.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendances_student_schedule_date_key') THEN
    ALTER TABLE b8.attendances DROP CONSTRAINT attendances_student_schedule_date_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendances_session_student_key') THEN
    ALTER TABLE b8.attendances
      ADD CONSTRAINT attendances_session_student_key UNIQUE (session_id, student_id);
  END IF;
END $$;

-- 4) schedule_id & date lama di b8.attendances: dibiarin nullable,
-- ditandain deprecated di komentar kolom (dokumentasi, gak ngaruh ke
-- aplikasi).
COMMENT ON COLUMN b8.attendances.schedule_id IS 'DEPRECATED - pakai session_id -> attendance_sessions.schedule_id. Dibiarin buat data lama.';
COMMENT ON COLUMN b8.attendances.date IS 'DEPRECATED - pakai session_id -> attendance_sessions.date. Dibiarin buat data lama.';
