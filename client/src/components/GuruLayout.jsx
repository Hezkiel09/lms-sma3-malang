
import { useEffect, useRef, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';

import { getUser, logout } from '../services/auth';

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  UserRound,
  LockKeyhole,
  CircleHelp
} from 'lucide-react';

// ==========================================
// NAVIGASI GURU
// ==========================================

const nav = [
  { to: '/guru/beranda', label: 'Beranda', icon: LayoutDashboard, soon: true },
  { to: '/guru/bank-soal', label: 'Bank Soal', icon: BookOpen, soon: true },
  { to: '/guru/rekap-nilai', label: 'Rekap Nilai', icon: ClipboardList, soon: true },
  { to: '/guru/presensi', label: 'Presensi Siswa', icon: CalendarDays },
  { to: '/guru/pesan', label: 'Pesan', icon: MessageSquare, soon: true }
];

const profileMenus = [
  { id: 'profil', label: 'Profil saya', icon: UserRound },
  { id: 'password', label: 'Ubah kata sandi', icon: LockKeyhole },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'bantuan', label: 'Bantuan', icon: CircleHelp }
];

// ==========================================
// CSS GURU LAYOUT
// ==========================================

const css = `
/* LAYOUT UTAMA */

.gl-app {
  display: grid;
  grid-template-columns: 255px minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: #ffffff;
  color: #192b39;
  font-family: inherit;
}

.gl-app,
.gl-app * {
  box-sizing: border-box;
}

.gl-app button,
.gl-app input {
  font-family: inherit;
}

/* ==========================================
   SIDEBAR
========================================== */

.gl-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #c8e7ee;
  border-radius: 0 20px 20px 0;
  z-index: 110;
  overflow-y: auto;
}

.gl-sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 38px 26px 36px;
}

.gl-logo {
  display: block;
  width: 145px;
  max-width: 100%;
  height: auto;
}

.gl-sidebar-close {
  display: none;
  border: 0;
  background: transparent;
  color: #07576c;
  cursor: pointer;
}

/* NAVIGASI SIDEBAR */

.gl-nav {
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
  padding: 0 16px;
}

.gl-nav-link {
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

.gl-nav-link svg {
  flex-shrink: 0;
}

.gl-nav-link:hover {
  background: #f0f9fb;
  color: #008da8;
}

.gl-nav-link.active,
.gl-nav-link.active:hover {
  background: #e3f4f8;
  color: #008da8;
  font-weight: 700;
}

.gl-nav-link.disabled {
  cursor: default;
}

.gl-nav-link.disabled:hover {
  background: transparent;
  color: #344b66;
}

/* LOGOUT SIDEBAR */

.gl-sidebar-bottom {
  padding: 15px 0 28px;
  margin-top: auto;
}

.gl-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 26px;
  border: none;
  background: #fff0f0;
  color: #e63939;
  font-size: 14px;
  cursor: pointer;
}

.gl-logout:hover {
  background: #ffe5e5;
}

/* ==========================================
   MAIN
========================================== */

.gl-main {
  width: 100%;
  min-width: 0;
  background: #ffffff;
}

.gl-content {
  width: 100%;
  min-width: 0;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 34px 55px;
}

.gl-content > * {
  min-width: 0;
}

/* ==========================================
   TOPBAR
========================================== */

.gl-topbar {
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

.gl-mobile-head {
  display: none;
}

/* SEARCH */

.gl-search {
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

.gl-search:focus-within {
  border-color: #0e9bb5;
  box-shadow: 0 0 0 3px rgba(14, 155, 181, .08);
}

.gl-search svg {
  flex-shrink: 0;
}

.gl-search input {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #172b38;
}

.gl-search input::placeholder {
  color: #83929e;
}

/* BAGIAN KANAN TOPBAR */

.gl-topbar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 18px;
}

/* NOTIFIKASI */

.gl-bell {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border: 1px solid #b7e5ee;
  border-radius: 50%;
  background: #e7f6fa;
  color: #07576c;
}

/* ==========================================
   PROFIL GURU
========================================== */

.gl-profile {
  position: relative;
  min-width: 0;
}

.gl-profile-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 7px;
  border: none;
  border-radius: 14px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background .2s;
}

.gl-profile-trigger:hover,
.gl-profile-trigger[aria-expanded="true"] {
  background: #e9f8fb;
}

/* AVATAR INISIAL */

.gl-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 49px;
  height: 49px;
  border-radius: 50%;
  background: #e3f4f8;
  color: #008da6;
  font-size: 20px;
  font-weight: 700;
}

/* INFORMASI PROFIL */

.gl-profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 180px;
}

.gl-profile-info b {
  color: #172b38;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gl-profile-info small {
  color: #7b8c9c;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gl-profile-chevron {
  flex-shrink: 0;
  color: #008da6;
  transition: transform .2s;
}

.gl-profile-chevron.open {
  transform: rotate(180deg);
}

/* ==========================================
   DROPDOWN PROFIL
   SAMA SEPERTI LAYOUT ORANG TUA
========================================== */

.gl-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 160;
  width: 360px;
  max-width: calc(100vw - 24px);
  max-height: calc(100dvh - 110px);
  overflow-y: auto;
  border: 1px solid #bce4ed;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 16px 45px rgba(0, 65, 85, .14);
}

/* HEADER DROPDOWN */

.gl-dropdown-head {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 22px;
  background: #e6f7fa;
  border-bottom: 1px solid #b9e6ef;
}

.gl-dropdown-head .gl-avatar {
  width: 58px;
  height: 58px;
  font-size: 24px;
  background: #d7f0f5;
  color: #008ca5;
}

.gl-dropdown-identity {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.gl-dropdown-identity b {
  color: #172b38;
  font-size: 17px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.gl-dropdown-identity small {
  color: #718595;
  font-size: 13px;
}

/* MENU DROPDOWN */

.gl-dropdown-menu {
  padding: 13px;
}

.gl-dropdown-item {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  min-height: 60px;
  padding: 8px 10px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #172b38;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background .2s;
}

.gl-dropdown-item:hover {
  background: #e9f7fa;
}

.gl-dropdown-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #e5f5f8;
  color: #0095b0;
}

.gl-dropdown-divider {
  height: 1px;
  margin: 12px 8px;
  background: #cceaf0;
}

/* TOMBOL KELUAR */

.gl-dropdown-item.danger {
  color: #d72828;
}

.gl-dropdown-item.danger .gl-dropdown-icon {
  background: #ffe9e9;
  color: #d72828;
}

.gl-dropdown-item.danger:hover {
  background: #fff0f0;
}

/* SUBMENU PROFIL */

.gl-dropdown-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 18px 20px 8px;
  border: none;
  background: transparent;
  color: #008fa8;
  cursor: pointer;
}

.gl-dropdown-detail {
  padding: 15px 22px 25px;
}

.gl-dropdown-detail h3 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #172b38;
}

.gl-dropdown-detail p {
  margin: 10px 0;
  font-size: 13px;
  line-height: 1.6;
  color: #718595;
  overflow-wrap: anywhere;
}

.gl-dropdown-detail p b {
  color: #172b38;
}

/* ==========================================
   MOBILE MENU
========================================== */

.gl-menu-button {
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

.gl-mobile-brand {
  color: #07576c;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

/* ==========================================
   TABLET
========================================== */

@media (max-width: 960px) {
  .gl-app {
    display: block;
  }

  /* SIDEBAR DRAWER */

  .gl-sidebar {
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

  .gl-sidebar.open {
    transform: translateX(0);
  }

  .gl-overlay {
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

  .gl-sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gl-menu-button {
    display: flex;
  }

  /* TOPBAR DUA BARIS */

  .gl-topbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 12px;
    row-gap: 14px;
    min-height: auto;
    padding: 18px 22px;
    border-bottom: 1px solid #edf4f6;
  }

  .gl-mobile-head {
    display: flex;
    align-items: center;
    gap: 12px;
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
  }

  .gl-topbar-right {
    grid-column: 2;
    grid-row: 1;
    gap: 12px;
    justify-self: end;
  }

  .gl-search {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
  }

  .gl-content {
    padding: 24px 22px 45px;
  }

  /* KONTEN PRESENSI */

  .gl-content .tbl,
  .gl-content .table-wrap,
  .gl-content .table-container {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .gl-content .tbl .tr {
    min-width: 690px;
  }

  .gl-content .panel {
    min-width: 0;
  }
}

/* ==========================================
   HANDPHONE
========================================== */

@media (max-width: 560px) {
  .gl-topbar {
    padding: 14px 15px;
    gap: 12px;
  }

  .gl-mobile-head {
    gap: 8px;
  }

  .gl-mobile-brand {
    font-size: 13px;
  }

  .gl-menu-button {
    width: 40px;
    height: 40px;
  }

  .gl-topbar-right {
    gap: 9px;
  }

  /* NOTIFIKASI */

  .gl-bell {
    width: 40px;
    height: 40px;
  }

  .gl-bell svg {
    width: 20px;
    height: 20px;
  }

  /* PROFIL */

  .gl-avatar {
    width: 40px;
    height: 40px;
    font-size: 17px;
  }

  .gl-profile-info,
  .gl-profile-chevron {
    display: none;
  }

  .gl-profile-trigger {
    padding: 2px;
  }

  /* DROPDOWN MOBILE */

  .gl-dropdown {
    position: fixed;
    top: 75px;
    right: 12px;
    width: min(360px, calc(100vw - 24px));
    max-height: calc(100dvh - 90px);
    overflow-y: auto;
  }

  .gl-dropdown-head {
    padding: 18px;
  }

  .gl-dropdown-menu {
    padding: 10px;
  }

  .gl-dropdown-item {
    min-height: 54px;
  }

  /* SEARCH */

  .gl-search {
    height: 44px;
    padding: 0 14px;
  }

  .gl-search input {
    font-size: 14px;
  }

  /* KONTEN */

  .gl-content {
    padding: 20px 15px 38px;
  }

  .gl-content .panel {
    min-width: 0;
    padding: 15px;
  }

  .gl-content .title {
    font-size: clamp(22px, 6vw, 30px);
    overflow-wrap: anywhere;
  }

  /* TABEL */

  .gl-content table {
    max-width: 100%;
  }

  .gl-content .tbl,
  .gl-content .table-wrap,
  .gl-content .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* LAYAR SANGAT KECIL */

@media (max-width: 360px) {
  .gl-mobile-brand {
    font-size: 12px;
  }

  .gl-topbar-right {
    gap: 6px;
  }

  .gl-content {
    padding: 16px 12px 30px;
  }
}
`;

