alter table b8.attendances
  add column if not exists recorded_at timestamptz;

alter table b8.attendance_sessions
  add column if not exists topic text,
  add column if not exists learning_outcome text,
  add column if not exists method text not null default 'siswa';

alter table b8.attendance_sessions
  drop constraint if exists attendance_sessions_method_check;
alter table b8.attendance_sessions
  add constraint attendance_sessions_method_check check (method in ('siswa', 'manual'));

-- Data lama: yang sudah terisi dianggap sudah tercatat.
update b8.attendances
   set recorded_at = now()
 where recorded_at is null
   and (status <> 'alpha' or source = 'siswa');

notify pgrst, 'reload schema';