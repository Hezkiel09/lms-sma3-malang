import React, { useState } from 'react';
import { 
  Home, Calendar as CalendarIcon, MessageSquare, LogOut, Search, Bell, 
  BookOpen, FileText, ArrowLeft, UploadCloud, Edit, Trash2 
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const EditFileGuru = ({ onKembali }) => {
  const [judul, setJudul] = useState('Persamaan Garis Lurus');
  const [status, setStatus] = useState('publikasi');

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
        <div>
          <div className="mt-4 mb-8 pl-2">
            <img src={logoSmanti} alt="SMANTI Connect" className="h-10 object-contain" />
          </div>
          <nav className="space-y-0">
            <button onClick={onKembali} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E0F7FA] text-[#007A99] font-bold text-sm w-full text-left cursor-pointer">
              <Home size={24} className="text-[#0088A8]" />
              <span>Beranda</span>
            </button>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm"><BookOpen size={24} /><span>Bank Soal</span></a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm"><FileText size={24} /><span>Rekap Nilai</span></a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm"><CalendarIcon size={24} /><span>Presensi</span></a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm"><MessageSquare size={24} /><span>Pesan</span></a>
          </nav>
        </div>
        <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#FFF0F0] text-[#E53935] font-semibold text-sm hover:bg-red-100 transition cursor-pointer">
          <span>Keluar</span><LogOut size={22} />
        </button>
      </aside>

      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        <header className="flex justify-between items-center mb-6 w-full">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" size={20} />
            <input type="text" placeholder="Cari informasi..." className="w-full pl-11 pr-4 py-2 bg-white rounded-full text-sm border border-cyan-100 shadow-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-gray-400" />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 bg-[#E0F7FA] rounded-full text-[#0088A8] relative shadow-xs hover:bg-cyan-100 transition cursor-pointer">
              <Bell size={18} /><span className="absolute top-1 right-1 w-2 h-2 bg-[#00A8CC] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="Karina" className="w-9 h-9 rounded-full object-cover border border-cyan-200" />
              <div className="text-xs">
                <p className="font-bold text-[#17242E] leading-tight">Karina</p>
                <p className="text-[#71808D] text-[11px]">Guru</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-4 flex items-center gap-3">
          <button onClick={onKembali} className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs">
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D]">BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">MATEMATIKA X A</span></p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#17242E]">Edit File</h2>
          <p className="text-xs text-[#71808D] mt-1">Buat materi pembelajaran baru untuk diakses oleh siswa.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">Judul Materi</label>
            <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} className="w-full px-4 py-3 bg-[#E0F7FA]/30 rounded-xl text-xs font-medium text-[#17242E] border border-cyan-100 focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">Deskripsi</label>
            <div className="border border-cyan-100 rounded-xl overflow-hidden">
              <div className="bg-white border-b border-gray-100 p-2 flex gap-3 text-xs text-gray-500 font-bold">
                <span>Insert</span><span>Format</span><span>Tools</span><span>Table</span><span>Help</span>
              </div>
              <textarea rows={5} className="w-full p-4 bg-[#E0F7FA]/30 text-xs text-[#17242E] focus:outline-none" defaultValue="Materi ini membahas konsep dasar persamaan garis lurus, gradien, dan grafiknya. Peserta didik akan memahami cara menentukan gradien dari dua titik, menulis bentuk umum persamaan garis lurus, serta mengenali hubungan antara gradien, kemiringan, dan posisi garis pada bidang koordinat." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">Upload File Materi</label>
            <div className="bg-[#E0F7FA]/30 border border-cyan-100 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0088A8] text-white flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#17242E]">Garis Lurus.pdf</p>
                  <p className="text-[10px] text-[#71808D] uppercase font-semibold">DOKUMEN PDF • 2.4 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-cyan-50 text-[#0088A8] hover:bg-cyan-100 cursor-pointer"><Edit size={14} /></button>
                <button className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 cursor-pointer"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-3">Status Publikasi</label>
            <div className="flex items-center gap-6 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" checked={status === 'publikasi'} onChange={() => setStatus('publikasi')} className="accent-[#0088A8]" /> Publikasi Langsung
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" checked={status === 'draft'} onChange={() => setStatus('draft')} className="accent-[#0088A8]" /> Simpan sebagai Draft
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={onKembali} className="px-6 py-2.5 rounded-xl bg-[#E0F7FA] text-[#0088A8] font-bold text-xs hover:bg-cyan-100 transition cursor-pointer">Batal</button>
            <button onClick={() => { alert('Perubahan file disimpan!'); onKembali(); }} className="px-6 py-2.5 rounded-xl bg-[#054C5A] text-white font-bold text-xs hover:bg-[#033742] transition cursor-pointer">Simpan Perubahan</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditFileGuru;