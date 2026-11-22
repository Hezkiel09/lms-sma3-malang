import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Calendar,
  MessageSquare,
  LogOut,
  X,
} from 'lucide-react';
import logosmanti from '../../assets/logo smanti.png';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { name: 'Beranda', path: '/siswa/beranda', icon: Home },
  { name: 'Kuis & Asesmen', path: '/siswa/kuis', icon: ClipboardList },
  { name: 'Presensi', path: '/siswa/presensi', icon: Calendar },
  { name: 'Pesan', path: '/siswa/pesan', icon: MessageSquare },
];

export default function SiswaSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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

        {/* Bottom Keluar Button */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between rounded-xl bg-[#fee2e2]/50 px-4 py-2.5 text-sm font-semibold text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
          >
            <span>Keluar</span>
            <LogOut className="h-4 w-4 text-[#ef4444]" />
          </button>
        </div>
      </aside>
    </>
  );
}
