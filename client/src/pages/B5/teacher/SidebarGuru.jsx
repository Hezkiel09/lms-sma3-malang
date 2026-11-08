import React from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  LogOut, 
  BookOpen, 
  FileText 
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const SidebarGuru = ({ menuAktif = 'beranda', onPilihMenu }) => {
  return (
    <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
      <div>
        {/* Logo Brand */}
        <div className="mt-4 mb-8 pl-0">
          <img src={logoSmanti} alt="SMANTI Connect" className="h-12 object-contain" />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-0">
          <button 
            onClick={() => onPilihMenu && onPilihMenu('beranda')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm w-full text-left transition cursor-pointer ${
              menuAktif === 'beranda' 
                ? 'bg-[#E0F7FA] text-[#007A99]' 
                : 'text-[#71808D] hover:bg-gray-50'
            }`}
          >
            <Home size={24} className={menuAktif === 'beranda' ? 'text-[#0088A8]' : 'text-[#71808D]'} />
            <span>Beranda</span>
          </button>

          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
            <BookOpen size={24} />
            <span>Bank Soal</span>
          </a>

          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
            <FileText size={24} />
            <span>Rekap Nilai</span>
          </a>

          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
            <CalendarIcon size={24} />
            <span>Presensi</span>
          </a>

          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
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
  );
};

export default SidebarGuru;