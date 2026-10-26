import { supabaseAdmin } from '../../config/supabase.js';
import { httpError } from './b8.http.js';
import { ATTENDANCE_STATUSES, STUDENT_CHECKIN_STATUSES } from './b8.constants.js';
import { notifyUser } from './notification.service.js';

const master = () => supabaseAdmin.schema('master');
const b8 = () => supabaseAdmin.schema('b8');

// Ambil data dari hasil query; lempar error HTTP kalau gagal.
const unwrap = ({ data, error }) => {
  if (error) {
    if (error.code === '23505') throw httpError(409, 'Data sudah ada (duplikat).');
    if (error.code === '22P02') throw httpError(422, 'Format id tidak valid.');
    throw httpError(500, error.message);
  }
  return data;
};

const isValidDate = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

async function getTeacher(userId) {
  const t = unwrap(await master().from('teachers').select('id, name').eq('user_id', userId).maybeSingle());
  if (!t) throw httpError(404, 'Profil guru tidak ditemukan');
  return t;
}

async function getStudent(userId) {
  const s = unwrap(await master().from('students').select('id, name, class_id').eq('user_id', userId).maybeSingle());
  if (!s) throw httpError(404, 'Profil siswa tidak ditemukan');
  return s;
}

async function getOwnedSession(id, teacherId) {
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', id).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (session.opened_by !== teacherId) throw httpError(403, 'Ini bukan sesi kamu');
  return session;
}

// Tempelkan schedule + subject + class ke tiap sesi (tanpa embed lintas schema).
async function withSchedule(sessions) {
  if (!sessions.length) return sessions;
  const scheduleIds = [...new Set(sessions.map((s) => s.schedule_id))];
  const schedules = unwrap(await master().from('schedules').select('*').in('id', scheduleIds));
  const subjectIds = [...new Set(schedules.map((s) => s.subject_id).filter(Boolean))];
  const classIds = [...new Set(schedules.map((s) => s.class_id).filter(Boolean))];
  const subjects = subjectIds.length
    ? unwrap(await master().from('subjects').select('id, name').in('id', subjectIds))
    : [];
  const classes = classIds.length
    ? unwrap(await master().from('classes').select('id, name').in('id', classIds))
    : [];
  const subjectById = Object.fromEntries(subjects.map((x) => [x.id, x]));
  const classById = Object.fromEntries(classes.map((x) => [x.id, x]));
  const scheduleById = Object.fromEntries(
    schedules.map((s) => [
      s.id,
      { ...s, subject: subjectById[s.subject_id] ?? null, class: classById[s.class_id] ?? null },
    ])
  );
  return sessions.map((s) => ({ ...s, schedule: scheduleById[s.schedule_id] ?? null }));
}

// Untuk daftar siswa: nama siswa + user_id orang tuanya.
async function parentsOfStudents(studentIds) {
  if (!studentIds.length) return [];
  const students = unwrap(await master().from('students').select('id, name, parent_id').in('id', studentIds));
  const parentIds = [...new Set(students.map((s) => s.parent_id).filter(Boolean))];
  const parents = parentIds.length
    ? unwrap(await master().from('parents').select('id, user_id').in('id', parentIds))
    : [];
  const userByParent = Object.fromEntries(parents.map((p) => [p.id, p.user_id]));
  return students.map((s) => ({ id: s.id, name: s.name, parentUserId: userByParent[s.parent_id] ?? null }));
}

// ---------------------------------------------------------------

// Guru buka sesi untuk 1 jadwal + tanggal. Semua siswa kelas itu otomatis alpha.
export async function openSession(userId, { scheduleId, date }) {
  if (!scheduleId || !date) throw httpError(422, 'scheduleId dan date wajib diisi');
  if (!isValidDate(date)) throw httpError(422, 'Format date tidak valid (pakai YYYY-MM-DD)');

  const teacher = await getTeacher(userId);
  const schedule = unwrap(await master().from('schedules').select('*').eq('id', scheduleId).maybeSingle());
  if (!schedule) throw httpError(404, 'Jadwal tidak ditemukan');
  if (schedule.teacher_id !== teacher.id) throw httpError(403, 'Ini bukan jadwal mengajar kamu');
  if (!schedule.class_id) throw httpError(422, 'Jadwal ini belum punya kelas');

  const students = unwrap(await master().from('students').select('id').eq('class_id', schedule.class_id));
  if (!students.length) throw httpError(422, 'Kelas ini belum punya siswa');

  let session;
  try {
    session = unwrap(
      await b8()
        .from('attendance_sessions')
        .insert({ schedule_id: scheduleId, date, opened_by: teacher.id })
        .select()
        .single()
    );
  } catch (e) {
    if (e.status === 409) throw httpError(409, 'Sesi untuk jadwal dan tanggal ini sudah ada');
    throw e;
  }

  // supabase-js tidak punya transaksi: kalau insert presensi gagal, sesi dihapus lagi.
  const { error } = await b8()
    .from('attendances')
    .insert(
      students.map((s) => ({
        session_id: session.id,
        student_id: s.id,
        schedule_id: scheduleId,
        date,
        status: 'alpha',
      }))
    );
  if (error) {
    await b8().from('attendance_sessions').delete().eq('id', session.id);
    throw httpError(500, error.message);
  }
  return session;
}

