import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Trash2, FileText, Download, 
  Calendar, BookOpen, User, CheckCircle, ChevronLeft, ChevronRight, Layers 
} from 'lucide-react';

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
        // Fallback data dummy jika API belum merespons penuh agar tampilan Figma langsung terlihat
        setMaterial({
          title: "Persamaan Garis Lurus",
          created_at: "12 Okt 2026",
          category: "Matematika",
          targetClass: "X-A",
          description: `Materi ini membahas konsep dasar persamaan garis lurus, gradien, dan grafiknya. Peserta didik akan memahami cara menentukan gradien dari dua titik, menulis bentuk umum persamaan garis lurus, serta mengenali hubungan antara gradien, kemiringan, dan posisi garis pada bidang koordinat.

Melalui materi ini, peserta didik juga akan belajar menggambar grafik garis lurus dari persamaan yang diberikan serta menerapkan konsep tersebut untuk menyelesaikan masalah sehari-hari yang terkait dengan perubahan posisi, kecepatan, atau keterhubungan antar titik.`,
          objectives: [
            "Menentukan gradien dan persamaan garis lurus dari titik atau grafik yang diketahui.",
            "Menggambar grafik garis lurus dan menerapkannya untuk menyelesaikan masalah sehari-hari."
          ],
          fileName: "Garis Lurus.pdf",
          fileSize: "2.4 MB",
          file_url: "#",
          subject: "Matematika",
          status: "Published",
          author: {
            name: "Karina",
            role: "Guru Matematika"
          }
        });
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
            <h1 className="text-2xl font-bold text-[#17242E]">{material?.title}</h1>
          </div>

          <button 
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFF0F0] hover:bg-red-100 text-[#E53935] rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>

        {/* SUB-INFO META */}
        <div className="flex items-center gap-4 mt-3 text-xs text-[#71808D]">
          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-cyan-600" /> {material?.created_at ? new Date(material.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Okt 2026'}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Layers size={14} className="text-cyan-600" /> {material?.targetClass || 'X-A'}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-cyan-600" /> {material?.subject || 'Matematika'}</span>
        </div>
      </div>

      {/* MAIN LAYOUT GRID (Kiri: Konten & Pratinjau, Kanan: Sidebar Informasi) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2 Span) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD DESKRIPSI MATERI */}
          <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#17242E]">Deskripsi Materi</h2>
            <div className="text-[#17242E] text-xs leading-relaxed whitespace-pre-line">
              {material?.description}
            </div>

            {material?.objectives && material.objectives.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-[#17242E] mb-2">Tujuan :</p>
                <ol className="list-decimal list-inside text-xs text-[#17242E] space-y-1">
                  {material.objectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* CARD PRATINJAU FILE */}
          <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#17242E]">Pratinjau File</h2>
            
            {/* MOCKUP CONTAINER PDF VIEWER */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
              
              {/* Toolbar Viewer */}
              <div className="bg-white px-4 py-2.5 border-b border-gray-200 flex justify-between items-center text-xs text-gray-600">
                <span className="font-bold text-[#17242E]">{material?.fileName || 'Garis Lurus.pdf'}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">- &nbsp; 100% &nbsp; +</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded cursor-pointer"><ChevronLeft size={14} /></button>
                    <span className="text-[11px] font-semibold text-gray-600">1 dari 12</span>
                    <button className="p-1 hover:bg-gray-100 rounded cursor-pointer"><ChevronRight size={14} /></button>
                  </div>
                </div>
              </div>

              {/* Isi Pratinjau Dokumen Sesuai Figma */}
              <div className="p-8 bg-white max-h-[500px] overflow-y-auto space-y-6 text-[#17242E]">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-[#17242E]">BAB 4: PERSAMAAN GARIS LURUS</h3>
                  <p className="text-[11px] text-gray-400">Matematika - Kelas VIII SMP</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-[#0088A8] flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-[#0088A8] rounded-full inline-block"></span> 1. Definisi
                    </h4>
                    <p className="text-gray-600 mt-1 pl-3">
                      Persamaan garis lurus adalah suatu persamaan yang jika digambarkan ke dalam koordinat Kartesius akan membentuk sebuah garis lurus. Hubungan antara variabel x dan y bersifat linear.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0088A8] flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-[#0088A8] rounded-full inline-block"></span> 2. Bentuk Umum
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-xl text-center font-mono font-bold my-2 text-[#17242E] border border-gray-100">
                      y = mx + c
                    </div>
                    <ul className="list-disc list-inside text-gray-600 pl-3 space-y-1 text-[11px]">
                      <li><strong>m</strong> adalah Gradien (kemiringan garis)</li>
                      <li><strong>c</strong> adalah Konstanta (titik potong pada sumbu y)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0088A8] flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-[#0088A8] rounded-full inline-block"></span> 4. Contoh Soal
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-[11px] border border-gray-100">
                      <p className="font-semibold">Soal:</p>
                      <p>Tentukan persamaan garis yang melalui titik (0, 3) dan memiliki gradien m = 4.</p>
                      <p className="font-semibold pt-2">Penyelesaian:</p>
                      <p>Gunakan rumus: y = mx + c</p>
                      <p>Karena melalui (0, 3), maka c = 3.</p>
                      <p>Dengan m = 4, maka persamaannya adalah:</p>
                      <p className="font-bold text-[#0088A8]">y = 4x + 3</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination Bawah Viewer */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 flex justify-center items-center gap-3">
                <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer"><ChevronLeft size={14} /></button>
                <span className="text-[11px] font-semibold px-3 py-1 bg-gray-100 rounded-lg text-gray-600">1 dari 12</span>
                <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer"><ChevronRight size={14} /></button>
              </div>
            </div>

          </div>
        </div>

        {/* KOLOM KANAN (1 Span) - SIDEBAR INFORMASI */}
        <div className="space-y-6">
          
          {/* CARD LAMPIRAN */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Lampiran</h3>
            <div className="flex items-center justify-between p-3.5 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-100/50 text-[#0088A8] rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#17242E]">{material?.fileName || 'Garis Lurus.pdf'}</p>
                  <p className="text-[10px] text-gray-400">{material?.fileSize || '2.4 MB'} • PDF File</p>
                </div>
              </div>
              <a 
                href={material?.file_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs"
                title="Download File"
              >
                <Download size={16} />
              </a>
            </div>
          </div>

          {/* CARD INFORMASI TAMBAHAN */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Informasi Tambahan</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wide">MATA PELAJARAN</p>
                <p className="font-semibold text-[#17242E] mt-0.5">{material?.subject || 'Matematika'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wide">KELAS TARGET</p>
                <p className="font-semibold text-[#17242E] mt-0.5">{material?.targetClass || 'X-A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wide">TANGGAL UNGGAH</p>
                <p className="font-semibold text-[#17242E] mt-0.5">{material?.created_at ? new Date(material.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Okt 2026'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wide">STATUS</p>
                <div className="flex items-center gap-1.5 text-green-600 font-semibold mt-0.5">
                  <CheckCircle size={14} /> {material?.status || 'Published'}
                </div>
              </div>
            </div>
          </div>

          {/* CARD DIUNGGAH OLEH */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Diunggah Oleh</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 text-[#0088A8] flex items-center justify-center font-bold text-sm">
                {material?.author?.name?.[0] || 'K'}
              </div>
              <div>
                <p className="text-xs font-bold text-[#17242E]">{material?.author?.name || 'Karina'}</p>
                <p className="text-[11px] text-gray-400">{material?.author?.role || 'Guru Matematika'}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DetailFileGuru;