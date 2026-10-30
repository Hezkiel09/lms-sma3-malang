import { master, b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';
import { notifyMany, notifyEach } from './notification.service.js';
import {
  wib,
  toHHMM,
  toMinutes,
  weekdayOf,
  weekdayOfDate,
  dateLabel,
  DAY_NAMES,
  sessionClock,
  scheduleTiming,
} from './b8.time.js';

const METHODS = ['siswa', 'manual'];
const REMIND_OPTIONS = [10, 15, 30];

const isValidDate = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

function checkRange(from, to) {
  if (from && !isValidDate(from)) throw httpError(422, 'Format from tidak valid (pakai YYYY-MM-DD)');
  if (to && !isValidDate(to)) throw httpError(422, 'Format to tidak valid (pakai YYYY-MM-DD)');
  if (from && to && from > to) throw httpError(422, 'Rentang tanggal tidak valid (from lebih besar dari to)');
}

function requiredText(value, max, label) {
  if (typeof value !== 'string' || !value.trim()) throw httpError(422, `${label} wajib diisi`);
  const t = value.trim();
  if (t.length > max) throw httpError(422, `${label} maksimal ${max} karakter`);
  return t;
}

function boolOpt(value, fallback, label) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'boolean') throw httpError(422, `${label} harus true atau false`);
  return value;
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

// Query ".in(...)" dipecah per 100 id supaya URL tidak kepanjangan.
async function selectByIds(fromFn, columns, ids, col = 'id') {
  const uniq = [...new Set(ids.filter(Boolean))];
  const out = [];
  for (let i = 0; i < uniq.length; i += 100) {
    out.push(...unwrap(await fromFn().select(columns).in(col, uniq.slice(i, i + 100))));
  }
  return out;
}

async function getTeacher(userId) {
  const t = unwrap(await master().from('teachers').select('id, name').eq('user_id', userId).maybeSingle());
  if (!t) throw httpError(404, 'Profil guru tidak ditemukan');
  return t;
}

// Tempelkan subject + class ke jadwal (tanpa embed lintas schema).
async function decorateSchedules(schedules) {
  const subjects = await selectByIds(() => master().from('subjects'), 'id, name', schedules.map((s) => s.subject_id));
  const classes = await selectByIds(() => master().from('classes'), 'id, name', schedules.map((s) => s.class_id));
  const subjectById = Object.fromEntries(subjects.map((x) => [x.id, x]));
  const classById = Object.fromEntries(classes.map((x) => [x.id, x]));
  return schedules.map((s) => ({
    ...s,
    subject: subjectById[s.subject_id] ?? null,
    class: classById[s.class_id] ?? null,
  }));
}

async function withSchedule(sessions) {
  if (!sessions.length) return sessions;
  const schedules = await selectByIds(() => master().from('schedules'), '*', sessions.map((s) => s.schedule_id));
  const byId = Object.fromEntries((await decorateSchedules(schedules)).map((s) => [s.id, s]));
  return sessions.map((s) => ({ ...s, schedule: byId[s.schedule_id] ?? null }));
}

// "Sesi ke-N": urutan jadwal pada hari yang sama di kelas yang sama, berdasarkan jam mulai.
async function sessionNumbers(schedules) {
  const classIds = [...new Set(schedules.map((s) => s.class_id).filter(Boolean))];
  if (!classIds.length) return {};
  const all = await selectByIds(() => master().from('schedules'), 'id, class_id, day, start_time', classIds, 'class_id');
  const groups = {};
  for (const s of all) (groups[`${s.class_id}|${weekdayOf(s.day)}`] ??= []).push(s);
  const out = {};
  for (const g of Object.values(groups)) {
    g.sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time) || String(a.id).localeCompare(String(b.id)));
    g.forEach((s, i) => (out[s.id] = i + 1));
  }
  return out;
}

