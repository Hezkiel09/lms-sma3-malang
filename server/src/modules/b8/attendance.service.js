import { master, b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';
import { ATTENDANCE_STATUSES, STUDENT_CHECKIN_STATUSES } from './b8.constants.js';
import { notifyMany } from './notification.service.js';

const isValidDate = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

// Rekap jumlah per status.
const summarize = (rows) =>
  rows.reduce(
    (acc, r) => {
      if (r.status in acc) acc[r.status] += 1;
      return acc;
    },
    { hadir: 0, sakit: 0, izin: 0, alpha: 0 }
  );

function checkRange(from, to) {
  if (from && !isValidDate(from)) throw httpError(422, 'Format from tidak valid (pakai YYYY-MM-DD)');
  if (to && !isValidDate(to)) throw httpError(422, 'Format to tidak valid (pakai YYYY-MM-DD)');
  if (from && to && from > to) throw httpError(422, 'Rentang tanggal tidak valid (from lebih besar dari to)');
}

// PostgREST membatasi 1000 baris per request: ambil bertahap.
async function fetchAll(build) {
  const out = [];
  for (let start = 0; ; start += 1000) {
    const chunk = unwrap(await build().range(start, start + 999));
    out.push(...chunk);
    if (chunk.length < 1000) break;
  }
  return out;
}

async function selectByIds(fromFn, columns, ids, col = 'id') {
  const uniq = [...new Set(ids.filter(Boolean))];
  const out = [];
  for (let i = 0; i < uniq.length; i += 100) {
    out.push(...unwrap(await fromFn().select(columns).in(col, uniq.slice(i, i + 100))));
  }
  return out;
}

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // cegah formula injection di Excel
  return `"${s.replace(/"/g, '""')}"`;
};

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
  const schedules = await selectByIds(() => master().from('schedules'), '*', scheduleIds);
  const subjects = await selectByIds(() => master().from('subjects'), 'id, name', schedules.map((s) => s.subject_id));
  const classes = await selectByIds(() => master().from('classes'), 'id, name', schedules.map((s) => s.class_id));
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

// schedule_id -> nama mata pelajaran
async function subjectNameBySchedule(scheduleIds) {
  const schedules = await selectByIds(() => master().from('schedules'), 'id, subject_id', scheduleIds);
  const subjects = await selectByIds(() => master().from('subjects'), 'id, name', schedules.map((s) => s.subject_id));
  const nameBySubject = Object.fromEntries(subjects.map((s) => [s.id, s.name]));
  return Object.fromEntries(schedules.map((s) => [s.id, nameBySubject[s.subject_id] ?? null]));
}

// Tempelkan data siswa dan nama mapel ke baris presensi.
async function enrichAttendances(rows) {
  const students = await selectByIds(() => master().from('students'), 'id, nis, name', rows.map((r) => r.student_id));
  const studentById = Object.fromEntries(students.map((s) => [s.id, s]));
  const subjectBySchedule = await subjectNameBySchedule(rows.map((r) => r.schedule_id));
  return rows.map((r) => ({
    ...r,
    student: studentById[r.student_id] ?? null,
    subject_name: subjectBySchedule[r.schedule_id] ?? null,
  }));
}

