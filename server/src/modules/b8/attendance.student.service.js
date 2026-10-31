import { master, b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';
import { STUDENT_CHECKIN_STATUSES } from './b8.constants.js';
import {
  wib,
  toHHMM,
  toMinutes,
  weekdayOf,
  weekdayOfDate,
  dateLabel,
  monthLabel,
  addDays,
  sessionClock,
  scheduleTiming,
} from './b8.time.js';

const THRESHOLD = 80; // batas minimum kehadiran sekolah (%)
const LABEL = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpha: 'Alfa' };
// Urutan keparahan untuk status harian: yang terburuk menang.
const SEVERITY = { hadir: 0, izin: 1, sakit: 2, alpha: 3 };

const isValidDate = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

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

async function getStudent(userId) {
  const s = unwrap(
    await master().from('students').select('id, nis, name, class_id, parent_id').eq('user_id', userId).maybeSingle()
  );
  if (!s) throw httpError(404, 'Profil siswa tidak ditemukan');
  return s;
}

// Siswa: hanya dirinya ("me" atau id sendiri). Orang tua: hanya anaknya. Admin: bebas.
async function resolveStudent(userId, role, studentId) {
  if (role === 'student') {
    const me = await getStudent(userId);
    if (studentId !== 'me' && studentId !== me.id) throw httpError(403, 'Tidak punya akses ke data siswa ini');
    return me;
  }
  if (studentId === 'me') throw httpError(422, 'studentId wajib diisi');
  const child = unwrap(
    await master().from('students').select('id, nis, name, class_id, parent_id').eq('id', studentId).maybeSingle()
  );
  if (!child) throw httpError(404, 'Siswa tidak ditemukan');
  if (role === 'parent') {
    const parent = unwrap(await master().from('parents').select('id').eq('user_id', userId).maybeSingle());
    if (!parent || child.parent_id !== parent.id) throw httpError(403, 'Tidak punya akses ke data siswa ini');
  }
  return child;
}

const levelLabel = (percent) =>
  percent === null ? null : percent >= 90 ? 'Sangat baik' : percent >= THRESHOLD ? 'Baik' : 'Perlu perhatian';

const rangeOfMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${ym}-01`, to: `${ym}-${String(last).padStart(2, '0')}`, last };
};

function shiftMonth(ym, n) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

// ---------------------------------------------------------------

// Halaman "Hari Ini": sesi presensi kelas siswa pada hari ini, status pengisian, dan jadwal berikutnya.
export async function getTodayForMe(userId) {
  const student = await getStudent(userId);
  const w = wib();
  const out = { date: w.date, date_label: dateLabel(w.date), student: { id: student.id, name: student.name } };
  if (!student.class_id) return { ...out, subtitle: 'Kamu belum terdaftar di kelas.', has_open: false, sessions: [], next: null };

  const all = unwrap(await master().from('schedules').select('*').eq('class_id', student.class_id));
  const todays = all
    .filter((s) => weekdayOf(s.day) === w.weekday)
    .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
  if (!todays.length) return { ...out, subtitle: 'Tidak ada jadwal pelajaran hari ini.', has_open: false, sessions: [], next: null };

  const subjects = await selectByIds(() => master().from('subjects'), 'id, name', todays.map((s) => s.subject_id));
  const teachers = await selectByIds(() => master().from('teachers'), 'id, user_id, name', todays.map((s) => s.teacher_id));
  const classes = await selectByIds(() => master().from('classes'), 'id, name', [student.class_id]);
  const subjectById = Object.fromEntries(subjects.map((x) => [x.id, x]));
  const teacherById = Object.fromEntries(teachers.map((x) => [x.id, x]));
  const className = classes[0]?.name ?? null;
  const numberOf = Object.fromEntries(todays.map((s, i) => [s.id, i + 1]));

  const sessions = unwrap(
    await b8().from('attendance_sessions').select('*').eq('date', w.date).in('schedule_id', todays.map((s) => s.id))
  );
  const sessionBySchedule = Object.fromEntries(sessions.map((s) => [s.schedule_id, s]));
  const classRows = sessions.length
    ? await selectByIds(() => b8().from('attendances'), 'session_id, student_id, status, recorded_at, source', sessions.map((s) => s.id), 'session_id')
    : [];
  const rowsBySession = {};
  classRows.forEach((r) => (rowsBySession[r.session_id] ??= []).push(r));

  const cards = [];
  let next = null;
  for (const sch of todays) {
    const subject = subjectById[sch.subject_id] ?? null;
    const teacher = teacherById[sch.teacher_id] ?? null;
    const base = {
      schedule_id: sch.id,
      session_number: numberOf[sch.id],
      subject,
      teacher: teacher ? { id: teacher.id, name: teacher.name, user_id: teacher.user_id } : null,
      class_name: className,
      time: { start: toHHMM(sch.start_time), end: toHHMM(sch.end_time) },
    };
    const session = sessionBySchedule[sch.id];
    if (!session) {
      if (!next && scheduleTiming(sch) === 'berikutnya') next = { ...base, label: 'Berikutnya' };
      continue;
    }

    const clock = sessionClock(session, sch);
    const rows = rowsBySession[session.id] ?? [];
    const mineRow = rows.find((r) => r.student_id === student.id);
    const recorded = Boolean(mineRow?.recorded_at);
    const mine = recorded
      ? {
          status: mineRow.status,
          label: LABEL[mineRow.status],
          time: wib(new Date(mineRow.recorded_at)).time,
          source: mineRow.source,
        }
      : null;

    let state;
    if (clock.state === 'open') state = recorded ? 'submitted' : 'open';
    else state = 'ended';

    const card = {
      ...base,
      session_id: session.id,
      method: session.method,
      state, // open | submitted | ended
      session_state: clock.state,
      remaining_label: clock.remainingLabel,
      ends_at: base.time.end,
      my: mine,
      can_submit: clock.state === 'open' && session.method === 'siswa' && !recorded,      
      options: STUDENT_CHECKIN_STATUSES.map((v) => ({ value: v, label: LABEL[v] })),
      announcement:
        state === 'open'
          ? {
              title: `Presensi ${subject?.name ?? ''} dibuka`.trim(),
              message: `${teacher?.name ?? 'Guru'} membuka presensi ${className} · Sesi ${numberOf[sch.id]}. Isi kehadiranmu sebelum presensi ditutup.`,
            }
          : null,
      class_summary: {
        total: rows.length,
        hadir: rows.filter((r) => r.recorded_at && r.status === 'hadir').length,
        izin: rows.filter((r) => r.recorded_at && r.status === 'izin').length,
        sakit: rows.filter((r) => r.recorded_at && r.status === 'sakit').length,
      },
    };

    if (state === 'submitted') {
      card.result = {
        title: `Presensi terkirim: ${mine.label}`,
        message: `Dikirim pukul ${mine.time}. Salah mengisi? Hubungi guru.`,
      };
    }
    if (state === 'ended') {
      card.result = mine
        ? { title: `Presensi tercatat: ${mine.label}`, message: `Sesi berakhir pukul ${base.time.end}.` }
        : {
            status: 'alpha',
            title: 'Sesi berakhir',
            badge: 'Alfa',
            message: 'Kamu belum mengisi presensi, jadi tercatat Alfa.',
            hint: 'Hubungi guru jika ada kesalahan.',
          };
    }
    cards.push(card);
  }

  const hasOpen = cards.some((c) => c.state === 'open' || c.state === 'submitted');
  const subtitle = cards.some((c) => c.state === 'open')
    ? 'Isi kehadiranmu untuk sesi yang sedang berlangsung.'
    : cards.some((c) => c.state === 'submitted')
      ? 'Isi kehadiranmu untuk sesi yang sedang berlangsung.'
      : cards.length
        ? 'Waktu pengisian presensi untuk sesi ini sudah habis.'
        : 'Isi kehadiranmu saat sesi berlangsung.';
  return { ...out, subtitle, has_open: hasOpen, sessions: cards, next };
}

// UC-27: siswa mengisi presensi (hadir / izin / sakit). Pilihan terkunci setelah dikirim. Koreksi hanya lewat guru.
// masih berlangsung, kecuali sudah dikoreksi guru.
export async function checkin(userId, sessionId, { status, notes } = {}) {
  if (!STUDENT_CHECKIN_STATUSES.includes(status)) {
    throw httpError(422, `status harus salah satu dari: ${STUDENT_CHECKIN_STATUSES.join(', ')}`);
  }
  const student = await getStudent(userId);
  const session = unwrap(await b8().from('attendance_sessions').select('*').eq('id', sessionId).maybeSingle());
  if (!session) throw httpError(404, 'Sesi tidak ditemukan');
  if (session.method === 'manual') throw httpError(409, 'Presensi sesi ini dicatat manual oleh guru');

  const schedule = unwrap(
    await master().from('schedules').select('class_id, end_time').eq('id', session.schedule_id).maybeSingle()
  );
  if (!schedule || schedule.class_id !== student.class_id) throw httpError(403, 'Sesi ini bukan untuk kelas kamu');
  const clock = sessionClock(session, schedule);
  if (clock.state === 'closed') throw httpError(409, 'Sesi sudah ditutup');
  if (clock.state === 'ended') throw httpError(409, 'Waktu pengisian presensi untuk sesi ini sudah habis');

  const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim().slice(0, 500) : null;
  const existing = unwrap(
    await b8().from('attendances').select('*').eq('session_id', sessionId).eq('student_id', student.id).maybeSingle()
  );
  const now = new Date().toISOString();
  const respond = (row, changed) => ({
    attendance: row,
    changed,
    label: LABEL[row.status],
    time: wib(new Date(row.recorded_at)).time,
  });

  if (!existing) {
    // Siswa pindah kelas setelah sesi dibuka: belum punya baris, buatkan.
    const row = unwrap(
      await b8()
        .from('attendances')
        .insert({
          session_id: sessionId,
          student_id: student.id,
          schedule_id: session.schedule_id,
          date: session.date,
          status,
          notes: cleanNotes,
          source: 'siswa',
          recorded_at: now,
        })
        .select()
        .single()
    );
    return respond(row, true);
  }

  if (existing.recorded_at) {
    throw httpError(409, 'Presensi kamu sudah terkirim dan tidak dapat diubah. Hubungi guru jika salah mengisi.');
  }
  if (existing.recorded_at && existing.status === status && (existing.notes ?? null) === cleanNotes) {
    return respond(existing, false);
  }

  // Syarat sumber/recorded_at mencegah menimpa data yang berubah bersamaan (mis. koreksi guru).
  let q = b8()
    .from('attendances')
    .update({ status, notes: cleanNotes, source: 'siswa', recorded_at: now })
    .eq('id', existing.id);
  q = q.is('recorded_at', null);
  const updated = unwrap(await q.select());
  if (!updated.length) throw httpError(409, 'Presensi sudah berubah, muat ulang halaman');
  return respond(updated[0], true);
}

// ---------------------------------------------------------------

// Muat baris presensi siswa pada rentang tanggal + konteks sesi/jadwal/mapel/guru.
// Baris yang belum diisi pada sesi yang masih berjalan dibuang; pada sesi yang sudah berakhir/ditutup
// dihitung Alfa.
async function loadEffectiveRows(studentId, from, to) {
  const rows = await fetchAll(() => {
    let q = b8().from('attendances').select('*').eq('student_id', studentId).order('id');
    if (from) q = q.gte('date', from);
    if (to) q = q.lte('date', to);
    return q;
  });
  if (!rows.length) return [];

  const sessions = await selectByIds(() => b8().from('attendance_sessions'), '*', rows.map((r) => r.session_id));
  const sessionById = Object.fromEntries(sessions.map((s) => [s.id, s]));
  const scheduleIds = [...new Set([...rows.map((r) => r.schedule_id), ...sessions.map((s) => s.schedule_id)])];
  const schedules = await selectByIds(() => master().from('schedules'), '*', scheduleIds);
  const scheduleById = Object.fromEntries(schedules.map((s) => [s.id, s]));
  const subjects = await selectByIds(() => master().from('subjects'), 'id, name', schedules.map((s) => s.subject_id));
  const teachers = await selectByIds(() => master().from('teachers'), 'id, name', schedules.map((s) => s.teacher_id));
  const subjectById = Object.fromEntries(subjects.map((x) => [x.id, x]));
  const teacherById = Object.fromEntries(teachers.map((x) => [x.id, x]));

  const out = [];
  for (const r of rows) {
    const session = r.session_id ? sessionById[r.session_id] : null;
    const schedule = scheduleById[r.schedule_id ?? session?.schedule_id] ?? null;
    let status;
    if (r.recorded_at || !session) status = r.status;
    else {
      const clock = sessionClock(session, schedule);
      if (clock.state === 'open') continue; // masih bisa diisi
      status = 'alpha';
    }
    out.push({
      ...r,
      effective_status: status,
      session,
      schedule,
      subject: schedule ? subjectById[schedule.subject_id] ?? null : null,
      teacher: schedule ? teacherById[schedule.teacher_id] ?? null : null,
    });
  }
  return out;
}

function pctOf(hadir, total) {
  return total ? Math.round((hadir / total) * 100) : null;
}

// Riwayat per Mapel / Presensi Anak: ringkasan harian, kalender sebulan, dan rekap per mapel.
// Query: month=YYYY-MM (default bulan ini, WIB). Untuk semester, pakai from & to (ringkasan per mapel saja).
export async function getOverview(userId, role, studentId, { month, from, to } = {}) {
  const student = await resolveStudent(userId, role, studentId);
  const ym = month ?? wib().date.slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ym)) throw httpError(422, 'Format month tidak valid (pakai YYYY-MM)');
  if ((from && !isValidDate(from)) || (to && !isValidDate(to))) throw httpError(422, 'Format from/to tidak valid (pakai YYYY-MM-DD)');
  if (from && to && from > to) throw httpError(422, 'Rentang tanggal tidak valid (from lebih besar dari to)');

  const m = rangeOfMonth(ym);
  const monthRows = await loadEffectiveRows(student.id, m.from, m.to);

  // Status harian: yang terburuk menang; partial = ada status lain pada hari itu.
  const byDate = {};
  for (const r of monthRows) (byDate[r.date] ??= []).push(r);
  const days = [];
  const dayCount = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
  const today = wib().date;
  for (let d = 1; d <= m.last; d++) {
    const date = `${ym}-${String(d).padStart(2, '0')}`;
    const wd = weekdayOfDate(date);
    const items = byDate[date] ?? [];
    let status = null;
    for (const it of items) {
      if (status === null || SEVERITY[it.effective_status] > SEVERITY[status]) status = it.effective_status;
    }
    if (status) dayCount[status] += 1;
    days.push({
      date,
      day: d,
      weekday: wd,
      is_weekend: wd === 0 || wd === 6,
      is_today: date === today,
      status,
      label: status ? LABEL[status] : null,
      partial: new Set(items.map((i) => i.effective_status)).size > 1,
      items: items.map((i) => ({ subject: i.subject?.name ?? null, status: i.effective_status })),
    });
  }
  const recordedDays = dayCount.hadir + dayCount.izin + dayCount.sakit + dayCount.alpha;
  const percent = pctOf(dayCount.hadir, recordedDays);

  // Rekap per mapel (bulan ini, atau rentang from/to bila diberikan).
  const subjectRows = from || to ? await loadEffectiveRows(student.id, from, to) : monthRows;
  const bySubject = {};
  for (const r of subjectRows) {
    const key = r.subject?.id ?? 'unknown';
    const g = (bySubject[key] ??= {
      subject: r.subject,
      teacher: r.teacher,
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
    });
    g[r.effective_status] += 1;
  }
  const subjects = Object.values(bySubject)
    .map((g) => {
      const total = g.hadir + g.izin + g.sakit + g.alpha;
      const p = pctOf(g.hadir, total);
      return { ...g, total, percent: p, level: levelLabel(p), below_threshold: p !== null && p < THRESHOLD };
    })
    .sort((a, b) => (a.subject?.name ?? '').localeCompare(b.subject?.name ?? ''));
  const below = subjects.filter((s) => s.below_threshold);
  const firstName = student.name.split(' ')[0];

  return {
    student: { id: student.id, name: student.name, nis: student.nis },
    month: ym,
    month_label: monthLabel(ym),
    prev_month: shiftMonth(ym, -1),
    next_month: shiftMonth(ym, 1),
    period: { from: from ?? m.from, to: to ?? m.to },
    threshold: THRESHOLD,
    summary: {
      percent,
      level: levelLabel(percent),
      hadir_days: dayCount.hadir,
      izin_days: dayCount.izin,
      sakit_days: dayCount.sakit,
      izin_sakit_days: dayCount.izin + dayCount.sakit,
      alpha_days: dayCount.alpha,
      recorded_days: recordedDays,
    },
    days,
    subjects,
    subjects_notice: below.length
      ? { ok: false, message: `Kehadiran ${firstName} di ${below.map((s) => s.subject?.name).join(', ')} berada di bawah batas minimum sekolah sebesar ${THRESHOLD}%.` }
      : { ok: true, message: `Kehadiran ${firstName} di seluruh mata pelajaran berada di atas batas minimum sekolah sebesar ${THRESHOLD}%.` },
  };
}

// Presensi satu minggu (Senin-Jumat) untuk beranda orang tua/siswa.
export async function getWeek(userId, role, studentId, { date } = {}) {
  const student = await resolveStudent(userId, role, studentId);
  const base = date ?? wib().date;
  if (!isValidDate(base)) throw httpError(422, 'Format date tidak valid (pakai YYYY-MM-DD)');
  const wd = weekdayOfDate(base);
  const monday = addDays(base, wd === 0 ? -6 : 1 - wd);
  const friday = addDays(monday, 4);
  const rows = await loadEffectiveRows(student.id, monday, friday);

  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = addDays(monday, i);
    const items = rows.filter((r) => r.date === d);
    let status = null;
    for (const it of items) if (status === null || SEVERITY[it.effective_status] > SEVERITY[status]) status = it.effective_status;
    const times = items.filter((r) => r.recorded_at).map((r) => wib(new Date(r.recorded_at)).time).sort();
    days.push({
      date: d,
      weekday: weekdayOfDate(d),
      day: Number(d.slice(8)),
      is_today: d === wib().date,
      status,
      label: status ? LABEL[status] : null,
      first_recorded_time: times[0] ?? null,
    });
  }
  const todayRow = days.find((d) => d.is_today);
  return {
    period: { from: monday, to: friday },
    days,
    today_note: todayRow?.status ? `Presensi hari ini telah tercatat pukul ${todayRow.first_recorded_time ?? '-'}` : null,
  };
}

// Detail satu mapel: kehadiran per pertemuan beserta materi dan sub capaian.
export async function getSubjectDetail(userId, role, studentId, subjectId, { from, to, limit } = {}) {
  const student = await resolveStudent(userId, role, studentId);
  if ((from && !isValidDate(from)) || (to && !isValidDate(to))) throw httpError(422, 'Format from/to tidak valid (pakai YYYY-MM-DD)');
  const max = Math.min(Math.max(Number(limit) || 50, 1), 200);

  const all = (await loadEffectiveRows(student.id, from, to)).filter((r) => r.subject?.id === subjectId);
  const subject = unwrap(await master().from('subjects').select('id, name').eq('id', subjectId).maybeSingle());
  if (!subject) throw httpError(404, 'Mata pelajaran tidak ditemukan');
  const teacher = all[0]?.teacher ?? null;

  // Nomor pertemuan: urutan seluruh sesi seri kelas + mapel + guru yang sama.
  const numberBySession = {};
  const first = all[0]?.schedule;
  if (first) {
    let sq = master().from('schedules').select('id').eq('class_id', first.class_id).eq('subject_id', subjectId);
    if (first.teacher_id) sq = sq.eq('teacher_id', first.teacher_id);
    const ids = unwrap(await sq).map((s) => s.id);
    const series = unwrap(
      await b8().from('attendance_sessions').select('id').in('schedule_id', ids).order('date', { ascending: true }).order('opened_at', { ascending: true })
    );
    series.forEach((s, i) => (numberBySession[s.id] = i + 1));
  }

  const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
  all.forEach((r) => (counts[r.effective_status] += 1));
  const total = all.length;
  const percent = pctOf(counts.hadir, total);

  const meetings = all
    .map((r) => ({
      number: numberBySession[r.session_id] ?? null,
      session_id: r.session_id,
      date: r.date,
      date_label: dateLabel(r.date),
      time: `${toHHMM(r.schedule?.start_time)}–${toHHMM(r.schedule?.end_time)} WIB`,
      topic: r.session?.topic ?? null,
      learning_outcome: r.session?.learning_outcome ?? null,
      status: r.effective_status,
      label: LABEL[r.effective_status],
      notes: r.notes ?? null,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.number ?? 0) - (a.number ?? 0)))
    .slice(0, max);

  const aboveMin = percent === null || percent >= THRESHOLD;
  return {
    student: { id: student.id, name: student.name },
    subject,
    teacher,
    summary: { ...counts, total, percent, level: levelLabel(percent) },
    threshold: THRESHOLD,
    above_threshold: aboveMin,
    notice: aboveMin
      ? `Kehadiran ${subject.name} berada di atas batas minimum sekolah.`
      : `Kehadiran ${subject.name} berada di bawah batas minimum sekolah (${THRESHOLD}%).`,
    meetings,
  };
}