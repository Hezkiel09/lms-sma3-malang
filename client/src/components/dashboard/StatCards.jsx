import { Users, GraduationCap, Monitor, FileText } from 'lucide-react';
import { mockStats } from '../../data/mockData';

const iconMap = {
  Users: Users,
  GraduationCap: GraduationCap,
  Monitor: Monitor,
  FileText: FileText,
};

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {mockStats.map((item) => {
        const Icon = iconMap[item.icon] || Users;
        return (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            {/* Top row: Icon and Trend badge */}
            <div className="flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                {item.change}
              </span>
            </div>

            {/* Bottom info */}
            <div className="mt-4">
              <div className="text-2xl font-bold tracking-tight text-slate-800">
                {item.value}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-400">{item.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
