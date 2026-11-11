
import { useEffect, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  LogOut,
  Search,
  Menu,
  X
} from 'lucide-react';

import ProfileMenu from './ProfileMenu';
import NotifMenu from './NotifMenu';
import { getUser, logout } from '../services/auth';
import { todayMock } from '../mocks/todayMock';

// ==========================================
// NAVIGASI SISWA
// ==========================================

const nav = [
  {
    to: '/siswa/beranda',
    label: 'Beranda',
    icon: LayoutDashboard,
    soon: true
  },
  {
    to: '/siswa/presensi',
    label: 'Presensi',
    icon: CalendarDays
  },
  {
    to: '/siswa/pesan',
    label: 'Pesan',
    icon: MessageSquare,
    soon: true
  }
];

// ==========================================
// CSS SISWA LAYOUT
// Semua CSS di satu file JSX
// ==========================================

const css = `

/* ==========================================
   LAYOUT UTAMA
========================================== */

.sl-app {
  display: grid;
  grid-template-columns: 255px minmax(0, 1fr);
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #ffffff;
  color: #172b38;
  font-family: inherit;
}

.sl-app,
.sl-app * {
  box-sizing: border-box;
}

.sl-app button,
.sl-app input {
  font-family: inherit;
}

/* ==========================================
   SIDEBAR
========================================== */

.sl-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: #ffffff;
  border-right: 1px solid #c8e7ee;
  border-radius: 0 20px 20px 0;
  z-index: 110;
  overflow-y: auto;
}

.sl-sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 38px 26px 36px;
}

.sl-logo {
  display: block;
  width: 145px;
  max-width: 100%;
  height: auto;
}

.sl-sidebar-close {
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  background: transparent;
  color: #07576c;
  cursor: pointer;
}

/* ==========================================
   NAVIGASI SIDEBAR
========================================== */

.sl-nav {
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
  padding: 0 16px;
}

.sl-nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 48px;
  padding: 12px 15px;
  border-radius: 12px;
  color: #344b66;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background .2s, color .2s;
}

.sl-nav-link svg {
  flex-shrink: 0;
}

.sl-nav-link:hover {
  background: #f0f9fb;
  color: #008da8;
}

.sl-nav-link.active,
.sl-nav-link.active:hover {
  background: #e3f4f8;
  color: #008da8;
  font-weight: 700;
}

.sl-nav-link.disabled {
  cursor: default;
}

.sl-nav-link.disabled:hover {
  background: transparent;
  color: #344b66;
}

/* ==========================================
   LOGOUT
========================================== */

.sl-sidebar-bottom {
  margin-top: auto;
  padding: 15px 0 28px;
}

.sl-logout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 26px;
  border: none;
  background: #fff0f0;
  color: #e63939;
  font-size: 14px;
  cursor: pointer;
}

.sl-logout:hover {
  background: #ffe5e5;
}

/* ==========================================
   MAIN CONTENT
========================================== */

.sl-main {
  min-width: 0;
  width: 100%;
  background: #ffffff;
}

.sl-content {
  width: 100%;
  min-width: 0;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 34px 55px;
}

.sl-content > * {
  min-width: 0;
}

/* ==========================================
   TOPBAR DESKTOP
========================================== */

.sl-topbar {
  position: relative;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 26px;
  width: 100%;
  min-height: 120px;
  padding: 25px 34px;
  background: #ffffff;
}

.sl-mobile-head {
  display: none;
}

.sl-mobile-brand {
  color: #07576c;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.sl-menu-button {
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border: 1px solid #d4e9ee;
  border-radius: 11px;
  background: #ffffff;
  color: #008fa8;
  cursor: pointer;
}

/* ==========================================
   SEARCH
========================================== */

.sl-search {
  display: flex;
  align-items: center;
  gap: 13px;
  flex: 1;
  min-width: 0;
  height: 47px;
  padding: 0 18px;
  border: 1px solid #b7e5ee;
  border-radius: 30px;
  background: #ffffff;
  color: #0099b2;
}

.sl-search:focus-within {
  border-color: #0e9bb5;
  box-shadow: 0 0 0 3px rgba(14, 155, 181, .08);
}

.sl-search svg {
  flex-shrink: 0;
}

.sl-search input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #172b38;
}

.sl-search input::placeholder {
  color: #83929e;
}

/* ==========================================
   TOPBAR RIGHT
========================================== */

.sl-topbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 18px;
  min-width: 0;
}

.sl-notification {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sl-profile {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
}

/* Popup ProfileMenu dan NotifMenu
   tidak dipotong oleh layout */

.sl-topbar,
.sl-topbar-right,
.sl-notification,
.sl-profile {
  overflow: visible;
}

/* ==========================================
   RESPONSIVE CONTENT
========================================== */

.sl-content .tbl,
.sl-content .table-wrap,
.sl-content .table-container {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* ==========================================
   TABLET
========================================== */

@media (max-width: 960px) {

  .sl-app {
    display: block;
  }

  /* SIDEBAR MENJADI DRAWER */

  .sl-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(285px, 85vw);
    height: 100dvh;
    transform: translateX(-105%);
    transition: transform .25s ease;
    border-radius: 0 18px 18px 0;
    box-shadow: 4px 0 26px rgba(0, 40, 60, .09);
    z-index: 110;
  }

  .sl-sidebar.open {
    transform: translateX(0);
  }

  .sl-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: rgba(13, 32, 45, .35);
    cursor: pointer;
  }

  .sl-sidebar-close {
    display: flex;
  }

  .sl-menu-button {
    display: flex;
  }

  /* TOPBAR MENJADI DUA BARIS */

  .sl-topbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    column-gap: 12px;
    row-gap: 14px;
    align-items: center;
    min-height: auto;
    padding: 18px 22px;
    border-bottom: 1px solid #edf4f6;
  }

  /* BARIS PERTAMA KIRI */

  .sl-mobile-head {
    display: flex;
    align-items: center;
    gap: 10px;
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
  }

  /* BARIS PERTAMA KANAN */

  .sl-topbar-right {
    display: flex;
    align-items: center;
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    gap: 12px;
    width: auto;
    min-width: 0;
  }

  /* BARIS KEDUA SEARCH */

  .sl-search {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
  }

  .sl-content {
    padding: 24px 22px 45px;
  }

  /* TABEL */

  .sl-content .tbl .tr {
    min-width: 690px;
  }

  .sl-content .panel {
    min-width: 0;
  }

  .sl-content .subj-head {
    flex-wrap: wrap;
    gap: 12px;
  }

  .sl-content .semester {
    max-width: 100%;
  }
}

/* ==========================================
   MOBILE / HANDPHONE
========================================== */

@media (max-width: 640px) {

  /* TOPBAR TETAP 2 BARIS */

  .sl-topbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 13px;
    align-items: center;
    min-height: auto;
    padding: 14px 16px;
    border-bottom: 1px solid #edf4f6;
  }

  /* HEADER KIRI */

  .sl-mobile-head {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }

  .sl-menu-button {
    display: flex;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 11px;
  }

  .sl-mobile-brand {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #07576c;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* HEADER KANAN */

  .sl-topbar-right {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    justify-self: end;
    gap: 8px;
    width: auto;
    min-width: 0;
  }

  .sl-notification {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sl-profile {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 0;
    width: 44px;
  }

  /* PROFILE SISWA COMPACT
     Menyesuaikan trigger ProfileMenu pada HP.
     Dropdown tetap dapat terbuka. */

  .sl-profile > :first-child {
    max-width: 44px;
    min-width: 0;
  }

  .sl-profile > button:first-of-type,
  .sl-profile > :first-child > button:first-of-type {
    width: 44px !important;
    min-width: 44px !important;
    max-width: 44px !important;
    height: 44px;
    overflow: hidden;
    padding: 2px !important;
    gap: 0 !important;
    font-size: 0;
    justify-content: flex-start;
  }

  .sl-profile > button:first-of-type > :not(img):not([class*="avatar"]):not(:has(img)),
  .sl-profile > :first-child > button:first-of-type > :not(img):not([class*="avatar"]):not(:has(img)) {
    display: none;
  }

  /* Jika ProfileMenu menggunakan dropdown langsung
     di dalam root komponen */

  .sl-profile > [class*="dropdown"],
  .sl-profile > :first-child > [class*="dropdown"],
  .sl-profile > [class*="popover"],
  .sl-profile > :first-child > [class*="popover"] {
    position: fixed;
    top: 76px;
    right: 12px;
    left: auto;
    width: min(360px, calc(100vw - 24px));
    max-width: calc(100vw - 24px);
    max-height: calc(100dvh - 90px);
    overflow-y: auto;
    z-index: 160;
  }

  /* SEARCH BARIS KEDUA */

  .sl-search {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
    height: 44px;
    min-width: 0;
    padding: 0 14px;
  }

  .sl-search input {
    font-size: 14px;
  }

  /* CONTENT */

  .sl-content {
    padding: 20px 15px 38px;
  }

  .sl-content .title {
    font-size: clamp(22px, 6vw, 30px);
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .sl-content .subtitle {
    font-size: 14px;
    line-height: 1.6;
  }

  /* PANEL */

  .sl-content .panel {
    min-width: 0;
    padding: 16px;
  }

  /* STATISTIK */

  .sl-content .sum {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .sl-content .sum-card {
    min-width: 0;
    padding: 14px 12px;
  }

  .sl-content .sum-card .val {
    font-size: clamp(20px, 5vw, 30px);
  }

  /* KALENDER */

  .sl-content .cal-grid,
  .sl-content .cal-dow {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .sl-content .cal-cell {
    min-width: 0;
    padding: 5px 2px;
  }

  .sl-content .cal-cell .chip-st {
    max-width: 100%;
    font-size: 9px;
  }

  .sl-content .cal-leg {
    flex-wrap: wrap;
    gap: 8px;
  }

  /* TABEL PRESENSI PER MAPEL */

  .sl-content .tbl {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .sl-content .tbl .tr {
    min-width: 690px;
  }

  .sl-content .subj-head {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .sl-content .semester {
    max-width: 100%;
  }
}

/* ==========================================
   HP KECIL - IPHONE SE
========================================== */

@media (max-width: 420px) {

  .sl-topbar {
    padding: 12px;
    column-gap: 8px;
    row-gap: 12px;
  }

  .sl-mobile-head {
    gap: 7px;
  }

  .sl-mobile-brand {
    font-size: 12px;
  }

  .sl-topbar-right {
    gap: 7px;
  }

  .sl-content {
    padding: 20px 13px 35px;
  }

  .sl-profile {
    width: 42px;
  }

  .sl-profile > :first-child {
    max-width: 42px;
  }

  .sl-profile > button:first-of-type,
  .sl-profile > :first-child > button:first-of-type {
    width: 42px !important;
    min-width: 42px !important;
    max-width: 42px !important;
  }
}

/* ==========================================
   HP SANGAT KECIL
========================================== */

@media (max-width: 350px) {

  .sl-mobile-brand {
    display: none;
  }

  .sl-content {
    padding: 16px 12px 30px;
  }

  .sl-content .sum-card {
    padding: 12px 9px;
  }

  .sl-content .sum-card .val {
    font-size: 20px;
  }
}

/* ==========================================
   REDUCED MOTION
========================================== */

@media (prefers-reduced-motion: reduce) {
  .sl-sidebar,
  .sl-nav-link {
    transition: none;
  }
}
`;

