// Semua perhitungan waktu presensi memakai WIB (UTC+7), apa pun zona waktu server.
const WIB_MS = 7 * 3600 * 1000;

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY_LOOKUP = {
  minggu: 0, ahad: 0, sunday: 0, senin: 1, monday: 1, selasa: 2, tuesday: 2, rabu: 3, wednesday: 3,
  kamis: 4, thursday: 4, jumat: 5, "jum'at": 5, friday: 5, sabtu: 6, saturday: 6,
};

// Waktu sekarang (atau waktu tertentu) dalam WIB.
export function wib(d = new Date()) {
  const w = new Date(d.getTime() + WIB_MS);
  const iso = w.toISOString();
  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 16),
    minutes: w.getUTCHours() * 60 + w.getUTCMinutes(),
    weekday: w.getUTCDay(),
  };
}

export const toHHMM = (t) => String(t ?? '').slice(0, 5);
export const toMinutes = (t) => {
  const [h, m] = toHHMM(t).split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

// schedules.day boleh "Jumat", "jumat", "Friday", atau angka 0-6.
export function weekdayOf(day) {
  if (typeof day === 'number') return day % 7;
  const k = String(day ?? '').trim().toLowerCase().replace(/[’`]/g, "'");
  return k in DAY_LOOKUP ? DAY_LOOKUP[k] : null;
}

export const weekdayOfDate = (dateStr) => new Date(`${dateStr}T00:00:00Z`).getUTCDay();

// "Jumat, 6 Desember 2024"
export function dateLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return `${DAY_NAMES[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
// "5 Des"
export function shortDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}
export const addDays = (dateStr, n) => new Date(new Date(`${dateStr}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);

export function formatRemaining(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const parts = [];
  if (h) parts.push(`${h} jam`);
  if (m) parts.push(`${m} menit`);
  return parts.length ? `Sisa ${parts.join(' ')}` : 'Sisa kurang dari 1 menit';
}

// Status turunan sesi tanpa scheduler:
//  closed = ditutup guru, ended = lewat jam selesai tapi belum ditutup, open = masih berjalan.
export function sessionClock(session, schedule, now = new Date()) {
  const w = wib(now);
  const endMin = toMinutes(schedule?.end_time);
  if (session.status === 'closed') return { state: 'closed', remainingMinutes: null, remainingLabel: null };
  const pastDay = session.date < w.date;
  const pastEnd = session.date === w.date && endMin !== null && w.minutes >= endMin;
  if (pastDay || pastEnd) return { state: 'ended', remainingMinutes: null, remainingLabel: null };
  if (session.date === w.date && endMin !== null) {
    const left = endMin - w.minutes;
    return { state: 'open', remainingMinutes: left, remainingLabel: formatRemaining(left) };
  }
  return { state: 'open', remainingMinutes: null, remainingLabel: null };
}

// Posisi jadwal terhadap jam sekarang pada hari ini: berlangsung / berikutnya / selesai.
export function scheduleTiming(schedule, now = new Date()) {
  const w = wib(now);
  const s = toMinutes(schedule.start_time);
  const e = toMinutes(schedule.end_time);
  if (s === null || e === null) return 'berikutnya';
  if (w.minutes >= e) return 'selesai';
  if (w.minutes >= s) return 'berlangsung';
  return 'berikutnya';
}