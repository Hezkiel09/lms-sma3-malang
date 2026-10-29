import { unwrap } from './b8.db.js';

const TZ = 'Asia/Jakarta';

// Tanggal, nama hari, dan batas bulan berjalan menurut waktu Indonesia (WIB).
export function nowInfo() {
  const d = new Date();
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d); // YYYY-MM-DD
  const dayName = new Intl.DateTimeFormat('id-ID', { timeZone: TZ, weekday: 'long' }).format(d);
  const [y, m] = date.split('-').map(Number);
  const mm = String(m).padStart(2, '0');
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return {
    date,
    dayName,
    monthStart: `${y}-${mm}-01`,
    monthEnd: `${y}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

const DAY_ORDER = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', "jum'at", 'sabtu', 'minggu'];
export const dayIndex = (day) => {
  const i = DAY_ORDER.indexOf(String(day ?? '').toLowerCase());
  return i === -1 ? 99 : i;
};

export const emptySummary = () => ({ hadir: 0, sakit: 0, izin: 0, alpha: 0 });

export const summarize = (rows) =>
  rows.reduce((acc, r) => {
    if (r.status in acc) acc[r.status] += 1;
    return acc;
  }, emptySummary());

// Query ".in(...)" dipecah per 100 id supaya URL tidak kepanjangan.
export async function selectByIds(fromFn, columns, ids, col = 'id') {
  const uniq = [...new Set(ids.filter(Boolean))];
  const out = [];
  for (let i = 0; i < uniq.length; i += 100) {
    out.push(...unwrap(await fromFn().select(columns).in(col, uniq.slice(i, i + 100))));
  }
  return out;
}

// Nilai kuis/tugas milik kelompok lain: tabelnya belum ditentukan.
export const gradesPlaceholder = () => ({
  available: false,
  message: 'Nilai dari fitur kuis dan tugas belum terhubung.',
  items: [],
});