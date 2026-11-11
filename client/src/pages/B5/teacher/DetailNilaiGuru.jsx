import React from 'react';
import { 
  FileText, Download, 
  ArrowLeft, X 
} from 'lucide-react';

// ==========================================
// HALAMAN DETAIL NILAI GURU (SUDAH DINILAI)
// ==========================================
const DetailNilaiGuru = ({ studentData, onKembali, onEditNilai }) => {
  // Data default dengan pengaman jika studentData kosong
  const currentStudent = {
    name: studentData?.nama || "Dedi Kurniawan",
    nis: studentData?.nis || "0012348",
    kelas: "X - A",
    tugas: studentData?.asesmen || "Latihan Mandiri: Grafik Parabola",
    waktuPengumpulan: studentData?.dikumpulkan && studentData?.dikumpulkan !== '--' 
      ? studentData.dikumpulkan 
      : '22 Jan 2026, 11:05 AM',
    status: "SUDAH DINILAI",
    score: studentData?.score || 80,
    kkm: 75,
    fileName: studentData?.fileName || "Tugas_Grafikparabola_dedi_kurniawan.pdf",
    fileSize: studentData?.fileSize || "2.4 MB",
    fileUrl: studentData?.fileUrl || "",
    feedback: studentData?.feedback || "Pemahaman yang sangat baik tentang konsep inti. Langkah-langkah derivasinya logis dan terdokumentasi dengan baik. Namun, harap kerjakan konsistensi notasi matematika Anda di bagian akhir.",
    fileKoreksiName: "Koreksi_Tugas_Grafikparabola_dedi_kurniawan.pdf"
  };

  const handleDownload = (fileName) => {
    alert("Mengunduh file: " + fileName);
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
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; NILAI &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">DETAIL NILAI</span>
          </p>
        </div>
      </div>

      {/* KONTEN UTAMA: GRID 2 KOLOM (INFO SISWA & KARTU NILAI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* CARD INFORMASI SISWA (2 Kolom) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs relative flex flex-col justify-between">
          
          <div className="flex items-start justify-between">
            {/* KIRI: AVATAR IKON & DETAIL LENGKAP SISWA */}
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-full bg-[#E0F7FA]/70 border border-cyan-200 text-[#0088A8] flex items-center justify-center shrink-0 mt-0.5">
                <X size={22} className="text-[#0088A8]" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-[#054C5A]">{currentStudent.name}</h2>
                  <p className="text-xs font-normal text-[#17242E] mt-0.5">NIS: {currentStudent.nis}</p>
                </div>

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

            {/* BADGE STATUS */}
            <div>
              <span className="px-4 py-1.5 rounded-full bg-[#0088A8] text-white text-[10px] font-bold tracking-wider inline-block">
                {currentStudent.status}
              </span>
            </div>
          </div>

          {/* TOMBOL EDIT NILAI DI KANAN BAWAH */}
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => {
                if (onEditNilai) {
                  onEditNilai(currentStudent); // Memanggil fungsi edit nilai yang membawa data siswa
                }
              }}
              className="px-6 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Edit Nilai
            </button>
          </div>

        </div>

        {/* KARTU NILAI BESAR (KOLOM KANAN) */}
        <div className="bg-[#054C5A] text-white p-6 rounded-3xl shadow-md flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-cyan-200 mb-2">NILAI</p>
          <div className="w-24 h-24 rounded-full border-4 border-cyan-300 flex items-center justify-center mb-2 shadow-inner bg-[#033742]/50">
            <span className="text-3xl font-black text-white">{currentStudent.score}</span>
          </div>
          <p className="text-xs text-cyan-100">KKM: {currentStudent.kkm}</p>
        </div>

      </div>

      {/* FILE YANG DIKUMPULKAN */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-extrabold text-[#71808D] uppercase tracking-wider">File yang Dikumpulkan</h3>
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
            onClick={() => handleDownload(currentStudent.fileName)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
          >
            <Download size={15} /> Unduh
          </button>
        </div>
      </div>

      {/* UMPAN BALIK GURU */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4 mb-6">
        <h3 className="text-xs font-extrabold text-[#71808D] uppercase tracking-wider">Umpan Balik Guru</h3>
        <div className="p-4 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl">
          <p className="text-xs text-[#17242E] leading-relaxed">
            {currentStudent.feedback}
          </p>
        </div>
      </div>

      {/* FILE KOREKSI */}
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

        <div className="p-4 border border-gray-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-cyan-100/60 text-[#0088A8] rounded-xl shrink-0">
              <FileText size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#17242E] truncate">{currentStudent.fileKoreksiName}</p>
              <p className="text-[10px] text-[#71808D] mt-0.5">PDF • Hasil koreksi guru</p>
            </div>
          </div>
          <button 
            onClick={() => handleDownload(currentStudent.fileKoreksiName)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
          >
            <Download size={15} /> Unduh
          </button>
        </div>
      </div>

    </div>
  );
};

export default DetailNilaiGuru;