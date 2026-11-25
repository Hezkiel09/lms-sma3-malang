// Data tampilan untuk Rekap Nilai orang tua.

export const KKM = 78;

const STUDENT = { id: 's1', name: 'Karina' };

// items: [tanggal, jenis, materi, nilai, rata-rata kelas]  (terbaru di atas)
const SUBJECTS = [
  {
    id: 'm1', name: 'Matematika', teacher: 'Budi Santoso, S.Pd.',
    override: { average: 88.8, delta: 2.4 },
    items: [
      ['29 Nov 2024', 'kuis', 'Peluang', 90, 85],
      ['22 Nov 2024', 'tugas', 'Statistika Dasar', 89, 84],
      ['15 Nov 2024', 'ulangan', 'Penerapan Turunan', 88, 83],
      ['11 Nov 2024', 'kuis', 'Turunan Fungsi Aljabar', 86, 81],
      ['7 Nov 2024', 'tugas', 'Limit Fungsi', 83, 78],
      ['31 Okt 2024', 'ulangan', 'Fungsi dan Grafik', 94, 82],
    ],
  },
  {
    id: 'm2', name: 'Bahasa Indonesia', teacher: 'Mutiara Ardhi, S.Pd.',
    items: [
      ['28 Nov 2024', 'tugas', 'Teks Eksposisi', 88, 84],
      ['21 Nov 2024', 'kuis', 'Kaidah Kebahasaan', 85, 82],
      ['14 Nov 2024', 'ulangan', 'Teks Negosiasi', 87, 83],
      ['8 Nov 2024', 'tugas', 'Surat Lamaran', 84, 80],
      ['1 Nov 2024', 'kuis', 'Ejaan dan Tanda Baca', 82, 79],
    ],
  },
  {
    id: 'm3', name: 'Biologi', teacher: 'Yusriatul Mutiara, S.Pd.',
    items: [
      ['27 Nov 2024', 'ulangan', 'Sistem Peredaran Darah', 84, 80],
      ['20 Nov 2024', 'tugas', 'Struktur Sel', 86, 82],
      ['13 Nov 2024', 'kuis', 'Jaringan Tumbuhan', 83, 79],
      ['6 Nov 2024', 'tugas', 'Klasifikasi Makhluk Hidup', 85, 81],
      ['30 Okt 2024', 'kuis', 'Keanekaragaman Hayati', 81, 78],
    ],
  },
  {
    id: 'm4', name: 'Bahasa Inggris', teacher: 'Kalingga Eka Putri, S.Pd.',
    items: [
      ['26 Nov 2024', 'kuis', 'Descriptive Text', 92, 85],
      ['19 Nov 2024', 'tugas', 'Speaking: Self Introduction', 90, 84],
      ['12 Nov 2024', 'ulangan', 'Simple Past Tense', 89, 82],
      ['5 Nov 2024', 'kuis', 'Vocabulary Unit 3', 88, 83],
      ['29 Okt 2024', 'tugas', 'Reading Comprehension', 87, 81],
    ],
  },
  {
    id: 'm5', name: 'Fisika', teacher: 'Syafah Nagita, S.Pd.',
    items: [
      ['25 Nov 2024', 'ulangan', 'Hukum Newton', 76, 77],
      ['18 Nov 2024', 'kuis', 'Gerak Lurus', 80, 79],
      ['11 Nov 2024', 'tugas', 'Besaran dan Satuan', 84, 80],
      ['4 Nov 2024', 'kuis', 'Vektor', 82, 78],
      ['28 Okt 2024', 'tugas', 'Pengukuran', 85, 81],
    ],
  },
  {
    id: 'm6', name: 'Informatika', teacher: 'Hendra Wijaya, S.Kom.',
    items: [
      ['24 Nov 2024', 'tugas', 'Algoritma Dasar', 95, 88],
      ['17 Nov 2024', 'kuis', 'Berpikir Komputasional', 93, 86],
      ['10 Nov 2024', 'ulangan', 'Jaringan Komputer', 91, 85],
      ['3 Nov 2024', 'tugas', 'Spreadsheet', 92, 87],
      ['27 Okt 2024', 'kuis', 'Keamanan Digital', 90, 84],
    ],
  },
];

const round1 = (n) => Math.round(n * 10) / 10;
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;

function summarize(s) {
  const scores = s.items.map((i) => i[3]);
  const average = s.override?.average ?? round1(mean(scores));
  const delta = s.override?.delta ?? round1(mean(scores.slice(0, 3)) - mean(scores.slice(3)));
  return { average, delta, highest: Math.max(...scores), total: scores.length, latest: scores[0] };
}

// Untuk halaman daftar: GET (nanti) ringkasan nilai semua mapel milik anak
export function getNilaiOverviewMock() {
  const subjects = SUBJECTS.map((s) => {
    const sum = summarize(s);
    return {
      subject: { id: s.id, name: s.name },
      teacher: { name: s.teacher },
      average: sum.average,
      delta: sum.delta,
      total: sum.total,
      latest: sum.latest,
      above_kkm: sum.average >= KKM,
    };
  });
  const allScores = SUBJECTS.flatMap((s) => s.items.map((i) => i[3]));
  const top = subjects.reduce((best, s) => {
    const h = summarize(SUBJECTS.find((x) => x.id === s.subject.id)).highest;
    return h > best.value ? { value: h, subject: s.subject.name } : best;
  }, { value: 0, subject: '' });
  return {
    student: STUDENT,
    kkm: KKM,
    summary: {
      average: round1(mean(subjects.map((s) => s.average))),
      delta: round1(mean(subjects.map((s) => s.delta))),
      highest: top.value,
      highest_subject: top.subject,
      total: allScores.length,
      status_percent: Math.round((subjects.filter((s) => s.above_kkm).length / subjects.length) * 100),
      subject_count: subjects.length,
    },
    subjects,
  };
}

// Untuk halaman detail: GET (nanti) detail nilai satu mapel
export function getNilaiDetailMock(subjectId) {
  const s = SUBJECTS.find((x) => x.id === subjectId);
  if (!s) return null;
  const sum = summarize(s);
  const overview = getNilaiOverviewMock();
  const items = s.items.map(([date_label, type, topic, score, class_average], i) => ({
    id: `${s.id}-${i}`,
    date_label,
    type,
    topic,
    score,
    class_average,
    status: score >= KKM ? 'tuntas' : 'remedial',
  }));
  return {
    student: STUDENT,
    subject: { id: s.id, name: s.name },
    teacher: { name: s.teacher },
    kkm: KKM,
    summary: {
      average: sum.average,
      delta: sum.delta,
      highest: sum.highest,
      highest_subject: s.name,
      total: sum.total,
      status_percent: overview.summary.status_percent,
      subject_count: overview.summary.subject_count,
    },
    // lima penilaian terakhir, urut dari yang terlama ke terbaru
    trend: items.slice(0, 5).reverse().map((it, i) => ({ label: `Nilai ${i + 1}`, value: it.score })),
    // badge "Di atas KKM" mengikuti penilaian terbaru
    above_kkm: sum.latest >= KKM,
    items,
  };
}