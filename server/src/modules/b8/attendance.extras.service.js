import { master, b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';
import { notifyMany } from './notification.service.js';
import { selectByIds, emptySummary } from './b8.utils.js';
import { sessionClock } from './b8.time.js';

const THRESHOLD = 80; // batas minimum kehadiran sekolah (%)

const isValidDate = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

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

async function getTeacher(userId) {
  const t = unwrap(await master().from('teachers').select('id, name').eq('user_id', userId).maybeSingle());
  if (!t) throw httpError(404, 'Profil guru tidak ditemukan');
  return t;
}

// Rekap presensi per siswa per pertemuan (halaman Rekap Presensi).
// Hanya sesi yang sudah ditutup yang dihitung. Persentase = hadir / jumlah pertemuan.
export async function getRecap(userId, role, { classId, subjectId, from, to } = {}) {
  if (!classId || !subjectId) throw httpError(422, 'classId dan subjectId wajib diisi');
  checkRange(from, to);

  let sq = master().from('schedules').select('id').eq('class_id', classId).eq('subject_id', subjectId);
  if (role === 'teacher') {
    const teacher = await getTeacher(userId);
    sq = sq.eq('teacher_id', teacher.id);
  }
  const scheduleIds = unwrap(await sq).map((s) => s.id);
  if (role === 'teacher' && !scheduleIds.length) {
    throw httpError(403, 'Kamu tidak punya jadwal pada kelas dan mata pelajaran ini');
  }

  const cls = unwrap(await master().from('classes').select('id, name').eq('id', classId).maybeSingle());
  const subj = unwrap(await master().from('subjects').select('id, name').eq('id', subjectId).maybeSingle());
  const students = unwrap(
    await master().from('students').select('id, nis, name, parent_id').eq('class_id', classId).order('name')
  );

  let sessions = [];
  let rows = [];
  if (scheduleIds.length) {
    let q = b8()
      .from('attendance_sessions')
      .select('id, date')
      .in('schedule_id', scheduleIds)
      .eq('status', 'closed')
      .order('date', { ascending: true })
      .order('opened_at', { ascending: true });
    if (from) q = q.gte('date', from);
    if (to) q = q.lte('date', to);
    sessions = unwrap(await q);

    if (sessions.length) {
      rows = await fetchAll(() => {
        let aq = b8()
          .from('attendances')
          .select('student_id, session_id, status')
          .in('schedule_id', scheduleIds)
          .not('session_id', 'is', null)
          .order('id');
        if (from) aq = aq.gte('date', from);
        if (to) aq = aq.lte('date', to);
        return aq;
      });
    }
  }

  const meetings = sessions.map((s, i) => ({ id: s.id, number: i + 1, date: s.date }));
  const statusOf = {};
  rows.forEach((r) => (statusOf[`${r.student_id}|${r.session_id}`] = r.status));

  const list = students.map((st) => {
    const counts = emptySummary();
    const perMeeting = meetings.map((m) => {
      const status = statusOf[`${st.id}|${m.id}`] ?? null;
      if (status && status in counts) counts[status] += 1;
      return { number: m.number, sessionId: m.id, status };
    });
    const percent = meetings.length ? Math.round((counts.hadir / meetings.length) * 100) : null;
    return {
      id: st.id,
      nis: st.nis,
      name: st.name,
      parentId: st.parent_id ?? null,
      meetings: perMeeting,
      ...counts,
      percent,
      needsAttention: percent !== null && percent < THRESHOLD,
    };
  });

  const withPercent = list.filter((s) => s.percent !== null);
  const summary = {
    averagePercent: withPercent.length
      ? Math.round(withPercent.reduce((a, s) => a + s.percent, 0) / withPercent.length)
      : null,
    label: null,
    belowThreshold: list.filter((s) => s.needsAttention).length,
    totalIzinSakit: list.reduce((a, s) => a + s.izin + s.sakit, 0),
    totalAlpha: list.reduce((a, s) => a + s.alpha, 0),
  };

  summary.label = summary.averagePercent === null ? null : summary.averagePercent >= THRESHOLD ? 'Baik' : 'Perlu perhatian';

  return {
    class: cls,
    subject: subj,
    period: { from: from ?? null, to: to ?? null },
    threshold: THRESHOLD,
    meetings,
    summary,
    students: list,
  };
}

// Tombol "Ingatkan N siswa": notifikasi ke siswa yang belum mengisi (belum ada recorded_at).
export async function remindStudents(userId, sessionId) {
  const teacher = await getTeacher(userId);
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', sessionId).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (session.opened_by !== teacher.id) throw httpError(403, 'Ini bukan sesi kamu');

  const schedule = unwrap(
    await master().from('schedules').select('subject_id, end_time').eq('id', session.schedule_id).maybeSingle()
  );
  if (sessionClock(session, schedule).state !== 'open') throw httpError(409, 'Sesi sudah berakhir atau ditutup');
  if (session.method === 'manual') throw httpError(409, 'Presensi sesi ini dicatat manual oleh guru');

  const pending = unwrap(
    await b8().from('attendances').select('student_id').eq('session_id', sessionId).is('recorded_at', null)
  );
  if (!pending.length) return { reminded: 0, message: 'Semua siswa sudah mengisi.' };

  const students = await selectByIds(() => master().from('students'), 'id, user_id', pending.map((p) => p.student_id));
  const subject = schedule?.subject_id
    ? unwrap(await master().from('subjects').select('name').eq('id', schedule.subject_id).maybeSingle())
    : null;

  const reminded = await notifyMany(
    students.map((s) => s.user_id),
    {
      title: 'Pengingat: presensi masih terbuka',
      message: `Presensi ${subject?.name ?? 'pelajaran'} belum kamu isi. Segera isi sebelum ditutup guru.`,
      type: 'presensi',
      data: { action: 'isi_presensi', sessionId },
    }
  );

  unwrap(
    await b8()
      .from('attendance_sessions')
      .update({ last_reminded_at: new Date().toISOString(), last_reminded_count: reminded })
      .eq('id', sessionId)
      .select('id')
  );
  return { reminded, message: `Pengingat dikirim ke ${reminded} siswa.` };
}