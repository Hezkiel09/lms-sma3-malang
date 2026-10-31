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
  Image as ImageIcon
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const DaftarKelas = ({ onKembali, onPilihKelas }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const daftarKelas = [
    { id: 'XA', nama: 'Matematika X A', desc: 'Pelajari persamaan linear, fungsi, dan grafik melalui latihan serta diskusi kelas.', materi: 12, tugas: 8, tahun: '2026 / 2027' },
    { id: 'XB', nama: 'Matematika X B', desc: 'Pelajari persamaan linear, fungsi, dan grafik melalui latihan serta diskusi kelas.', materi: 10, tugas: 6, tahun: '2026 / 2027' },
    { id: 'XC', nama: 'Matematika X C', desc: 'Pelajari persamaan linear, fungsi, dan grafik melalui latihan serta diskusi kelas.', materi: 14, tugas: 9, tahun: '2026 / 2027' },
    { id: 'XD', nama: 'Matematika X D', desc: 'Pelajari trigonometri dasar dan perbandingan sudut dengan latihan soal terarah.', materi: 11, tugas: 7, tahun: '2026 / 2027' },
    { id: 'XE', nama: 'Matematika X E', desc: 'Pahami statistika dasar, penyajian data, dan peluang melalui kegiatan kelas.', materi: 13, tugas: 8, tahun: '2026 / 2027' },
  ];

  const filteredKelas = daftarKelas.filter(k => 
    k.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    k.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      {/* SIDEBAR */}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        {/* TOPBAR */}
        <header className="flex justify-between items-center mb-6 w-full">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" size={20} />
            <input 
              type="text" 
              placeholder="Cari mata pelajaran..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* HEADER TITLE & TOMBOL KEMBALI */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onKembali}
              className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[11px] text-[#71808D] mb-0.5">Beranda / Kelas 10</p>
              <h2 className="text-2xl font-bold text-[#17242E]">Kelas 10</h2>
            </div>
          </div>
        </div>

        {/* GRID KELAS 10 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredKelas.length > 0 ? (
            filteredKelas.map((kelas) => (
              <div key={kelas.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex flex-col justify-between p-2 w-full hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition-all duration-300">
                <div>
                  <div className="h-28 bg-[#DDF6F9] rounded-2xl flex flex-col items-center justify-center text-[#007088] p-4 relative overflow-hidden">
                    <ImageIcon size={28} className="text-[#0088A8] mb-1 opacity-80" />
                    <span className="text-[10px] font-bold tracking-widest text-[#054C5A]">MATEMATIKA</span>
                  </div>

                  <div className="p-4">
                    <span className="text-[9px] bg-[#EAF7FA] text-[#0088A8] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      KELAS {kelas.id}
                    </span>
                    <h4 className="font-bold text-sm mt-1 mb-1 text-[#17242E]">{kelas.nama}</h4>
                    <p className="text-[11px] text-[#71808D] leading-relaxed mb-3">{kelas.desc}</p>
                    
                    <div className="flex gap-4 text-[11px] text-[#71808D] mb-3">
                      <span className="flex items-center gap-1"><BookOpen size={12} className="text-cyan-600"/> {kelas.materi} Materi</span>
                      <span className="flex items-center gap-1"><FileText size={12} className="text-cyan-600"/> {kelas.tugas} Tugas</span>
                    </div>

                    <div className="text-[10px] text-[#71808D] pt-2 border-t border-gray-100">
                      <p className="font-bold text-[#17242E]">{kelas.tahun}</p>
                    </div>
                  </div>
                </div>

                {/* TOMBOL LIHAT KELAS YANG SUDAH TERHUBUNG KE PROPS */}
                <div className="px-4 pb-2">
                  <button 
                    onClick={onPilihKelas}
                    className="w-full py-2 bg-[#054C5A] text-white rounded-xl text-xs font-semibold hover:bg-[#033742] transition cursor-pointer shadow-xs"
                  >
                    Lihat Kelas
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 text-xs">
              Kelas tidak ditemukan.
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default DaftarKelas;