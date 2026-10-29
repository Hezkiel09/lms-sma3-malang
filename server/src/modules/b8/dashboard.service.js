import { master, b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';
import { listNotifications } from './notification.service.js';
import {
  nowInfo,
  dayIndex,
  emptySummary,
  summarize,
  selectByIds,
  gradesPlaceholder,
} from './b8.utils.js';

const STATUSES = ['hadir', 'sakit', 'izin', 'alpha'];

// UC-10: dashboard guru.
export async function teacherDashboard(userId) {
  const teacher = unwrap(
    await master().from('teachers').select('id, name').eq('user_id', userId).maybeSingle()
  );
  if (!teacher) throw httpError(404, 'Profil guru tidak ditemukan');

  const { date, dayName, monthStart, monthEnd } = nowInfo();
  const { unreadCount } = await listNotifications(userId, { limit: 1 });
  const base = {
    teacher,
    today: { date, day: dayName },
    period: { from: monthStart, to: monthEnd },
    grades: gradesPlaceholder(),
    unreadNotifications: unreadCount,
  };

  const schedules = unwrap(await master().from('schedules').select('*').eq('teacher_id', teacher.id));
  if (!schedules.length) {
    return {
      ...base,
      schedules: [],
      todaySchedules: [],
      openSessions: [],
      attendance: emptySummary(),
      message: 'Belum ada jadwal mengajar.',
    };
  }

  const subjects = await selectByIds(() => master().from('subjects'), 'id, name', schedules.map((s) => s.subject_id));
  const classes = await selectByIds(() => master().from('classes'), 'id, name', schedules.map((s) => s.class_id));
  const subjectById = Object.fromEntries(subjects.map((x) => [x.id, x.name]));
  const classById = Object.fromEntries(classes.map((x) => [x.id, x.name]));
  const enriched = schedules
    .map((s) => ({ ...s, subject_name: subjectById[s.subject_id] ?? null, class_name: classById[s.class_id] ?? null }))
    .sort((a, b) => dayIndex(a.day) - dayIndex(b.day) || String(a.start_time).localeCompare(String(b.start_time)));
  const scheduleById = Object.fromEntries(enriched.map((s) => [s.id, s]));
  const scheduleIds = enriched.map((s) => s.id);

  // Jadwal hari ini + sesi presensi hari ini (kalau sudah dibuka).
  const todayList = enriched.filter((s) => String(s.day ?? '').toLowerCase() === dayName.toLowerCase());
  const todaySessions = todayList.length
    ? unwrap(
        await b8()
          .from('attendance_sessions')
          .select('id, schedule_id, status')
          .eq('date', date)
          .in('schedule_id', todayList.map((s) => s.id))
      )
    : [];
  const sessionBySchedule = Object.fromEntries(todaySessions.map((s) => [s.schedule_id, s]));
  const todaySchedules = todayList.map((s) => ({ ...s, session: sessionBySchedule[s.id] ?? null }));

  // Sesi yang masih terbuka.
  const open = unwrap(
    await b8()
      .from('attendance_sessions')
      .select('id, schedule_id, date, opened_at')
      .eq('opened_by', teacher.id)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
  );
  const openSessions = open.map((s) => ({
    ...s,
    subject_name: scheduleById[s.schedule_id]?.subject_name ?? null,
    class_name: scheduleById[s.schedule_id]?.class_name ?? null,
  }));

  // Rekap presensi bulan ini (hitung per status, tidak kena batas 1000 baris).
  const counts = await Promise.all(
    STATUSES.map(async (status) => {
      const { count, error } = await b8()
        .from('attendances')
        .select('id', { count: 'exact', head: true })
        .in('schedule_id', scheduleIds)
        .eq('status', status)
        .gte('date', monthStart)
        .lte('date', monthEnd);
      if (error) throw httpError(500, error.message);
      return [status, count ?? 0];
    })
  );
  const attendance = Object.fromEntries(counts);

  return { ...base, schedules: enriched, todaySchedules, openSessions, attendance };
}

// UC-20: dashboard anak untuk orang tua. studentId opsional (pilih anak).
export async function parentDashboard(userId, { studentId } = {}) {
  const parent = unwrap(
    await master().from('parents').select('id, name').eq('user_id', userId).maybeSingle()
  );
  if (!parent) throw httpError(404, 'Profil orang tua tidak ditemukan');

  const { monthStart, monthEnd } = nowInfo();
  const { unreadCount, notifications } = await listNotifications(userId, { limit: 5 });
  const notif = { unreadCount, latest: notifications };

  const students = unwrap(
    await master().from('students').select('id, nis, name, class_id').eq('parent_id', parent.id).order('name')
  );
  if (!students.length) {
    return {
      parent,
      children: [],
      selected: null,
      notifications: notif,
      grades: gradesPlaceholder(),
      message: 'Akun belum terhubung dengan data siswa.',
    };
  }

  const classes = await selectByIds(() => master().from('classes'), 'id, name', students.map((s) => s.class_id));
  const classById = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const children = students.map((s) => ({
    id: s.id,
    name: s.name,
    nis: s.nis,
    class_id: s.class_id,
    class_name: classById[s.class_id] ?? null,
  }));

  const child = studentId ? children.find((c) => c.id === studentId) : children[0];
  if (!child) throw httpError(403, 'Tidak punya akses ke data siswa ini');

  const rows = unwrap(
    await b8()
      .from('attendances')
      .select('*')
      .eq('student_id', child.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false })
  );
  const schedules = await selectByIds(() => master().from('schedules'), 'id, subject_id', rows.map((r) => r.schedule_id));
  const subjects = await selectByIds(() => master().from('subjects'), 'id, name', schedules.map((s) => s.subject_id));
  const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s.name]));
  const subjectBySchedule = Object.fromEntries(schedules.map((s) => [s.id, subjectById[s.subject_id] ?? null]));

  return {
    parent,
    children, // untuk pilihan anak kalau lebih dari satu
    selected: child, // profil: nama, kelas, NIS
    period: { from: monthStart, to: monthEnd },
    attendance: {
      summary: summarize(rows),
      recent: rows.slice(0, 5).map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status,
        notes: r.notes,
        subject_name: subjectBySchedule[r.schedule_id] ?? null,
      })),
      message: rows.length ? null : 'Data presensi bulan ini belum ada.',
    },
    grades: gradesPlaceholder(),
    notifications: notif,
  };
}