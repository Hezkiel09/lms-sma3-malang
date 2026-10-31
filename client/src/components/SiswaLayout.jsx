import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, MessageSquare, LogOut, Search, Bell } from 'lucide-react';
import { todayMock } from '../mocks/todayMock';

const nav = [
  { to: '/siswa/beranda', label: 'Beranda', icon: LayoutDashboard, soon: true },
  { to: '/siswa/presensi', label: 'Presensi', icon: CalendarDays },
  { to: '/siswa/pesan', label: 'Pesan', icon: MessageSquare, soon: true },
];

export default function SiswaLayout() {
  const student = todayMock.student; // nanti diganti dari data login

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="logo"><img src="/logo.svg" alt="SMANTI Connect" /></div>
          <nav className="nav">
            {nav.map(({ to, label, icon: Icon, soon }) =>
            soon ? (
            <a key={to} href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                <Icon size={20} /> {label}
                </a>
                ) : (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={20} /> {label}
                </NavLink>
              )
            )}
          </nav>
        </div>
        <button className="logout">Keluar <LogOut size={18} /></button>
      </aside>

      <div className="main">
        <header className="topbar">
          <label className="search">
            <Search size={20} />
            <input placeholder="Cari informasi" />
          </label>
          <div className="topbar-right">
            <div className="bell"><Bell size={22} /><i /></div>
            <div className="profile">
              <img src="/avatar.png" alt="" />
              <div><b>{student.name}</b><small>{student.class_label}</small></div>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}