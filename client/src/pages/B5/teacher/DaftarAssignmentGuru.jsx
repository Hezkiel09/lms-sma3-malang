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
  ArrowLeft,
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const DaftarAssignmentGuru = ({ onKembali, onKeEditTugas }) => {
  // Data dummy daftar tugas sesuai desain Figma
  const [daftarTugas] = useState([
    {
      id: 1,
      judul: 'Latihan Mandiri: Grafik Parabola',
      dibuat: 'Dibuat pada 20 Jan 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '27 Jan 2026',
      status: 'Aktif' // Aktif, Dijadwalkan, Tutup
    },
    {
      id: 2,
      judul: 'Proyek Matematika: Analisis Data',
      dibuat: 'Dibuat pada 15 Feb 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '05 Mar 2026',
      status: 'Dijadwalkan'
    },
    {
      id: 3,
      judul: 'Tugas Trigonometri',
      dibuat: 'Dibuat pada 10 Feb 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '20 Feb 2026',
      status: 'Tutup'
    }
  ]);

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full relative">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
        <div>
          <div className="mt-4 mb-8 pl-2">
            <img src={logoSmanti} alt="SMANTI Connect" className="h-10 object-contain" />
          </div>

          <nav className="space-y-0">
            <button 
              onClick={onKembali}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm w-full text-left cursor-pointer"
            >
              <Home size={24} />
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

      {/* MAIN CONTENT */}
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
        <div className="mb-2">
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">TUGAS</span>
          </p>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#17242E]">Tugas</h2>
          <p className="text-xs text-[#71808D] mt-1">Kelola dan pantau tugas siswa untuk mata pelajaran ini.</p>
        </div>

        {/* TAB NAVIGASI (Materi, Tugas, Nilai) */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 text-sm font-bold">
          <span onClick={onKembali} className="pb-3 text-gray-400 hover:text-gray-600 cursor-pointer">Materi</span>
          <span className="pb-3 text-[#0088A8] border-b-2 border-[#0088A8] cursor-pointer">Tugas</span>
          <span className="pb-3 text-gray-400 hover:text-gray-600 cursor-pointer">Nilai</span>
        </div>

        {/* STATS CARDS (4 KOTAK STATISTIK) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 w-full">
          
          {/* Card 1: Total Tugas */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
            <h3 className="text-3xl font-bold text-[#17242E] mb-1">12</h3>
            <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL TUGAS</p>
          </div>

          {/* Card 2: Pengumpulan */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
            <h3 className="text-3xl font-bold text-[#17242E] mb-1">458</h3>
            <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">PENGUMPULAN</p>
          </div>

          {/* Card 3: Tingkat Penyelesaian */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
            <h3 className="text-3xl font-bold text-[#17242E] mb-1">82%</h3>
            <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TINGKAT PENYELESAIAN</p>
          </div>

          {/* Card 4: Perlu Dinilai (Dark Cyan Background) */}
          <div className="bg-[#054C5A] p-6 rounded-3xl shadow-[0_8px_20px_rgba(5,76,90,0.2)] flex flex-col justify-center items-center text-center text-white">
            <h3 className="text-3xl font-bold mb-1">5</h3>
            <p className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">PERLU DINILAI</p>
          </div>

        </div>

        {/* TABEL DAFTAR TUGAS */}
        <div className="bg-[#F8FAFC]/60 p-6 rounded-3xl border border-gray-100 shadow-2xs w-full">
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E0F7FA]/40 text-[11px] font-bold text-[#006064] uppercase border-b border-gray-100">
                  <th className="py-4 px-5">TUGAS</th>
                  <th className="py-4 px-5">MATA PELAJARAN</th>
                  <th className="py-4 px-5">KELAS</th>
                  <th className="py-4 px-5">TENGGAT</th>
                  <th className="py-4 px-5">STATUS</th>
                  <th className="py-4 px-5 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {daftarTugas.map((tugas) => (
                  <tr key={tugas.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-[#17242E]">{tugas.judul}</p>
                      <p className="text-[11px] text-[#71808D] mt-0.5">{tugas.dibuat}</p>
                    </td>
                    <td className="py-4 px-5 text-[#71808D] font-medium flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-50 text-[#0088A8] flex items-center justify-center">
                        <FileText size={14} />
                      </span>
                      {tugas.mapel}
                    </td>
                    <td className="py-4 px-5 text-[#71808D] font-medium">{tugas.kelas}</td>
                    <td className="py-4 px-5 text-[#71808D] font-medium flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {tugas.tenggat}
                    </td>
                    <td className="py-4 px-5">
                      {tugas.status === 'Aktif' && (
                        <span className="px-3 py-1 rounded-full bg-[#E8F8F0] text-[#10B981] text-[11px] font-bold">
                          Aktif
                        </span>
                      )}
                      {tugas.status === 'Dijadwalkan' && (
                        <span className="px-3 py-1 rounded-full bg-[#E0F7FA] text-[#0088A8] text-[11px] font-bold">
                          Dijadwalkan
                        </span>
                      )}
                      {tugas.status === 'Tutup' && (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold">
                          Tutup
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={onKeEditTugas}
                          className="p-2 rounded-xl bg-cyan-50 text-[#0088A8] hover:bg-cyan-100 transition cursor-pointer"
                          title="Edit Tugas"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => alert(`Hapus tugas: ${tugas.judul}`)}
                          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition cursor-pointer"
                          title="Hapus Tugas"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DaftarAssignmentGuru;