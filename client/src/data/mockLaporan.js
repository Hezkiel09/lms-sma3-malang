export const mockLaporanJenis = [
  { value: 'presensi_siswa', label: 'Presensi siswa' },
  { value: 'nilai_harian', label: 'Nilai harian' },
  { value: 'data_akademik', label: 'Data akademik' },
  { value: 'aktivitas_sistem', label: 'Aktivitas sistem' },
];

export const mockLaporanFormat = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
];

export const mockLaporanCards = [
  {
    id: 1,
    title: 'Laporan Presensi Siswa',
    description: 'Rekap kehadiran per siswa, kelas, dan periode',
    available: false,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    id: 2,
    title: 'Laporan Nilai Harian',
    description: 'Distribusi dan rekap capaian nilai per mata pelajaran',
    available: false,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 3,
    title: 'Laporan Data Akademik',
    description: 'Data kelas, mata pelajaran, guru, dan jadwal',
    available: true,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 4,
    title: 'Laporan Aktivitas Sistem',
    description: 'Log akses dan aktivitas seluruh pengguna',
    available: false,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];
