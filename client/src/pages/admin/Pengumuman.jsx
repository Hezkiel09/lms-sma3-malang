import { Plus, Megaphone, MoreHorizontal } from 'lucide-react';
import { mockPengumumanList, mockPengumumanSummary } from '../../data/mockPengumuman';

export default function PengumumanPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Pengumuman
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Publikasikan informasi sekolah secara terarah kepada seluruh pengguna.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Buat Pengumuman</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Grid (2 Columns: List on left, Summary on right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Announcement Cards List */}
        <div className="lg:col-span-2 space-y-3.5">
          {mockPengumumanList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              {/* Left: Megaphone Icon & Text info */}
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${item.iconColor}`}
                >
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 sm:text-base leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.target} · {item.date}
                  </p>
                </div>
              </div>

              {/* Right: Status badge & More options */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.statusColor}`}
                >
                  {item.status}
                </span>
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column (1 Col): Ringkasan & Info Box */}
        <div className="space-y-5">
          {/* Ringkasan Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800">Ringkasan</h3>

            <div className="space-y-3.5 text-xs sm:text-sm font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Terbit bulan ini</span>
                <span className="font-bold text-slate-800">
                  {mockPengumumanSummary.terbitBulanIni}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Terjadwal</span>
                <span className="font-bold text-slate-800">
                  {mockPengumumanSummary.terjadwal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Draf</span>
                <span className="font-bold text-slate-800">
                  {mockPengumumanSummary.draf}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Total jangkauan</span>
                <span className="font-bold text-slate-800">
                  {mockPengumumanSummary.totalJangkauan}
                </span>
              </div>
            </div>

            {/* Hint Box inside Ringkasan */}
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 text-xs text-[#008994] font-medium leading-relaxed">
              Pengumuman terjadwal akan dikirim otomatis melalui dashboard pengguna.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
