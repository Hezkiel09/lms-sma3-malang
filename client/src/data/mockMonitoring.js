export const mockMonitoringStats = {
  kehadiranHariIni: '94,8%',
  kehadiranSub: '1.183 dari 1.248 siswa',
  tidakHadir: '65',
  tidakHadirSub: '12 sakit · 18 izin · 35 alfa',
  belumDikonfirmasi: '4',
  belumDikonfirmasiSub: 'Perlu validasi admin',
  notifikasiTerkirim: '49',
  notifikasiTerkirimSub: 'Kepada orang tua/wali',
};

export const mockDetailPresensi = [
  {
    id: 1,
    kelas: 'XI MIPA 2',
    waliKelas: 'Rina Handayani',
    hadir: '34/36',
    sakitIzin: '1',
    alfa: '1',
    status: 'Lengkap',
  },
  {
    id: 2,
    kelas: 'XI MIPA 1',
    waliKelas: 'Budi Santoso',
    hadir: '33/34',
    sakitIzin: '1',
    alfa: '0',
    status: 'Lengkap',
  },
  {
    id: 3,
    kelas: 'X IPS 1',
    waliKelas: 'Dina Puspitasari',
    hadir: '28/32',
    sakitIzin: '1',
    alfa: '3',
    status: 'Perlu ditinjau',
  },
  {
    id: 4,
    kelas: 'XII MIPA 1',
    waliKelas: 'Dodi Firmansyah',
    hadir: '35/35',
    sakitIzin: '0',
    alfa: '0',
    status: 'Lengkap',
  },
];

export const mockDistribusiStatus = {
  percentage: '94,8%',
  statusText: 'optimal',
  baikSelesai: '94,8%',
  perluTinjau: '3,7%',
  bermasalah: '1,5%',
};

export const mockPerluTindakan = [
  {
    id: 1,
    text: 'Validasi 4 data tidak dikenali',
    dotColor: 'bg-red-500',
  },
  {
    id: 2,
    text: 'Ingatkan 7 guru belum input',
    dotColor: 'bg-amber-500',
  },
  {
    id: 3,
    text: 'Tinjau 2 konflik jadwal',
    dotColor: 'bg-amber-600',
  },
];
