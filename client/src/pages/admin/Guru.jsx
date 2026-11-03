import { useEffect, useState } from 'react';
import { Plus, Search, ChevronDown, Upload } from 'lucide-react';
import { mockGuruStats, mockGuruList } from '../../data/mockGuru';
import { apiFetch } from '../../lib/api';

export default function GuruPage() {
  const [activeTab, setActiveTab] = useState('Semua Guru');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('Semua jabatan');
  const [teachers, setTeachers] = useState(mockGuruList);
  const [loading, setLoading] = useState(false);

  const tabs = ['Semua Guru', 'Guru Tetap (PNS)', 'Guru Honorer', 'Tenaga Kependidikan'];

  useEffect(() => {
    let active = true;
    setLoading(true);

    apiFetch('/master/users/teachers')
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          // Format real data from backend
          const formatted = data.map((t, idx) => {
            const initials = t.name
              ? t.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'GR';
            return {
              id: t.id || idx + 1,
              nip: t.nip || '-',
              initial: initials,
              nama: t.name || '-',
              mapel: t.subjects?.name || 'Mata Pelajaran',
              jabatan: 'Guru Tetap (PNS)',
              status: 'Aktif',
            };
          });
          setTeachers(formatted);
        }
      })
      .catch(() => {
        // Fallback to mock data gracefully
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Filter teachers by search and tab
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mapel.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'Guru Tetap (PNS)') return t.jabatan.includes('PNS');
    if (activeTab === 'Guru Honorer') return t.jabatan.includes('Honorer');
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Data Guru &amp; Tenaga Kependidikan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Kelola data pengajar, staf kependidikan, dan beban mengajar SMAN 3 Malang.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Guru</span>
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total guru</span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {mockGuruStats.totalGuru}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Guru PNS</span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {mockGuruStats.guruPNS}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Guru honorer</span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {mockGuruStats.guruHonorer}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total staf</span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {mockGuruStats.totalStaf}
          </div>
        </div>
      </div>

      {/* 4. Table Card Container */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        {/* Search, Filter & Action Buttons */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari guru berdasarkan nama, NIP, mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <span>{selectedJabatan}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Impor Data Guru</span>
            </button>

            <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Ekspor
            </button>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Memuat data guru...</p>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4">NAMA GURU</th>
                  <th className="py-3 px-4">MATA PELAJARAN</th>
                  <th className="py-3 px-4">JABATAN</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTeachers.map((guru) => (
                  <tr key={guru.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 text-slate-500">{guru.nip}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/70 text-xs font-bold text-blue-800">
                          {guru.initial}
                        </div>
                        <span className="font-bold text-slate-800">{guru.nama}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">{guru.mapel}</td>
                    <td className="py-4 px-4 text-slate-500">{guru.jabatan}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          guru.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {guru.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-xs font-semibold text-[#008994] hover:text-[#00707a] transition-colors cursor-pointer">
                        Detail ...
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <div>Menampilkan 1-{filteredTeachers.length} dari {mockGuruStats.totalGuru} data</div>
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
