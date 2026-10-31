import { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Upload,
  GraduationCap,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  mockKelasStats,
  mockKelasList,
  mockMapelStats,
  mockMapelList,
  mockJadwalStats,
  mockJadwalList,
  mockValidasiJadwal,
} from '../../data/mockAkademik';

export default function AkademikPage() {
  const [activeTab, setActiveTab] = useState('Kelas');
  const [selectedTahun, setSelectedTahun] = useState('Tahun Ajaran 2024/2025');
  const [selectedKelasJadwal, setSelectedKelasJadwal] = useState('XI MIPA 2');
  const [selectedHari, setSelectedHari] = useState('Senin');

  const tabs = ['Kelas', 'Mata Pelajaran', 'Jadwal Pelajaran'];

  // Button title based on active tab
  const getButtonText = () => {
    if (activeTab === 'Kelas') return 'Tambah Kelas';
    if (activeTab === 'Mata Pelajaran') return 'Tambah Mata Pelajaran';
    return 'Tambah Jadwal Pelajaran';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Dynamic Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Akademik
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Atur kelas, mata pelajaran, beban mengajar, dan jadwal pembelajaran sekolah.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{getButtonText()}</span>
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

      {/* =========================================================================
          TAB 1: KELAS
         ========================================================================= */}
      {activeTab === 'Kelas' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total kelas</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockKelasStats.totalKelas}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Kapasitas siswa</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockKelasStats.kapasitasSiswa}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Wali kelas terisi</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockKelasStats.waliKelasTerisi}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Ruang aktif</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockKelasStats.ruangAktif}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            {/* Filter bar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kelas..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <span>{selectedTahun}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70">
                  <span>Impor Data</span>
                </button>
                <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Ekspor
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">KELAS</th>
                    <th className="py-3 px-4">JUMLAH SISWA</th>
                    <th className="py-3 px-4">WALI KELAS</th>
                    <th className="py-3 px-4">RUANG</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {mockKelasList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-800">{item.kelas}</td>
                      <td className="py-4 px-4 text-slate-600">{item.jumlahSiswa}</td>
                      <td className="py-4 px-4 text-slate-500">{item.waliKelas}</td>
                      <td className="py-4 px-4 text-slate-600">{item.ruang}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-xs font-semibold text-[#008994] hover:text-[#00707a]">
                          Kelola siswa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MATA PELAJARAN
         ========================================================================= */}
      {activeTab === 'Mata Pelajaran' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total mapel</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockMapelStats.totalMapel}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Mapel wajib</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockMapelStats.mapelWajib}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Mapel peminatan</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockMapelStats.mapelPeminatan}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total jam/minggu</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockMapelStats.totalJamMinggu}
              </div>
            </div>
          </div>

          {/* Filter Container */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mata pelajaran..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <span>{selectedTahun}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70">
                  <span>Impor Data</span>
                </button>
                <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Ekspor
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid Mata Pelajaran */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {mockMapelList.map((mapel) => (
              <div
                key={mapel.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        mapel.iconColor === 'cyan'
                          ? 'bg-cyan-50 text-cyan-600'
                          : mapel.iconColor === 'blue'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        mapel.kategori === 'Wajib'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {mapel.kategori}
                    </span>
                  </div>

                  {/* Title & Code */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-800">{mapel.nama}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{mapel.kode}</p>
                  </div>

                  {/* Info: Beban Belajar & Guru */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs text-slate-500 font-medium">
                    <div>
                      Beban belajar <span className="font-bold text-slate-800">{mapel.bebanBelajar}</span>
                    </div>
                    <div>{mapel.guruCount}</div>
                  </div>
                </div>

                {/* Bottom Button */}
                <div className="mt-5">
                  <button className="w-full rounded-xl bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                    Kelola guru & kelas
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: JADWAL PELAJARAN
         ========================================================================= */}
      {activeTab === 'Jadwal Pelajaran' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Jadwal aktif</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockJadwalStats.jadwalAktif}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Jam pelajaran</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockJadwalStats.jamPelajaran}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Konflik jadwal</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600">
                {mockJadwalStats.konflikJadwal}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Ruang tersedia</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {mockJadwalStats.ruangTersedia}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari jadwal pelajaran..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <span>{selectedTahun}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <span>{selectedKelasJadwal}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <span>{selectedHari}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70">
                  <span>Impor Data</span>
                </button>
                <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Ekspor
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Content & Validation Panel Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Schedule List */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-2 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-800">
                  Jadwal XI MIPA 2 · Senin
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Semester ganjil 2024/2025</p>
              </div>

              {/* Schedule list items */}
              <div className="space-y-4">
                {mockJadwalList.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2 text-xs sm:text-sm">
                      <div className="font-bold text-[#008994] w-28">{item.jam}</div>
                      <div className="font-bold text-slate-800 flex-1">{item.mapel}</div>
                      <div className="text-slate-500 w-36">{item.guru}</div>
                      <div className="text-slate-600 font-medium w-24 text-right">
                        {item.ruang}
                      </div>
                    </div>

                    {/* Conflict Alert Box if any */}
                    {item.hasConflict && (
                      <div className="rounded-xl bg-amber-50/80 border border-amber-200/60 p-2.5 text-xs text-amber-800 font-medium">
                        {item.conflictMsg}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Validasi Jadwal & Tips */}
            <div className="space-y-6">
              {/* Validation Card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-800">Validasi Jadwal</h3>

                <div className="space-y-3 text-xs sm:text-sm font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Tanpa konflik</span>
                    <span className="font-bold text-emerald-600">
                      {mockValidasiJadwal.tanpaKonflik}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Konflik guru</span>
                    <span className="font-bold text-amber-600">
                      {mockValidasiJadwal.konflikGuru}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Konflik ruang</span>
                    <span className="font-bold text-slate-800">
                      {mockValidasiJadwal.konflikRuang}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full rounded-xl bg-[#008994] py-2.5 text-center text-xs sm:text-sm font-semibold text-white hover:bg-[#007682] shadow-xs transition-colors">
                    Periksa semua jadwal
                  </button>
                </div>
              </div>

              {/* Tips Card */}
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5 text-xs text-cyan-900 leading-relaxed">
                <span className="font-bold text-[#008994]">Tips: </span>
                Sistem otomatis mendeteksi benturan guru, kelas, dan ruang sebelum jadwal diterbitkan.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
