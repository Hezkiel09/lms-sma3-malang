import React, { useRef, useState, useEffect } from 'react';
import {
  Search,
  Bell,
  CloudUpload,
  ArrowLeft,
  X,
  File as FileIcon,
  Trash2,
  Save,
} from 'lucide-react';

import SidebarGuru from './SidebarGuru'; // <--- Komponen Sidebar Terpisah

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.zip', '.ppt', '.pptx',
];

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EditFileGuru = ({ materialId, onKembali, onSaveSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [statusPublikasi, setStatusPublikasi] = useState('published');
  const [sectionTitle, setSectionTitle] = useState('');

  // Lampiran yang sudah tersimpan di database
  const [existingFiles, setExistingFiles] = useState([]);
  // Lampiran baru yang akan diunggah
  const [newFiles, setNewFiles] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [formError, setFormError] = useState('');
  const [fileError, setFileError] = useState('');

  const fileInputRef = useRef(null);

  // Ambil data materi saat ini dari backend
  useEffect(() => {
    const fetchMaterial = async () => {
      if (!materialId) {
        setLoadError('Material ID tidak valid.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError('');

        const res = await fetch(`${API_BASE_URL}/api/v1/b5/materials/${materialId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Gagal mengambil data materi (HTTP ${res.status})`);
        }

        const result = await res.json();
        const data = result.data;

        if (data) {
          setJudul(data.title || '');
          setDeskripsi(data.description || '');
          setStatusPublikasi(data.status || 'published');
          setExistingFiles(data.material_files || []);
          setSectionTitle(data.section?.title || '');
        }
      } catch (err) {
        console.error('Error fetching material for edit:', err);
        setLoadError(err.message || 'Gagal memuat materi.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);

  // Validasi dan tambah file baru
  const handleAddFiles = (fileList) => {
    const incomingFiles = Array.from(fileList || []);
    if (incomingFiles.length === 0) return;

    const validFiles = [];
    const errors = [];

    incomingFiles.forEach((file) => {
      const extension = `.${file.name.split('.').pop()}`.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        errors.push(`${file.name}: format file tidak didukung.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: ukuran file melebihi 10 MB.`);
        return;
      }
      validFiles.push(file);
    });

    const totalAllowed = MAX_FILES - existingFiles.length;
    const mergedFiles = [...newFiles];

    validFiles.forEach((file) => {
      const alreadyAdded = mergedFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (!alreadyAdded) {
        mergedFiles.push(file);
      }
    });

    if (mergedFiles.length > totalAllowed) {
      errors.push(`Maksimal total lampiran adalah ${MAX_FILES} file.`);
    }

    setNewFiles(mergedFiles.slice(0, Math.max(0, totalAllowed)));
    setFileError(errors.join(' '));
  };

  // Hapus lampiran yang sudah tersimpan di database
  const handleDeleteExistingFile = async (fileId, fileName) => {
    if (!window.confirm(`Hapus lampiran "${fileName}"?`)) return;

    try {
      setDeletingFileId(fileId);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/b5/materials/${materialId}/files/${fileId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal menghapus lampiran');
      }

      setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      alert('Gagal menghapus lampiran: ' + err.message);
    } finally {
      setDeletingFileId(null);
    }
  };

  // Submit form perubahan materi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!judul.trim()) {
      setFormError('Judul materi wajib diisi.');
      return;
    }
    if (judul.trim().length > 255) {
      setFormError('Judul materi maksimal 255 karakter.');
      return;
    }

    const formData = new FormData();
    formData.append('title', judul.trim());
    formData.append('description', deskripsi.trim());
    formData.append('status', statusPublikasi);

    newFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/b5/materials/${materialId}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        throw new Error(result?.message || `Gagal memperbarui materi (HTTP ${res.status}).`);
      }

      alert('Materi berhasil diperbarui!');
      if (onSaveSuccess) {
        onSaveSuccess(materialId, result.data);
      } else if (onKembali) {
        onKembali();
      }
    } catch (err) {
      console.error('Error updating material:', err);
      setFormError(err.message || 'Terjadi kesalahan saat memperbarui materi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white font-sans text-gray-500 text-xs">
        Memuat data materi untuk diedit...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 bg-white min-h-screen font-sans">
        <button
          onClick={onKembali}
          className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 mb-4 flex items-center gap-2 cursor-pointer text-xs font-semibold"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-medium">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full relative">
      {/* SIDEBAR TERPISAH */}
      <SidebarGuru 
        menuAktif="beranda" 
        onPilihMenu={(menu) => {
          if (menu === 'beranda') onKembali();
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
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; MATERI &nbsp;/&nbsp;{' '}
            <span className="font-bold text-[#17242E]">EDIT MATERI</span>
          </p>
        </div>

        {/* HEADER TITLE */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#17242E]">Edit Materi</h2>
          <p className="text-xs text-[#71808D] mt-1">
            Perbarui informasi materi pembelajaran {sectionTitle ? `untuk bagian ${sectionTitle}` : ''}.
          </p>
        </div>

        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {formError}
          </div>
        )}

        {/* FORM EDIT */}
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl">
          {/* JUDUL */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-[#17242E]">
              Judul Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Bab 4 Persamaan Garis Lurus"
              className="w-full px-4 py-3 rounded-2xl border border-cyan-100 bg-[#E0F7FA]/20 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8]"
              required
            />
          </div>

          {/* DESKRIPSI */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-[#17242E]">
              Deskripsi Materi
            </label>
            <textarea
              rows={5}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan ringkasan atau petunjuk belajar materi ini..."
              className="w-full p-4 rounded-2xl border border-gray-200 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8] bg-[#E0F7FA]/10 leading-relaxed"
            />
          </div>

          {/* STATUS PUBLIKASI */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-[#17242E]">
              Status Publikasi
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#17242E]">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={statusPublikasi === 'published'}
                  onChange={() => setStatusPublikasi('published')}
                  className="accent-[#0088A8]"
                />
                Dipublikasikan (Dapat dilihat siswa)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#17242E]">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={statusPublikasi === 'draft'}
                  onChange={() => setStatusPublikasi('draft')}
                  className="accent-[#0088A8]"
                />
                Draf (Disimpan sementara)
              </label>
            </div>
          </div>

          {/* LAMPIRAN SAAT INI (EXISTING FILES) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-[#17242E]">
              Berkas Terlampir Saat Ini ({existingFiles.length})
            </label>
            {existingFiles.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada berkas terlampir.</p>
            ) : (
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3.5 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-cyan-100 text-[#0088A8] rounded-xl shrink-0">
                        <FileIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#17242E] truncate">{file.file_name}</p>
                        <p className="text-[10px] text-gray-400">
                          {file.file_size ? formatFileSize(file.file_size) : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={deletingFileId === file.id}
                      onClick={() => handleDeleteExistingFile(file.id, file.file_name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                      title="Hapus file ini"
                    >
                      <Trash2 size={14} />
                      {deletingFileId === file.id ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UNGGAH LAMPIRAN BARU */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-[#17242E]">
              Tambah Lampiran Baru (Opsional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.zip,.ppt,.pptx"
              onChange={(e) => {
                handleAddFiles(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleAddFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed p-6 rounded-2xl text-center cursor-pointer transition ${
                isDragging
                  ? 'border-[#0088A8] bg-[#E0F7FA]/70'
                  : 'border-cyan-200 bg-[#E0F7FA]/20 hover:bg-cyan-50/50'
              }`}
            >
              <CloudUpload size={28} className="mx-auto text-[#0088A8] mb-2" />
              <p className="text-xs font-semibold text-[#17242E]">
                Klik untuk mengunggah atau seret dan lepas
              </p>
              <p className="text-[10px] text-cyan-600 mt-1">
                PDF, DOC, DOCX, ZIP, PPT, atau PPTX (Maks 10MB per file)
              </p>
            </div>

            {newFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold text-[#0088A8]">File baru yang akan diunggah:</p>
                {newFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon size={16} className="text-[#0088A8] shrink-0" />
                      <span className="font-semibold truncate">{file.name}</span>
                      <span className="text-gray-400 text-[10px]">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewFiles(newFiles.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fileError && <p className="text-xs text-red-600 mt-1">{fileError}</p>}
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onKembali}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditFileGuru;