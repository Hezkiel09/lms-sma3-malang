// Nanti diganti: GET notifikasi siswa dari backend (sesuaikan nama field dengan respons BE)
// type: 'closed' | 'open' | 'reminder'   group: 'today' | 'earlier'
// action.to = rute internal, null = belum ada tujuan (mis. tab Pesan milik kelompok lain)
export const notifMock = [
  {
    id: 'n1',
    group: 'today',
    type: 'closed',
    title: 'Presensi Matematika ditutup',
    body: 'Budi Santoso, S.Pd. menutup presensi Kelas X-A · Sesi 1 pukul 08:15. Kehadiranmu tercatat: Hadir.',
    time_label: '08:15',
    read: false,
    action: { label: 'Lihat riwayat', to: '/siswa/presensi/riwayat' },
  },
  {
    id: 'n2',
    group: 'today',
    type: 'open',
    title: 'Presensi Matematika dibuka',
    body: 'Presensi Kelas X-A · Sesi 1 (07:30 - 10:00) sedang berlangsung. Isi kehadiranmu sebelum ditutup guru.',
    time_label: '07:30',
    read: false,
    action: { label: 'Isi presensi', to: '/siswa/presensi' },
  },
  {
    id: 'n3',
    group: 'earlier',
    type: 'reminder',
    title: 'Pengingat: presensi masih terbuka',
    body: 'Presensi Bahasa Indonesia belum kamu isi. Segera isi sebelum ditutup guru.',
    time_label: 'Kemarin 08:05',
    read: true,
    action: null,
  },
  {
    id: 'n4',
    group: 'earlier',
    type: 'closed',
    title: 'Presensi Bahasa Indonesia ditutup',
    body: 'Ditutup pukul 08:30. Kamu belum mengisi, jadi tercatat Alfa. Hubungi guru jika ada kesalahan.',
    time_label: 'Kemarin 08:30',
    read: true,
    action: { label: 'Hubungi guru', to: null },
  },
];