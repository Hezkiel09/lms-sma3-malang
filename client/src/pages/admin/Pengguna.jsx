import { useState } from 'react';
import { Plus, Search, ChevronDown, Upload, Download } from 'lucide-react';
import { mockPenggunaStats, mockSiswaList } from '../../data/mockPengguna';

export default function PenggunaPage() {
  const [activeTab, setActiveTab] = useState('Siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua kelas');

  const tabs = ['Siswa', 'Orang Tua/Wali', 'Guru', 'Akun Pengguna'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Data Pengguna
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Kelola data siswa, orang tua/wali, guru, dan akses akun dalam satu tempat.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Siswa</span>
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

      {/* 3. Stat KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total data</span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {mockPenggunaStats.totalData}
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Akun aktif</span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {mockPenggunaStats.akunAktif}
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Perlu dilengkapi</span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600">
            {mockPenggunaStats.perluDilengkapi}
          </div>
        </div>
      </div>

      {/* 4. Table Card Container */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        {/* Search, Filter & Action Buttons */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari data siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            />
          </div>

          {/* Right Filters & Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Kelas */}
            <div className="relative">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <span>{selectedClass}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Impor Button */}
            <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Impor PDF/Dokumen</span>
            </button>

            {/* Ekspor Button */}
            <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Ekspor
            </button>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">ID/NIS</th>
                <th className="py-3 px-4">NAMA SISWA</th>
                <th className="py-3 px-4">KELAS</th>
                <th className="py-3 px-4">ORANG TUA/WALI</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockSiswaList.map((siswa) => (
                <tr key={siswa.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 text-slate-500">{siswa.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100/70 text-xs font-bold text-cyan-800">
                        {siswa.initial}
                      </div>
                      <span className="font-bold text-slate-800">{siswa.nama}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium">{siswa.kelas}</td>
                  <td className="py-4 px-4 text-slate-500">{siswa.orangTua}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        siswa.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {siswa.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-xs font-semibold text-[#008994] hover:text-[#00707a] transition-colors">
                      Detail ...
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Info & Pagination */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <div>Menampilkan 1-5 dari 1.248 data</div>
          <div className="flex items-center gap-1.5">
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Sebelumnya
            </button>
            <button className="h-8 w-8 rounded-xl bg-[#008994] font-bold text-white shadow-xs">
              1
            </button>
            <button className="h-8 w-8 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              2
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
