export const initialQuizData = {
  judul: '',
  kkm: 75,
  jumlahSoal: 40,
  durasi: '75 menit',
  deskripsi: '',
  soalTersedia: 40,
};

export const initialSoalList = Array.from({ length: 40 }, (_, i) => ({
  nomor: i + 1,
  id: `q-${i + 1}`,
  isNew: false,
}));

export const mockExcelValidationData = {
  fileName: 'soal_matematika_kelasXI.xlsx',
  fileSize: '18 KB',
  totalSoal: 3,
  soalValid: 3,
  perluPerbaikan: 0,
  totalPoin: 15,
  items: [
    {
      no: 1,
      pertanyaan: 'Hasil dari 12 × 8 adalah ...',
      jenisSoal: 'Pilihan Ganda',
      kunci: 'B • 96',
      bobot: '5 poin',
      status: 'Valid',
    },
    {
      no: 2,
      pertanyaan: 'Hasil dari 144 ÷ 12 adalah ...',
      jenisSoal: 'Pilihan Ganda',
      kunci: 'C • 12',
      bobot: '5 poin',
      status: 'Valid',
    },
    {
      no: 3,
      pertanyaan: 'Pecahan senilai 6/8 adalah ...',
      jenisSoal: 'Pilihan Ganda',
      kunci: 'A • 3/4',
      bobot: '5 poin',
      status: 'Valid',
    },
  ],
};

export const mockBankSoalPilihan = [
  {
    id: 'bs-1',
    tipe: 'Pilihan Ganda',
    metode: 'Dibuat',
    tanggal: '13 Okt 2026',
    pertanyaan: 'Diketahui f(x) = 2x + 1 dan g(x) = x². Nilai (f · g)(3) adalah ...',
    tag: 'XI • Matematika • Komposisi & invers',
    kunciJawaban: '19',
    selected: true,
  },
  {
    id: 'bs-2',
    tipe: 'Benar / Salah',
    metode: 'Diimpor',
    tanggal: '12 Okt 2026',
    pertanyaan: 'Invers dari fungsi f(x) = 2x + 3 adalah f⁻¹(x) = (x - 3) / 2.',
    tag: 'XI • Matematika • Komposisi & invers',
    kunciJawaban: 'Benar',
    selected: true,
  },
];
