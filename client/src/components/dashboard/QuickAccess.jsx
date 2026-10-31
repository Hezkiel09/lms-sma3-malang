import { Link } from 'react-router-dom';
import { mockQuickActions } from '../../data/mockData';

export default function QuickAccess() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Akses Cepat</h2>

        <div className="grid grid-cols-2 gap-3.5">
          {mockQuickActions.map((action) => (
            <Link
              key={action.id}
              to={action.link}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 p-4 transition-all hover:border-slate-300 hover:shadow-xs group"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${action.badgeBg}`}
              >
                {action.code}
              </div>
              <span className="mt-4 text-xs font-semibold text-slate-700 group-hover:text-[#008994] transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