// UC-12: guru buka sesi untuk 1 jadwal + tanggal. Semua siswa kelas otomatis alpha,
// lalu semua siswa kelas dinotifikasi (UC-19).
export async function openSession(userId, { scheduleId, date } = {}) {
  if (!scheduleId || !date) throw httpError(422, 'scheduleId dan date wajib diisi');
  if (!isValidDate(date)) throw httpError(422, 'Format date tidak valid (pakai YYYY-MM-DD)');

  const teacher = await getTeacher(userId);
  const schedule = unwrap(await master().from('schedules').select('*').eq('id', scheduleId).maybeSingle());
  if (!schedule) throw httpError(404, 'Jadwal tidak ditemukan');
  if (schedule.teacher_id !== teacher.id) throw httpError(403, 'Ini bukan jadwal mengajar kamu');
  if (!schedule.class_id) throw httpError(422, 'Jadwal ini belum punya kelas');

  // Sesi untuk jadwal + tanggal yang sama sudah ada (alt flow 1: arahkan ke koreksi).
  const dup = unwrap(
    await b8().from('attendance_sessions').select('id').eq('schedule_id', scheduleId).eq('date', date).limit(1)
  );
  if (dup.length) {
    throw httpError(409, 'Sesi untuk jadwal dan tanggal ini sudah ada', { sessionId: dup[0].id });
  }

  const students = unwrap(
    await master().from('students').select('id, nis, name, user_id').eq('class_id', schedule.class_id)
  );
  if (!students.length) throw httpError(422, 'Kelas ini belum punya siswa');

  const session = unwrap(
    await b8()
      .from('attendance_sessions')
      .insert({ schedule_id: scheduleId, date, opened_by: teacher.id })
      .select()
      .single()
  );

  // supabase-js tidak punya transaksi: kalau insert presensi gagal, sesi dihapus lagi.
  const { data: rows, error } = await b8()
    .from('attendances')
    .insert(
      students.map((s) => ({
        session_id: session.id,
        student_id: s.id,
        schedule_id: scheduleId,
        date,
        status: 'alpha',
        recorded_by: teacher.id,
        source: 'guru',
      }))
    )
    .select();
  if (error) {
    await b8().from('attendance_sessions').delete().eq('id', session.id);
    throw httpError(500, error.message);
  }

  // UC-19: notifikasi ke siswa kelas (tidak membatalkan proses utama kalau gagal).
  try {
    const subject = schedule.subject_id
      ? unwrap(await master().from('subjects').select('name').eq('id', schedule.subject_id).maybeSingle())
      : null;
    await notifyMany(
      students.map((s) => s.user_id),
      {
        title: 'Sesi presensi dibuka',
        message: `Sesi presensi ${subject?.name ?? 'pelajaran'} tanggal ${date} sudah dibuka. Silakan isi presensi kamu.`,
        type: 'presensi',
      }
    );
  } catch (e) {
    console.error('[notif] sesi dibuka:', e.message);
  }

  const studentById = Object.fromEntries(students.map((s) => [s.id, { id: s.id, nis: s.nis, name: s.name }]));
  const attendances = rows
    .map((r) => ({ ...r, student: studentById[r.student_id] ?? null }))
    .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? ''));
  return { ...session, summary: summarize(rows), attendances };
}

// Daftar sesi milik guru. Filter opsional: scheduleId, classId, subjectId, date, from, to.
export async function listMySessions(userId, { scheduleId, classId, subjectId, date, from, to } = {}) {
  checkRange(from, to);
  const teacher = await getTeacher(userId);

  let scheduleIds = null;
  if (classId || subjectId) {
    let sq = master().from('schedules').select('id').eq('teacher_id', teacher.id);
    if (classId) sq = sq.eq('class_id', classId);
    if (subjectId) sq = sq.eq('subject_id', subjectId);
    scheduleIds = unwrap(await sq).map((s) => s.id);
    if (!scheduleIds.length) return [];
  }

  let q = b8()
    .from('attendance_sessions')
    .select('*')
    .eq('opened_by', teacher.id)
    .order('date', { ascending: false })
    .limit(100);
  if (scheduleId) q = q.eq('schedule_id', scheduleId);
  if (scheduleIds) q = q.in('schedule_id', scheduleIds);
  if (date) q = q.eq('date', date);
  if (from) q = q.gte('date', from);
  if (to) q = q.lte('date', to);
    const sessions = await withSchedule(unwrap(await q));
  if (!sessions.length) return sessions;
  const ids = sessions.map((s) => s.id);
  const rows = [];
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    rows.push(
      ...(await fetchAll(() =>
        b8().from('attendances').select('session_id, status').in('session_id', chunk).order('id')
      ))
    );
  }
  const bySession = {};
  rows.forEach((r) => (bySession[r.session_id] ??= []).push(r));
  return sessions.map((s) => ({
    ...s,
    summary: summarize(bySession[s.id] ?? []),
    total: (bySession[s.id] ?? []).length,
  }));
}

// Detail sesi + daftar siswa + rekap sementara (UC-13, UC-14).
export async function getSession(userId, role, id) {
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', id).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (role === 'teacher') {
    const teacher = await getTeacher(userId);
    if (session.opened_by !== teacher.id) throw httpError(403, 'Ini bukan sesi kamu');
  }

  const [full] = await withSchedule([session]);
  const rows = unwrap(await b8().from('attendances').select('*').eq('session_id', id));
  const students = await selectByIds(() => master().from('students'), 'id, nis, name', rows.map((r) => r.student_id));
  const studentById = Object.fromEntries(students.map((s) => [s.id, s]));
  const attendances = rows
    .map((r) => ({ ...r, student: studentById[r.student_id] ?? null }))
    .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? ''));
  return { ...full, summary: summarize(rows), attendances };
}

