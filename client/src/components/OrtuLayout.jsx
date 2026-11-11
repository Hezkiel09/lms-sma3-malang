
import { useEffect, useRef, useState } from 'react';
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
  FileText,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  UserRound,
  LockKeyhole,
  Bell,
  CircleHelp,
  ChevronLeft
} from 'lucide-react';

import NotifMenu from './NotifMenu';
import { getUser, logout } from '../services/auth';

// ==========================================
// NAVIGASI ORANG TUA
// ==========================================

const nav = [
  {
    to: '/ortu',
    label: 'Beranda',
    icon: LayoutDashboard,
    end: true
  },
  {
    to: '/ortu/nilai',
    label: 'Rekap Nilai',
    icon: FileText,
    soon: true
  },
  {
    to: '/ortu/presensi',
    label: 'Presensi Anak',
    icon: CalendarDays
  },
  {
    to: '/ortu/pesan',
    label: 'Pesan dengan Guru',
    icon: MessageSquare
  }
];

// ==========================================
// CSS LAYOUT ORANG TUA
// ==========================================

const css = `
/* LAYOUT UTAMA */

.orl {
  display: grid;
  grid-template-columns: 255px minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
  background: #fff;
  color: #192b39;
}

.orl,
.orl * {
  box-sizing: border-box;
}

.orl button,
.orl input {
  font-family: inherit;
}

/* ==========================================
   SIDEBAR
========================================== */

.orl-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #c8e7ee;
  border-radius: 0 20px 20px 0;
  z-index: 100;
  overflow-y: auto;
}

.orl-sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 38px 26px 36px;
}

.orl-logo {
  display: block;
  width: 144px;
  max-width: 100%;
  height: auto;
}

/* NAVIGASI */

.orl-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  padding: 0 16px;
}

.orl-link {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 15px;
  min-height: 48px;
  border-radius: 12px;
  color: #344b66;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background .2s, color .2s;
}

.orl-link svg {
  flex-shrink: 0;
}

.orl-link:hover {
  background: #f0f9fb;
  color: #008da6;
}

.orl-link.active {
  background: #e3f4f8;
  color: #008da6;
  font-weight: 700;
}

.orl-link.soon {
  cursor: default;
}

.orl-link.soon:hover {
  background: transparent;
  color: #344b66;
}

/* LOGOUT SIDEBAR */

.orl-logout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 26px;
  margin-top: auto;
  margin-bottom: 28px;
  border: 0;
  background: #fff0f0;
  color: #e53e3e;
  cursor: pointer;
  font-size: 14px;
}

.orl-logout:hover {
  background: #ffe6e6;
}

.orl-close,
.orl-menu-btn {
  display: none;
}

/* ==========================================
   MAIN
========================================== */

.orl-main {
  min-width: 0;
  width: 100%;
}

.orl-topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 25px 34px;
  min-height: 120px;
  position: relative;
  z-index: 30;
  background: #fff;
}

.orl-mobile-head {
  display: none;
}

/* ==========================================
   SEARCH
========================================== */

.orl-search {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 12px;
  height: 46px;
  padding: 0 17px;
  border: 1px solid #b9e6ef;
  border-radius: 30px;
  color: #0099b2;
}

.orl-search svg {
  flex-shrink: 0;
}

.orl-search input {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #192b39;
  font-size: 14px;
}

.orl-search input::placeholder {
  color: #83929e;
}

.orl-search:focus-within {
  border-color: #0e9bb5;
}

/* ==========================================
   TOPBAR RIGHT
========================================== */

.orl-top-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 18px;
}

.orl-notif {
  display: flex;
  align-items: center;
}

/* ==========================================
   PROFILE TRIGGER
========================================== */

.orl-profile {
  position: relative;
}

.orl-profile-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  padding: 5px 7px;
  text-align: left;
}

.orl-profile-btn:hover,
.orl-profile-btn[aria-expanded="true"] {
  background: #e9f8fb;
}

/* AVATAR */

.orl-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 49px;
  height: 49px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: #e3f4f8;
  color: #008da6;
  font-weight: 700;
  font-size: 20px;
}

.orl-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* IDENTITAS PROFIL */

.orl-profile-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 170px;
}

.orl-profile-text b {
  font-size: 14px;
  color: #172b38;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.orl-profile-text small {
  font-size: 12px;
  color: #7b8c9c;
  white-space: nowrap;
}

.orl-chevron {
  color: #007f9a;
  flex-shrink: 0;
}

/* ==========================================
   DROPDOWN PROFIL ORANG TUA
========================================== */

.orl-pop {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 360px;
  max-width: calc(100vw - 24px);
  max-height: calc(100dvh - 110px);
  overflow-y: auto;
  background: white;
  border: 1px solid #bee5ed;
  border-radius: 22px;
  box-shadow: 0 16px 45px rgba(0, 65, 85, .14);
  z-index: 160;
}

/* HEADER DROPDOWN */

.orl-pop-head {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 22px;
  background: #e6f7fa;
  border-bottom: 1px solid #b9e6ef;
}

.orl-pop-head .orl-avatar {
  width: 58px;
  height: 58px;
}

.orl-pop-identity {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.orl-pop-identity b {
  font-size: 17px;
  overflow-wrap: anywhere;
}

.orl-pop-identity small {
  color: #677e90;
  font-size: 13px;
}

/* MENU DROPDOWN */

.orl-pop-list {
  padding: 13px;
}

.orl-pop-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 10px;
  min-height: 60px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  color: #172b38;
  font-size: 14px;
  cursor: pointer;
}

.orl-pop-item:hover {
  background: #e9f7fa;
}

.orl-pop-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: #e5f5f8;
  color: #0095b0;
}

.orl-pop-divider {
  height: 1px;
  margin: 12px 8px;
  background: #cceaf0;
}

/* TOMBOL KELUAR */

.orl-pop-item.danger {
  color: #d72828;
}

.orl-pop-item.danger .orl-pop-icon {
  color: #d72828;
  background: #ffe9e9;
}

.orl-pop-item.danger:hover {
  background: #fff0f0;
}

/* SUBMENU */

.orl-pop-back {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 18px 20px 8px;
  border: 0;
  background: transparent;
  color: #008fa8;
  cursor: pointer;
}

.orl-pop-detail {
  padding: 15px 22px 25px;
}

.orl-pop-detail h3 {
  margin: 0 0 12px;
  font-size: 17px;
}

.orl-pop-detail p {
  margin: 8px 0;
  color: #64788a;
  font-size: 13px;
  overflow-wrap: anywhere;
  line-height: 1.6;
}

/* ==========================================
   PAGE CONTENT
========================================== */

.orl-content {
  min-width: 0;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 34px 55px;
}

.orl-content > * {
  min-width: 0;
}

/* TABEL RESPONSIF */

.orl-content .tbl,
.orl-content .detail-table-wrap {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* ==========================================
   RESPONSIVE TABLET
========================================== */

@media (max-width: 900px) {

  .orl {
    display: block;
  }

  /* SIDEBAR DRAWER */

  .orl-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: min(285px, 85vw);
    transform: translateX(-105%);
    transition: transform .25s ease;
    border-radius: 0 18px 18px 0;
    box-shadow: 4px 0 28px rgba(0, 40, 60, .1);
  }

  .orl-sidebar.open {
    transform: translateX(0);
  }

  .orl-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(13, 32, 45, .35);
    cursor: pointer;
  }

  .orl-close,
  .orl-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border: 1px solid #d6e9ee;
    border-radius: 10px;
    background: white;
    color: #008fa8;
    cursor: pointer;
  }

  .orl-close {
    border: none;
  }

  /* TOPBAR DUA BARIS */

  .orl-topbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 12px;
    row-gap: 14px;
    padding: 18px 22px;
    min-height: unset;
    border-bottom: 1px solid #eaf3f5;
  }

  .orl-mobile-head {
    display: flex;
    align-items: center;
    gap: 10px;
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
    color: #07576c;
    font-size: 15px;
    font-weight: 700;
  }

  .orl-top-right {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    gap: 10px;
  }

  .orl-search {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
  }

  /* CONTENT */

  .orl-content {
    padding: 24px 22px 45px;
  }

  .orl-content .ortu-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .orl-content .ortu-card-head,
  .orl-content .subj-head {
    flex-wrap: wrap;
    gap: 12px;
  }

  .orl-content .tbl,
  .orl-content .detail-table-wrap {
    overflow-x: auto;
    max-width: 100%;
  }

  .orl-content .tbl .tr {
    min-width: 690px;
  }
}

/* ==========================================
   RESPONSIVE HANDPHONE
========================================== */

@media (max-width: 560px) {

  .orl-topbar {
    padding: 13px 15px;
    column-gap: 8px;
    row-gap: 12px;
  }

  .orl-top-right {
    gap: 8px;
  }

  .orl-mobile-head {
    font-size: 13px;
    gap: 7px;
  }

  .orl-menu-btn {
    width: 39px;
    height: 39px;
  }

  /* PROFIL COMPACT */

  .orl-avatar {
    width: 42px;
    height: 42px;
  }

  .orl-profile-text,
  .orl-chevron {
    display: none;
  }

  .orl-profile-btn {
    padding: 2px;
  }

  /* DROPDOWN MOBILE */

  .orl-pop {
    position: fixed;
    top: 75px;
    right: 12px;
    width: min(360px, calc(100vw - 24px));
    max-height: calc(100dvh - 90px);
  }

  /* SEARCH */

  .orl-search {
    height: 43px;
  }

  /* CONTENT */

  .orl-content {
    padding: 20px 15px 40px;
  }

  .orl-content .ortu-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .orl-content .ortu-hero h1 {
    font-size: clamp(24px, 7vw, 34px);
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .orl-content .ortu-hero-img {
    display: none;
  }

  .orl-content .ortu-card {
    padding: 16px;
  }

  /* STATISTIK PRESENSI */

  .orl-content .sum {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .orl-content .sum-card {
    min-width: 0;
    padding: 13px;
  }

  /* PANEL */

  .orl-content .panel {
    min-width: 0;
    padding: 15px;
  }

  /* KALENDER */

  .orl-content .cal-grid,
  .orl-content .cal-dow {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .orl-content .cal-cell {
    min-width: 0;
    padding: 5px 2px;
  }

  .orl-content .cal-cell .chip-st {
    font-size: 9px;
  }

  .orl-content .cal-leg {
    flex-wrap: wrap;
    gap: 8px;
  }

  .orl-content .ortu-week {
    overflow-x: auto;
  }

  /* DETAIL PRESENSI */

  .orl-content .detail-hero {
    flex-direction: column;
    align-items: stretch;
  }
}

/* ==========================================
   IPHONE SE / HP KECIL
========================================== */

@media (max-width: 380px) {

  .orl-topbar {
    padding: 12px;
  }

  .orl-mobile-head {
    font-size: 12px;
  }

  .orl-top-right {
    gap: 6px;
  }

  .orl-content {
    padding: 18px 12px 35px;
  }
}

/* REDUCED MOTION */

@media (prefers-reduced-motion: reduce) {
  .orl-sidebar,
  .orl-link {
    transition: none;
  }
}
`;

