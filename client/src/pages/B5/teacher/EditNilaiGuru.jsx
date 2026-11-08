import React, { useState } from 'react';
import { 
  FileText, Download, 
  ArrowLeft, ChevronLeft, ChevronRight, MoreHorizontal, X 
} from 'lucide-react';

// ==========================================
// HALAMAN EDIT NILAI GURU
// ==========================================
const EditNilaiGuru = ({ studentData, onSimpanPerubahan, onBatal }) => {
  // State untuk nilai dan feedback yang bisa diedit
  const [nilai, setNilai] = useState(studentData?.nilai !== '--' ? studentData?.nilai : '85');
  const [feedback, setFeedback] = useState(
    studentData?.feedback || "Pemahaman yang sangat baik tentang konsep inti. Langkah-langkah derivasinya logis dan terdokumentasi dengan baik. Namun, harap kerjakan konsistensi notasi matematika Anda di bagian akhir."
  );
  const [showMenuFile, setShowMenuFile] = useState(false);

  // Data default dengan pengaman jika studentData kosong
  const currentStudent = {
    name: studentData?.nama || "Dedi Kurniawan",
    nis: studentData?.nis || "0012348",
    kelas: "X - A",
    tugas: studentData?.asesmen || "Latihan Mandiri: Grafik Parabola",
    waktuPengumpulan: studentData?.dikumpulkan && studentData?.dikumpulkan !== '--' 
      ? studentData.dikumpulkan 
      : '18 Jan 2026, 14:30 PM',
    status: "SUDAH DINILAI",
    fileName: studentData?.fileName || "Tugas_Grafikparabola_dedi_kurniawan.pdf",
    fileSize: studentData?.fileSize || "2.4 MB",
    fileUrl: studentData?.fileUrl || "",
    fileKoreksiName: "Koreksi_Tugas_Grafikparabola_dedi_kurniawan.pdf"
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    if (nilai === '' || isNaN(nilai) || nilai < 0 || nilai > 100) {
      alert('Masukkan nilai yang valid antara 0 sampai 100.');
      return;
    }
    alert(`Perubahan nilai untuk ${currentStudent.name} berhasil disimpan!`);
     
    if (onSimpanPerubahan) {
      onSimpanPerubahan({ 
        ...studentData, 
        score: nilai, 
        nilai: nilai,
        feedback: feedback,
        status: "SUDAH DINILAI"
      });
    }
  };

  const handleDownload = (fileName) => {
    alert("Mengunduh berkas: " + fileName);
  };

  return (
    <div className="w-full font-sans text-[#17242E]">

      {/* BREADCRUMB & TOMBOL NAVIGASI SEBELUMNYA/BERIKUTNYA */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBatal}
            className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; NILAI &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">EDIT NILAI</span>
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
        <p className="text-xs text-[#71808D] mt-1">Tinjau jawaban/file siswa, berikan anotasi, masukkan nilai, dan simpan penilaian atau minta revisi.</p>
      </div>

      {/* KONTEN UTAMA: GRID 2 KOLOM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2 Kolom span) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD INFORMASI SISWA & PENGUMPULAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs relative flex items-start justify-between">
            
            {/* KIRI: AVATAR & DETAIL LENGKAP SISWA */}
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-full bg-[#E0F7FA]/70 border border-cyan-200 text-[#0088A8] flex items-center justify-center shrink-0 mt-0.5">
                <X size={22} className="text-[#0088A8]" />
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

            {/* BADGE STATUS SUDAH DINILAI */}
            <div>
              <span className="px-4 py-1.5 rounded-full bg-[#0088A8] text-white text-[10px] font-bold tracking-wider inline-block">
                {currentStudent.status}
              </span>
            </div>

          </div>

          {/* CARD BERKAS YANG DIKUMPULKAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-[#71808D] uppercase tracking-wider">Berkas yang Dikumpulkan</h3>
              <span className="text-[11px] text-[#71808D]">1 Berkas Terkait</span>
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
                onClick={() => handleDownload(currentStudent.fileName)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
              >
                <Download size={15} /> Unduh
              </button>
            </div>
          </div>

          {/* FILE KOREKSI (SUDAH DIKOREKSI) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-extrabold text-[#71808D] uppercase tracking-wider">File Koreksi</h3>
                <p className="text-[11px] text-[#71808D] mt-0.5">Hasil koreksi tinjauan guru</p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-[#0088A8] text-white text-[10px] font-bold tracking-wider">
                SUDAH DIKOREKSI
              </span>
            </div>

            <div className="p-4 border border-gray-200 rounded-2xl flex items-center justify-between relative">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 bg-cyan-100/60 text-[#0088A8] rounded-xl shrink-0">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#17242E] truncate">{currentStudent.fileKoreksiName}</p>
                  <p className="text-[10px] text-[#71808D] mt-0.5">PDF • Hasil koreksi guru</p>
                </div>
              </div>

              {/* TOMBOL TITIK TIGA (MENU FILE KOREKSI) */}
              <div className="relative">
                <button 
                  onClick={() => setShowMenuFile(!showMenuFile)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                >
                  <MoreHorizontal size={18} />
                </button>

                {showMenuFile && (
                  <div className="absolute right-0 bottom-full mb-2 w-28 bg-white border border-gray-200 rounded-xl shadow-md py-1.5 z-10 text-xs">
                    <button 
                      onClick={() => { alert("Edit file koreksi"); setShowMenuFile(false); }}
                      className="w-full px-3 py-1.5 text-left hover:bg-cyan-50 text-[#17242E]"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => { alert("Hapus file koreksi"); setShowMenuFile(false); }}
                      className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: PANEL PENILAIAN & TOMBOL AKSI */}
        <div className="space-y-6">
          
          {/* PANEL PENILAIAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-5">
            <h3 className="text-xs font-extrabold text-[#71808D] uppercase tracking-wider">PENILAIAN</h3>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-[#71808D] tracking-wider uppercase mb-2">NILAI</label>
               
              {/* KOTAK INPUT NILAI MENYESUAIKAN FIGMA */}
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={nilai}
                  onChange={(e) => setNilai(e.target.value)}
                  className="w-32 py-3 px-4 bg-[#E0F7FA]/40 border border-cyan-200 rounded-2xl text-center text-xl font-bold text-[#007A99] focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
                />
                <span className="text-base font-bold text-gray-400">/ 100</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-[#71808D] tracking-wider uppercase">FEEDBACK (OPSIONAL)</label>
              <textarea 
                rows="5"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3.5 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl text-xs text-[#17242E] focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none leading-relaxed"
              />
            </div>

            {/* TOMBOL SIMPAN PERUBAHAN & BATAL */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={handleSimpan}
                className="w-full py-3.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-2xl text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                Simpan Perubahan
              </button>
              <button 
                onClick={onBatal}
                className="w-full py-3.5 bg-[#E0F7FA]/50 hover:bg-[#E0F7FA] text-[#007A99] rounded-2xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border border-cyan-100"
              >
                Batal
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EditNilaiGuru;