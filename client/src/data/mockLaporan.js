export const mockLaporanJenis = [
  { value: 'presensi_siswa', label: 'Presensi siswa' },
  { value: 'nilai_harian', label: 'Nilai harian' },
  { value: 'data_akademik', label: 'Data akademik' },
  { value: 'aktivitas_sistem', label: 'Aktivitas sistem' },
];

export const mockLaporanPeriode = [
  { value: '2024-11', label: 'November 2024' },
  { value: '2024-10', label: 'Oktober 2024' },
  { value: '2024-09', label: 'September 2024' },
  { value: '2024-08', label: 'Agustus 2024' },
];

export const mockLaporanFormat = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
];

export const mockLaporanCards = [
  {
    id: 1,
    type: 'presensi_siswa',
    title: 'Laporan Presensi Siswa',
    description: 'Rekap kehadiran per siswa, kelas, dan periode',
    lastGenerated: 'Terakhir dibuat 18 Nov 2024',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    id: 2,
    type: 'nilai_harian',
    title: 'Laporan Nilai Harian',
    description: 'Distribusi dan rekap capaian nilai per mata pelajaran',
    lastGenerated: 'Terakhir dibuat 15 Nov 2024',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 3,
    type: 'data_akademik',
    title: 'Laporan Data Akademik',
    description: 'Data kelas, mata pelajaran, guru, dan jadwal',
    lastGenerated: 'Terakhir dibuat 10 Nov 2024',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 4,
    type: 'aktivitas_sistem',
    title: 'Laporan Aktivitas Sistem',
    description: 'Log akses dan aktivitas seluruh pengguna',
    lastGenerated: 'Terakhir dibuat 8 Nov 2024',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];