export async function listMySessions(userId, { date }) {
  const teacher = await getTeacher(userId);
  let q = b8()
    .from('attendance_sessions')
    .select('*')
    .eq('opened_by', teacher.id)
    .order('date', { ascending: false })
    .limit(50);
  if (date) q = q.eq('date', date);
  return withSchedule(unwrap(await q));
}

export async function getSession(userId, role, id) {
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', id).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (role === 'teacher') {
    const teacher = await getTeacher(userId);
    if (session.opened_by !== teacher.id) throw httpError(403, 'Ini bukan sesi kamu');
  }

  const [full] = await withSchedule([session]);
  const rows = unwrap(await b8().from('attendances').select('*').eq('session_id', id));
  const students = rows.length
    ? unwrap(await master().from('students').select('id, nis, name').in('id', rows.map((r) => r.student_id)))
    : [];
  const studentById = Object.fromEntries(students.map((s) => [s.id, s]));
  const attendances = rows
    .map((r) => ({ ...r, student: studentById[r.student_id] ?? null }))
    .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? ''));
  return { ...full, attendances };
}

// Tutup sesi. Yang belum check-in tetap alpha. Ortu siswa yang tidak hadir dikabari.
export async function closeSession(userId, id) {
  const teacher = await getTeacher(userId);
  const session = await getOwnedSession(id, teacher.id);
  if (session.status === 'closed') throw httpError(409, 'Sesi sudah ditutup');

  const closed = unwrap(
    await b8()
      .from('attendance_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  );

  const [full] = await withSchedule([session]);
  const mapel = full.schedule?.subject?.name ?? 'pelajaran';
  const notHadir = unwrap(await b8().from('attendances').select('student_id, status').eq('session_id', id).neq('status', 'hadir'));
  const info = await parentsOfStudents(notHadir.map((a) => a.student_id));
  const statusByStudent = Object.fromEntries(notHadir.map((a) => [a.student_id, a.status]));

  // Gagal kirim notifikasi tidak boleh menggagalkan penutupan sesi.
  await Promise.allSettled(
    info
      .filter((s) => s.parentUserId)
      .map((s) =>
        notifyUser({
          userId: s.parentUserId,
          title: 'Presensi anak',
          message: `${s.name} tercatat ${statusByStudent[s.id]} pada ${mapel} (${session.date})`,
          type: 'presensi',
        })
      )
  );
  return closed;
}

// Sesi terbuka untuk kelas siswa + presensi dia sendiri.
export async function activeForMe(userId) {
  const student = await getStudent(userId);
  if (!student.class_id) return [];
  const schedules = unwrap(await master().from('schedules').select('id').eq('class_id', student.class_id));
  if (!schedules.length) return [];

  const sessions = unwrap(
    await b8()
      .from('attendance_sessions')
      .select('*')
      .eq('status', 'open')
      .in('schedule_id', schedules.map((s) => s.id))
      .order('opened_at', { ascending: false })
  );
  if (!sessions.length) return [];

  const mine = unwrap(
    await b8().from('attendances').select('*').eq('student_id', student.id).in('session_id', sessions.map((s) => s.id))
  );
  const mineBySession = Object.fromEntries(mine.map((a) => [a.session_id, a]));
  const full = await withSchedule(sessions);
  return full.map((s) => ({ ...s, myAttendance: mineBySession[s.id] ?? null }));
}

// Siswa check-in sendiri: hadir / sakit.
export async function checkin(userId, sessionId, { status, notes }) {
  if (!STUDENT_CHECKIN_STATUSES.includes(status)) {
    throw httpError(422, `status harus salah satu dari: ${STUDENT_CHECKIN_STATUSES.join(', ')}`);
  }
  const student = await getStudent(userId);
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', sessionId).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (session.status !== 'open') throw httpError(409, 'Sesi sudah ditutup');

  const schedule = unwrap(await master().from('schedules').select('class_id').eq('id', session.schedule_id).maybeSingle());
  if (!schedule || schedule.class_id !== student.class_id) throw httpError(403, 'Sesi ini bukan untuk kelas kamu');

  const existing = unwrap(
    await b8().from('attendances').select('*').eq('session_id', sessionId).eq('student_id', student.id).maybeSingle()
  );
  if (existing?.source === 'guru') throw httpError(409, 'Presensi kamu sudah diubah guru');

  if (existing) {
    return unwrap(
      await b8()
        .from('attendances')
        .update({ status, notes: notes ?? null, source: 'siswa' })
        .eq('id', existing.id)
        .select()
        .single()
    );
  }
  // Siswa pindah kelas setelah sesi dibuka: belum punya baris, buatkan.
  return unwrap(
    await b8()
      .from('attendances')
      .insert({
        session_id: sessionId,
        student_id: student.id,
        schedule_id: session.schedule_id,
        date: session.date,
        status,
        notes: notes ?? null,
        source: 'siswa',
      })
      .select()
      .single()
  );
}

// Koreksi presensi oleh guru (termasuk set "izin").
export async function updateAttendance(userId, role, id, { status, notes }) {
  if (!ATTENDANCE_STATUSES.includes(status)) {
    throw httpError(422, `status harus salah satu dari: ${ATTENDANCE_STATUSES.join(', ')}`);
  }
  const existing = unwrap(await b8().from('attendances').select('*').eq('id', id).maybeSingle());
  if (!existing) throw httpError(404, 'Data presensi tidak ditemukan');

  let teacher = null;
  if (role === 'teacher') {
    teacher = await getTeacher(userId);
    const session = existing.session_id
      ? unwrap(await b8().from('attendance_sessions').select('opened_by').eq('id', existing.session_id).maybeSingle())
      : null;
    if (session?.opened_by !== teacher.id) throw httpError(403, 'Presensi ini bukan dari sesi kamu');
  }

  const updated = unwrap(
    await b8()
      .from('attendances')
      .update({ status, notes: notes ?? existing.notes, source: 'guru', recorded_by: teacher?.id ?? null })
      .eq('id', id)
      .select()
      .single()
  );

  // Kabari ortu hanya kalau status berubah dan bukan hadir.
  if (existing.status !== status && status !== 'hadir') {
    const [info] = await parentsOfStudents([existing.student_id]);
    if (info?.parentUserId) {
      await notifyUser({
        userId: info.parentUserId,
        title: 'Presensi anak diperbarui',
        message: `Presensi ${info.name} diubah menjadi ${status}`,
        type: 'presensi',
      }).catch((e) => console.error('Gagal kirim notifikasi:', e.message));
    }
  }
  return updated;
}

// Riwayat presensi siswa. Ortu: anak sendiri. Siswa: dirinya sendiri.
export async function getStudentAttendances(userId, role, studentId, { from, to }) {
  if (role === 'parent') {
    const parent = unwrap(await master().from('parents').select('id').eq('user_id', userId).maybeSingle());
    const child = parent
      ? unwrap(await master().from('students').select('id').eq('id', studentId).eq('parent_id', parent.id).maybeSingle())
      : null;
    if (!child) throw httpError(403, 'Tidak punya akses ke data siswa ini');
  }
  if (role === 'student') {
    const me = await getStudent(userId);
    if (me.id !== studentId) throw httpError(403, 'Tidak punya akses ke data siswa ini');
  }

  let q = b8().from('attendances').select('*').eq('student_id', studentId).order('date', { ascending: false });
  if (from) q = q.gte('date', from);
  if (to) q = q.lte('date', to);
  const rows = unwrap(await q);

  // Tempelkan nama mapel dari schedule.
  const scheduleIds = [...new Set(rows.map((r) => r.schedule_id).filter(Boolean))];
  const schedules = scheduleIds.length
    ? unwrap(await master().from('schedules').select('id, subject_id').in('id', scheduleIds))
    : [];
  const subjectIds = [...new Set(schedules.map((s) => s.subject_id).filter(Boolean))];
  const subjects = subjectIds.length
    ? unwrap(await master().from('subjects').select('id, name').in('id', subjectIds))
    : [];
  const nameBySubject = Object.fromEntries(subjects.map((s) => [s.id, s.name]));
  const subjectBySchedule = Object.fromEntries(schedules.map((s) => [s.id, nameBySubject[s.subject_id] ?? null]));
  return rows.map((r) => ({ ...r, subject_name: subjectBySchedule[r.schedule_id] ?? null }));
}