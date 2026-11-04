import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  FileText,
  Calendar,
  MessageSquare,
  LogOut,
  X,
} from 'lucide-react';
import logosmanti from '../../assets/logo smanti.png';

const menuItems = [
  { name: 'Beranda', path: '/b6/beranda', icon: Home },
  {
    name: 'Bank Soal',
    path: '/b6/bank-soal',
    icon: BookOpen,
    relatedPaths: ['/b6/bank-soal', '/b6/buat-kuis'],
  },
  {
    name: 'Rekap Nilai',
    path: '/b6/rekap-nilai',
    icon: FileText,
    relatedPaths: ['/b6/rekap-nilai', '/b6/asesmen/rekap-hasil'],
  },
  { name: 'Presensi', path: '/b6/presensi', icon: Calendar },
  { name: 'Pesan', path: '/b6/pesan', icon: MessageSquare },
];

export default function GuruSidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand SMANTI Connect */}
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center">
            <img
              src={logosmanti}
              alt="SMANTI Connect"
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // Check active status
              const isItemActive = item.relatedPaths
                ? item.relatedPaths.some((p) => location.pathname.startsWith(p))
                : location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isItemActive
                      ? 'bg-[#e6f4f5] text-[#005b64]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isItemActive ? 'text-[#005b64]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switch to Admin & Keluar Button */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <NavLink
            to="/admin/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <span>Beralih ke Portal Admin</span>
          </NavLink>

          <NavLink
            to="/login"
            className="flex items-center justify-between rounded-xl bg-[#fee2e2]/50 px-4 py-2.5 text-sm font-semibold text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
          >
            <span>Keluar</span>
            <LogOut className="h-4 w-4 text-[#ef4444]" />
          </NavLink>
        </div>
      </aside>
    </>
  );
}
