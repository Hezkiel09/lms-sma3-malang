import React, { useState } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  LogOut, 
  Search, 
  Bell, 
  BookOpen, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Download, 
  ExternalLink, 
  ArrowLeft,
  ClipboardList,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';
import TabTugasGuru from './TabTugasGuru'; // Import komponen tab tugas
import TabNilaiGuru from './TabNilaiGuru';

const DetailCourseGuru = ({ onKembali, onKeModeEdit, onKeEditTugas }) => {
  const [tabAktif, setTabAktif] = useState('materi'); // 'materi' | 'tugas' | 'nilai'
  const [openBab, setOpenBab] = useState({
    1: true,  // Persamaan Garis Lurus
    2: true,  // Fungsi Kuadrat
    3: true,  // Sistem Persamaan Linear
    4: true,  // Logaritma
    5: true   // Trigonometri
  });

  const toggleBab = (id) => {
    setOpenBab(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
        <div>
          <div className="mt-4 mb-8 pl-2">
            <img src={logoSmanti} alt="SMANTI Connect" className="h-10 object-contain" />
          </div>

          <nav className="space-y-0">
            <button 
              onClick={onKembali}
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

        <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#FFF0F0] text-[#E53935] font-semibold text-sm hover:bg-red-100 transition cursor-pointer">
          <span>Keluar</span>
          <LogOut size={22} />
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        
        {/* TOPBAR */}
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

        {/* BREADCRUMB */}
        <div className="mb-4 flex items-center gap-3">
          <button 
            onClick={onKembali}
            className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">MATERI</span>
          </p>
        </div>

        {/* HEADER COURSE & TOMBOL EDIT (Hanya muncul di tab Materi) */}
        <div className="flex justify-between items-start mb-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-[#17242E]">Matematika X A</h2>
            <p className="text-xs text-[#71808D] mt-1">Kelola dan atur materi pelajaran untuk siswa.</p>
          </div>

          {tabAktif === 'materi' && (
            <button 
              onClick={onKeModeEdit}
              className="px-5 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Edit3 size={15} />
              EDIT
            </button>
          )}
        </div>

        {/* TAB NAVIGASI (MATERI / TUGAS / NILAI) */}
        <div className="flex gap-8 border-b border-gray-200 mb-6 text-sm font-bold">
          <button 
            onClick={() => setTabAktif('materi')}
            className={`pb-3 transition cursor-pointer ${
              tabAktif === 'materi' 
                ? 'text-[#0088A8] border-b-2 border-[#0088A8]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Materi
          </button>
          <button 
            onClick={() => setTabAktif('tugas')}
            className={`pb-3 transition cursor-pointer ${
              tabAktif === 'tugas' 
                ? 'text-[#0088A8] border-b-2 border-[#0088A8]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Tugas
          </button>
          <button 
            onClick={() => setTabAktif('nilai')}
            className={`pb-3 transition cursor-pointer ${
              tabAktif === 'nilai' 
                ? 'text-[#0088A8] border-b-2 border-[#0088A8]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Nilai
          </button>
        </div>

        {/* ISI TAB: MATERI */}
        {tabAktif === 'materi' && (
          <div className="space-y-6 w-full">
            
            {/* BAB 1: Persamaan Garis Lurus */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,136,168,0.08)] overflow-hidden">
              <div 
                onClick={() => toggleBab(1)}
                className="p-5 flex justify-between items-center bg-[#F8FAFC]/60 border-b border-gray-100 cursor-pointer hover:bg-cyan-50/20 transition"
              >
                <div className="flex items-center gap-3">
                  {openBab[1] ? <ChevronUp size={18} className="text-[#0088A8]" /> : <ChevronDown size={18} className="text-gray-400" />}
                  <h3 className="font-bold text-base text-[#17242E]">Persamaan Garis Lurus</h3>
                </div>
                <span className="text-[11px] text-[#71808D]">12 Okt 2026</span>
              </div>

              {openBab[1] && (
                <div className="p-6 space-y-4">
                  <div className="text-xs text-[#71808D] leading-relaxed">
                    <p>Materi tentang persamaan garis lurus, gradien, dan grafiknya.</p>
                    <p className="font-bold text-[#17242E] mt-2">Tujuan :</p>
                    <p>1. Menentukan gradien dan persamaan garis lurus dari titik atau grafik yang diketahui.</p>
                    <p>2. Menggambar grafik garis lurus dan menerapkannya untuk menyelesaikan masalah sehari-hari.</p>
                  </div>

                  {/* PDF DOKUMEN */}
                  <div className="bg-[#E0F7FA]/40 border border-cyan-100 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0088A8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#17242E]">Garis Lurus.pdf</p>
                        <p className="text-[10px] text-[#71808D] uppercase font-semibold">DOKUMEN PDF • 2.4 MB</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
                      <Download size={14} /> Unduh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BAB 2: Fungsi Kuadrat */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,136,168,0.08)] overflow-hidden">
              <div 
                onClick={() => toggleBab(2)}
                className="p-5 flex justify-between items-center bg-[#F8FAFC]/60 border-b border-gray-100 cursor-pointer hover:bg-cyan-50/20 transition"
              >
                <div className="flex items-center gap-3">
                  {openBab[2] ? <ChevronUp size={18} className="text-[#0088A8]" /> : <ChevronDown size={18} className="text-gray-400" />}
                  <h3 className="font-bold text-base text-[#17242E]">Fungsi Kuadrat</h3>
                </div>
                <span className="text-[11px] text-[#71808D]">14 Okt 2026</span>
              </div>

              {openBab[2] && (
                <div className="p-6 space-y-4">
                  <div className="text-xs text-[#71808D] leading-relaxed">
                    <p>Materi tentang bentuk umum, puncak, dan grafik fungsi kuadrat.</p>
                    <p className="font-bold text-[#17242E] mt-2">Tujuan :</p>
                    <p>1. Menentukan bentuk umum, puncak, dan sumbu simetri fungsi kuadrat.</p>
                    <p>2. Menggambar grafik fungsi kuadrat dan menerapkannya untuk menyelesaikan masalah sehari-hari.</p>
                  </div>

                  {/* PDF 1 */}
                  <div className="bg-[#E0F7FA]/40 border border-cyan-100 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0088A8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#17242E]">fungsi_kuadrat_xa.pdf</p>
                        <p className="text-[10px] text-[#71808D] uppercase font-semibold">DOKUMEN PDF • 2.4 MB</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
                      <Download size={14} /> Unduh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BAB 3: Sistem Persamaan Linear */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,136,168,0.08)] overflow-hidden">
              <div 
                onClick={() => toggleBab(3)}
                className="p-5 flex justify-between items-center bg-[#F8FAFC]/60 border-b border-gray-100 cursor-pointer hover:bg-cyan-50/20 transition"
              >
                <div className="flex items-center gap-3">
                  {openBab[3] ? <ChevronUp size={18} className="text-[#0088A8]" /> : <ChevronDown size={18} className="text-gray-400" />}
                  <h3 className="font-bold text-base text-[#17242E]">Sistem Persamaan Linear</h3>
                </div>
                <span className="text-[11px] text-[#71808D]">16 Okt 2026</span>
              </div>

              {openBab[3] && (
                <div className="p-6 space-y-4">
                  <div className="text-xs text-[#71808D] leading-relaxed">
                    <p>Materi tentang metode substitusi dan eliminasi pada SPL.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ISI TAB: TUGAS (Memanggil Komponen TabTugasGuru yang sesuai Figma) */}
        {tabAktif === 'tugas' && (
          <TabTugasGuru onKeEditTugas={onKeEditTugas} />
        )}

        {/* ISI TAB: NILAI */}
        {tabAktif === 'nilai' && (
  <TabNilaiGuru 
    onKeDetailNilai={() => setSubHalaman('detailNilai')} 
    onKeInputNilai={() => setSubHalaman('inputNilai')} 
  />
)}

      </main>
    </div>
  );
};

export default DetailCourseGuru;