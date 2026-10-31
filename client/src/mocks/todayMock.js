export const todayMock = {
  date_label: 'Jumat, 6 Desember 2024',
  subtitle: 'Isi kehadiranmu untuk sesi yang sedang berlangsung.',
  has_open: true,
  sessions: [
    {
      session_id: 's1',
      session_number: 1,
      subject: { name: 'Matematika' },
      teacher: { name: 'Budi Santoso, S.Pd.' },
      class_name: 'Kelas X-A',
      time: { start: '07:30', end: '10:00' },
      state: 'open',
      remaining_label: '2 jam 15 menit',
      can_submit: true,
      options: [
        { value: 'hadir', label: 'Hadir' },
        { value: 'izin', label: 'Izin' },
        { value: 'sakit', label: 'Sakit' },
      ],
      my: null,
    },
  ],
  next: null,
}