
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  LogOut,
  Search,
  Bell
} from 'lucide-react';

const nav = [
  { to: '/guru/beranda', label: 'Beranda', icon: LayoutDashboard, soon: true },
  { to: '/guru/bank-soal', label: 'Bank Soal', icon: BookOpen, soon: true },
  { to: '/guru/rekap-nilai', label: 'Rekap Nilai', icon: ClipboardList, soon: true },
  { to: '/guru/presensi', label: 'Presensi Siswa', icon: CalendarDays },
  { to: '/guru/pesan', label: 'Pesan', icon: MessageSquare, soon: true },
];

export default function GuruLayout() {
  // Sementara gunakan data tampilan.
  // Nantinya ganti dengan data guru dari sistem login.
  const teacher = {
    name: 'Budi Santoso, S.Pd.',
    subject: 'Guru Matematika'
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="logo">
            <img src="/logo.svg" alt="SMANTI Connect" />
          </div>

          <nav className="nav">
            {nav.map(({ to, label, icon: Icon, soon }) =>
              soon ? (
                <a
                  key={to}
                  href="#"
                  className="nav-item"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon size={20} />
                  {label}
                </a>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              )
            )}
          </nav>
        </div>

        <button className="logout">
          Keluar <LogOut size={18} />
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <label className="search">
            <Search size={20} />
            <input placeholder="Cari siswa" />
          </label>

          <div className="topbar-right">
            <div className="bell">
              <Bell size={22} />
              <i />
            </div>

            <div className="profile">
              <img src="/avatar.png" alt="" />
              <div>
                <b>{teacher.name}</b>
                <small>{teacher.subject}</small>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
