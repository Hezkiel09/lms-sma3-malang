import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  FileText,
  Info,
} from 'lucide-react';

export default function BuatSoal() {
  const navigate = useNavigate();
  const location = useLocation();

  const kelas = location.state?.kelas || 'XI';
  const mapel = location.state?.mapel || 'Matematika';
  const materi = location.state?.materi || 'Komposisi & invers';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/b6/bank-soal" className="hover:text-slate-600 transition-colors">
          Bank Soal
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-slate-400">Kelas {kelas}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-slate-400">{mapel}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Buat Soal</span>
      </nav>

      {/* 2. Header Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Buat Soal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Pilih cara menambahkan soal ke Bank Soal {kelas} / {mapel}.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-xl bg-[#e0f7fa] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#006064] hover:bg-[#b2ebf2] transition-colors"
          >
            Kembali ke Kelas Mapel
          </button>
        </div>
      </div>

      {/* 3. Info Summary Box */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:grid-cols-3">
        <div>
          <span className="text-xs text-slate-400 font-medium">Kelas</span>
          <div className="text-sm font-bold text-slate-800 mt-1">{kelas}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Mata pelajaran</span>
          <div className="text-sm font-bold text-slate-800 mt-1">{mapel}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Materi</span>
          <div className="text-sm font-bold text-slate-800 mt-1">{materi}</div>
        </div>
      </div>

      {/* 4. Main Card: Stepper & 2 Options */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Pilih Cara Membuat Soal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Input satu per satu atau impor soal yang sudah disiapkan dalam Excel.
          </p>
        </div>

        {/* Stepper Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            1. Pilih Kelas
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            2. Pilih Mata Pelajaran
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            3. Lihat Soal
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="rounded-full bg-[#004d57] px-3.5 py-1 text-xs font-semibold text-white shadow-xs">
            4. Tambah / Impor Soal
          </span>
        </div>

        {/* 2 Side-by-side Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Input Manual */}
          <div className="rounded-2xl border border-cyan-100/90 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                <Edit3 className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Input Manual
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tulis pertanyaan, kunci jawaban, dan pembahasan langsung di aplikasi.
                  Pilih jenis soal untuk mulai.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() =>
                  navigate('/b6/buat-kuis/tambah-soal', {
                    state: {
                      initialType: 'Pilihan Ganda',
                      from: 'bank-soal',
                      kelas,
                      mapel,
                      materi,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors text-center border border-cyan-100/60"
              >
                Pilihan Ganda
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/b6/buat-kuis/tambah-soal', {
                    state: {
                      initialType: 'Benar / Salah',
                      from: 'bank-soal',
                      kelas,
                      mapel,
                      materi,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors text-center border border-cyan-100/60"
              >
                Benar / Salah
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/b6/buat-kuis/tambah-soal', {
                    state: {
                      initialType: 'Esai',
                      from: 'bank-soal',
                      kelas,
                      mapel,
                      materi,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors text-center border border-cyan-100/60"
              >
                Esai
              </button>
            </div>
          </div>

          {/* Card 2: Impor dari Excel */}
          <div className="rounded-2xl border border-cyan-100/90 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                <FileSpreadsheet className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Impor dari Excel
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tambahkan soal dari file Excel sesuai templat. Periksa isi soal sebelum
                  menyimpan ke bank soal.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-4 space-y-2 text-xs text-slate-600">
                <p>• Unduh dan isi templat Excel.</p>
                <p>• Unggah file dan tinjau soal yang diimpor.</p>
                <p>• Simpan pada konteks kelas, mapel, dan materi ini.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  navigate('/b6/buat-kuis/import', {
                    state: {
                      from: 'bank-soal',
                      kelas,
                      mapel,
                      materi,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#004d57] py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors text-center"
              >
                Impor dari Excel
              </button>
            </div>
          </div>
        </div>

        {/* Context alert */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <Info className="h-4 w-4 text-[#008994] flex-shrink-0" />
          <span>
            Soal baru akan ditambahkan ke Kelas {kelas} • {mapel} • {materi}.
          </span>
        </div>
      </div>

      {/* 5. Bottom Caption */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Bank soal tersinkronisasi otomatis dengan portal ujian dan presensi SMAN 3 Malang. Gunakan kembali materi yang telah diuji untuk efisiensi pembuatan kuis.
        </span>
      </div>
    </div>
  );
}