// Pertemuan ke-N: urutan sesi pada seri kelas + mapel + guru yang sama (urut tanggal).
// Untuk sesi yang belum dibuat (preview), dihitung sebagai sesi berikutnya pada tanggal tsb.
async function meetingNumber(schedule, { sessionId, date } = {}) {
  if (!schedule) return null;
  let sq = master().from('schedules').select('id').eq('class_id', schedule.class_id).eq('subject_id', schedule.subject_id);
  if (schedule.teacher_id) sq = sq.eq('teacher_id', schedule.teacher_id);
  const ids = unwrap(await sq).map((s) => s.id);
  if (!ids.length) return null;
  const list = unwrap(
    await b8()
      .from('attendance_sessions')
      .select('id, date')
      .in('schedule_id', ids)
      .order('date', { ascending: true })
      .order('opened_at', { ascending: true })
  );
  if (sessionId) {
    const i = list.findIndex((s) => s.id === sessionId);
    return i === -1 ? null : i + 1;
  }
  return list.filter((s) => s.date <= date).length + 1;
}

const STATUS_LABEL = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpha: 'Alfa' };

// Hitung ringkasan. Sesi yang masih berjalan: siswa yang belum mengisi dihitung "pending".
// Sesi yang sudah berakhir/ditutup: yang belum mengisi otomatis dihitung alfa.
function tally(rows, state) {
  const unfilled = rows.filter((r) => !r.recorded_at).length;
  const out = { total: rows.length, hadir: 0, izin: 0, sakit: 0, alpha: 0, pending: 0, filled: rows.length - unfilled };
  for (const r of rows) {
    if (r.recorded_at && r.status in out) out[r.status] += 1;
  }
  if (state === 'open') out.pending = unfilled;
  else out.alpha += unfilled;
  out.filledPercent = out.total ? Math.round((out.filled / out.total) * 100) : 0;
  return out;
}

function rowView(r, student, state, method) {
  const pending = !r.recorded_at;
  const shown = pending ? (state === 'open' ? 'pending' : 'alpha') : r.status;
  const time = pending ? null : wib(new Date(r.recorded_at)).time;
  const sourceText = pending ? null : r.source === 'siswa' ? `${time} · Diisi siswa` : 'Dicatat guru';
  return {
    ...r,
    student: student ?? null,
    display_status: shown,
    display_label: shown === 'pending' ? (method === 'manual' ? 'Belum dicatat' : 'Belum mengisi') : STATUS_LABEL[shown],
    time,
    source_text: sourceText,
  };
}

function timeInfo(schedule) {
  return { start: toHHMM(schedule?.start_time), end: toHHMM(schedule?.end_time) };
}

function sessionBase(session, schedule, sessionNumber) {
  const clock = sessionClock(session, schedule);
  return {
    ...session,
    schedule,
    session_number: sessionNumber ?? null,
    state: clock.state,
    state_label: clock.state === 'open' ? 'Sedang Berlangsung' : 'Selesai',
    remaining_minutes: clock.remainingMinutes,
    remaining_label: clock.remainingLabel,
    day_name: DAY_NAMES[weekdayOfDate(session.date)],
    date_label: dateLabel(session.date),
    time: timeInfo(schedule),
  };
}

// ---------------------------------------------------------------

// Info untuk form "Buat Presensi" sebelum sesi dibuat: jadwal, nomor pertemuan, ringkasan.
export async function previewSession(userId, { scheduleId, date } = {}) {
  if (!scheduleId) throw httpError(422, 'scheduleId wajib diisi');
  const day = date ?? wib().date;
  if (!isValidDate(day)) throw httpError(422, 'Format date tidak valid (pakai YYYY-MM-DD)');

  const teacher = await getTeacher(userId);
  const found = unwrap(await master().from('schedules').select('*').eq('id', scheduleId).maybeSingle());
  if (!found) throw httpError(404, 'Jadwal tidak ditemukan');
  if (found.teacher_id !== teacher.id) throw httpError(403, 'Ini bukan jadwal mengajar kamu');
  const [schedule] = await decorateSchedules([found]);

  const existing = unwrap(
    await b8().from('attendance_sessions').select('id').eq('schedule_id', scheduleId).eq('date', day).limit(1)
  );
  const students = unwrap(await master().from('students').select('id').eq('class_id', schedule.class_id));
  const numbers = await sessionNumbers([schedule]);

  return {
    schedule,
    date: day,
    date_label: dateLabel(day),
    day_matches_schedule: weekdayOf(schedule.day) === weekdayOfDate(day),
    time: timeInfo(schedule),
    session_number: numbers[schedule.id] ?? null,
    meeting_number: await meetingNumber(schedule, existing.length ? { sessionId: existing[0].id } : { date: day }),
    student_count: students.length,
    existing_session_id: existing[0]?.id ?? null,
    defaults: {
      method: 'siswa',
      open_mode: 'now',
      notify_on_open: true,
      remind_unfilled: true,
      remind_after_minutes: 15,
      notify_on_close: true,
    },
    remind_options: REMIND_OPTIONS,
  };
}