// ==========================================
// KOMPONEN LAYOUT SISWA
// ==========================================

export default function SiswaLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // Identitas siswa dari akun login.
  // Mode mock lama tetap didukung.
  const user = getUser();

  const student = user
    ? {
        name: user.name ?? user.email,
        class_name: user.class_name,
        nis: user.nis
      }
    : todayMock.student;

  // Tutup sidebar ketika berpindah halaman.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Tutup sidebar menggunakan tombol Escape.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="sl-app">

      {/* CSS LANGSUNG DI JSX */}
      <style>{css}</style>

      {/* OVERLAY MOBILE */}
      {menuOpen && (
        <button
          type="button"
          className="sl-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ======================================
          SIDEBAR SISWA
      ====================================== */}

      <aside
        className={`sl-sidebar ${menuOpen ? 'open' : ''}`}
        aria-label="Navigasi Siswa"
      >
        {/* LOGO */}
        <div className="sl-sidebar-head">
          <img
            className="sl-logo"
            src="/logo.svg"
            alt="SMANTI Connect"
          />

          <button
            type="button"
            className="sl-sidebar-close"
            aria-label="Tutup sidebar"
            onClick={() => setMenuOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="sl-nav">
          {nav.map((item) => {
            const Icon = item.icon;

            if (item.soon) {
              return (
                <span
                  key={item.to}
                  className="sl-nav-link disabled"
                  title="Fitur belum tersedia"
                  aria-disabled="true"
                >
                  <Icon size={20} />
                  {item.label}
                </span>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `sl-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="sl-sidebar-bottom">
          <button
            type="button"
            className="sl-logout"
            onClick={handleLogout}
          >
            <span>Keluar</span>
            <LogOut size={19} />
          </button>
        </div>
      </aside>

      {/* ======================================
          MAIN
      ====================================== */}

      <div className="sl-main">

        {/* TOPBAR */}
        <header className="sl-topbar">

          {/* HEADER MOBILE */}
          <div className="sl-mobile-head">
            <button
              type="button"
              className="sl-menu-button"
              aria-label="Buka menu navigasi"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <span className="sl-mobile-brand">
              SMANTI Connect
            </span>
          </div>

          {/* SEARCH */}
          <label className="sl-search">
            <Search size={20} />

            <input
              type="search"
              placeholder="Cari informasi"
              aria-label="Cari informasi"
            />
          </label>

          {/* TOPBAR KANAN */}
          <div className="sl-topbar-right">

            {/* NOTIFIKASI ASLI */}
            <div className="sl-notification">
              <NotifMenu />
            </div>

            {/* PROFILE MENU ASLI SISWA */}
            <div className="sl-profile">
              <ProfileMenu student={student} />
            </div>
          </div>
        </header>

        {/* ======================================
            HALAMAN SISWA
        ====================================== */}

        <main className="sl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
