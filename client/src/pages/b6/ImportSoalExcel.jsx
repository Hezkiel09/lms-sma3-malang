import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [data, setData] = useState(mockExcelValidationData);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadTemplate = () => {
    alert('Mengunduh template template_soal_excel.xlsx...');
  };

  const handleImporSubmit = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      // Navigate to Buat Kuis with state
      navigate('/b6/buat-kuis', { state: { importedCount: 3 } });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/b6/buat-kuis" className="hover:text-slate-600">
          Buat Kuis
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Import Soal dari Excel</span>
      </nav>

      {/* 2. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Import Soal dari Excel
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Ulangan Harian Matematika Kelas XI
        </p>
      </div>

      {/* 3. Horizontal Stepper (1 Siapkan berkas -> 2 Validasi soal -> 3 Impor ke kuis) */}
      <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
        <div className="flex items-center gap-2 text-[#005b64]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008994] text-xs text-white">
            1
          </span>
          <span>Siapkan berkas</span>
        </div>
        <div className="h-0.5 w-16 bg-[#008994]" />

        <div className="flex items-center gap-2 text-[#005b64]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#008994] text-xs text-white">
            2
          </span>
          <span>Validasi soal</span>
        </div>
        <div className="h-0.5 w-16 bg-slate-200" />

        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-400">
            3
          </span>
          <span>Impor ke kuis</span>
        </div>
      </div>

      {/* 4. Top Card: Unggah Berkas Excel */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Unggah Berkas Excel</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan template agar format soal sesuai.
            </p>
          </div>
          <div>
            <button
              onClick={handleDownloadTemplate}
              className="rounded-xl bg-[#e6f7f8] px-4 py-2 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              Unduh Template
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-1">
          {/* Left Column: Petunjuk Format & Kolom Wajib */}
          <div className="space-y-4 text-xs text-slate-600">
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Petunjuk Format</h3>
              <ul className="space-y-1.5 list-disc list-inside text-slate-500">
                <li>Satu baris untuk satu soal pilihan ganda.</li>
                <li>Isi pilihan A–D dan kunci A, B, C, atau D.</li>
                <li>Bobot berupa angka lebih dari 0.</li>
                <li>Jangan mengubah nama kolom template.</li>
              </ul>
            </div>

            <div className="pt-2">
              <h3 className="font-bold text-slate-800 mb-1">Kolom wajib</h3>
              <p className="text-slate-500 leading-relaxed">
                Pertanyaan, Pilihan A, Pilihan B, Pilihan C, Pilihan D, Kunci, Bobot
              </p>
            </div>
          </div>

          {/* Right Column: Upload Box & Attached File */}
          <div className="space-y-3">
            {/* Dashed Drag & Drop Box */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50/30 p-6 text-center cursor-pointer hover:bg-cyan-50/60 transition-colors">
              <Upload className="h-8 w-8 text-[#008994] mb-2" />
              <span className="text-xs font-semibold text-slate-800">
                Seret berkas Excel ke sini
              </span>
              <span className="text-xs text-cyan-700 font-semibold mt-1">
                atau pilih berkas dari komputer
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Format .xlsx atau .xls • Maksimal 5 MB
              </span>
            </div>

            {/* Uploaded File Row */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-[#008994]" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{data.fileName}</p>
                  <p className="text-[11px] text-slate-400">
                    {data.fileSize} • {data.totalSoal} soal • Validasi selesai
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-[#008994]" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Card: Hasil Validasi & Pratinjau */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Hasil Validasi &amp; Pratinjau
          </h2>
          <span className="rounded-full bg-[#e6f7f8] px-3 py-1 text-xs font-semibold text-[#005b64]">
            Siap diimpor
          </span>
        </div>

        {/* 4 Stat Bar (Total soal, Soal valid, Perlu perbaikan, Total poin) */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-4">
          <div>
            <div className="text-xl font-bold text-slate-800">{data.totalSoal}</div>
            <div className="text-xs text-slate-400 mt-0.5">Total soal</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{data.soalValid}</div>
            <div className="text-xs text-slate-400 mt-0.5">Soal valid</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{data.perluPerbaikan}</div>
            <div className="text-xs text-slate-400 mt-0.5">Perlu perbaikan</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{data.totalPoin}</div>
            <div className="text-xs text-slate-400 mt-0.5">Total poin</div>
          </div>
        </div>

        {/* Preview Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-3">No.</th>
                <th className="py-3 px-3">Pertanyaan</th>
                <th className="py-3 px-3">Jenis Soal</th>
                <th className="py-3 px-3">Kunci</th>
                <th className="py-3 px-3">Bobot</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.items.map((row) => (
                <tr key={row.no} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 text-slate-400">{row.no}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    {row.pertanyaan}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{row.jenisSoal}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-800">{row.kunci}</td>
                  <td className="py-3.5 px-3 text-slate-600">{row.bobot}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="inline-flex items-center rounded-md bg-[#e0f7fa] px-2.5 py-0.5 text-xs font-semibold text-[#006064]">
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
          onClick={() => navigate('/b6/buat-kuis')}
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
