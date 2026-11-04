-- 005: pastikan semua kolom yang dipakai kode backend B8 ada.
-- Aman dijalankan berulang (IF NOT EXISTS). Jalankan di Supabase SQL Editor.
-- Kalau kolom ini belum ada, "Buka Sesi" gagal (500) dan notifikasi tidak terbuat.

alter table b8.attendances
  add column if not exists recorded_at timestamptz;

alter table b8.attendance_sessions
  add column if not exists topic text,
  add column if not exists learning_outcome text,
  add column if not exists method text not null default 'siswa',
  add column if not exists notify_on_open boolean not null default true,
  add column if not exists remind_unfilled boolean not null default true,
  add column if not exists remind_after_minutes integer not null default 15,
  add column if not exists notify_on_close boolean not null default true,
  add column if not exists last_reminded_at timestamptz,
  add column if not exists last_reminded_count integer;

alter table b8.attendance_sessions
  drop constraint if exists attendance_sessions_method_check;
alter table b8.attendance_sessions
  add constraint attendance_sessions_method_check check (method in ('siswa', 'manual'));

alter table b8.notifications
  add column if not exists data jsonb;

-- Data lama yang sudah terisi dianggap sudah tercatat (sama seperti 004).
update b8.attendances
   set recorded_at = now()
 where recorded_at is null
   and (status <> 'alpha' or source = 'siswa');

notify pgrst, 'reload schema';

-- CEK (opsional, jalankan SEBELUM migrasi untuk tahu apa yang kurang):
-- select v.t as tabel, v.c as kolom_yang_kurang
-- from (values
--   ('attendances','recorded_at'),
--   ('attendance_sessions','topic'),('attendance_sessions','learning_outcome'),
--   ('attendance_sessions','method'),('attendance_sessions','notify_on_open'),
--   ('attendance_sessions','remind_unfilled'),('attendance_sessions','remind_after_minutes'),
--   ('attendance_sessions','notify_on_close'),('attendance_sessions','last_reminded_at'),
--   ('attendance_sessions','last_reminded_count'),('notifications','data')
-- ) as v(t, c)
-- where not exists (
--   select 1 from information_schema.columns
--   where table_schema = 'b8' and table_name = v.t and column_name = v.c
-- );