import React, { useRef, useState, useEffect } from 'react';
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
  UploadCloud,
  File as FileIcon,
  X,
  Trash2,
  ExternalLink,
  Save,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const BASE_URL = 'http://localhost:5000/api/v1/b5';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.zip', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt'];

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Mengonversi string ISO ke tanggal (YYYY-MM-DD) dan waktu (HH:mm) zona Asia/Jakarta (WIB)
const parseIsoToWib = (isoString, defaultTime = '00:00') => {
  if (!isoString) return { date: '', time: defaultTime };
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: '', time: defaultTime };

  try {
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return {
      date: dateFormatter.format(d),
      time: timeFormatter.format(d),
    };
  } catch (err) {
    console.error('Error parsing date to WIB:', err);
    return { date: '', time: defaultTime };
  }
};

const EditAssignmentGuru = ({ assignmentId, onKembali, onSaveSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [judul, setJudul] = useState('');
  const [instruksi, setInstruksi] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [allowLate, setAllowLate] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');

  // Lampiran tersimpan di database
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);

  // Lampiran baru yang akan diunggah
  const [newFiles, setNewFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 1. Ambil data tugas berdasarkan ID dari database
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) {
        setLoadError('ID Tugas tidak valid.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError('');
        const res = await fetch(`${BASE_URL}/assignments/${assignmentId}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || 'Gagal memuat data tugas.');
        }

        const data = result.data;
        if (data) {
          setJudul(data.title || '');
          setInstruksi(data.instructions || data.instruction || data.description || '');
          setAllowLate(Boolean(data.allow_late_submission));
          setSectionTitle(data.section?.title || '');

          // Parse start_at ke format YYYY-MM-DD dan HH:mm WIB
          const startWib = parseIsoToWib(data.start_at || data.start_date, '10:00');
          setStartDate(startWib.date);
          setStartTime(startWib.time);

          // Parse deadline ke format YYYY-MM-DD dan HH:mm WIB
          const deadlineWib = parseIsoToWib(data.deadline || data.deadline_raw, '23:59');
          setDeadlineDate(deadlineWib.date);
          setDeadlineTime(deadlineWib.time);

          // Lampiran yang sudah ada
          const files = data.assignment_files || data.files || [];
          setExistingFiles(files);
        }
      } catch (err) {
        console.error('Error fetching assignment for edit:', err);
        setLoadError(err.message || 'Terjadi kesalahan saat memuat tugas.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Handler menambahkan file baru
  const handleAddNewFiles = (fileList) => {
    const incomingFiles = Array.from(fileList || []);
    if (incomingFiles.length === 0) return;

    const validFiles = [];
    const errors = [];

    incomingFiles.forEach((file) => {
      const extension = `.${file.name.split('.').pop()}`.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        errors.push(`${file.name}: format tidak didukung.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: ukuran > 10 MB.`);
        return;
      }
      validFiles.push(file);
    });

    const totalActiveFiles = existingFiles.length + newFiles.length + validFiles.length;
    if (totalActiveFiles > MAX_FILES) {
      errors.push(`Maksimal total ${MAX_FILES} file lampiran.`);
    }

    const remainingSlots = Math.max(0, MAX_FILES - existingFiles.length - newFiles.length);
    const filesToAdd = validFiles.slice(0, remainingSlots);

    setNewFiles((prev) => [...prev, ...filesToAdd]);
    setFileError(errors.join(' '));
  };

  // Hapus lampiran tersimpan
  const handleRemoveExistingFile = (fileId) => {
    setDeletedFileIds((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Hapus lampiran baru yang belum disimpan
  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Simpan perubahan ke backend
  const handleSimpanPerubahan = async (e) => {
    if (e) e.preventDefault();
    setSaveError('');

    if (!judul.trim()) {
      setSaveError('Judul tugas wajib diisi.');
      return;
    }
    if (!startDate) {
      setSaveError('Tanggal mulai wajib diisi.');
      return;
    }
    if (!deadlineDate) {
      setSaveError('Tanggal selesai/deadline wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', judul.trim());
      formData.append('instructions', instruksi.trim());
      formData.append('startDate', startDate);
      formData.append('startTime', startTime);
      formData.append('deadlineDate', deadlineDate);
      formData.append('deadlineTime', deadlineTime);
      formData.append('allowLateSubmission', allowLate ? 'true' : 'false');
      formData.append('deletedFileIds', JSON.stringify(deletedFileIds));

      newFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch(`${BASE_URL}/assignments/${assignmentId}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Gagal menyimpan perubahan tugas.');
      }

      alert('Perubahan tugas berhasil disimpan!');
      if (onSaveSuccess) {
        onSaveSuccess(assignmentId, result.data);
      } else {
        onKembali();
      }
    } catch (err) {
      console.error('Error updating assignment:', err);
      setSaveError(err.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#0088A8]" />
        <span className="ml-3 text-sm text-[#71808D]">Memuat data tugas...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-700 mb-4">{loadError}</p>
          <button
            onClick={onKembali}
            className="px-5 py-2 bg-[#054C5A] text-white text-xs font-bold rounded-xl hover:bg-[#033742] transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

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
              <BookOpen size={24} /><span>Bank Soal</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <FileText size={24} /><span>Rekap Nilai</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <CalendarIcon size={24} /><span>Presensi</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <MessageSquare size={24} /><span>Pesan</span>
            </a>
          </nav>
        </div>
        <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#FFF0F0] text-[#E53935] font-semibold text-sm hover:bg-red-100 transition cursor-pointer">
          <span>Keluar</span><LogOut size={22} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
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
              <Bell size={18} /><span className="absolute top-1 right-1 w-2 h-2 bg-[#00A8CC] rounded-full"></span>
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
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; TUGAS &nbsp;/&nbsp;{' '}
            <span className="font-bold text-[#17242E]">EDIT TUGAS</span>
          </p>
        </div>

        {/* TITLE */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#17242E]">Edit Tugas</h2>
          <p className="text-xs text-[#71808D] mt-1">
            Ubah informasi tugas, instruksi, tenggat waktu pengumpulan, dan kelola file lampiran.
            {sectionTitle && <span className="font-semibold text-cyan-800"> (Bab: {sectionTitle})</span>}
          </p>
        </div>

        {/* ERROR ALERT */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* FORM */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
          {/* Judul Tugas */}
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">
              Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul tugas..."
              className="w-full px-4 py-3 bg-[#E0F7FA]/30 rounded-xl text-xs font-medium text-[#17242E] border border-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Instruksi */}
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">Instruksi</label>
            <div className="border border-cyan-100 rounded-xl overflow-hidden">
              <div className="bg-white border-b border-gray-100 p-2 flex gap-3 text-xs text-gray-500 font-bold">
                <span>Insert</span>
                <span>Format</span>
                <span>Tools</span>
                <span>Table</span>
                <span>Help</span>
              </div>
              <textarea
                rows={4}
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value)}
                placeholder="Tuliskan instruksi atau panduan tugas..."
                className="w-full p-4 bg-[#E0F7FA]/30 text-xs text-[#17242E] focus:outline-none"
              />
            </div>
          </div>

          {/* Tanggal & Waktu Mulai dan Selesai (WIB) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">
                TANGGAL MULAI <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">
                WAKTU MULAI (WIB)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">
                TANGGAL SELESAI <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">
                WAKTU SELESAI (WIB)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Opsi Pengumpulan Terlambat */}
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="allowLateEdit"
              checked={allowLate}
              onChange={(e) => setAllowLate(e.target.checked)}
              className="w-4 h-4 text-[#0088A8] border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="allowLateEdit" className="text-xs font-semibold text-[#17242E] cursor-pointer">
              Izinkan pengumpulan tugas melewati tenggat waktu (terlambat)
            </label>
          </div>

          {/* LAMPIRAN TERSIMPAN (EXISTING FILES) */}
          {existingFiles.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#71808D] mb-2">
                LAMPIRAN TERSIMPAN ({existingFiles.length})
              </label>
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-[#E0F7FA]/30 border border-cyan-100 p-3 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <FileIcon size={18} className="text-[#0088A8] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#17242E] truncate block">
                          {file.file_name}
                        </span>
                        {file.file_size && (
                          <span className="text-[10px] text-[#71808D]">
                            {formatFileSize(file.file_size)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {file.signed_url || file.file_url ? (
                        <a
                          href={file.signed_url || file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#0088A8] hover:bg-cyan-100 rounded-lg transition"
                          title="Lihat / Unduh File"
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingFile(file.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Hapus Lampiran Ini"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD LAMPIRAN BARU */}
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">
              TAMBAH LAMPIRAN BARU (OPSIONAL)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleAddNewFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 rounded-2xl text-center cursor-pointer transition ${
                isDragging
                  ? 'border-[#0088A8] bg-[#E0F7FA]/40'
                  : 'border-cyan-200 bg-[#E0F7FA]/20 hover:bg-[#E0F7FA]/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(',')}
                className="hidden"
                onChange={(e) => handleAddNewFiles(e.target.files)}
              />
              <UploadCloud size={28} className="mx-auto text-[#0088A8] mb-2" />
              <p className="text-xs font-semibold text-[#17242E]">
                Klik untuk mengunggah atau seret dan lepas file di sini
              </p>
              <p className="text-[10px] text-cyan-600 mt-1">
                PDF, DOC, ZIP, PPTX, XLS, Gambar (Maks 10MB per file)
              </p>
            </div>

            {fileError && <p className="text-[11px] text-red-500 mt-2">{fileError}</p>}

            {/* List File Baru */}
            {newFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {newFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-cyan-50/60 border border-cyan-200 p-2.5 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-4">
                      <FileIcon size={16} className="text-[#0088A8] shrink-0" />
                      <span className="text-xs font-medium text-[#17242E] truncate">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[#71808D]">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onKembali}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer transition disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSimpanPerubahan}
              disabled={isSaving}
              className="px-7 py-2.5 bg-[#054C5A] text-white rounded-xl text-xs font-bold hover:bg-[#033742] cursor-pointer transition shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditAssignmentGuru;
