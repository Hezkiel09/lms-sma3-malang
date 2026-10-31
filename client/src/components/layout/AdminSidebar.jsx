import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Activity,
  Megaphone,
  FileText,
  User,
  LogOut,
  X,
} from 'lucide-react';
import logosmanti from '../../assets/logo smanti.png';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Data Pengguna', path: '/admin/pengguna', icon: Users },
  { name: 'Akademik', path: '/admin/akademik', icon: GraduationCap },
  { name: 'Monitoring', path: '/admin/monitoring', icon: Activity, badge: '4' },
  { name: 'Pengumuman', path: '/admin/pengumuman', icon: Megaphone },
  { name: 'Laporan', path: '/admin/laporan', icon: FileText },
  { name: 'Profil', path: '/admin/profil', icon: User },
];

export default function AdminSidebar({ isOpen, onClose }) {
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
          <div className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Admin
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#008994] text-white shadow-sm shadow-[#008994]/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={`h-5 w-5 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Keluar Button */}
        <div className="p-4 border-t border-slate-100">
          <NavLink
            to="/login"
            className="flex items-center justify-between rounded-xl bg-red-50/80 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-100/80 transition-colors"
          >
            <span>Keluar</span>
            <LogOut className="h-4 w-4" />
          </NavLink>
        </div>
      </aside>
    </>
  );
}
