
export const mockJadwalHariIni = {
  date: "2026-11-02",
  date_label: "Senin, 2 November 2026",
  schedules: [
    {
      schedule_id: "SCH-XA-01",
      session_number: 1,
      class: { id: "X-A", name: "X-A" },
      subject: { id: "MTK", name: "Matematika" },
      time: { start: "07:30", end: "09:00" },
      room: "Ruang 10A",
      student_count: 32,
      timing: "selesai",
      session: null,
    },
    {
      schedule_id: "SCH-XB-03",
      session_number: 3,
      class: { id: "X-B", name: "X-B" },
      subject: { id: "MTK", name: "Matematika" },
      time: { start: "10:15", end: "11:45" },
      room: "Ruang 10B",
      student_count: 32,
      timing: "selesai",
      session: null,
    },
    {
      schedule_id: "SCH-XIA-05",
      session_number: 5,
      class: { id: "XI-A", name: "XI-A" },
      subject: {
        id: "MTK-WAJIB",
        name: "Matematika Wajib",
      },
      time: { start: "12:30", end: "14:00" },
      room: "Ruang 11A",
      student_count: 32,
      timing: "selesai",
      session: null,
    },
  ],
};

export const mockRiwayatPresensi = [
  {
    id: "ATT-001",
    date_label: "30 Okt 2026",
    day_name: "Jumat",
    time: { start: "07:30", end: "09:00" },
    schedule: {
      class: { id: "X-A", name: "X-A" },
      subject: { id: "MTK", name: "Matematika" },
    },
    topic: "Penerapan Algoritma",
    learning_outcome:
      "Menerapkan algoritma untuk menyelesaikan masalah kontekstual sederhana.",
    state: "closed",
    state_label: "Selesai",
    summary: {
      total: 32,
      hadir: 28,
      izin: 2,
      sakit: 1,
      alpha: 1,
      pending: 0,
    },
  },
  {
    id: "ATT-002",
    date_label: "28 Okt 2026",
    day_name: "Rabu",
    time: { start: "10:15", end: "11:45" },
    schedule: {
      class: { id: "X-B", name: "X-B" },
      subject: { id: "MTK", name: "Matematika" },
    },
    topic: "Algoritma dan Pola Bilangan",
    learning_outcome:
      "Menjelaskan pola bilangan dan menyusun langkah penyelesaian secara sistematis.",
    state: "closed",
    state_label: "Selesai",
    summary: {
      total: 32,
      hadir: 30,
      izin: 1,
      sakit: 1,
      alpha: 0,
      pending: 0,
    },
  },
  {
    id: "ATT-003",
    date_label: "26 Okt 2026",
    day_name: "Senin",
    time: { start: "12:30", end: "14:00" },
    schedule: {
      class: { id: "XI-A", name: "XI-A" },
      subject: {
        id: "MTK-WAJIB",
        name: "Matematika Wajib",
      },
    },
    topic: "Barisan Aritmetika",
    learning_outcome:
      "Menentukan suku ke-n dan jumlah suku pada barisan aritmetika.",
    state: "closed",
    state_label: "Selesai",
    summary: {
      total: 32,
      hadir: 27,
      izin: 2,
      sakit: 2,
      alpha: 1,
      pending: 0,
    },
  },
  {
    id: "ATT-004",
    date_label: "23 Okt 2026",
    day_name: "Jumat",
    time: { start: "07:30", end: "09:00" },
    schedule: {
      class: { id: "X-A", name: "X-A" },
      subject: { id: "MTK", name: "Matematika" },
    },
    topic: "Persamaan Linear",
    learning_outcome:
      "Menyelesaikan persamaan linear satu variabel menggunakan operasi aljabar.",
    state: "closed",
    state_label: "Selesai",
    summary: {
      total: 32,
      hadir: 29,
      izin: 1,
      sakit: 2,
      alpha: 0,
      pending: 0,
    },
  },
];
