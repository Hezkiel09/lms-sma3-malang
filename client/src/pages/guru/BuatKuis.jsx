import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload,
  Clock,
  FileText,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function BuatKuisPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if routed with added questions
  const hasAddedFromLocation = Boolean(location.state?.addedFromBank || location.state?.importedCount);
  const [hasAddedFromBank, setHasAddedFromBank] = useState(hasAddedFromLocation);

  // Form details
  const [formData, setFormData] = useState({
    judul: '',
    kkm: 75,
    jumlahSoal: hasAddedFromBank ? 42 : 40,
    durasi: '75 menit',
    deskripsi: '',
  });

  const totalQuestions = hasAddedFromBank ? 42 : 40;
  const numbersList = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Title (Persis di Foto: Langsung "Buat Kuis" Tanpa Breadcrumb di Atasnya) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Buat Kuis
        </h1>

        <div className="flex items-center gap-3">
          {/* Badge Gambar 4 jika ada soal dari bank */}
          {hasAddedFromBank && (
            <span className="rounded-full bg-[#e6f7f8] px-3.5 py-1 text-xs font-semibold text-[#005b64]">
              Soal dari Bank Ditambahkan
            </span>
          )}

          {/* Toggle demo switch untuk beralih antara Gambar 1 & Gambar 4 */}
          <button
            onClick={() => {
              const next = !hasAddedFromBank;
              setHasAddedFromBank(next);
              setFormData((prev) => ({ ...prev, jumlahSoal: next ? 42 : 40 }));
            }}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline"
          >
            [Demo: {hasAddedFromBank ? 'Lihat Tampilan Gambar 1 (40 Soal)' : 'Lihat Tampilan Gambar 4 (+2 Soal)'}]
          </button>
        </div>
      </div>

      {/* 2. Success Alert Banner (Hanya muncul jika soal ditambahkan - Gambar 4) */}
      {hasAddedFromBank && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>2 soal dari Bank Soal berhasil ditambahkan</span>
        </div>
      )}

      {/* 3. Card 1: Detail Kuis */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Detail Kuis</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur judul, durasi, dan jumlah soal untuk kuis ini.
            </p>
          </div>
          <div>
            <button
              onClick={() => alert('Draft kuis berhasil disimpan!')}
              className="rounded-xl bg-[#004d57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              Simpan Draft
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Judul Kuis */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Judul Kuis
            </label>
            <input
              type="text"
              placeholder="Contoh: Ulangan Harian Matematika XI"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
            />
          </div>

          {/* Row: KKM, Jumlah Soal, Durasi */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                KKM
              </label>
              <input
                type="number"
                value={formData.kkm}
                onChange={(e) => setFormData({ ...formData, kkm: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-[#004d57] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Jumlah Soal
              </label>
              <input
                type="number"
                value={hasAddedFromBank ? 42 : 40}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Durasi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.durasi}
                  onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 focus:border-[#004d57] focus:outline-none"
                />
                <Clock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan instruksi singkat untuk siswa sebelum memulai kuis."
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Card 2: Daftar Soal */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Soal</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola soal yang sudah ditambahkan ke kuis ini.
            </p>
          </div>

          {/* 3 Tombol Aksi: Impor, Ambil dari Bank Soal, Tambah Soal */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/guru/buat-kuis/import')}
              className="flex items-center gap-2 rounded-xl bg-[#e6f7f8] px-4 py-2 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              <Upload className="h-4 w-4 stroke-[2.2]" />
              <span>Impor</span>
            </button>

            <button
              onClick={() => navigate('/guru/buat-kuis/ambil-bank-soal')}
              className="rounded-xl bg-[#004d57] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              Ambil dari Bank Soal
            </button>

            <button
              onClick={() => navigate('/guru/buat-kuis/tambah-soal')}
              className="rounded-xl bg-[#004d57] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              Tambah Soal
            </button>
          </div>
        </div>

        {/* Number Badges Grid (1 s/d 40 atau 42) */}
        <div className="flex flex-wrap gap-2 pt-2">
          {numbersList.map((num) => {
            const isNewlyAdded = num > 40;
            return (
              <button
                key={num}
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                  isNewlyAdded
                    ? 'bg-[#004d57] text-white ring-2 ring-cyan-400 hover:brightness-110'
                    : 'bg-[#008994] text-white hover:brightness-110'
                }`}
                title={`Soal nomor ${num}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Sub-info line below numbers */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span>
              {totalQuestions} soal tersedia untuk diedit atau ditambahkan.
            </span>
          </div>

          {hasAddedFromBank && (
            <span className="rounded-full bg-[#e0f7fa] px-2.5 py-0.5 text-xs font-semibold text-[#006064]">
              41–42 baru
            </span>
          )}
        </div>

        {/* =====================================================================
            BAGIAN GAMBAR 4: "Soal yang baru ditambahkan"
           ===================================================================== */}
        {hasAddedFromBank && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Soal yang baru ditambahkan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  40 soal lama + 2 soal dari Bank Soal = 42 soal
                </p>
              </div>
              <span className="rounded-full bg-[#e6f7f8] px-3 py-1 text-xs font-semibold text-[#005b64]">
                2 soal dari Bank Soal
              </span>
            </div>

            {/* Card Soal 41 */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004d57] text-xs font-bold text-white">
                    41
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded-md bg-[#e0f7fa] px-2 py-0.5 text-[11px] font-semibold text-[#006064]">
                        Pilihan Ganda
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        Dari Bank Soal
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      Diketahui f(x) = 2x + 1 dan g(x) = x². Nilai (f · g)(3) adalah ...
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sumber: XI • Matematika • Komposisi & invers
                    </p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 whitespace-nowrap pl-2">
                  Kunci jawaban: <span className="text-[#005b64]">19</span>
                </div>
              </div>
            </div>

            {/* Card Soal 42 */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004d57] text-xs font-bold text-white">
                    42
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded-md bg-[#e0f7fa] px-2 py-0.5 text-[11px] font-semibold text-[#006064]">
                        Benar / Salah
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        Dari Bank Soal
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      Invers dari fungsi f(x) = 2x + 3 adalah f⁻¹(x) = (x - 3) / 2.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sumber: XI • Matematika • Komposisi & invers
                    </p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 whitespace-nowrap pl-2">
                  Kunci jawaban: <span className="text-[#005b64]">Benar</span>
                </div>
              </div>
            </div>

            {/* Note bawah */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Info className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span>
                Salinan soal dapat diedit di kuis ini tanpa mengubah soal pada Bank Soal sumber.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
