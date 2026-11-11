import { useEffect, useState } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  LogOut, 
  BookOpen, 
  FileText,
  Menu,
  X
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const SidebarGuru = ({ menuAktif = 'beranda', onPilihMenu }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const pilihMenu = (menu) => {
    onPilihMenu && onPilihMenu(menu);
    setIsMobileOpen(false);
  };

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Buka navigasi"
          aria-controls="sidebar-guru"
          aria-expanded={false}
          className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100 bg-white text-[#0088A8] shadow-md transition hover:bg-cyan-50 lg:hidden"
        >
          <Menu size={22} />
        </button>
      )}

      {isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        id="sidebar-guru"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-80 max-w-[85vw] flex-col justify-between border-r border-gray-100 bg-white p-6 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:min-h-screen lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {isMobileOpen && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Tutup navigasi"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-[#71808D] transition hover:bg-gray-100 lg:hidden"
          >
            <X size={22} />
          </button>
        )}

        <div>
          {/* Logo Brand */}
          <div className="mt-4 mb-8 pl-0">
            <img src={logoSmanti} alt="SMANTI Connect" className="h-12 object-contain" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0">
            <button
              onClick={() => pilihMenu('beranda')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm w-full text-left transition cursor-pointer ${
                menuAktif === 'beranda'
                  ? 'bg-[#E0F7FA] text-[#007A99]'
                  : 'text-[#71808D] hover:bg-gray-50'
              }`}
            >
              <Home size={24} className={menuAktif === 'beranda' ? 'text-[#0088A8]' : 'text-[#71808D]'} />
              <span>Beranda</span>
            </button>

            <a href="#" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <BookOpen size={24} />
              <span>Bank Soal</span>
            </a>

            <a href="#" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <FileText size={24} />
              <span>Rekap Nilai</span>
            </a>

            <a href="#" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <CalendarIcon size={24} />
              <span>Presensi</span>
            </a>

            <a href="#" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <MessageSquare size={24} />
              <span>Pesan</span>
            </a>
          </nav>
        </div>

        {/* Logout Button */}
        <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#FFF0F0] text-[#E53935] font-semibold text-sm hover:bg-red-100 transition cursor-pointer">
          <span>Keluar</span>
          <LogOut size={22} />
        </button>
      </aside>
    </>
  );
};

export default SidebarGuru;