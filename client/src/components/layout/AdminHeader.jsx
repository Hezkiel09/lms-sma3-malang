import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ onToggleSidebar }) {
  const { user } = useAuth();
  const displayName = user?.name || 'Administrator';
  const displayRole = user?.role === 'admin' ? 'Administrator' : user?.role || 'Admin';

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-sm sm:px-8">
      {/* Left: Mobile hamburger & Wide Pill Search Bar */}
      <div className="flex flex-1 items-center gap-4 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Pill Search Input matching Figma */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600" />
          <input
            type="text"
            placeholder="Cari informasi"
            className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Right: Notification & Profile */}
      <div className="flex items-center gap-5 ml-4">
        {/* Bell Icon with Cyan Circular Background */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100/70 text-cyan-700 hover:bg-cyan-200/70 transition-colors">
          <Bell className="h-5 w-5 fill-cyan-700/20" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008994] text-white font-bold text-sm shadow-xs ring-2 ring-slate-100">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-slate-800 leading-tight">{displayName}</p>
            <p className="text-xs text-slate-400">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
