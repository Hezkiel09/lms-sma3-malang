import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Upload,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function ImportSoalExcelPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromSource = location.state?.from || 'buat-kuis';
  const customKelas = location.state?.kelas;
  const customMapel = location.state?.mapel;

  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState(null);
  const [bankId, setBankId] = useState(location.state?.bankId || '');
  const [banks, setBanks] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (fromSource !== 'buat-kuis') return undefined;
    let active = true;
    apiFetch('/banks').then((list) => {
      if (!active) return;
      const availableBanks = Array.isArray(list) ? list : [];
      setBanks(availableBanks);
      setBankId((current) => current || String(availableBanks[0]?.id || ''));
    }).catch((error) => {
      if (active) setFeedback({ type: 'error', message: `Gagal memuat bank soal: ${error.message}` });
    });
    return () => { active = false; };
  }, [fromSource]);

  const handleDownloadTemplate = () => {
    const content = 'Pertanyaan,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Kunci,Bobot\n';
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'template_soal_excel.csv';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (!/\.(xlsx|xls)$/i.test(selectedFile.name)) {
      setFeedback({ type: 'error', message: 'Pilih file dengan format .xlsx atau .xls.' });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran file maksimal 5 MB.' });
      return;
    }
    setFeedback(null);
    setFile(selectedFile);
  };

  const handleImporSubmit = async () => {
    if (!file) return setFeedback({ type: 'error', message: 'Pilih file Excel terlebih dahulu.' });
    if (!bankId) return setFeedback({ type: 'error', message: 'Pilih bank soal tujuan terlebih dahulu.' });
    setIsImporting(true);
    setFeedback(null);
    try {
      const body = new FormData();
      body.append('excel_file', file);
      const result = await apiFetch(`/banks/${encodeURIComponent(bankId)}/questions/import`, { method: 'POST', body });
      setFeedback({ type: 'error', message: typeof result === 'string' ? result : 'Server belum mengembalikan hasil validasi atau data soal. Impor belum dikonfirmasi.' });
    } catch (error) {
      setFeedback({ type: 'error', message: `Impor belum berhasil: ${error.message}` });
    } finally {
      setIsImporting(false);
    }
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

      {fromSource === 'buat-kuis' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <label htmlFor="import-bank" className="block text-xs font-semibold text-slate-700">Bank Soal tujuan</label>
          <select id="import-bank" value={bankId} onChange={(event) => setBankId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm">
            {!banks.length && <option value="">Belum ada bank soal</option>}
            {banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
          </select>
        </div>
      )}
      {feedback && <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{feedback.message}</div>}

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
            Unduh Template CSV
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
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50/20 p-8 text-center transition-colors hover:bg-cyan-50/40 cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-[#008994] mb-3">
                <Upload className="h-6 w-6 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Seret berkas Excel ke sini
              </h3>
              <p className="text-xs font-semibold text-[#005b64] mt-1 hover:underline">
                {file ? file.name : 'atau pilih berkas dari komputer'}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Format .xlsx atau .xls • Maksimal 5 MB
              </p>
              <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => handleFileChange(event.target.files?.[0])} />
            </label>

            {/* File Info Card (Uploaded State) */}
            {file && <div className="flex items-center justify-between rounded-xl border border-cyan-200/80 bg-cyan-50/50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-cyan-200 text-[#008994]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-800">{file.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • Menunggu validasi server
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#005b64]">Dipilih</span>
            </div>}
          </div>
        </div>
      </div>

      {/* 5. Hasil Validasi & Pratinjau Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <h2 className="text-base font-bold text-slate-800">
            Hasil Validasi &amp; Pratinjau
          </h2>
          <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Menunggu validasi
          </span>
        </div>

        {/* 4 Mini Stat Badges */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-[#005b64]">0</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total soal</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-[#008994]">0</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Soal valid</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-slate-800">0</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Perlu perbaikan</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <span className="text-2xl font-bold text-[#005b64]">0</span>
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
              {!file && <tr><td colSpan="6" className="py-8 text-center text-slate-400">Pilih file untuk memulai validasi soal.</td></tr>}
              {file && <tr><td colSpan="6" className="py-8 text-center text-slate-400">File siap dikirim. Pratinjau menunggu dukungan parser di server.</td></tr>}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 pt-2 border-t border-slate-50">
          Endpoint impor saat ini belum menyediakan parsing dan hasil validasi; soal belum dikonfirmasi tersimpan.
        </p>
      </div>

      {/* 6. Bottom Action Buttons: Kembali & Impor 3 Soal */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            if (fromSource === 'bank-soal') {
              navigate('/b6/bank-soal', { state: { refreshBankId: bankId } });
            } else {
              navigate('/b6/buat-kuis', { state: { selectedQuestions: location.state?.selectedQuestions, formData: location.state?.formData } });
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
          {isImporting ? 'Mengunggah...' : 'Unggah untuk Validasi'}
        </button>
      </div>
    </div>
  );
}
