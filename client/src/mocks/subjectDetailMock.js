import { overviewMock } from './overviewMock';

const MEETINGS = [
  { date: '2024-11-29', topic: 'Penerapan Algoritma', outcome: 'Menerapkan algoritma untuk menyelesaikan masalah kontekstual sederhana.' },
  { date: '2024-11-22', topic: 'Algoritma dan Pola Bilangan', outcome: 'Menjelaskan pola bilangan dan menyusun langkah penyelesaian secara sistematis.' },
  { date: '2024-11-15', topic: 'Barisan Aritmetika', outcome: 'Menentukan suku ke-n dan jumlah suku pada barisan aritmetika.' },
  { date: '2024-11-08', topic: 'Persamaan Linear', outcome: 'Menyelesaikan persamaan linear satu variabel menggunakan operasi aljabar.' },
  { date: '2024-11-01', topic: 'Fungsi dan Relasi', outcome: 'Membedakan relasi dan fungsi serta menyajikannya dalam berbagai bentuk.' },
  { date: '2024-10-25', topic: 'Himpunan', outcome: 'Menyatakan himpunan dan melakukan operasi pada himpunan.' },
  { date: '2024-10-18', topic: 'Bilangan Real', outcome: 'Mengidentifikasi sifat-sifat operasi bilangan real.' },
  { date: '2024-10-11', topic: 'Pengantar Matematika', outcome: 'Memahami ruang lingkup dan tujuan pembelajaran mata pelajaran.' },
];

const LABEL = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpha: 'Alfa' };

const dateLabel = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

// Mock: meniru respons GET /attendances/student/me/subjects/:subjectId
export function getSubjectDetailMock(subjectId) {
  const row = overviewMock.subjects.find((s) => s.subject.id === subjectId);
  if (!row) return null;

  const total = row.hadir + row.izin + row.sakit + row.alpha;
  const meetings = MEETINGS.slice(0, total).map((m, i) => {
    const status = subjectId === 'm5' && i === 1 ? 'alpha' : row.izin > 0 && i === 3 ? 'izin' : 'hadir';
    return {
      number: total - i,
      session_id: `${subjectId}-${total - i}`,
      date: m.date,
      date_label: dateLabel(m.date),
      time: '07:00–08:30 WIB',
      topic: m.topic,
      learning_outcome: m.outcome,
      status,
      label: LABEL[status],
      notes: null,
    };
  });

  const above = row.percent === null || row.percent >= overviewMock.threshold;

  return {
    student: overviewMock.student,
    subject: row.subject,
    teacher: row.teacher,
    summary: {
      hadir: row.hadir,
      izin: row.izin,
      sakit: row.sakit,
      alpha: row.alpha,
      total,
      percent: row.percent,
      level: row.level,
    },
    threshold: overviewMock.threshold,
    above_threshold: above,
    notice: above
      ? `Kehadiran ${row.subject.name} berada di atas batas minimum sekolah.`
      : `Kehadiran ${row.subject.name} berada di bawah batas minimum sekolah (${overviewMock.threshold}%).`,
    meetings,
  };
}