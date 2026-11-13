import React, { useState } from 'react';
import { 
  FileText, Download, 
  ArrowLeft, ChevronLeft, ChevronRight, MoreHorizontal, X, UploadCloud 
} from 'lucide-react';

// ==========================================
// HALAMAN EDIT NILAI GURU (UC-07)
// ==========================================
const EditNilaiGuru = ({ studentData, onSimpanPerubahan, onBatal }) => {
  const [nilai, setNilai] = useState(
    studentData?.score !== null && studentData?.score !== undefined 
      ? String(studentData.score) 
      : studentData?.nilai !== '--' 
        ? String(studentData?.nilai || '85') 
        : '85'
  );
  const [feedback, setFeedback] = useState(
    studentData?.feedback || "Pemahaman yang baik tentang materi. Silakan periksa kembali ketelitian dalam langkah pengerjaan."
  );
  const [showMenuFile, setShowMenuFile] = useState(false);
  const [fileKoreksi, setFileKoreksi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileKoreksiTerhapus, setFileKoreksiTerhapus] = useState(false);

  // Data default dengan pengaman jika studentData kosong
  const currentStudent = {
    id: studentData?.id || studentData?.submission_id,
    submission_id: studentData?.submission_id || studentData?.id,
    name: studentData?.nama || studentData?.name || "Dedi Kurniawan",
    nis: studentData?.nis || "0012348",
    kelas: studentData?.kelas || "X - A",
    tugas: studentData?.asesmen || "Latihan Mandiri: Grafik Parabola",
    waktuPengumpulan: studentData?.dikumpulkan && studentData?.dikumpulkan !== '--' 
      ? studentData.dikumpulkan 
      : '18 Jan 2026, 14:30 PM',
    status: studentData?.status || "SUDAH DINILAI",
    fileName: studentData?.fileName || studentData?.file || "Tugas_Grafikparabola_dedi_kurniawan.pdf",
    fileSize: studentData?.fileSize || "2.4 MB",
    fileUrl: studentData?.fileUrl || "",
    fileKoreksiName: studentData?.fileKoreksiName || null,
    fileKoreksiUrl: studentData?.fileKoreksiUrl || null,
    fileKoreksiId: studentData?.correction_files?.[0]?.id || null,
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    const nilaiAngka = Number(nilai);
    if (nilai === '' || isNaN(nilaiAngka) || nilaiAngka < 0 || nilaiAngka > 100) {
      alert('Masukkan nilai yang valid antara 0 sampai 100.');
      return;
    }

    const subId = currentStudent.submission_id;
    const isUuid = typeof subId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subId);

    if (isUuid) {
      try {
        setLoading(true);
        let res;
        if (fileKoreksi) {
          const formData = new FormData();
          formData.append('score', String(nilaiAngka));
          if (feedback) formData.append('feedback', feedback);
          formData.append('files', fileKoreksi);
          if (fileKoreksiTerhapus && currentStudent.fileKoreksiId) {
            formData.append('removeCorrectionFileId', currentStudent.fileKoreksiId);
          }
          res = await fetch(`http://localhost:5000/api/v1/b5/submissions/${subId}/grade`, {
            method: 'PUT',
            body: formData,
          });
        } else {
          res = await fetch(`http://localhost:5000/api/v1/b5/submissions/${subId}/grade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              score: nilaiAngka, 
              feedback,
              removeCorrectionFileId: fileKoreksiTerhapus ? currentStudent.fileKoreksiId : undefined,
            }),
          });
        }

        const json = await res.json();
        if (!res.ok) {
          alert(json.message || 'Gagal menyimpan perubahan nilai.');
          setLoading(false);
          return;
        }

        alert(`Perubahan nilai untuk ${currentStudent.name} berhasil disimpan!`);
        if (onSimpanPerubahan) {
          onSimpanPerubahan(json.data);
        }
      } catch (err) {
        console.error('Error saat menyimpan nilai:', err);
        alert('Terjadi kesalahan koneksi saat menyimpan nilai.');
      } finally {
        setLoading(false);
      }
    } else {
      alert(`Perubahan nilai untuk ${currentStudent.name} berhasil disimpan!`);
      if (onSimpanPerubahan) {
        onSimpanPerubahan({ 
          ...studentData, 
          score: nilaiAngka, 
          nilai: nilaiAngka,
          feedback: feedback,
          status: "SUDAH DINILAI",
          fileKoreksiName: fileKoreksi ? fileKoreksi.name : (fileKoreksiTerhapus ? null : currentStudent.fileKoreksiName),
        });
      }
    }
  };

  const handleHapusFileKoreksi = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus file koreksi ini?")) {
      return;
    }

    const subId = currentStudent.submission_id;
    const fileId = currentStudent.fileKoreksiId;
    const isUuid = typeof subId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subId);

    if (isUuid && fileId) {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/b5/submissions/${subId}/correction-files/${fileId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          alert("File koreksi berhasil dihapus dari database.");
        }
      } catch (err) {
        console.warn("Gagal menghapus file koreksi via API:", err);
      }
    }

    setFileKoreksiTerhapus(true);
    setShowMenuFile(false);
  };

  const handleDownload = (fileUrl, fileName) => {
    if (!fileUrl) {
      alert("Berkas belum tersedia untuk diunduh.");
      return;
    }
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "file";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const adaFileKoreksi = (currentStudent.fileKoreksiName || fileKoreksi) && !fileKoreksiTerhapus;

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
            onClick={() => alert("Fitur navigasi antar siswa tersedia saat daftar siswa aktif.")}
            className="px-4 py-2 rounded-full border border-cyan-200 text-xs font-bold text-[#007A99] hover:bg-cyan-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <button 
            onClick={() => alert("Fitur navigasi antar siswa tersedia saat daftar siswa aktif.")}
            className="px-4 py-2 rounded-full border border-cyan-200 text-xs font-bold text-[#007A99] hover:bg-cyan-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            Berikutnya <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* HEADER JUDUL */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#17242E]">Edit Nilai &amp; Evaluasi Pengumpulan</h1>
        <p className="text-xs text-[#71808D] mt-1">Perbarui nilai, ubah catatan evaluasi, atau perbarui file koreksi untuk siswa.</p>
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

            {/* BADGE STATUS SUDAH DINILAI */}
            <div>
              <span className="px-4 py-1.5 rounded-full bg-[#0088A8] text-white text-[10px] font-bold tracking-wider inline-block">
                {String(currentStudent.status).toUpperCase()}
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
                  <p className="text-[10px] text-[#71808D] mt-0.5">DOKUMEN • {currentStudent.fileSize}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(currentStudent.fileUrl, currentStudent.fileName)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
              >
                <Download size={15} /> Unduh
              </button>
            </div>
          </div>

          {/* FILE KOREKSI (SUDAH DIKOREKSI ATAU UPLOAD BARU) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-extrabold text-[#71808D] uppercase tracking-wider">File Koreksi</h3>
                <p className="text-[11px] text-[#71808D] mt-0.5">Hasil koreksi evaluasi guru</p>
              </div>
              {adaFileKoreksi && (
                <span className="px-3.5 py-1.5 rounded-full bg-[#0088A8] text-white text-[10px] font-bold tracking-wider">
                  SUDAH DIKOREKSI
                </span>
              )}
            </div>

            {adaFileKoreksi ? (
              <div className="p-4 border border-gray-200 rounded-2xl flex items-center justify-between relative">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-3 bg-cyan-100/60 text-[#0088A8] rounded-xl shrink-0">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#17242E] truncate">
                      {fileKoreksi ? fileKoreksi.name : currentStudent.fileKoreksiName}
                    </p>
                    <p className="text-[10px] text-[#71808D] mt-0.5">PDF / Dokumen • Hasil koreksi guru</p>
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
                      <label 
                        htmlFor="ganti-file-koreksi" 
                        className="block w-full px-3 py-1.5 text-left hover:bg-cyan-50 text-[#17242E] cursor-pointer"
                      >
                        Ganti
                      </label>
                      <button 
                        onClick={handleHapusFileKoreksi}
                        className="w-full px-3 py-1.5 text-left hover:bg-red-50 text-red-600 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                  <input 
                    id="ganti-file-koreksi"
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFileKoreksi(e.target.files[0]);
                        setFileKoreksiTerhapus(false);
                        setShowMenuFile(false);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-cyan-200 hover:border-[#0088A8] bg-cyan-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition">
                <UploadCloud size={24} className="text-[#0088A8] mb-2" />
                <p className="text-xs font-bold text-[#17242E]">Unggah File Koreksi Baru</p>
                <p className="text-[10px] text-[#71808D] mt-0.5">PDF, DOC, ZIP (Maks 10MB)</p>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setFileKoreksi(e.target.files[0]);
                      setFileKoreksiTerhapus(false);
                    }
                  }}
                />
              </label>
            )}
          </div>

        </div>

        {/* KOLOM KANAN: PANEL PENILAIAN & TOMBOL AKSI */}
        <div className="space-y-6">
          
          {/* PANEL PENILAIAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-5">
            <h3 className="text-xs font-extrabold text-[#71808D] uppercase tracking-wider">PENILAIAN</h3>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-[#71808D] tracking-wider uppercase mb-2">NILAI</label>
               
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
                disabled={loading}
                className={`w-full py-3.5 text-white rounded-2xl text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#054C5A] hover:bg-[#033742]'
                }`}
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
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
