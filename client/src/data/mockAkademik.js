// Data Tab 1: Kelas
export const mockKelasStats = {
  totalKelas: '36',
  kapasitasSiswa: '1.296',
  waliKelasTerisi: '36/36',
  ruangAktif: '42',
};

export const mockKelasList = [
  {
    id: 1,
    kelas: 'XI MIPA 1',
    jumlahSiswa: '34 siswa',
    waliKelas: 'Rina Handayani, S.Pd.',
    ruang: 'Ruang 2.01',
    status: 'Aktif',
  },
  {
    id: 2,
    kelas: 'XI MIPA 2',
    jumlahSiswa: '36 siswa',
    waliKelas: 'Budi Santoso, S.Pd.',
    ruang: 'Ruang 2.02',
    status: 'Aktif',
  },
  {
    id: 3,
    kelas: 'XI IPS 1',
    jumlahSiswa: '32 siswa',
    waliKelas: 'Dina Puspitasari, S.Pd.',
    ruang: 'Ruang 2.05',
    status: 'Aktif',
  },
  {
    id: 4,
    kelas: 'XI Bahasa',
    jumlahSiswa: '28 siswa',
    waliKelas: 'Ratna Kusuma, S.Pd.',
    ruang: 'Ruang 2.07',
    status: 'Aktif',
  },
];

// Data Tab 2: Mata Pelajaran
export const mockMapelStats = {
  totalMapel: '18',
  mapelWajib: '12',
  mapelPeminatan: '6',
  totalJamMinggu: '48 JP',
};

export const mockMapelList = [
  {
    id: 'mat',
    nama: 'Matematika',
    kode: 'MAT-11',
    bebanBelajar: '4 JP',
    guruCount: '8 guru',
    kategori: 'Wajib',
    iconColor: 'cyan',
  },
  {
    id: 'bin',
    nama: 'Bahasa Indonesia',
    kode: 'BIN-11',
    bebanBelajar: '4 JP',
    guruCount: '7 guru',
    kategori: 'Wajib',
    iconColor: 'blue',
  },
  {
    id: 'bio',
    nama: 'Biologi',
    kode: 'BIO-11',
    bebanBelajar: '5 JP',
    guruCount: '4 guru',
    kategori: 'Peminatan',
    iconColor: 'amber',
  },
  {
    id: 'big',
    nama: 'Bahasa Inggris',
    kode: 'BIG-11',
    bebanBelajar: '3 JP',
    guruCount: '6 guru',
    kategori: 'Wajib',
    iconColor: 'cyan',
  },
  {
    id: 'fis',
    nama: 'Fisika',
    kode: 'FIS-11',
    bebanBelajar: '5 JP',
    guruCount: '4 guru',
    kategori: 'Peminatan',
    iconColor: 'blue',
  },
];

// Data Tab 3: Jadwal Pelajaran
export const mockJadwalStats = {
  jadwalAktif: '648',
  jamPelajaran: '07.00–15.30',
  konflikJadwal: '2',
  ruangTersedia: '6',
};

export const mockJadwalList = [
  {
    id: 1,
    jam: '07.00–08.30',
    mapel: 'Matematika',
    guru: 'Budi Santoso',
    ruang: 'R. 2.02',
    hasConflict: false,
  },
  {
    id: 2,
    jam: '08.30–10.00',
    mapel: 'Biologi',
    guru: 'Rina Handayani',
    ruang: 'Lab. Biologi',
    hasConflict: true,
    conflictMsg: 'Periksa: guru memiliki jadwal lain di jam yang sama.',
  },
  {
    id: 3,
    jam: '10.15–11.45',
    mapel: 'Bahasa Indonesia',
    guru: 'Dina Puspitasari',
    ruang: 'R. 2.02',
    hasConflict: false,
  },
  {
    id: 4,
    jam: '12.30–14.00',
    mapel: 'Bahasa Inggris',
    guru: 'Ratna Kusuma',
    ruang: 'Lab. Bahasa',
    hasConflict: false,
  },
];

export const mockValidasiJadwal = {
  tanpaKonflik: '646',
  konflikGuru: '2',
  konflikRuang: '0',
};