// ==========================================
// KOMPONEN GURU LAYOUT
// ==========================================

export default function GuruLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState('');

  // Identitas guru dari akun login.
  const user = getUser();

  const teacher = {
    name: user?.name || user?.email || 'Guru',
    subject: user?.subject_label || 'Guru',
    email: user?.email || '-'
  };

  // Avatar menggunakan huruf inisial nama.
  const teacherInitial =
    String(teacher.name).trim().charAt(0).toUpperCase() || 'G';

  // Tutup menu ketika pindah halaman.
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setProfilePanel('');
  }, [location.pathname]);

  // Klik di luar dropdown dan tombol Escape.
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
        setProfilePanel('');
        setMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Logout
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Avatar yang sama digunakan pada header dan dropdown.
  const avatar = (
    <span className="gl-avatar">
      {teacherInitial}
    </span>
  );

  return (
    <div className="gl-app">

      {/* CSS LANGSUNG DI JSX */}
      <style>{css}</style>

      {/* OVERLAY MOBILE */}
      {menuOpen && (
        <button
          type="button"
          className="gl-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`gl-sidebar ${menuOpen ? 'open' : ''}`}
        aria-label="Navigasi Guru"
      >
        <div className="gl-sidebar-head">
          <img
            className="gl-logo"
            src="/logo.svg"
            alt="SMANTI Connect"
          />

          <button
            type="button"
            className="gl-sidebar-close"
            aria-label="Tutup sidebar"
            onClick={() => setMenuOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="gl-nav">
          {nav.map((item) => {
            const Icon = item.icon;

            if (item.soon) {
              return (
                <span
                  key={item.to}
                  className="gl-nav-link disabled"
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
                  `gl-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT SIDEBAR */}
        <div className="gl-sidebar-bottom">
          <button
            type="button"
            className="gl-logout"
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

      <div className="gl-main">

        {/* TOPBAR */}
        <header className="gl-topbar">

          {/* HEADER MOBILE */}
          <div className="gl-mobile-head">
            <button
              type="button"
              className="gl-menu-button"
              aria-label="Buka menu navigasi"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={23} />
            </button>

            <span className="gl-mobile-brand">
              SMANTI Connect
            </span>
          </div>

          {/* SEARCH */}
          <label className="gl-search">
            <Search size={20} />

            <input
              type="search"
              placeholder="Cari siswa"
              aria-label="Cari siswa"
            />
          </label>

          {/* TOPBAR RIGHT */}
          <div className="gl-topbar-right">

            {/* NOTIFIKASI */}
            <div
              className="gl-bell"
              title="Notifikasi"
              aria-label="Notifikasi"
            >
              <Bell size={22} />
            </div>

            {/* PROFIL GURU */}
            <div className="gl-profile" ref={profileRef}>

              {/* TOMBOL PROFIL */}
              <button
                type="button"
                className="gl-profile-trigger"
                aria-label={`Profil ${teacher.name}`}
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setProfilePanel('');
                }}
              >
                {avatar}

                <div className="gl-profile-info">
                  <b title={teacher.name}>
                    {teacher.name}
                  </b>

                  <small title={teacher.subject}>
                    {teacher.subject}
                  </small>
                </div>

                <ChevronDown
                  size={17}
                  className={`gl-profile-chevron ${
                    profileOpen ? 'open' : ''
                  }`}
                />
              </button>

              {/* ==================================
                  DROPDOWN PROFIL GURU
              ================================== */}

              {profileOpen && (
                <div className="gl-dropdown">
                  {!profilePanel ? (
                    <>
                      {/* HEADER DROPDOWN */}
                      <div className="gl-dropdown-head">
                        {avatar}

                        <div className="gl-dropdown-identity">
                          <b>{teacher.name}</b>
                          <small>{teacher.subject}</small>
                        </div>
                      </div>

                      {/* MENU DROPDOWN */}
                      <div className="gl-dropdown-menu">
                        {profileMenus.map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              className="gl-dropdown-item"
                              onClick={() => setProfilePanel(item.id)}
                            >
                              <span className="gl-dropdown-icon">
                                <Icon size={20} />
                              </span>

                              {item.label}
                            </button>
                          );
                        })}

                        <div className="gl-dropdown-divider" />

                        {/* KELUAR */}
                        <button
                          type="button"
                          className="gl-dropdown-item danger"
                          onClick={handleLogout}
                        >
                          <span className="gl-dropdown-icon">
                            <LogOut size={20} />
                          </span>
                          Keluar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* KEMBALI */}
                      <button
                        type="button"
                        className="gl-dropdown-back"
                        onClick={() => setProfilePanel('')}
                      >
                        <ChevronLeft size={18} />
                        Kembali
                      </button>

                      {/* DETAIL MENU */}
                      <div className="gl-dropdown-detail">

                        {/* PROFIL SAYA */}
                        {profilePanel === 'profil' && (
                          <>
                            <h3>Profil Saya</h3>

                            <p>
                              <b>Nama:</b> {teacher.name}
                            </p>

                            <p>
                              <b>Email:</b> {teacher.email}
                            </p>

                            <p>
                              <b>Role:</b> Guru
                            </p>

                            <p>
                              <b>Mata Pelajaran:</b> {teacher.subject}
                            </p>
                          </>
                        )}

                        {/* UBAH KATA SANDI */}
                        {profilePanel === 'password' && (
                          <>
                            <h3>Ubah Kata Sandi</h3>

                            <p>
                              Fitur penggantian kata sandi
                              belum terhubung pada halaman ini.
                            </p>
                          </>
                        )}

                        {/* NOTIFIKASI */}
                        {profilePanel === 'notifikasi' && (
                          <>
                            <h3>Notifikasi</h3>

                            <p>
                              Notifikasi guru belum terhubung
                              ke dropdown profil ini.
                            </p>
                          </>
                        )}

                        {/* BANTUAN */}
                        {profilePanel === 'bantuan' && (
                          <>
                            <h3>Bantuan</h3>

                            <p>
                              Jika mengalami kendala pada sistem,
                              silakan hubungi administrator sekolah.
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
            HALAMAN GURU
        ====================================== */}

        <main className="gl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
