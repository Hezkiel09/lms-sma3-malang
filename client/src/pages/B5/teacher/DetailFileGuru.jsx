import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trash2, FileText, Download, 
  Calendar, BookOpen, CheckCircle, Layers 
} from 'lucide-react';

const DetailFileGuru = ({ materialId, courseId, onKembali, onDelete }) => {
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
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-gray-500 font-medium text-xs">Memuat detail materi...</p>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <button onClick={onKembali} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 mb-4 flex items-center gap-2 cursor-pointer">
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen font-sans text-[#17242E]">
      
      {/* BREADCRUMB & HEADER */}
      <div className="mb-6">
        <p className="text-[11px] text-[#71808D] mb-2 font-medium tracking-wide">
          BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; MATERI &nbsp;/&nbsp; <span className="text-[#17242E] font-bold">DETAIL MATERI</span>
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={onKembali}
              className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold text-[#17242E]">{material?.title || 'Tanpa Judul'}</h1>
          </div>

          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFF0F0] hover:bg-red-100 text-[#E53935] rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>

        {/* SUB-INFO META */}
        <div className="flex items-center gap-4 mt-3 text-xs text-[#71808D]">
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
    </div>
  );
};

export default DetailFileGuru;