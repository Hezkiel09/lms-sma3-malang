export const mockStats = [
  {
    id: 1,
    title: 'Total Siswa',
    value: '1.248',
    subtitle: '36 rombel aktif',
    change: '↗ 2,4%',
    icon: 'Users',
    iconBg: 'bg-cyan-50 text-cyan-600',
  },
  {
    id: 2,
    title: 'Guru & Staf',
    value: '86',
    subtitle: '82 akun aktif',
    change: '↗ 2,4%',
    icon: 'GraduationCap',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    id: 3,
    title: 'Kehadiran Hari Ini',
    value: '94,8%',
    subtitle: '1.183 siswa hadir',
    change: '↗ 2,4%',
    icon: 'Monitor',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  {
    id: 4,
    title: 'Aktivitas Sistem',
    value: '328',
    subtitle: '+12% dari kemarin',
    change: '↗ 2,4%',
    icon: 'FileText',
    iconBg: 'bg-purple-50 text-purple-600',
  },
];

export const mockAttendanceTrend = [
  { day: 'Sen', percentage: 88, isToday: false },
  { day: 'Sel', percentage: 94, isToday: false },
  { day: 'Rab', percentage: 91, isToday: false },
  { day: 'Kam', percentage: 97, isToday: false },
  { day: 'Jum', percentage: 95, isToday: false },
  { day: 'Sab', percentage: 82, isToday: false },
  { day: 'Hari ini', percentage: 96, isToday: true },
];

export const mockQuickActions = [
  {
    id: 'ts',
    label: 'Tambah siswa',
    code: 'TS',
    badgeBg: 'bg-cyan-100 text-cyan-700',
    link: '/admin/siswa/tambah',
  },
  {
    id: 'aj',
    label: 'Atur jadwal',
    code: 'AJ',
    badgeBg: 'bg-blue-100 text-blue-700',
    link: '/admin/jadwal',
  },
  {
    id: 'ip',
    label: 'Impor presensi',
    code: 'IP',
    badgeBg: 'bg-amber-100 text-amber-700',
    link: '/admin/presensi/impor',
  },
  {
    id: 'bp',
    label: 'Buat pengumuman',
    code: 'BP',
    badgeBg: 'bg-purple-100 text-purple-700',
    link: '/admin/pengumuman/buat',
  },
];

export const mockRecentActivities = [
  {
    id: 1,
    title: 'Impor presensi berhasil',
    desc: 'Ibu Rina mengimpor 34 data siswa XI MIPA 2',
    time: '5 menit lalu',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    id: 2,
    title: 'Akun pengguna dibuat',
    desc: 'Akun wali atas nama Dewi Kartika telah aktif',
    time: '18 menit lalu',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    id: 3,
    title: 'Data perlu ditinjau',
    desc: '4 presensi berstatus tidak dikenali pada kelas X IPS 1',
    time: '32 menit lalu',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    id: 4,
    title: 'Nilai diperbarui',
    desc: 'Pak Budi mengisi nilai Matematika untuk XII MIPA 1',
    time: '1 jam lalu',
    tagColor: 'bg-slate-100 text-slate-600 border-slate-200',
  },
];
