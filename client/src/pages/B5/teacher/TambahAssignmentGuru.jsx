import React, { useRef, useState } from 'react';
import { 
  Home, Calendar as CalendarIcon, MessageSquare, LogOut, Search, Bell, 
  BookOpen, FileText, ArrowLeft, UploadCloud, File as FileIcon, X 
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';

const BASE_URL = 'http://localhost:5000/api/v1/b5';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.zip', '.ppt', '.pptx'];

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SUBMISSION_TYPES = ['pdf', 'doc', 'zip', 'pptx', 'video', 'jpg', 'catatan', 'png'];

const TambahAssignmentGuru = ({ onKembali, onSaveSuccess, sectionId, courseId }) => {
  const [judul, setJudul] = useState('');
  const [instruksi, setInstruksi] = useState('');

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [allowLate, setAllowLate] = useState(false);
  const [submissionTypes, setSubmissionTypes] = useState(['pdf']);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // State untuk Lampiran File Tugas
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const handleAddFiles = (fileList) => {
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

    const mergedFiles = [...selectedFiles];
    validFiles.forEach((file) => {
      const exists = mergedFiles.some((f) => f.name === file.name && f.size === file.size);
      if (!exists) mergedFiles.push(file);
    });

    if (mergedFiles.length > MAX_FILES) {
      errors.push(`Maksimal ${MAX_FILES} file.`);
    }

    setSelectedFiles(mergedFiles.slice(0, MAX_FILES));
    setFileError(errors.join(' '));
  };

  const toggleSubmissionType = (type) => {
    setSubmissionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSimpanTugas = async () => {
    setSaveError('');

    if (!sectionId) {
      setSaveError('Konteks Section tujuan tidak ditemukan. Tambah tugas melalui tombol Tambah Aktivitas pada bab di halaman kelas.');
      return;
    }
    if (!judul.trim()) {
      setSaveError('Judul tugas wajib diisi.');
      return;
    }
    if (!startDate) {
      setSaveError('Tanggal mulai wajib diisi.');
      return;
    }
    if (!deadlineDate) {
      setSaveError('Tanggal selesai wajib diisi.');
      return;
    }

    const formData = new FormData();
    formData.append('section_id', sectionId);
    if (courseId) formData.append('course_id', courseId);
    formData.append('title', judul.trim());
    if (instruksi.trim()) formData.append('instructions', instruksi.trim());
    formData.append('start_date', startDate);
    formData.append('start_time', startTime);
    formData.append('deadline_date', deadlineDate);
    formData.append('deadline_time', deadlineTime);
    formData.append('submission_type', submissionTypes.length > 0 ? submissionTypes.join(',') : 'file');
    formData.append('allow_late_submission', allowLate ? 'true' : 'false');

    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    setIsSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/assignments`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal menyimpan tugas.');
      }

      alert('Tugas berhasil dibuat!');
      const newId = result.data?.id;
      if (onSaveSuccess) {
        onSaveSuccess(newId, result.data);
      } else {
        onKembali();
      }
    } catch (err) {
      console.error('Error menyimpan tugas:', err);
      setSaveError(err.message || 'Terjadi kesalahan saat menyimpan tugas.');
    } finally {
      setIsSaving(false);
    }
  };

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
          <p className="text-[11px] text-[#71808D]">BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; TUGAS &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">BUAT TUGAS</span></p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#17242E]">Tambah Tugas</h2>
          <p className="text-xs text-[#71808D] mt-1">Isi detail di bawah ini untuk membuat tugas baru bagi siswa Anda.</p>
        </div>

        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
            {saveError}
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
          {/* Judul Tugas */}
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">
              Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., Latihan Mandiri: Grafik Parabola" 
              value={judul} 
              onChange={(e) => setJudul(e.target.value)} 
              className="w-full px-4 py-3 bg-[#E0F7FA]/30 rounded-xl text-xs font-medium text-[#17242E] border border-cyan-100 focus:outline-none" 
            />
          </div>

          {/* Instruksi */}
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">Instruksi</label>
            <div className="border border-cyan-100 rounded-xl overflow-hidden">
              <div className="bg-white border-b border-gray-100 p-2 flex gap-3 text-xs text-gray-500 font-bold">
                <span>Insert</span><span>Format</span><span>Tools</span><span>Table</span><span>Help</span>
              </div>
              <textarea 
                rows={4} 
                placeholder="Tulis instruksi tugas di sini..." 
                value={instruksi} 
                onChange={(e) => setInstruksi(e.target.value)} 
                className="w-full p-4 bg-[#E0F7FA]/30 text-xs text-[#17242E] focus:outline-none" 
              />
            </div>
          </div>

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">
                TANGGAL MULAI <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 cursor-pointer" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">WAKTU MULAI</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 cursor-pointer" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">
                TANGGAL SELESAI (DEADLINE) <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={deadlineDate} 
                onChange={(e) => setDeadlineDate(e.target.value)} 
                className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 cursor-pointer" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#71808D] mb-1">WAKTU SELESAI</label>
              <input 
                type="time" 
                value={deadlineTime} 
                onChange={(e) => setDeadlineTime(e.target.value)} 
                className="w-full px-3 py-2 bg-[#E0F7FA]/30 rounded-xl text-xs text-[#17242E] border border-cyan-100 cursor-pointer" 
              />
            </div>
          </div>

          {/* Izinkan Pengumpulan Terlambat */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAllowLate((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                allowLate ? 'bg-[#0088A8]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  allowLate ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            <label className="text-xs font-semibold text-[#17242E] cursor-pointer select-none" onClick={() => setAllowLate((v) => !v)}>
              Izinkan Pengumpulan Terlambat
            </label>
          </div>

          {/* Lampiran */}
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">Lampiran (Opsional)</label>
            
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
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleAddFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed p-6 rounded-2xl text-center cursor-pointer transition ${
                isDragging ? 'border-[#0088A8] bg-[#E0F7FA]/70' : 'border-cyan-200 bg-[#E0F7FA]/20 hover:bg-cyan-50/50'
              }`}
            >
              <UploadCloud size={28} className="mx-auto text-[#0088A8] mb-2" />
              <p className="text-xs font-semibold text-[#17242E]">Klik untuk mengunggah atau seret dan lepas</p>
              <p className="text-[10px] text-cyan-600 mt-1">PDF, DOC, ZIP or PPTX (Maks 10MB)</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#E0F7FA]/50 border border-cyan-100 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon size={16} className="text-[#0088A8] shrink-0" />
                      <span className="font-semibold truncate">{file.name}</span>
                      <span className="text-gray-400 text-[10px]">({formatFileSize(file.size)})</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
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

          {/* Jenis Pengumpulan */}
          <div>
            <label className="block text-xs font-bold text-[#71808D] mb-2">Jenis Pengumpulan</label>
            <div className="grid grid-cols-2 gap-3 text-xs text-[#17242E] font-medium">
              {SUBMISSION_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={submissionTypes.includes(type)} 
                    onChange={() => toggleSubmissionType(type)} 
                    className="accent-[#0088A8]" 
                  />
                  {type.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onKembali}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer transition"
            >
              Batal
            </button>
            
            <button 
              type="button"
              onClick={handleSimpanTugas}
              disabled={isSaving}
              className="px-7 py-2.5 bg-[#054C5A] text-white rounded-xl text-xs font-bold hover:bg-[#033742] cursor-pointer transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TambahAssignmentGuru;
