import React, { useState } from 'react';
import { 
  FileText, Download, 
  ArrowLeft, ChevronLeft, ChevronRight, UploadCloud, 
  History 
} from 'lucide-react';

// ==========================================
// HALAMAN TINJAU & NILAI GURU
// ==========================================
const TinjauNilaiGuru = ({ studentData, onKembali, onSimpanSukses }) => {
  // State untuk input nilai dan feedback
  const [nilai, setNilai] = useState(
  studentData?.score ?? ''
);
  const [feedback, setFeedback] = useState('');
  const [fileKoreksi, setFileKoreksi] = useState(null);

  // Data default dengan pengaman jika studentData kosong
  const currentStudent = {
  name: studentData?.nama || "Dedi Kurniawan",
  nis: studentData?.nis || "0012345",
  kelas: studentData?.kelas || "X - A",
  tugas: studentData?.asesmen || "Latihan Mandiri: Grafik Parabola",
  waktuPengumpulan:
    studentData?.dikumpulkan &&
    studentData.dikumpulkan !== '--'
      ? studentData.dikumpulkan
      : 'Belum mengumpulkan',
  status: studentData?.status || "DISERAHKAN",
  fileName:
    studentData?.fileName ||
    "Tugas_Grafikparabola_dedi_kurniawan.pdf",
  fileSize: studentData?.fileSize || "2.4 MB",
  fileUrl: studentData?.fileUrl || "",
  score: studentData?.score ?? null,
  feedback: studentData?.feedback || ""
};

  const handleSimpanNilai = (e) => {
  e.preventDefault();

  const nilaiAngka = Number(nilai);

  if (
    nilai === '' ||
    !Number.isFinite(nilaiAngka) ||
    nilaiAngka < 0 ||
    nilaiAngka > 100
  ) {
    alert('Masukkan nilai yang valid antara 0 sampai 100.');
    return;
  }

  const dataNilai = {
    ...currentStudent,
    score: nilaiAngka,
    feedback: feedback,
    status: "SUDAH DINILAI"
  };

  if (onSimpanSukses) {
    onSimpanSukses(dataNilai);
  } else {
    alert('Nilai berhasil diproses.');
  }
};

  const handleDownload = () => {
    if (!currentStudent.fileUrl) {
      alert("Mengunduh file siswa: " + currentStudent.fileName);
      return;
    }
    const link = document.createElement("a");
    link.href = currentStudent.fileUrl;
    link.download = currentStudent.fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="w-full font-sans text-[#17242E]">

      {/* BREADCRUMB */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onKembali}
            className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">TINJAU &amp; NILAI</span>
          </p>
        </div>

        {/* TOMBOL NAVIGASI SEBELUMNYA / BERIKUTNYA */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("Navigasi ke siswa sebelumnya")}
            className="px-4 py-2 rounded-full border border-cyan-200 text-xs font-bold text-[#007A99] hover:bg-cyan-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <button 
            onClick={() => alert("Navigasi ke siswa berikutnya")}
            className="px-4 py-2 rounded-full border border-cyan-200 text-xs font-bold text-[#007A99] hover:bg-cyan-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            Berikutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* HEADER JUDUL */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#17242E]">Tinjau &amp; Nilai Pengumpulan</h1>
        <p className="text-xs text-[#71808D] mt-1">Tinjau jawaban atau file siswa, berikan anotasi, masukkan nilai, lalu simpan penilaian atau minta revisi.</p>
      </div>

      {/* KONTEN UTAMA: GRID 2 KOLOM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2 Kolom span) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD INFORMASI SISWA & PENGUMPULAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs relative flex items-start justify-between">
            
            {/* KIRI: AVATAR & DETAIL LENGKAP SISWA */}
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-full bg-[#E0F7FA]/60 border border-cyan-200 text-[#0088A8] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-lg font-bold">{currentStudent?.name ? currentStudent.name.charAt(0) : 'D'}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-[#054C5A]">{currentStudent.name}</h2>
                  <p className="text-xs font-normal text-[#17242E] mt-0.5">NIS: {currentStudent.nis}</p>
                </div>

                {/* DETAIL INFORMASI: KELAS, TUGAS, WAKTU PENGUMPULAN */}
                <div className="flex flex-wrap items-start gap-12 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-[#0088A8] tracking-wider uppercase mb-0.5">KELAS</p>
                    <p className="font-normal text-[#17242E]">{currentStudent.kelas}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#0088A8] tracking-wider uppercase mb-0.5">TUGAS</p>
                    <p className="font-normal text-[#17242E]">{currentStudent.tugas}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#0088A8] tracking-wider uppercase mb-0.5">WAKTU PENGUMPULAN</p>
                    <p className="font-normal text-[#17242E]">{currentStudent.waktuPengumpulan}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BADGE STATUS DI KANAN ATAS */}
            <div>
              <span className={`px-4 py-1.5 rounded-full text-white text-[10px] font-bold tracking-wider inline-block ${
                currentStudent.status === 'SUDAH DINILAI' ? 'bg-[#10B981]' : 
                currentStudent.status === 'TERLAMBAT' ? 'bg-orange-500' : 'bg-[#0088A8]'
              }`}>
                {currentStudent.status}
              </span>
            </div>

          </div>

          {/* CARD FILE YANG DIKUMPULKAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#71808D] uppercase tracking-wider">File yang Dikumpulkan</h3>
              <span className="text-[11px] text-[#71808D]">1 file terkait</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 bg-cyan-100/60 text-[#0088A8] rounded-xl shrink-0">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#17242E] truncate">{currentStudent.fileName}</p>
                  <p className="text-[10px] text-[#71808D] mt-0.5">DOKUMEN PDF • {currentStudent.fileSize}</p>
                </div>
              </div>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
              >
                <Download size={15} /> Unduh
              </button>
            </div>
          </div>

          {/* CARD UNGGAH KOREKSI FILE */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-[#71808D] uppercase tracking-wider">Unggah File Koreksi</h3>
            
            <label className="border-2 border-dashed border-cyan-200 hover:border-[#0088A8] bg-cyan-50/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition">
              <div className="w-12 h-12 rounded-full bg-cyan-100 text-[#0088A8] flex items-center justify-center mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-xs font-bold text-[#17242E]">Klik untuk mengunggah atau seret dan lepaskan file ke sini</p>
              <p className="text-[11px] text-[#71808D] mt-1">PDF, DOC, ZIP, atau PPTX (maks. 10 MB)</p>
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setFileKoreksi(e.target.files[0])}
              />
            </label>
            {fileKoreksi && (
              <p className="text-xs text-cyan-800 font-semibold">File terpilih: {fileKoreksi.name}</p>
            )}
          </div>

        </div>

        {/* KOLOM KANAN: PANEL PENILAIAN & RIWAYAT */}
        <div className="space-y-6">
          
          {/* PANEL PENILAIAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-5">
            <h3 className="text-xs font-bold text-[#71808D] uppercase tracking-wider">Penilaian</h3>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#71808D] tracking-wider uppercase">Nilai</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={nilai}
                    onChange={(e) => setNilai(e.target.value)}
                    placeholder="00"
                    className="w-full py-3 px-4 bg-[#E0F7FA]/40 border border-cyan-200 rounded-2xl text-center text-lg font-bold text-[#007A99] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <span className="text-sm font-bold text-[#71808D]">/ 100</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#71808D] tracking-wider uppercase">Umpan Balik (Opsional)</label>
              <textarea 
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tambahkan komentar atau umpan balik untuk siswa..."
                className="w-full p-3.5 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl text-xs text-[#17242E] focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 resize-none"
              />
            </div>

            <button 
              onClick={handleSimpanNilai}
              className="w-full py-3.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-2xl text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              Simpan Nilai
            </button>
          </div>

          {/* PANEL RIWAYAT STATUS */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#71808D] uppercase tracking-wider">Riwayat Status</h3>
              <History size={16} className="text-gray-400" />
            </div>

            <div className="space-y-4 pt-2 relative border-l-2 border-cyan-100 ml-2 pl-4">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0088A8]"></span>
                <p className="text-xs font-bold text-[#17242E]">Ditetapkan</p>
                <p className="text-[10px] text-[#71808D] mt-0.5">20 Jan 2026, 10:00 AM</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0088A8]"></span>
                <p className="text-xs font-bold text-[#17242E]">Dikumpulkan</p>
                <p className="text-[10px] text-[#71808D] mt-0.5">22 Jan 2026, 11:05 AM</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0088A8]"></span>
                <p className="text-xs font-bold text-[#17242E]">Sedang Ditinjau</p>
                <p className="text-[10px] text-[#71808D] mt-0.5">Sedang diedit</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TinjauNilaiGuru;