// Kelas + mapel yang diajar guru (pilihan kelas di Buat Presensi, filter Rekap, info "Akses dibatasi").
export async function getTeaching(userId) {
  const teacher = await getTeacher(userId);
  const schedules = await decorateSchedules(
    unwrap(await master().from('schedules').select('*').eq('teacher_id', teacher.id))
  );
  const classes = {};
  const subjects = {};
  for (const s of schedules) {
    if (s.class) {
      classes[s.class.id] ??= { id: s.class.id, name: s.class.name, subjects: [], schedules: [] };
      if (s.subject && !classes[s.class.id].subjects.some((x) => x.id === s.subject.id)) {
        classes[s.class.id].subjects.push(s.subject);
      }
      classes[s.class.id].schedules.push({
        id: s.id,
        day: s.day,
        start_time: toHHMM(s.start_time),
        end_time: toHHMM(s.end_time),
        subject_id: s.subject_id,
      });
    }
    if (s.subject) subjects[s.subject.id] = s.subject;
  }
  return {
    teacher,
    classes: Object.values(classes).sort((a, b) => a.name.localeCompare(b.name)),
    subjects: Object.values(subjects).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

// Halaman Presensi: jadwal mengajar pada satu hari (default hari ini, WIB) + sesi yang sudah dibuat.
export async function getToday(userId, { date } = {}) {
  if (date && !isValidDate(date)) throw httpError(422, 'Format date tidak valid (pakai YYYY-MM-DD)');
  const w = wib();
  const day = date ?? w.date;
  const weekday = weekdayOfDate(day);

  const teacher = await getTeacher(userId);
  const mine = unwrap(await master().from('schedules').select('*').eq('teacher_id', teacher.id));
  const todays = mine
    .filter((s) => weekdayOf(s.day) === weekday)
    .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
  if (!todays.length) return { date: day, date_label: dateLabel(day), is_today: day === w.date, schedules: [] };

  const decorated = await decorateSchedules(todays);
  const numbers = await sessionNumbers(todays);

  const students = await fetchAll(() =>
    master().from('students').select('id, class_id').in('class_id', [...new Set(todays.map((s) => s.class_id))]).order('id')
  );
  const countByClass = {};
  students.forEach((s) => (countByClass[s.class_id] = (countByClass[s.class_id] ?? 0) + 1));

  const sessions = unwrap(
    await b8().from('attendance_sessions').select('*').eq('date', day).in('schedule_id', todays.map((s) => s.id))
  );
  const sessionBySchedule = Object.fromEntries(sessions.map((s) => [s.schedule_id, s]));
  const rows = sessions.length
    ? await selectByIds(() => b8().from('attendances'), 'session_id, status, recorded_at', sessions.map((s) => s.id), 'session_id')
    : [];
  const rowsBySession = {};
  rows.forEach((r) => (rowsBySession[r.session_id] ??= []).push(r));

  const isToday = day === w.date;
  return {
    date: day,
    date_label: dateLabel(day),
    is_today: isToday,
    schedules: decorated.map((s) => {
      const session = sessionBySchedule[s.id] ?? null;
      const clock = session ? sessionClock(session, s) : null;
      return {
        schedule_id: s.id,
        session_number: numbers[s.id] ?? null,
        class: s.class,
        subject: s.subject,
        time: timeInfo(s),
        student_count: countByClass[s.class_id] ?? 0,
        // berlangsung / berikutnya / selesai (hanya bermakna untuk hari ini)
        timing: isToday ? scheduleTiming(s) : null,
        session: session
          ? {
              id: session.id,
              state: clock.state,
              method: session.method,
              topic: session.topic,
              summary: tally(rowsBySession[session.id] ?? [], clock.state),
            }
          : null,
      };
    }),
  };
}

// UC-12: guru buka sesi untuk 1 jadwal + tanggal. Semua siswa kelas otomatis alpha
// (belum mengisi), lalu siswa kelas dinotifikasi bila notifyOnOpen aktif (UC-19).
export async function openSession(userId, input = {}) {
  const { scheduleId, date, openMode } = input;
  if (!scheduleId || !date) throw httpError(422, 'scheduleId dan date wajib diisi');
  if (!isValidDate(date)) throw httpError(422, 'Format date tidak valid (pakai YYYY-MM-DD)');

  const topic = requiredText(input.topic, 200, 'Materi');
  const outcome = requiredText(input.learningOutcome, 1000, 'Sub capaian pembelajaran');

  const method = input.method ?? 'siswa';
  if (!METHODS.includes(method)) throw httpError(422, `method harus salah satu dari: ${METHODS.join(', ')}`);
  if (openMode !== undefined && openMode !== 'now') {
    throw httpError(422, 'Pembukaan terjadwal belum tersedia, gunakan openMode "now"');
  }

  const notifyOnOpen = boolOpt(input.notifyOnOpen, true, 'notifyOnOpen');
  const notifyOnClose = boolOpt(input.notifyOnClose, true, 'notifyOnClose');
  // Pengingat hanya masuk akal untuk presensi yang diisi siswa.
  const remindUnfilled = method === 'manual' ? false : boolOpt(input.remindUnfilled, true, 'remindUnfilled');
  const remindAfter = input.remindAfterMinutes ?? 15;
  if (!REMIND_OPTIONS.includes(remindAfter)) {
    throw httpError(422, `remindAfterMinutes harus salah satu dari: ${REMIND_OPTIONS.join(', ')}`);
  }

  const teacher = await getTeacher(userId);
  const found = unwrap(await master().from('schedules').select('*').eq('id', scheduleId).maybeSingle());
  if (!found) throw httpError(404, 'Jadwal tidak ditemukan');
  if (found.teacher_id !== teacher.id) throw httpError(403, 'Ini bukan jadwal mengajar kamu');
  if (!found.class_id) throw httpError(422, 'Jadwal ini belum punya kelas');
  const [schedule] = await decorateSchedules([found]);

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
      .insert({
        schedule_id: scheduleId,
        date,
        opened_by: teacher.id,
        topic,
        learning_outcome: outcome,
        method,
        notify_on_open: notifyOnOpen,
        remind_unfilled: remindUnfilled,
        remind_after_minutes: remindAfter,
        notify_on_close: notifyOnClose,
      })
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

  const numbers = await sessionNumbers([schedule]);
  let notified = 0;
  if (notifyOnOpen) {
    const t = timeInfo(schedule);
    const subjectName = schedule.subject?.name ?? 'pelajaran';
    const where = `${schedule.class?.name ?? 'Kelas'} · Sesi ${numbers[schedule.id] ?? '-'} (${t.start} - ${t.end})`;
    notified = await notifyMany(
      students.map((s) => s.user_id),
      {
        title: `Presensi ${subjectName} dibuka`,
        message:
          method === 'manual'
            ? `Presensi ${where} sedang berlangsung. Kehadiranmu dicatat oleh guru.`
            : `Presensi ${where} sedang berlangsung. Isi kehadiranmu sebelum ditutup guru.`,
        type: 'presensi',
        data: { action: method === 'manual' ? 'lihat_riwayat' : 'isi_presensi', sessionId: session.id },
      }
    );
  }

  const view = sessionBase(session, schedule, numbers[schedule.id]);
  const studentById = Object.fromEntries(students.map((s) => [s.id, { id: s.id, nis: s.nis, name: s.name }]));
  return {
    ...view,
    meeting_number: await meetingNumber(schedule, { sessionId: session.id }),
    notified,
    summary: tally(rows, view.state),
    attendances: rows
      .map((r) => rowView(r, studentById[r.student_id], view.state, method))
      .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? '')),
  };
}

