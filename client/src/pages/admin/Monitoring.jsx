import { useState } from 'react';
import {
  Plus,
  ChevronDown,
  Download,
  Search,
  Monitor,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  mockMonitoringStats,
  mockDetailPresensi,
  mockDistribusiStatus,
  mockPerluTindakan,
} from '../../data/mockMonitoring';

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('Presensi');
  const [selectedTanggal, setSelectedTanggal] = useState('Hari ini, 18 Nov 2024');
  const [selectedTingkat, setSelectedTingkat] = useState('Semua tingkat');
  const [selectedKelas, setSelectedKelas] = useState('Semua kelas');

  const tabs = ['Presensi', 'Nilai Siswa', 'Bank Soal', 'Aktivitas Pembelajaran'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Monitoring
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Pantau kualitas data, temukan anomali, dan tindak lanjuti aktivitas akademik secara menyeluruh.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Impor Presensi</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tab Pills */}
      <div className="flex overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xs">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-[#008994] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dropdown 1: Tanggal */}
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
            <span>{selectedTanggal}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Dropdown 2: Tingkat */}
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
            <span>{selectedTingkat}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Dropdown 3: Kelas */}
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
            <span>{selectedKelas}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div>
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Unduh laporan
          </button>
        </div>
      </div>

      {/* 4. 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <Monitor className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Kehadiran hari ini</span>
            <div className="text-2xl font-bold tracking-tight text-slate-800 mt-1">
              {mockMonitoringStats.kehadiranHariIni}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {mockMonitoringStats.kehadiranSub}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Monitor className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Tidak hadir</span>
            <div className="text-2xl font-bold tracking-tight text-slate-800 mt-1">
              {mockMonitoringStats.tidakHadir}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {mockMonitoringStats.tidakHadirSub}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Monitor className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Belum dikonfirmasi</span>
            <div className="text-2xl font-bold tracking-tight text-amber-600 mt-1">
              {mockMonitoringStats.belumDikonfirmasi}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {mockMonitoringStats.belumDikonfirmasiSub}
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Monitor className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium">Notifikasi terkirim</span>
            <div className="text-2xl font-bold tracking-tight text-slate-800 mt-1">
              {mockMonitoringStats.notifikasiTerkirim}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {mockMonitoringStats.notifikasiTerkirimSub}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Main Content Grid (2 Columns: Detail Presensi on left, Panels on right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Detail Presensi Table Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-2 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Detail Presensi</h2>
              <p className="text-xs text-slate-400 mt-0.5">Data diperbarui pukul 10.42 WIB</p>
            </div>

            {/* Small search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari..."
                className="w-48 rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#008994] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-3">KELAS</th>
                  <th className="py-3 px-3">WALI KELAS</th>
                  <th className="py-3 px-3">HADIR</th>
                  <th className="py-3 px-3">SAKIT/IZIN</th>
                  <th className="py-3 px-3">ALFA</th>
                  <th className="py-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {mockDetailPresensi.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3 font-bold text-slate-800">{row.kelas}</td>
                    <td className="py-4 px-3 text-slate-500">{row.waliKelas}</td>
                    <td className="py-4 px-3 text-slate-700">{row.hadir}</td>
                    <td className="py-4 px-3 text-slate-600">{row.sakitIzin}</td>
                    <td className="py-4 px-3 text-slate-600">{row.alfa}</td>
                    <td className="py-4 px-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.status === 'Lengkap'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Menampilkan 4 data prioritas</span>
            <button className="flex items-center gap-1 font-semibold text-[#008994] hover:text-[#00707a] transition-colors">
              <span>Lihat seluruh data</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (1 Col): Distribusi Status & Perlu Tindakan */}
        <div className="space-y-6">
          {/* Card: Distribusi Status */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-800">Distribusi Status</h3>

            <div className="flex items-center gap-5">
              {/* Donut chart representation */}
              <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path
                    className="text-slate-100 stroke-current"
                    strokeWidth="3.8"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment: Baik/selesai (94.8%) */}
                  <path
                    className="text-cyan-500 stroke-current"
                    strokeDasharray="94.8, 100"
                    strokeWidth="3.8"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-bold text-slate-800 leading-none block">
                    {mockDistribusiStatus.percentage}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {mockDistribusiStatus.statusText}
                  </span>
                </div>
              </div>

              {/* Status legends */}
              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    <span className="text-slate-500">Baik/selesai</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {mockDistribusiStatus.baikSelesai}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-slate-500">Perlu tinjau</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {mockDistribusiStatus.perluTinjau}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-slate-500">Bermasalah</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {mockDistribusiStatus.bermasalah}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Perlu Tindakan */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Perlu Tindakan</h3>
              <span className="rounded-full bg-amber-100/70 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                4 ITEM
              </span>
            </div>

            <div className="space-y-2.5">
              {mockPerluTindakan.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50/70 px-4 py-3 text-xs font-medium text-slate-700 hover:bg-slate-100/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${action.dotColor}`} />
                    <span>{action.text}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
