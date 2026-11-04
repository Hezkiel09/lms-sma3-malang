import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Upload,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function TambahSoalKuisPage() {
  const navigate = useNavigate();

  // State
  const [jenisSoal, setJenisSoal] = useState('Benar / Salah'); // Default to Gambar 1, easily toggled
  const [pertanyaan, setPertanyaan] = useState(
    'Pada barisan aritmetika 5, 8, 11, ..., suku ke-10 adalah 32.'
  );
  const [kunciJawabanPG, setKunciJawabanPG] = useState('B');
  const [kunciBenarSalah, setKunciBenarSalah] = useState('Benar');
  const [bobot, setBobot] = useState(5);
  const [pilihanPG, setPilihanPG] = useState({
    A: '84',
    B: '96',
    C: '108',
    D: '120',
  });

  // Esai reference & rubric
  const [jawabanAcuan, setJawabanAcuan] = useState(
    `Diketahui a = 5 dan b = 8 – 5 = 3.\nU₁₀ = a + (10 – 1)b = 5 + 9 × 3 = 32.\nS₁₀ = 10/2 × (2 × 5 + 9 × 3) = 5 × 37 = 185.`
  );
  const rubricList = [
    { text: 'Menentukan a = 5 dan b = 3 dengan benar.', poin: '2 poin' },
    { text: 'Menggunakan rumus U₁₀ dan memperoleh U₁₀ = 32.', poin: '3 poin' },
    { text: 'Menuliskan rumus S₁₀ = n/2 × (2a + (n - 1)b).', poin: '2 poin' },
    { text: 'Menghitung S₁₀ = 185 dengan langkah yang benar.', poin: '3 poin' },
  ];

  const handleTabChange = (type) => {
    setJenisSoal(type);
    if (type === 'Benar / Salah') {
      setPertanyaan('Pada barisan aritmetika 5, 8, 11, ..., suku ke-10 adalah 32.');
      setBobot(5);
    } else if (type === 'Esai') {
      setPertanyaan(
        'Diketahui barisan aritmetika 5, 8, 11, .... Tentukan suku ke-10 dan jumlah 10 suku pertama. Tuliskan langkah penyelesaiannya.'
      );
      setBobot(10);
    } else {
      setPertanyaan('Hasil dari 12 × 8 adalah ...');
      setBobot(5);
    }
  };

  const handleSimpanSoal = (e) => {
    e.preventDefault();
    alert(`Soal 41 (${jenisSoal}) berhasil disimpan ke daftar soal!`);
    navigate('/b6/buat-kuis', { state: { addedQuestionNumber: 41 } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/b6/buat-kuis" className="hover:text-slate-600 transition-colors">
          Buat Kuis
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Tambah Soal</span>
      </nav>

      {/* 2. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Tambah Soal
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Ulangan Harian Matematika Kelas XI
        </p>
      </div>

      {/* 3. Main Card: Detail Soal */}
      <form onSubmit={handleSimpanSoal} className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
          {/* Card Title & Soal 41 Badge */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Detail Soal</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {jenisSoal === 'Esai'
                  ? 'Susun pertanyaan, jawaban acuan, dan penilaian.'
                  : 'Susun pernyataan dan tentukan jawaban yang benar.'}
              </p>
            </div>
            <span className="rounded-md bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
              Soal 41
            </span>
          </div>

          {/* Section: Jenis Soal (3 Tabs: Pilihan Ganda, Benar / Salah, Esai) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Jenis Soal
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Option 1: Pilihan Ganda */}
              <button
                type="button"
                onClick={() => handleTabChange('Pilihan Ganda')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  jenisSoal === 'Pilihan Ganda'
                    ? 'border-2 border-cyan-500 bg-cyan-50/60 text-[#005b64]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {jenisSoal === 'Pilihan Ganda' && (
                  <CheckCircle2 className="h-4 w-4 text-[#008994]" />
                )}
                <span>Pilihan Ganda</span>
              </button>

              {/* Option 2: Benar / Salah */}
              <button
                type="button"
                onClick={() => handleTabChange('Benar / Salah')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  jenisSoal === 'Benar / Salah'
                    ? 'border-2 border-cyan-500 bg-cyan-50/60 text-[#005b64]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {jenisSoal === 'Benar / Salah' && (
                  <CheckCircle2 className="h-4 w-4 text-[#008994]" />
                )}
                <span>Benar / Salah</span>
              </button>

              {/* Option 3: Esai */}
              <button
                type="button"
                onClick={() => handleTabChange('Esai')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  jenisSoal === 'Esai'
                    ? 'border-2 border-cyan-500 bg-cyan-50/60 text-[#005b64]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {jenisSoal === 'Esai' && (
                  <CheckCircle2 className="h-4 w-4 text-[#008994]" />
                )}
                <span>Esai</span>
              </button>
            </div>
          </div>

          {/* Section: Pertanyaan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Pertanyaan
            </label>
            <textarea
              rows={jenisSoal === 'Esai' ? 4 : 3}
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
              placeholder="Tuliskan teks pertanyaan di sini..."
            />
            <div className="text-[11px] text-slate-400">
              {pertanyaan.length} karakter
            </div>
          </div>

          {/* Section: Gambar Soal (Opsional) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Gambar Soal (Opsional)
            </label>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-slate-50/40 p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100/70 text-[#008994] mb-2">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Pilih gambar untuk melampirkan ke soal
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format PNG atau JPG, ukuran maksimal 5 MB
              </p>
              <button
                type="button"
                onClick={() => alert('Pilih gambar dari file picker')}
                className="mt-3 rounded-xl bg-[#004d57] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003c44] transition-colors"
              >
                Pilih Gambar
              </button>
            </div>
          </div>

          {/* Section: Mode Benar / Salah */}
          {jenisSoal === 'Benar / Salah' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Pilihan Jawaban &amp; Kunci Jawaban
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tentukan apakah pernyataan benar atau salah sebagai kunci.
                </p>
              </div>

              <div className="space-y-2.5">
                {['Benar', 'Salah'].map((val) => {
                  const isChecked = kunciBenarSalah === val;
                  return (
                    <div
                      key={val}
                      onClick={() => setKunciBenarSalah(val)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-2 border-cyan-400 bg-cyan-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                            isChecked
                              ? 'border-[#008994] bg-[#008994]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {val}
                        </span>
                      </div>

                      {isChecked && (
                        <span className="text-xs font-semibold text-[#005b64]">
                          Kunci jawaban
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Mode Pilihan Ganda */}
          {jenisSoal === 'Pilihan Ganda' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Pilihan Jawaban &amp; Kunci Jawaban
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pilih lingkaran pada jawaban yang benar sebagai kunci.
                </p>
              </div>

              <div className="space-y-2.5">
                {['A', 'B', 'C', 'D'].map((key) => {
                  const isChecked = kunciJawabanPG === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setKunciJawabanPG(key)}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-2 border-cyan-400 bg-cyan-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isChecked
                              ? 'border-[#008994] bg-[#008994]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>

                        <span className="text-xs font-bold text-slate-800">
                          {key}.
                        </span>

                        <input
                          type="text"
                          value={pilihanPG[key]}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setPilihanPG({ ...pilihanPG, [key]: e.target.value })
                          }
                          className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
                        />
                      </div>

                      {isChecked && (
                        <span className="text-xs font-semibold text-[#005b64] pl-2">
                          Kunci jawaban
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Mode Esai (Jawaban Acuan & Pedoman Penilaian) */}
          {jenisSoal === 'Esai' && (
            <div className="space-y-6">
              {/* Jawaban Acuan */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Jawaban Acuan
                </label>
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="text-xs sm:text-sm text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                    {jawabanAcuan}
                  </div>
                  <div className="pt-2 text-xs text-slate-400 border-t border-slate-50">
                    Acuan untuk guru; langkah setara yang benar tetap diterima.
                  </div>
                </div>
              </div>

              {/* Pedoman Penilaian */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Pedoman Penilaian
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Berikan poin sesuai langkah yang benar. Total maksimal 10 poin.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white divide-y divide-slate-100 shadow-2xs">
                  {rubricList.map((rubric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm"
                    >
                      <span className="text-slate-700">{rubric.text}</span>
                      <span className="font-bold text-[#005b64] pl-3 whitespace-nowrap">
                        {rubric.poin}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section: Bobot Nilai */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Bobot Nilai
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={bobot}
                  onChange={(e) => setBobot(Number(e.target.value))}
                  className="w-24 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:border-[#004d57] focus:outline-none"
                />
                <span className="text-xs font-semibold text-slate-600">poin</span>
              </div>
              <span className="text-xs text-slate-400 sm:ml-4">
                {jenisSoal === 'Esai'
                  ? 'Nilai diberikan guru berdasarkan pedoman penilaian, dari 0 hingga 10 poin. Jawaban kosong bernilai 0.'
                  : `Siswa mendapat ${bobot} poin jika menjawab benar. Jawaban salah atau kosong bernilai 0.`}
              </span>
            </div>
          </div>

          {/* Action Buttons: Kembali & Simpan Soal */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/b6/buat-kuis')}
              className="rounded-xl bg-[#e6f7f8] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              Kembali
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#004d57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors"
            >
              Simpan Soal
            </button>
          </div>
        </div>
      </form>

      {/* Bottom Caption */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>Soal akan ditambahkan ke daftar soal kuis ini setelah disimpan.</span>
      </div>
    </div>
  );
}
