const LABEL = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpha: 'Alfa' };
const SUBJECTS = ['Matematika', 'Bahasa Indonesia', 'Biologi', 'Bahasa Inggris', 'Fisika'];

function buildDays() {
  const days = [];
  for (let d = 1; d <= 30; d++) {
    const date = `2024-11-${String(d).padStart(2, '0')}`;
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Minggu
    const weekend = weekday === 0 || weekday === 6;
    let status = weekend ? null : 'hadir';
    let items = weekend ? [] : SUBJECTS.map((subject) => ({ subject, status: 'hadir' }));
    let partial = false;

    if (d === 14) {
      status = 'izin';
      partial = true;
      items = items.map((it, i) => ({ ...it, status: i < 2 ? 'hadir' : 'izin' }));
    }
    if (d === 21) {
      status = 'sakit';
      items = items.map((it) => ({ ...it, status: 'sakit' }));
    }

    days.push({
      date,
      day: d,
      weekday,
      is_weekend: weekend,
      is_today: d === 15,
      status,
      label: status ? LABEL[status] : null,
      partial,
      items,
    });
  }
  return days;
}

const subj = (id, name, teacher, hadir, izin, percent) => ({
  subject: { id, name },
  teacher: { name: teacher },
  hadir,
  izin,
  sakit: 0,
  alpha: 0,
  total: hadir + izin,
  percent,
  level: percent >= 90 ? 'Sangat baik' : 'Baik',
  below_threshold: percent < 80,
});

export const overviewMock = {
  student: { id: 's1', name: 'Karina', nis: '12345' },
  month: '2024-11',
  month_label: 'November 2024',
  prev_month: '2024-10',
  next_month: '2024-12',
  threshold: 80,
  summary: {
    percent: 90,
    level: 'Sangat baik',
    hadir_days: 19,
    izin_days: 1,
    sakit_days: 1,
    izin_sakit_days: 2,
    alpha_days: 0,
    recorded_days: 21,
  },
  days: buildDays(),
  subjects: [
    subj('m1', 'Matematika', 'Budi Santoso, S.Pd.', 8, 0, 100),
    subj('m2', 'Bahasa Indonesia', 'Mutiara Ardhi, S.Pd.', 7, 1, 88),
    subj('m3', 'Biologi', 'Yusriatul Mutiara, S.Pd.', 7, 1, 88),
    subj('m4', 'Bahasa Inggris', 'Kalingga Eka Putri, S.Pd.', 7, 1, 88),
    subj('m5', 'Fisika', 'Syafah Nagita, S.Pd.', 7, 1, 88),
  ],
  subjects_notice: {
    ok: true,
    message: 'Kehadiran Karina di seluruh mata pelajaran berada di atas batas minimum sekolah sebesar 80%.',
  },
};