// UC-14: tutup sesi, lalu notifikasi ke siswa kelas (UC-19).
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

  try {
    const [full] = await withSchedule([session]);
    const classId = full.schedule?.class_id;
    if (classId) {
      const students = unwrap(await master().from('students').select('user_id').eq('class_id', classId));
      await notifyMany(
        students.map((s) => s.user_id),
        {
          title: 'Sesi presensi ditutup',
          message: `Sesi presensi ${full.schedule?.subject?.name ?? 'pelajaran'} tanggal ${session.date} sudah ditutup.`,
          type: 'presensi',
        }
      );
    }
  } catch (e) {
    console.error('[notif] sesi ditutup:', e.message);
  }
  return closed;
}

// UC-27: sesi terbuka untuk kelas siswa + presensi dia sendiri.
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

// UC-27: siswa mengisi presensi sendiri (hadir / izin / sakit), hanya kalau masih alpha.
export async function checkin(userId, sessionId, { status, notes } = {}) {
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
  if (existing && existing.status !== 'alpha') throw httpError(409, 'Presensi sudah tercatat');

  if (existing) {
    const updated = unwrap(
      await b8()
        .from('attendances')
        .update({ status, notes: notes ?? null, source: 'siswa' })
        .eq('id', existing.id)
        .eq('status', 'alpha')
        .select()
    );
    if (!updated.length) throw httpError(409, 'Presensi sudah tercatat');
    return updated[0];
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

// UC-13: koreksi satu presensi. Mengembalikan { data, changed }. Tidak ada notifikasi.
function assertNotes(status, notes) {
  if ((status === 'izin' || status === 'sakit') && !String(notes ?? '').trim()) {
    throw httpError(422, 'Catatan wajib diisi untuk izin dan sakit');
  }
}

export async function updateAttendance(userId, id, { status, notes } = {}) {
  if (!ATTENDANCE_STATUSES.includes(status)) {
    throw httpError(422, `status harus salah satu dari: ${ATTENDANCE_STATUSES.join(', ')}`);
  }
  const teacher = await getTeacher(userId);
  const existing = unwrap(await b8().from('attendances').select('*').eq('id', id).maybeSingle());
  if (!existing) throw httpError(404, 'Data presensi tidak ditemukan');

  const session = existing.session_id
    ? unwrap(await b8().from('attendance_sessions').select('opened_by').eq('id', existing.session_id).maybeSingle())
    : null;
  if (session?.opened_by !== teacher.id) throw httpError(403, 'Presensi ini bukan dari sesi kamu');

  assertNotes(status, notes ?? existing.notes);
  if (existing.status === status && (notes === undefined || notes === existing.notes)) {
  }

  const data = unwrap(
    await b8()
      .from('attendances')
      .update({ status, notes: notes ?? existing.notes, source: 'guru', recorded_by: teacher.id })
      .eq('id', id)
      .select()
      .single()
  );
  return { data, changed: true };
}

//tombol "Simpan Perubahan" - banyak siswa sekaligus.
export async function updateSessionAttendances(userId, sessionId, changes) {
  if (!Array.isArray(changes) || !changes.length) {
    throw httpError(422, 'changes wajib berisi minimal 1 item');
  }
  const teacher = await getTeacher(userId);
  await getOwnedSession(sessionId, teacher.id);

  const rows = unwrap(await b8().from('attendances').select('*').eq('session_id', sessionId));
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  // Validasi semua dulu supaya tidak ada yang setengah tersimpan karena input salah.
  const todo = [];
  for (const c of changes) {
    if (!ATTENDANCE_STATUSES.includes(c?.status)) {
      throw httpError(422, `status harus salah satu dari: ${ATTENDANCE_STATUSES.join(', ')}`);
    }
    const row = byId[c.attendanceId];
    if (!row) throw httpError(404, `Presensi ${c.attendanceId} bukan bagian dari sesi ini`);
    assertNotes(c.status, c.notes ?? row.notes);
    if (row.status === c.status && (c.notes === undefined || c.notes === row.notes)) continue;
  }
  if (!todo.length) return { changed: false, updated: [] };

  const updated = await Promise.all(
    todo.map(async ({ row, c }) =>
      unwrap(
        await b8()
          .from('attendances')
          .update({ status: c.status, notes: c.notes ?? row.notes, source: 'guru', recorded_by: teacher.id })
          .eq('id', row.id)
          .select()
          .single()
      )
    )
  );
  return { changed: true, updated };
}

// Guru hanya melihat jadwal miliknya. Filter: classId, subjectId, studentId, status, from, to.
export async function listAttendances(userId, role, { classId, subjectId, studentId, status, from, to } = {}) {
  checkRange(from, to);
  if (status && !ATTENDANCE_STATUSES.includes(status)) {
    throw httpError(422, `status harus salah satu dari: ${ATTENDANCE_STATUSES.join(', ')}`);
  }

  let scheduleIds = null;
  if (role === 'teacher' || classId || subjectId) {
    let sq = master().from('schedules').select('id');
    if (role === 'teacher') {
      const teacher = await getTeacher(userId);
      sq = sq.eq('teacher_id', teacher.id);
    }
    if (classId) sq = sq.eq('class_id', classId);
    if (subjectId) sq = sq.eq('subject_id', subjectId);
    scheduleIds = unwrap(await sq).map((s) => s.id);
    if (!scheduleIds.length) return { summary: summarize([]), records: [] };
  }

  let q = b8().from('attendances').select('*').order('date', { ascending: false }).limit(1000);
  if (scheduleIds) q = q.in('schedule_id', scheduleIds);
  if (studentId) q = q.eq('student_id', studentId);
  if (status) q = q.eq('status', status);
  if (from) q = q.gte('date', from);
  if (to) q = q.lte('date', to);
  const rows = unwrap(await q);

  return { summary: summarize(rows), records: await enrichAttendances(rows) };
}

// UC-15: export rekap presensi per siswa (CSV). Mengembalikan { filename, csv }.
export async function exportAttendances(userId, { classId, subjectId, from, to } = {}) {
  if (!classId || !subjectId || !from || !to) {
    throw httpError(422, 'classId, subjectId, from, dan to wajib diisi');
  }
  checkRange(from, to);

  const teacher = await getTeacher(userId);
  const schedules = unwrap(
    await master()
      .from('schedules')
      .select('id')
      .eq('teacher_id', teacher.id)
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
  );
  if (!schedules.length) throw httpError(403, 'Kamu tidak punya jadwal pada kelas dan mata pelajaran ini');
  const scheduleIds = schedules.map((s) => s.id);

  const rows = await fetchAll(() =>
    b8()
      .from('attendances')
      .select('student_id, status')
      .in('schedule_id', scheduleIds)
      .gte('date', from)
      .lte('date', to)
      .order('id')
  );
  if (!rows.length) throw httpError(404, 'Data presensi kosong pada periode ini');

  const students = unwrap(
    await master().from('students').select('id, nis, name').eq('class_id', classId).order('name')
  );
  const tally = Object.fromEntries(students.map((s) => [s.id, { hadir: 0, sakit: 0, izin: 0, alpha: 0 }]));
  for (const r of rows) {
    if (tally[r.student_id] && r.status in tally[r.student_id]) tally[r.student_id][r.status] += 1;
  }

  const cls = unwrap(await master().from('classes').select('name').eq('id', classId).maybeSingle());
  const subj = unwrap(await master().from('subjects').select('name').eq('id', subjectId).maybeSingle());

  const header = ['NIS', 'Nama', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Total'];
  const lines = students.map((s) => {
    const t = tally[s.id];
    return [s.nis, s.name, t.hadir, t.sakit, t.izin, t.alpha, t.hadir + t.sakit + t.izin + t.alpha];
  });
  const csv = '\uFEFF' + [header, ...lines].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const filename = `rekap-presensi_${cls?.name ?? 'kelas'}_${subj?.name ?? 'mapel'}_${from}_${to}.csv`.replace(
    /[^A-Za-z0-9._-]+/g,
    '_'
  );
  return { filename, csv };
}

// Riwayat presensi satu siswa.
// Ortu: anak sendiri. Siswa: dirinya sendiri. Mengembalikan { summary, records }.
export async function getStudentAttendances(userId, role, studentId, { from, to } = {}) {
  checkRange(from, to);
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

  const subjectBySchedule = await subjectNameBySchedule(rows.map((r) => r.schedule_id));
  const records = rows.map((r) => ({ ...r, subject_name: subjectBySchedule[r.schedule_id] ?? null }));
  return { summary: summarize(rows), records };
}