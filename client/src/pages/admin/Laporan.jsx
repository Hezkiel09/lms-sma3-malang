import { useState } from 'react';
import { ChevronDown, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  mockLaporanJenis,
  mockLaporanPeriode,
  mockLaporanFormat,
  mockLaporanCards,
} from '../../data/mockLaporan';
import { apiFetch } from '../../lib/api';

function escapeCsvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function downloadCsvFile(filename, csvContent) {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

export default function LaporanPage() {
  const [selectedJenis, setSelectedJenis] = useState(mockLaporanJenis[0].value);
  const [selectedPeriode, setSelectedPeriode] = useState(mockLaporanPeriode[0].label);
  const [selectedFormat, setSelectedFormat] = useState(mockLaporanFormat[0].value);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notif, setNotif] = useState(null); // { type: 'success' | 'error', message: string }

  const showNotification = (type, message) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 4000);
  };

  // Unduh laporan berdasarkan jenis
  const handleDownloadReport = async (reportType, reportTitle) => {
    setIsProcessing(true);
    try {
      if (reportType === 'data_akademik') {
        // Coba fetch dari backend
        let classes = [];
        let subjects = [];
        let teachers = [];

        try {
          const [cls, sub, tch] = await Promise.all([
            apiFetch('/master/classes'),
            apiFetch('/master/subjects'),
            apiFetch('/master/users/teachers'),
          ]);
          classes = Array.isArray(cls) ? cls : [];
          subjects = Array.isArray(sub) ? sub : [];
          teachers = Array.isArray(tch) ? tch : [];
        } catch {
          // Fallback data jika backend belum berjalan
          classes = [{ name: 'XI MIPA 2', level: 'XI', major: 'MIPA' }];
          subjects = [{ name: 'Matematika' }, { name: 'Bahasa Indonesia' }];
          teachers = [{ name: 'Budi Santoso, S.Pd.', nip: '198501152010011002' }];
        }

        const headers = ['Kategori', 'Nama', 'Keterangan/NIP/Tingkat', 'Detail Tambahan'];
        const rows = [
          ...classes.map((c) => ['Kelas', c.name, `Tingkat ${c.level || '-'}`, c.major || '-']),
          ...subjects.map((s) => ['Mata Pelajaran', s.name, s.code || '-', `${s.credit_hours || 2} Jam`]),
          ...teachers.map((t) => ['Guru', t.name, t.nip || '-', t.phone || '-']),
        ];

        const csv = [headers, ...rows]
          .map((row) => row.map(escapeCsvValue).join(','))
          .join('\r\n');

        downloadCsvFile(`laporan-data-akademik-${Date.now()}.csv`, csv);
        showNotification('success', 'Laporan Data Akademik berhasil diunduh.');
      } else if (reportType === 'presensi_siswa') {
        const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alfa', 'Persentase'];
        const rows = [
          ['21043', 'Almira Putri Ananda', 'XI MIPA 2', '20', '0', '0', '0', '100%'],
          ['21044', 'Bima Arya Pratama', 'XI MIPA 2', '19', '1', '0', '0', '95%'],
          ['21045', 'Citra Lestari', 'XI MIPA 1', '18', '0', '2', '0', '90%'],
          ['21046', 'Daffa Ramadhan', 'XI IPS 1', '17', '1', '1', '1', '85%'],
          ['21047', 'Fara Nabila', 'XI Bahasa', '20', '0', '0', '0', '100%'],
        ];

        const csv = [headers, ...rows]
          .map((row) => row.map(escapeCsvValue).join(','))
          .join('\r\n');

        downloadCsvFile(`laporan-presensi-siswa-${Date.now()}.csv`, csv);
        showNotification('success', 'Laporan Presensi Siswa berhasil diunduh.');
      } else if (reportType === 'nilai_harian') {
        const headers = ['NIS', 'Nama Siswa', 'Mata Pelajaran', 'UH 1', 'UH 2', 'Tugas', 'Rata-rata'];
        const rows = [
          ['21043', 'Almira Putri Ananda', 'Matematika', '92', '88', '95', '91.6'],
          ['21044', 'Bima Arya Pratama', 'Matematika', '85', '80', '90', '85.0'],
          ['21045', 'Citra Lestari', 'Fisika', '88', '84', '86', '86.0'],
          ['21046', 'Daffa Ramadhan', 'Sosiologi', '78', '82', '80', '80.0'],
        ];

        const csv = [headers, ...rows]
          .map((row) => row.map(escapeCsvValue).join(','))
          .join('\r\n');

        downloadCsvFile(`laporan-nilai-harian-${Date.now()}.csv`, csv);
        showNotification('success', 'Laporan Nilai Harian berhasil diunduh.');
      } else {
        // Aktivitas sistem
        const headers = ['Waktu', 'Pengguna', 'Peran', 'Aktivitas', 'Status'];
        const rows = [
          ['18 Nov 2024 10:42', 'Rina Handayani, M.Pd.', 'Guru', 'Impor presensi XI MIPA 2', 'Berhasil'],
          ['18 Nov 2024 10:30', 'Karina Maharani', 'Admin', 'Validasi akun orang tua', 'Berhasil'],
          ['18 Nov 2024 09:15', 'Budi Santoso, S.Pd.', 'Guru', 'Input nilai Matematika XII MIPA 1', 'Berhasil'],
          ['18 Nov 2024 08:00', 'Sistem', 'System', 'Sinkronisasi kehadiran harian', 'Berhasil'],
        ];

        const csv = [headers, ...rows]
          .map((row) => row.map(escapeCsvValue).join(','))
          .join('\r\n');

        downloadCsvFile(`laporan-aktivitas-sistem-${Date.now()}.csv`, csv);
        showNotification('success', 'Laporan Aktivitas Sistem berhasil diunduh.');
      }
    } catch (err) {
      showNotification('error', `Gagal mengunduh laporan: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuatLaporan = () => {
    const reportItem = mockLaporanCards.find((c) => c.type === selectedJenis) || mockLaporanCards[0];
    handleDownloadReport(selectedJenis, reportItem.title);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Laporan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Buat, unduh, dan arsipkan laporan operasional sekolah.
        </p>
      </div>

      {/* Notifikasi feedback */}
      {notif && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold transition-all ${
            notif.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notif.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <span>{notif.message}</span>
        </div>
      )}

      {/* 2. Filter Bar — Teal/cyan gradient background */}
      <div className="rounded-2xl bg-gradient-to-r from-[#008994] to-[#00b4d8] p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          {/* Jenis Laporan */}
          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/70">
              Jenis Laporan
            </label>
            <div className="relative">
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {mockLaporanJenis.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Periode */}
          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/70">
              Periode
            </label>
            <div className="relative">
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {mockLaporanPeriode.map((item) => (
                  <option key={item.value} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Format */}
          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/70">
              Format
            </label>
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {mockLaporanFormat.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Buat Laporan Button */}
          <div className="lg:flex-shrink-0">
            <button
              onClick={handleBuatLaporan}
              disabled={isProcessing}
              className="w-full rounded-xl bg-slate-800 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 transition-colors disabled:opacity-60 lg:w-auto"
            >
              {isProcessing ? 'Memproses...' : 'Buat Laporan'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Report Cards Grid (2x2) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {mockLaporanCards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            {/* Top: Icon + Title & Description */}
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconColor}`}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 sm:text-base leading-snug">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Bottom: Last generated date & Download button */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                {card.lastGenerated}
              </span>
              <button
                onClick={() => handleDownloadReport(card.type, card.title)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#008994] px-4 py-1.5 text-xs font-semibold text-[#008994] hover:bg-[#008994] hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
