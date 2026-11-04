import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Upload,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { mockExcelValidationData } from '../../data/mockKuis';

export default function ImportSoalExcelPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromSource = location.state?.from || 'buat-kuis';
  const customKelas = location.state?.kelas;
  const customMapel = location.state?.mapel;

  const [data, setData] = useState(mockExcelValidationData);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadTemplate = () => {
    alert('Mengunduh template template_soal_excel.xlsx...');
  };

  const handleImporSubmit = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      alert('3 soal berhasil diimpor!');
      if (fromSource === 'bank-soal') {
        navigate('/b6/bank-soal');
      } else {
        navigate('/b6/buat-kuis', { state: { importedCount: 3 } });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        {fromSource === 'bank-soal' ? (
          <Link to="/b6/bank-soal" className="hover:text-slate-600 transition-colors">
            Bank Soal
          </Link>
        ) : (
          <Link to="/b6/buat-kuis" className="hover:text-slate-600 transition-colors">
            Buat Kuis
          </Link>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Import Soal dari Excel</span>
      </nav>

      {/* 2. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Import Soal dari Excel
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          {fromSource === 'bank-soal'
            ? `Bank Soal Kelas ${customKelas || 'XI'} • ${customMapel || 'Matematika'}`
            : 'Ulangan Harian Matematika Kelas XI'}
        </p>
      </div>

      {/* 3. Horizontal Stepper (1 Siapkan berkas -> 2 Validasi soal -> 3 Impor ke kuis) */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2 text-[#005b64]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008994] text-white text-xs font-bold">
            1
          </span>
          <span>Siapkan berkas</span>
        </div>
        <div className="h-0.5 w-16 bg-cyan-200" />

        <div className="flex items-center gap-2 text-[#005b64]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008994] text-white text-xs font-bold">
            2
          </span>
          <span>Validasi soal</span>
        </div>
        <div className="h-0.5 w-16 bg-slate-200" />

        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
            3
          </span>
          <span>{fromSource === 'bank-soal' ? 'Impor ke bank soal' : 'Impor ke kuis'}</span>
        </div>
      </div>

      {/* 4. Dropzone Box & Petunjuk Format Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Unggah Berkas Excel</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan template agar format soal sesuai.
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="rounded-xl border border-cyan-200 bg-[#e0f7fa] px-4 py-2 text-xs font-semibold text-[#006064] hover:bg-[#b2ebf2] transition-colors"
          >
            Unduh Template
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Petunjuk Format */}
          <div className="space-y-3 rounded-xl bg-slate-50/60 p-4 border border-slate-100 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800">Petunjuk Format</h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-500">
              <li>Satu baris untuk satu soal pilihan ganda.</li>
              <li>Isi pilihan A–D dan kunci A, B, C, atau D.</li>
              <li>Bobot berupa angka lebih dari 0.</li>
              <li>Jangan mengubah nama kolom template.</li>
            </ul>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="font-bold text-slate-700 block mb-1">Kolom wajib</span>
              <p className="text-slate-500">
                Pertanyaan, Pilihan A, Pilihan B, Pilihan C, Pilihan D, Kunci, Bobot
              </p>
            </div>
          </div>

          {/* Drag & Drop Card */}
          <div className="space-y-3">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50/20 p-8 text-center transition-colors hover:bg-cyan-50/40 cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-[#008994] mb-3">
                <Upload className="h-6 w-6 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Seret berkas Excel ke sini
              </h3>
              <p className="text-xs font-semibold text-[#005b64] mt-1 hover:underline">
                atau pilih berkas dari komputer
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Format .xlsx atau .xls • Maksimal 5 MB
              </p>
            </div>

            {/* File Info Card (Uploaded State) */}
            <div className="flex items-center justify-between rounded-xl border border-cyan-200/80 bg-cyan-50/50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-cyan-200 text-[#008994]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    soal_matematika_kelasXI.xlsx
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    18 KB • 3 soal • Validasi selesai
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-[#008994]" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Hasil Validasi & Pratinjau Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <h2 className="text-base font-bold text-slate-800">
            Hasil Validasi &amp; Pratinjau
          </h2>
          <span className="rounded-md bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
            Siap diimpor
          </span>
        </div>

        {/* 4 Mini Stat Badges */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-[#005b64]">3</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total soal</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-[#008994]">3</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Soal valid</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-slate-800">0</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Perlu perbaikan</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-[#005b64]">15</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total poin</p>
          </div>
        </div>

        {/* Validation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/60 font-semibold text-slate-500">
              <tr>
                <th className="py-2.5 px-3 w-12">No.</th>
                <th className="py-2.5 px-3">Pertanyaan</th>
                <th className="py-2.5 px-3">Jenis Soal</th>
                <th className="py-2.5 px-3">Kunci</th>
                <th className="py-2.5 px-3">Bobot</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.map((row) => (
                <tr key={row.no} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-medium text-slate-400">{row.no}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {row.pertanyaan}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{row.jenisSoal}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{row.kunci}</td>
                  <td className="py-3 px-3 text-slate-600">{row.bobot}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-block rounded-md bg-[#e0f7fa] px-2.5 py-0.5 text-[11px] font-semibold text-[#006064]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 pt-2 border-t border-slate-50">
          Semua soal valid. 3 soal akan ditambahkan tanpa mengganti soal yang sudah ada.
        </p>
      </div>

      {/* 6. Bottom Action Buttons: Kembali & Impor 3 Soal */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            if (fromSource === 'bank-soal') {
              navigate('/b6/bank-soal');
            } else {
              navigate('/b6/buat-kuis');
            }
          }}
          className="rounded-xl bg-[#e6f7f8] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
        >
          Kembali
        </button>

        <button
          onClick={handleImporSubmit}
          disabled={isImporting}
          className="rounded-xl bg-[#004d57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors disabled:opacity-60"
        >
          {isImporting ? 'Mengimpor...' : 'Impor 3 Soal'}
        </button>
      </div>
    </div>
  );
}
