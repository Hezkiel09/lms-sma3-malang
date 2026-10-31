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
  CloudUpload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Maximize2,
  MoreHorizontal
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const TambahMateri = ({ onKembali }) => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [statusPublikasi, setStatusPublikasi] = useState('publikasi');

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
        <div className="mb-4">
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">MATEMATIKA X A</span>
          </p>
        </div>

        {/* TITLE SECTION */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#17242E]">Tambah File</h2>
          <p className="text-xs text-[#71808D] mt-1">Buat materi pembelajaran baru untuk diakses oleh siswa.</p>
        </div>

        {/* FORM UTAMA SESUAI FIGMA */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full max-w-4xl">
          
          {/* JUDUL MATERI */}
          <div>
            <label className="block text-xs font-bold text-[#17242E] mb-2">Judul Materi</label>
            <input 
              type="text" 
              placeholder="Masukkan judul materi..." 
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-cyan-100 bg-[#E0F7FA]/20 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8]"
            />
          </div>

          {/* DESKRIPSI / EDITOR */}
          <div>
            <label className="block text-xs font-bold text-[#17242E] mb-2">Deskripsi</label>
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              
              {/* Toolbar Editor */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                <span className="px-2 py-1 text-gray-500 font-semibold hover:bg-gray-200 rounded cursor-pointer">Insert</span>
                <span className="px-2 py-1 text-gray-500 font-semibold hover:bg-gray-200 rounded cursor-pointer">Format</span>
                <span className="px-2 py-1 text-gray-500 font-semibold hover:bg-gray-200 rounded cursor-pointer">Tools</span>
                <span className="px-2 py-1 text-gray-500 font-semibold hover:bg-gray-200 rounded cursor-pointer">Table</span>
                <span className="px-2 py-1 text-gray-500 font-semibold hover:bg-gray-200 rounded cursor-pointer">Help</span>
                
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Bold size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Italic size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Underline size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Strikethrough size={14} /></button>
                
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Heading1 size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Heading2 size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Heading3 size={14} /></button>
                
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><ImageIcon size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Video size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Link size={14} /></button>
                
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><AlignLeft size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><AlignCenter size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><AlignRight size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><AlignJustify size={14} /></button>
                
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><List size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><ListOrdered size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Undo size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Redo size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><Maximize2 size={14} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded cursor-pointer"><MoreHorizontal size={14} /></button>
              </div>

              {/* Textarea Konten */}
              <textarea 
                rows={6}
                placeholder="Tulis konten pembelajaran di sini..." 
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full p-4 text-xs text-[#17242E] focus:outline-none bg-[#E0F7FA]/10"
              />
              <div className="px-4 py-2 bg-gray-50 text-[10px] text-gray-400 border-t border-gray-100">
                0 kata
              </div>
            </div>
          </div>

          {/* UPLOAD FILE MATERI (DRAG & DROP AREA) */}
          <div>
            <label className="block text-xs font-bold text-[#17242E] mb-2">Upload File Materi</label>
            <div className="border-2 border-dashed border-cyan-200 rounded-2xl p-8 text-center bg-[#E0F7FA]/20 hover:bg-[#E0F7FA]/40 transition cursor-pointer flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#0088A8]/10 text-[#0088A8] flex items-center justify-center mb-3">
                <CloudUpload size={24} />
              </div>
              <p className="text-xs font-bold text-[#17242E]">Klik untuk mengunggah atau seret dan lepas</p>
              <p className="text-[10px] text-[#71808D] mt-1">PDF, DOC, ZIP or PPTX (Maks 10MB)</p>
            </div>
          </div>

          {/* STATUS PUBLIKASI */}
          <div>
            <label className="block text-xs font-bold text-[#17242E] mb-2">Status Publikasi</label>
            <div className="flex items-center gap-6 text-xs font-medium text-[#17242E]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  checked={statusPublikasi === 'publikasi'} 
                  onChange={() => setStatusPublikasi('publikasi')}
                  className="accent-[#0088A8]"
                />
                Publikasi Langsung
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  checked={statusPublikasi === 'draft'} 
                  onChange={() => setStatusPublikasi('draft')}
                  className="accent-[#0088A8]"
                />
                Simpan sebagai Draft
              </label>
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              onClick={onKembali}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer transition"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                alert('File materi berhasil disimpan!');
                onKembali();
              }}
              className="px-7 py-2.5 bg-[#054C5A] text-white rounded-xl text-xs font-bold hover:bg-[#033742] cursor-pointer transition shadow-xs"
            >
              Simpan
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default TambahMateri;