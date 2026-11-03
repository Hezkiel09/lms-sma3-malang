export const mockBankSoalStats = {
  totalSoal: 6,
  totalKelas: 3,
  totalMateri: 3,
  dibuat: 3,
  diimpor: 3,
};

export const mockKelasList = [
  {
    id: 'X',
    romawi: 'X',
    nama: 'Kelas X',
    jumlahMapel: 1,
    materiPreview: 'Matematika • Persamaan kuadrat',
    totalSoal: 2,
    mapelList: [
      {
        id: 'mat-x',
        nama: 'Matematika',
        kelas: 'Kelas X',
        materi: 'Persamaan kuadrat',
        tipeSoal: 'Pilihan Ganda • Benar / Salah',
        totalSoal: 2,
      },
    ],
  },
  {
    id: 'XI',
    romawi: 'XI',
    nama: 'Kelas XI',
    jumlahMapel: 1,
    materiPreview: 'Matematika • Komposisi & invers',
    totalSoal: 2,
    mapelList: [
      {
        id: 'mat-xi',
        nama: 'Matematika',
        kelas: 'Kelas XI',
        materi: 'Komposisi & invers',
        tipeSoal: 'Pilihan Ganda • Benar / Salah',
        totalSoal: 2,
      },
    ],
  },
  {
    id: 'XII',
    romawi: 'XII',
    nama: 'Kelas XII',
    jumlahMapel: 1,
    materiPreview: 'Matematika • Peluang',
    totalSoal: 2,
    mapelList: [
      {
        id: 'mat-xii',
        nama: 'Matematika',
        kelas: 'Kelas XII',
        materi: 'Peluang',
        tipeSoal: 'Pilihan Ganda • Benar / Salah',
        totalSoal: 2,
      },
    ],
  },
];

export const mockQuestionsList = [
  {
    id: 1,
    tipe: 'Pilihan Ganda',
    metode: 'Dibuat',
    tanggal: '13 Okt 2026',
    pertanyaan: 'Diketahui f(x) = 2x + 1 dan g(x) = x². Nilai (f · g)(3) adalah ...',
    tag: 'XI • Matematika • Komposisi & invers',
    kelasId: 'XI',
    mapelId: 'mat-xi',
    materi: 'Komposisi & invers',
    pilihan: [
      { key: 'A', teks: '54' },
      { key: 'B', teks: '55' },
      { key: 'C', teks: '63' },
      { key: 'D', teks: '121' },
    ],
    kunciJawaban: 'C',
    pembahasan: 'g(3) = 3² = 9. Maka (f · g)(3) = f(g(3)) = f(9) = 2(9) + 1 = 19? Atau jika perkalian fungsi (f · g)(3) = f(3) · g(3) = (2(3) + 1) · (9) = 7 · 9 = 63.',
  },
  {
    id: 2,
    tipe: 'Benar / Salah',
    metode: 'Diimpor',
    tanggal: '12 Okt 2026',
    pertanyaan: 'Invers dari fungsi f(x) = 2x + 3 adalah f⁻¹(x) = (x - 3) / 2.',
    tag: 'XI • Matematika • Komposisi & invers',
    kelasId: 'XI',
    mapelId: 'mat-xi',
    materi: 'Komposisi & invers',
    pilihan: [
      { key: 'B', teks: 'Benar' },
      { key: 'S', teks: 'Salah' },
    ],
    kunciJawaban: 'B',
    pembahasan: 'Misal y = 2x + 3 => 2x = y - 3 => x = (y - 3) / 2. Maka f⁻¹(x) = (x - 3) / 2 adalah Benar.',
  },
];
