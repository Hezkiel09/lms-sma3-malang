import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiTrash2, FiFileText, FiDownload, 
  FiCalendar, FiBookOpen, FiUser, FiCheckCircle, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

const DetailFileGuru = ({ materialId, courseId, onKembali, onDelete }) => {
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:5000/api/v1/b5/materials/${materialId}`);
        
        if (!response.ok) {
          throw new Error('Gagal memuat detail materi dari server');
        }
        
        const result = await response.json();
        setMaterial(result.data);
      } catch (err) {
        console.error('Error fetching detail materi:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchMaterialDetail();
    }
  }, [materialId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F9FAFB]">
        <p className="text-gray-500 font-medium text-sm">Memuat detail materi...</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="p-8 bg-[#F9FAFB] min-h-screen">
        <button onClick={onKembali} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 mb-4 flex items-center gap-2">
          <FiArrowLeft size={18} /> Kembali
        </button>
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error || 'Data materi tidak ditemukan.'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="text-xs text-gray-400 mb-1">
          BERANDA / KELAS 10 / MATERI / <span className="text-gray-600 font-medium">DETAIL MATERI</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={onKembali}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 cursor-pointer"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{material.title}</h1>
          </div>
          <button 
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <FiTrash2 size={16} /> Hapus
          </button>
        </div>

        {/* Sub-info Meta */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><FiCalendar size={14} /> {material.created_at ? new Date(material.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><FiBookOpen size={14} /> Matematika</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Deskripsi Materi */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Deskripsi Materi</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {material.description || 'Tidak ada deskripsi.'}
            </div>
          </div>

          {/* Card Pratinjau File / PDF */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Pratinjau File</h2>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-6 text-center">
              {material.file_url ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">Lampiran file tersedia untuk diunduh atau dilihat.</p>
                  <a 
                    href={material.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#054C5A] text-white rounded-xl text-xs font-bold hover:bg-[#033742] transition"
                  >
                    <FiDownload size={16} /> Buka / Unduh Berkas
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Tidak ada lampiran file pada materi ini.</p>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan - Sidebar Informasi */}
        <div className="space-y-6">
          
          {/* Card Lampiran */}
          {material.file_url && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Lampiran</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <FiFileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Berkas Lampiran</p>
                    <p className="text-xs text-gray-400">Dokumen Materi</p>
                  </div>
                </div>
                <a 
                  href={material.file_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-lg transition"
                  title="Download File"
                >
                  <FiDownload size={16} />
                </a>
              </div>
            </div>
          )}

          {/* Card Informasi Tambahan */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Informasi Tambahan</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">MATA PELAJARAN</p>
                <p className="font-semibold text-gray-800">Matematika</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">KELAS TARGET</p>
                <p className="font-semibold text-gray-800">X-A</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">TANGGAL UNGGAH</p>
                <p className="font-semibold text-gray-800">{material.created_at ? new Date(material.created_at).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">STATUS</p>
                <div className="flex items-center gap-1.5 text-green-600 font-semibold mt-0.5">
                  <FiCheckCircle size={14} /> {material.status || 'Published'}
                </div>
              </div>
            </div>
          </div>

          {/* Card Diunggah Oleh */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Diunggah Oleh</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                K
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Karina</p>
                <p className="text-xs text-gray-400">Guru Matematika</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DetailFileGuru;