// Riwayat sesi milik guru + ringkasan per sesi.
// Filter opsional: scheduleId, classId, subjectId, date, from, to, limit.
export async function listMySessions(userId, { scheduleId, classId, subjectId, date, from, to, limit } = {}) {
  checkRange(from, to);
  const max = Math.min(Math.max(Number(limit) || 100, 1), 200);
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
    .order('opened_at', { ascending: false })
    .limit(max);
  if (scheduleId) q = q.eq('schedule_id', scheduleId);
  if (scheduleIds) q = q.in('schedule_id', scheduleIds);
  if (date) q = q.eq('date', date);
  if (from) q = q.gte('date', from);
  if (to) q = q.lte('date', to);

  const sessions = await withSchedule(unwrap(await q));
  if (!sessions.length) return sessions;

  const rows = [];
  const ids = sessions.map((s) => s.id);
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    rows.push(
      ...(await fetchAll(() =>
        b8().from('attendances').select('session_id, status, recorded_at').in('session_id', chunk).order('id')
      ))
    );
  }
  const bySession = {};
  rows.forEach((r) => (bySession[r.session_id] ??= []).push(r));

  return sessions.map((s) => {
    const view = sessionBase(s, s.schedule, null);
    const summary = tally(bySession[s.id] ?? [], view.state);
    return { ...view, summary, total: summary.total };
  });
}

