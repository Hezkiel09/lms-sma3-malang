import { mockRecentActivities } from '../../data/mockData';

export default function RecentActivities() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800">Aktivitas Terkini</h2>
          <p className="text-xs text-slate-400">
            Pembaruan terbaru dari seluruh sistem
          </p>
        </div>
        <button className="text-xs font-semibold text-[#008994] hover:text-[#00707a] transition-colors">
          Lihat semua
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-slate-50">
        {mockRecentActivities.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between group hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
          >
            {/* Left: Indicator Icon + Text */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cyan-50/80">
                <span className="h-2 w-2 rounded-full bg-[#008994]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>

            {/* Right: Time badge */}
            <div className="flex items-center pl-12 sm:pl-0">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border ${item.tagColor}`}
              >
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
