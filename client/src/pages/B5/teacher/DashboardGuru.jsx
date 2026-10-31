import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  LogOut, 
  Search, 
  Bell, 
  BookOpen, 
  FileText, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';
import bannerGuruImg from '../../../assets/banner.png';
import DaftarKelas from './DaftarKelas';
import DetailCourseGuru from './DetailCourseGuru';
import KelolaCourseGuru from './KelolaCourseGuru';
import EditAssignmentGuru from './EditAssignmentGuru'; // Pastikan path ini sesuai dengan letak file EditAssignmentGuru

const DashboardGuru = () => {
  const [halamanAktif, setHalamanAktif] = useState('beranda');

  // Sinkronisasi URL browser secara aman tanpa merusak fungsi state
  const ubahHalaman = (halaman, urlPath) => {
    window.history.pushState({}, '', urlPath);
    setHalamanAktif(halaman);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/kelas') setHalamanAktif('kelas10');
      else if (window.location.pathname === '/kelas/detail') setHalamanAktif('detailCourse');
      else if (window.location.pathname === '/kelas/kelola') setHalamanAktif('kelolaCourse');
      else if (window.location.pathname === '/kelas/edit-assignment') setHalamanAktif('editAssignment');
      else setHalamanAktif('beranda');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render Halaman Daftar Kelas
  if (halamanAktif === 'kelas10') {
    return (
      <DaftarKelas 
        onKembali={() => ubahHalaman('beranda', '/dashboard')} 
        onPilihKelas={() => ubahHalaman('detailCourse', '/kelas/detail')}
      />
    );
  }

  // Render Halaman Detail Course
  if (halamanAktif === 'detailCourse') {
    return (
      <DetailCourseGuru 
        onKembali={() => ubahHalaman('kelas10', '/kelas')}
        onKeModeEdit={() => ubahHalaman('kelolaCourse', '/kelas/kelola')}
        onKeEditTugas={() => ubahHalaman('editAssignment', '/kelas/edit-assignment')}
      />
    );
  }

  // Render Kelola Course
  if (halamanAktif === 'kelolaCourse') {
    return (
      <KelolaCourseGuru 
        onKembali={() => ubahHalaman('detailCourse', '/kelas/detail')}
      />
    );
  }

  // Render Edit Assignment Guru
  if (halamanAktif === 'editAssignment') {
    return (
      <EditAssignmentGuru 
        onKembali={() => ubahHalaman('detailCourse', '/kelas/detail')}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
        <div>
          {/* Logo Brand */}
          <div className="mt-4 mb-8 pl-2">
            <img src={logoSmanti} alt="SMANTI Connect" className="h-10 object-contain" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0">
            <button 
              onClick={() => ubahHalaman('beranda', '/dashboard')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E0F7FA] text-[#007A99] font-bold text-sm w-full text-left cursor-pointer"
            >
              <Home size={24} className="text-[#0088A8]" />
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

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        
        {/* HEADER / TOPBAR */}
        <header className="flex justify-between items-center mb-6 w-full">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" size={20} />
            <input 
              type="text" 
              placeholder="Cari informasi..." 
              className="w-full pl-11 pr-4 py-2 bg-white rounded-full text-sm border border-cyan-100 shadow-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 bg-[#E0F7FA] rounded-full text-[#0088A8] relative shadow-xs hover:bg-cyan-100 transition cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00A8CC] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" 
                alt="Karina" 
                className="w-9 h-9 rounded-full object-cover border border-cyan-200"
              />
              <div className="text-xs">
                <p className="font-bold text-[#17242E] leading-tight">Karina</p>
                <p className="text-[#71808D] text-[11px]">Guru</p>
              </div>
            </div>
          </div>
        </header>

        {/* BREADCRUMB & TITLE */}
        <div className="mb-6">
          <p className="text-[11px] text-[#71808D] mb-1">Beranda /</p>
          <h2 className="text-2xl font-bold text-[#17242E]">Beranda</h2>
        </div>

        {/* WELCOME BANNER GURU */}
        <section className="bg-[#DDF6F9] px-6 sm:px-8 py-6 rounded-3xl mb-8 flex justify-between items-center relative overflow-hidden shadow-xs w-full min-h-[150px]">
          <div className="w-full lg:max-w-[65%] z-10 pr-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#007088] mb-2 leading-tight">
              Selamat Datang,<br />Karina
            </h3>
            <p className="text-xs sm:text-sm text-[#005B66] font-medium leading-relaxed">
              Mari kelola materi dan evaluasi tugas siswa dengan lebih mudah dan cepat.
            </p>
          </div>
          
          <div className="hidden lg:flex absolute right-4 bottom-0 h-full items-end justify-end pointer-events-none z-10">
            <img 
              src={bannerGuruImg} 
              alt="Teacher 3D" 
              className="h-[110%] w-auto object-contain object-bottom max-w-[220px]"
            />
          </div>
        </section>

        {/* SECTION: PILIHAN KELAS (10, 11, 12) */}
        <section className="mb-8 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">PILIHAN KELAS</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            
            {/* Kelas 10 */}
            <div 
              onClick={() => ubahHalaman('kelas10', '/kelas')}
              className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex items-center justify-between hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition cursor-pointer group"
            >
              <div>
                <h4 className="font-bold text-base text-[#17242E] group-hover:text-[#0088A8] transition">Kelas 10</h4>
                <p className="text-[11px] text-[#71808D] mt-1">Buka halaman course untuk kelas 10</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Kelas 11 */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex items-center justify-between hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition cursor-pointer">
              <div>
                <h4 className="font-bold text-base text-[#17242E]">Kelas 11</h4>
                <p className="text-[11px] text-[#71808D] mt-1">Buka halaman course untuk kelas 11</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Kelas 12 */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex items-center justify-between hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition cursor-pointer">
              <div>
                <h4 className="font-bold text-base text-[#17242E]">Kelas 12</h4>
                <p className="text-[11px] text-[#71808D] mt-1">Buka halaman course untuk kelas 12</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: COURSE SUMMARY (4 STATS) */}
        <section className="mb-8 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">COURSE SUMMARY</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
            
            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL MATA PELAJARAN</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">12</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-2/3 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL MATERI</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">48</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-4/5 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL ASSIGNMENT</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">24</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-1/2 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL PENGUMPULAN</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">864</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-11/12 rounded-full"></div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: RIWAYAT TUGAS */}
        <section className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 mb-6 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">RIWAYAT TUGAS</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E0F7FA]/50 text-[11px] font-bold text-[#006064] uppercase border-b border-cyan-100">
                  <th className="py-3 px-4">TUGAS</th>
                  <th className="py-3 px-4">KELAS</th>
                  <th className="py-3 px-4">MATA PELAJARAN</th>
                  <th className="py-3 px-4">DEADLINE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#17242E]">Lorem ipsum dolor</td>
                  <td className="py-3.5 px-4 text-[#71808D]">X A</td>
                  <td className="py-3.5 px-4 text-[#71808D]">Matematika</td>
                  <td className="py-3.5 px-4 text-[#71808D]">12/05/2026</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#B2EBF2] text-[#006064] text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#71808D] cursor-pointer hover:text-[#0088A8]">
                    <MoreVertical size={16} className="mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#17242E]">Tugas Harian 3</td>
                  <td className="py-3.5 px-4 text-[#71808D]">XI B</td>
                  <td className="py-3.5 px-4 text-[#71808D]">Matematika</td>
                  <td className="py-3.5 px-4 text-[#71808D]">15/05/2026</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#FFF3C4] text-[#8C6D00] text-[10px] font-bold">
                      DRAFT
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[#71808D] cursor-pointer hover:text-[#0088A8]">
                    <MoreVertical size={16} className="mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION: RIWAYAT PENGUMPULAN */}
        <section className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">RIWAYAT PENGUMPULAN</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E0F7FA]/50 text-[11px] font-bold text-[#006064] uppercase border-b border-cyan-100">
                  <th className="py-3 px-4">NAMA SISWA</th>
                  <th className="py-3 px-4">KELAS</th>
                  <th className="py-3 px-4">TUGAS</th>
                  <th className="py-3 px-4">SUBMITTED</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#17242E] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#0088A8] flex items-center justify-center font-bold text-[10px]">SN</span>
                    Siti Nurhaliza
                  </td>
                  <td className="py-3.5 px-4 text-[#71808D]">XII IPS 2</td>
                  <td className="py-3.5 px-4 text-[#71808D]">Tugas 1</td>
                  <td className="py-3.5 px-4 text-[#71808D]">10:45 WIB</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#B2EBF2] text-[#006064] text-[10px] font-bold">
                      DONE
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button className="px-4 py-1.5 bg-[#054C5A] text-white rounded-xl text-xs font-semibold hover:bg-[#033742] transition cursor-pointer">
                      Nilai
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default DashboardGuru;