// Halaman detail sesi: header, progres, kartu ringkasan, dan daftar siswa (UC-13, UC-14).
export async function getSession(userId, role, id) {
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', id).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (role === 'teacher') {
    const teacher = await getTeacher(userId);
    if (session.opened_by !== teacher.id) throw httpError(403, 'Ini bukan sesi kamu');
  }

  const [full] = await withSchedule([session]);
  const numbers = await sessionNumbers(full.schedule ? [full.schedule] : []);
  const view = sessionBase(session, full.schedule, numbers[session.schedule_id]);

  const rows = unwrap(await b8().from('attendances').select('*').eq('session_id', id));
  const students = await selectByIds(() => master().from('students'), 'id, nis, name', rows.map((r) => r.student_id));
  const studentById = Object.fromEntries(students.map((s) => [s.id, s]));
  const summary = tally(rows, view.state);

  return {
    ...view,
    meeting_number: await meetingNumber(full.schedule, { sessionId: id }),
    summary,
    progress: { filled: summary.filled, total: summary.total, percent: summary.filledPercent },
    reminder: {
      enabled: session.remind_unfilled,
      pending_count: summary.pending,
      last_reminded_at: session.last_reminded_at ?? null,
      last_reminded_count: session.last_reminded_count ?? null,
    },
    attendances: rows
      .map((r) => rowView(r, studentById[r.student_id], view.state, session.method))
      .sort((a, b) => (a.student?.name ?? '').localeCompare(b.student?.name ?? '')),
  };
}

// UC-14: tutup sesi. Yang belum mengisi otomatis dihitung alfa; siswa dinotifikasi
// beserta statusnya bila notifyOnClose aktif (UC-19).
export async function closeSession(userId, id) {
  const teacher = await getTeacher(userId);
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', id).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (session.opened_by !== teacher.id) throw httpError(403, 'Ini bukan sesi kamu');
  if (session.status === 'closed') throw httpError(409, 'Sesi sudah ditutup');

  const closed = unwrap(
    await b8()
      .from('attendance_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  );

  const rows = unwrap(await b8().from('attendances').select('student_id, status, recorded_at').eq('session_id', id));
  const summary = tally(rows, 'closed');

  let notified = 0;
  if (closed.notify_on_close) {
    const [full] = await withSchedule([session]);
    const numbers = await sessionNumbers(full.schedule ? [full.schedule] : []);
    const students = await selectByIds(() => master().from('students'), 'id, user_id', rows.map((r) => r.student_id));
    const userByStudent = Object.fromEntries(students.map((s) => [s.id, s.user_id]));
    const subjectName = full.schedule?.subject?.name ?? 'pelajaran';
    const where = `${full.schedule?.class?.name ?? 'Kelas'} · Sesi ${numbers[session.schedule_id] ?? '-'}`;
    const at = wib(new Date(closed.closed_at)).time;
    notified = await notifyEach(
      rows.map((r) => {
        const recorded = Boolean(r.recorded_at);
        return {
          userId: userByStudent[r.student_id],
          title: `Presensi ${subjectName} ditutup`,
          message: recorded
            ? `${teacher.name} menutup presensi ${where} pukul ${at}. Kehadiranmu tercatat: ${STATUS_LABEL[r.status]}.`
            : `Ditutup pukul ${at}. Kamu belum mengisi, jadi tercatat Alfa. Hubungi guru jika ada kesalahan.`,
          type: 'presensi',
          data: {
            action: recorded ? 'lihat_riwayat' : 'hubungi_guru',
            sessionId: id,
            status: recorded ? r.status : 'alpha',
            teacherUserId: userId,
          },
        };
      })
    );
  }

  return { ...closed, state: 'closed', summary, notified };
}