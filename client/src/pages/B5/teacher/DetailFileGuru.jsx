import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trash2, FileText, Download, 
  Calendar, BookOpen, CheckCircle, Layers,
  Search, Bell 
} from 'lucide-react';
import SidebarGuru from './SidebarGuru'; // <--- Komponen Sidebar Terpisah

const DetailFileGuru = ({ materialId, courseId, onKembali, onDelete, onLogout }) => {
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterialDetail = async () => {
    if (!materialId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/v1/b5/materials/${materialId}`);
      
      if (!response.ok) {
        throw new Error('Gagal memuat detail materi dari server');
      }
      
      const result = await response.json();
      console.log("DATA DETAIL MATERI:", result.data);
      setMaterial(result.data);
    } catch (err) {
      console.error('Error fetching detail materi:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/v1/b5/materials/${materialId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal menghapus materi.');
      }
      alert('Materi berhasil dihapus.');
      if (onDelete) onDelete();
      else if (onKembali) onKembali();
    } catch (err) {
      alert('Gagal menghapus materi: ' + err.message);
    }
  };

  useEffect(() => {
    fetchMaterialDetail();
  }, [materialId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white font-sans text-xs text-gray-500">
        Memuat detail materi...
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
        <SidebarGuru 
          menuAktif="beranda" 
          onPilihMenu={(menu) => {
            if (menu === 'beranda' && onKembali) onKembali();
          }} 
        />
        <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
          <button onClick={onKembali} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 mb-4 flex items-center gap-2 cursor-pointer">
            <ArrowLeft size={18} /> Kembali
          </button>
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-medium">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      
      {/* SIDEBAR TERPISAH */}
      <SidebarGuru 
        menuAktif="beranda" 
        onPilihMenu={(menu) => {
          if (menu === 'beranda' && onKembali) onKembali();
        }} 
      />

      {/* MAIN CONTENT AREA */}
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
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; MATERI &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">DETAIL MATERI</span>
          </p>
        </div>

        {/* HEADER JUDUL & TOMBOL HAPUS */}
        <div className="flex justify-between items-start mb-6 w-full">
          <div>
            <h1 className="text-2xl font-bold text-[#17242E]">{material?.title || 'Tanpa Judul'}</h1>
            
            {/* SUB-INFO META */}
            <div className="flex items-center gap-3 mt-2 text-xs text-[#71808D]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-cyan-600" /> 
                {material?.created_at ? new Date(material.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Layers size={14} className="text-cyan-600" /> 
                {material?.section?.title || 'Kelas 10'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-cyan-600" /> 
                Matematika X A
              </span>
            </div>
          </div>

          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF0F0] hover:bg-red-100 text-[#E53935] rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARD DESKRIPSI MATERI */}
            <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#17242E]">Deskripsi Materi</h2>
              <div className="text-[#17242E] text-xs leading-relaxed whitespace-pre-line">
                {material?.description || 'Tidak ada deskripsi materi.'}
              </div>
            </div>

            {/* CARD PRATINJAU FILE MURNI DINAMIS */}
            <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#17242E]">Pratinjau File</h2>
              
              {material?.material_files && material.material_files.length > 0 ? (
                <div className="space-y-4">
                  {material.material_files.map((file) => {
                    const fileLink = file.file_url.startsWith('http') 
                      ? file.file_url 
                      : `http://localhost:5000/${file.file_url}`;

                    return (
                      <div key={file.id} className="space-y-3">
                        <p className="text-xs font-bold text-[#0088A8]">{file.file_name}</p>
                        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                          <iframe 
                            src={fileLink} 
                            title={file.file_name}
                            className="w-full h-[500px] border-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 border border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50">
                  <p className="text-xs text-gray-400">Tidak ada lampiran file pada materi ini.</p>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN - SIDEBAR INFORMASI */}
          <div className="space-y-6">
            
            {/* CARD LAMPIRAN MURNI DINAMIS */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Berkas Terlampir</h3>
              {material?.material_files && material.material_files.length > 0 ? (
                material.material_files.map((file) => {
                  const fileLink = file.file_url.startsWith('http') 
                    ? file.file_url 
                    : `http://localhost:5000/${file.file_url}`;

                  return (
                    <div key={file.id} className="flex items-center justify-between p-3.5 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-cyan-100/50 text-[#0088A8] rounded-xl shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#17242E] truncate">{file.file_name}</p>
                          <p className="text-[10px] text-gray-400">
                            {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : ''} • PDF
                          </p>
                        </div>
                      </div>
                      <a 
                        href={fileLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs shrink-0 ml-2"
                        title="Download File"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 italic">Tidak ada berkas terlampir.</p>
              )}
            </div>

            {/* CARD INFORMASI TAMBAHAN */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Informasi Tambahan</h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide">MATA PELAJARAN</p>
                  <p className="font-semibold text-[#17242E] mt-0.5">Matematika X A</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide">KELAS TARGET</p>
                  <p className="font-semibold text-[#17242E] mt-0.5">X-A</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide">TANGGAL UNGGAH</p>
                  <p className="font-semibold text-[#17242E] mt-0.5">
                    {material?.created_at ? new Date(material.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide">STATUS</p>
                  <div className="flex items-center gap-1.5 text-[#2E7D32] font-semibold mt-0.5">
                    <CheckCircle size={14} className="text-[#2E7D32]" /> {material?.status || 'Published'}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD DIUNGGAH OLEH */}
            <div className="bg-[#054C5A] p-6 rounded-3xl shadow-2xs space-y-3 text-white">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">Diunggah Oleh</h3>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-white text-[#054C5A] flex items-center justify-center font-bold text-sm shadow-xs">
                  K
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Karina</p>
                  <p className="text-[11px] text-cyan-100 font-medium">Guru Matematika</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default DetailFileGuru;