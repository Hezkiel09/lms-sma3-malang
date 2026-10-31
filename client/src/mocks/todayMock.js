const options = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'izin', label: 'Izin' },
  { value: 'sakit', label: 'Sakit' },
];

const base = {
  student: { id: 's1', name: 'Karina', class_label: 'Siswa Kelas X-A' },
  next: null,
};

const openCard = {
  schedule_id: 'sch1',
  session_id: 'ses1',
  session_number: 1,
  subject: { id: 'sub1', name: 'Matematika' },
  teacher: { name: 'Budi Santoso, S.Pd.', user_id: 't1' },  class_name: 'Kelas X-A',
  time: { start: '07:30', end: '10:00' },
  state: 'open',
  remaining_label: 'Sisa 2 jam 15 menit',
  my: null,
  can_submit: true,
  lesson_over: false,
  options,
  announcement: {
    title: 'Presensi Matematika dibuka',
    message: 'Budi Santoso, S.Pd. membuka presensi Kelas X-A · Sesi 1. Isi kehadiranmu sebelum presensi ditutup.',
  },
  class_summary: { total: 15, hadir: 12, izin: 2, sakit: 1 },
};

export const todayOpen = {
  ...base,
  subtitle: 'Isi kehadiranmu untuk sesi yang sedang berlangsung.',
  has_open: true,
  sessions: [openCard],
};

export const todaySubmitted = {
  ...todayOpen,
  sessions: [{
    ...openCard,
    state: 'submitted',
    can_submit: false,
    announcement: null,
    my: { status: 'hadir', label: 'Hadir', time: '07:42' },
    result: { title: 'Presensi terkirim: Hadir', message: 'Dikirim pukul 07:42. Salah mengisi? Hubungi guru.' },
  }],
};

export const todayEnded = {
  ...base,
  subtitle: 'Waktu pengisian presensi untuk sesi ini sudah habis.',
  has_open: false,
  sessions: [{
    ...openCard,
    state: 'ended',
    can_submit: false,
    announcement: null,
    result: {
      status: 'alpha',
      title: 'Sesi berakhir',
      badge: 'Alfa',
      message: 'Kamu belum mengisi presensi, jadi tercatat Alfa.',
      hint: 'Hubungi guru jika ada kesalahan.',
    },
  }],
};

export const todayEmpty = {
  ...base,
  subtitle: 'Isi kehadiranmu saat sesi berlangsung.',
  has_open: false,
  sessions: [],
  next: {
    session_number: 2,
    subject: { name: 'Bahasa Indonesia' },
    teacher: { name: 'Mutiara Ardhi, S.Pd.' },
    time: { start: '10:15', end: '11:45' },
    label: 'Berikutnya',
  },
};

// Ganti baris ini untuk mencoba tiap tampilan:
// todayOpen | todaySubmitted | todayEnded | todayEmpty
export const todayWeekend = {
  ...base,
  subtitle: 'Tidak ada jadwal pelajaran hari ini.',
  has_open: false,
  sessions: [],
  next: null,
};

export const todayEndedNext = { ...todayEnded, next: todayEmpty.next };
export const todayOver = {
  ...base,
  subtitle: 'Isi kehadiranmu untuk sesi yang sedang berlangsung.',
  has_open: true,
  sessions: [
    {
      ...todaySubmitted.sessions[0],
      session_id: 'ses0',
      session_number: 1,
      subject: { id: 'sub0', name: 'IPA' },
      time: { start: '07:00', end: '07:30' },
      lesson_over: true,
    },
    { ...todayEnded.sessions[0], session_id: 'ses1', session_number: 2, lesson_over: true },
    {
      ...openCard,
      session_id: 'ses2',
      session_number: 3,
      subject: { id: 'sub2', name: 'Bahasa Indonesia' },
      teacher: { name: 'Mutiara Ardhi, S.Pd.', user_id: 't2' },
      time: { start: '10:15', end: '11:45' },
      announcement: {
        title: 'Presensi Bahasa Indonesia dibuka',
        message: 'Mutiara Ardhi, S.Pd. membuka presensi Kelas X-A · Sesi 3. Isi kehadiranmu sebelum presensi ditutup.',
      },
    },
  ],
};
export const todayMock = todayOpen;