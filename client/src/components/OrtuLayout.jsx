import ProfileMenu from './ProfileMenu';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { todayMock } from '../mocks/todayMock';
import NotifMenu from './NotifMenu';
import { getUser, logout } from '../services/auth';
import { getChildId } from '../pages/ortu/PilihAnak';
import { LayoutDashboard, CalendarDays, MessageSquare, FileText, LogOut, Search } from 'lucide-react';

const nav = [
  { to: '/ortu', label: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/ortu/nilai', label: 'Rekap Nilai', icon: FileText, soon: true },
  { to: '/ortu/presensi', label: 'Presensi Anak', icon: CalendarDays },
  { to: '/ortu/pesan', label: 'Pesan dengan Guru', icon: MessageSquare, soon: true },
];

export default function OrtuLayout() {
  const navigate = useNavigate();
  const user = getUser();
  // Data dari akun yang login; kalau mode mock (tanpa login), pakai data tampilan.
  const student = user
    ? { name: user.name ?? user.email, class_name: user.class_name, nis: user.nis }
    : todayMock.student;
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="logo"><img src="/logo.svg" alt="SMANTI Connect" /></div>
          <nav className="nav">
            {nav.map(({ to, label, icon: Icon, soon, end }) =>
              soon ? (
                <a key={to} href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                  <Icon size={20} /> {label}
                </a>
              ) : (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={20} /> {label}
                </NavLink>
              )
            )}
          </nav>
        </div>
        <button className="logout" onClick={handleLogout}>Keluar <LogOut size={18} /></button>
      </aside>

      <div className="main">
        <header className="topbar">
          <label className="search">
            <Search size={20} />
            <input placeholder="Cari informasi" />
          </label>

          <div className="topbar-right">
            <NotifMenu />
            <ProfileMenu student={student} />
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}