// ==========================================
// KOMPONEN ORANG TUA LAYOUT
// ==========================================

export default function OrtuLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState('');

  // ========================================
  // DATA AKUN ORANG TUA
  // ========================================

  const user = getUser();

  const parentName =
    user?.name || user?.email || 'Orang Tua';

  const parentEmail =
    user?.email || '-';

  const initial =
    parentName.trim().charAt(0).toUpperCase() || 'O';

  // ========================================
  // TUTUP MENU KETIKA PINDAH HALAMAN
  // ========================================

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setProfilePanel('');
  }, [location.pathname]);

  // ========================================
  // KLIK DI LUAR DROPDOWN / ESCAPE
  // ========================================

  useEffect(() => {
    function handleOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
        setProfilePanel('');
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setSidebarOpen(false);
        setProfilePanel('');
      }
    }

    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // ========================================
  // AVATAR ORANG TUA
  // ========================================

  const avatar = (
    <span className="orl-avatar">
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt="Foto orang tua"
        />
      ) : (
        initial
      )}
    </span>
  );

  // ========================================
  // MENU DROPDOWN PROFIL
  // ========================================

  const menuItems = [
    {
      id: 'profil',
      label: 'Profil saya',
      icon: UserRound
    },
    {
      id: 'password',
      label: 'Ubah kata sandi',
      icon: LockKeyhole
    },
    {
      id: 'notifikasi',
      label: 'Notifikasi',
      icon: Bell
    },
    {
      id: 'bantuan',
      label: 'Bantuan',
      icon: CircleHelp
    }
  ];

  return (
    <div className="orl">

      {/* CSS LANGSUNG DI JSX */}
      <style>{css}</style>

      {/* ======================================
          OVERLAY SIDEBAR MOBILE
      ====================================== */}

      {sidebarOpen && (
        <button
          type="button"
          className="orl-overlay"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ======================================
          SIDEBAR ORANG TUA
      ====================================== */}

      <aside
        className={`orl-sidebar ${
          sidebarOpen ? 'open' : ''
        }`}
      >

        {/* LOGO */}
        <div className="orl-sidebar-head">
          <img
            className="orl-logo"
            src="/logo.svg"
            alt="SMANTI Connect"
          />

          <button
            type="button"
            className="orl-close"
            aria-label="Tutup menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="orl-nav">
          {nav.map(({
            to,
            label,
            icon: Icon,
            soon,
            end
          }) =>
            soon ? (
              <span
                key={to}
                className="orl-link soon"
                title="Fitur belum tersedia"
                aria-disabled="true"
              >
                <Icon size={20} />
                {label}
              </span>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `orl-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            )
          )}
        </nav>

        {/* LOGOUT SIDEBAR */}
        <button
          type="button"
          className="orl-logout"
          onClick={handleLogout}
        >
          Keluar
          <LogOut size={19} />
        </button>
      </aside>

      {/* ======================================
          MAIN
      ====================================== */}

      <div className="orl-main">

        {/* TOPBAR */}
        <header className="orl-topbar">

          {/* HEADER MOBILE */}
          <div className="orl-mobile-head">
            <button
              type="button"
              className="orl-menu-btn"
              aria-label="Buka navigasi"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>

            SMANTI Connect
          </div>

          {/* SEARCH */}
          <label className="orl-search">
            <Search size={20} />

            <input
              type="search"
              placeholder="Cari informasi"
              aria-label="Cari informasi"
            />
          </label>

          {/* ==================================
              TOPBAR RIGHT
          ================================== */}

          <div className="orl-top-right">

            {/* NOTIFIKASI */}
            <div className="orl-notif">
              <NotifMenu />
            </div>

            {/* ==================================
                PROFIL ORANG TUA
            ================================== */}

            <div
              className="orl-profile"
              ref={profileRef}
            >

              {/* TOMBOL PROFIL */}
              <button
                type="button"
                className="orl-profile-btn"
                aria-expanded={profileOpen}
                aria-label={`Profil ${parentName}`}
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setProfilePanel('');
                }}
              >
                {avatar}

                <span className="orl-profile-text">
                  <b>{parentName}</b>
                  <small>Orang Tua/Wali</small>
                </span>

                <ChevronDown
                  className="orl-chevron"
                  size={17}
                  style={{
                    transform: profileOpen
                      ? 'rotate(180deg)'
                      : 'none'
                  }}
                />
              </button>

              {/* ==================================
                  DROPDOWN PROFIL
              ================================== */}

              {profileOpen && (
                <div className="orl-pop">
                  {!profilePanel ? (
                    <>
                      {/* HEADER DROPDOWN */}
                      <div className="orl-pop-head">
                        {avatar}

                        <div className="orl-pop-identity">
                          <b>{parentName}</b>
                          <small>Orang Tua/Wali</small>
                        </div>
                      </div>

                      {/* MENU DROPDOWN */}
                      <div className="orl-pop-list">
                        {menuItems.map(({
                          id,
                          label,
                          icon: Icon
                        }) => (
                          <button
                            key={id}
                            type="button"
                            className="orl-pop-item"
                            onClick={() => setProfilePanel(id)}
                          >
                            <span className="orl-pop-icon">
                              <Icon size={20} />
                            </span>

                            {label}
                          </button>
                        ))}

                        <div className="orl-pop-divider" />

                        {/* LOGOUT */}
                        <button
                          type="button"
                          className="orl-pop-item danger"
                          onClick={handleLogout}
                        >
                          <span className="orl-pop-icon">
                            <LogOut size={20} />
                          </span>

                          Keluar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* TOMBOL KEMBALI */}
                      <button
                        type="button"
                        className="orl-pop-back"
                        onClick={() => setProfilePanel('')}
                      >
                        <ChevronLeft size={18} />
                        Kembali
                      </button>

                      {/* DETAIL MENU */}
                      <div className="orl-pop-detail">

                        {/* PROFIL SAYA */}
                        {profilePanel === 'profil' && (
                          <>
                            <h3>Profil Saya</h3>

                            <p>
                              <b>Nama:</b> {parentName}
                            </p>

                            <p>
                              <b>Email:</b> {parentEmail}
                            </p>

                            <p>
                              <b>Role:</b> Orang Tua/Wali
                            </p>
                          </>
                        )}

                        {/* UBAH KATA SANDI */}
                        {profilePanel === 'password' && (
                          <>
                            <h3>Ubah Kata Sandi</h3>

                            <p>
                              Penggantian kata sandi belum
                              terhubung di halaman ini.
                              Gunakan layanan pengelolaan akun
                              sekolah yang tersedia.
                            </p>
                          </>
                        )}

                        {/* NOTIFIKASI */}
                        {profilePanel === 'notifikasi' && (
                          <>
                            <h3>Notifikasi</h3>

                            <p>
                              Klik ikon lonceng di bagian atas
                              untuk melihat notifikasi terbaru.
                            </p>
                          </>
                        )}

                        {/* BANTUAN */}
                        {profilePanel === 'bantuan' && (
                          <>
                            <h3>Bantuan</h3>

                            <p>
                              Jika mengalami kendala akun atau
                              presensi, hubungi admin sekolah.
                            </p>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ======================================
            HALAMAN ORANG TUA
        ====================================== */}

        <main className="orl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
