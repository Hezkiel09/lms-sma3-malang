import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, FiTrash2, FiFileText, FiDownload, 
  FiCalendar, FiBookOpen, FiUser, FiCheckCircle, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

const DetailFileGuru = ({ materialId, courseId, onKembali, onDelete }) => {
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulasi fetch data detail materi berdasarkan ID (bisa disesuaikan dengan endpoint GET detail materi dari Rasyid nantinya)
  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        setLoading(true);
        // Contoh endpoint GET detail materi (sesuaikan jika sudah ada dari backend)
        const response = await fetch(`http://localhost:5000/api/v1/b5/materials/${materialId || 'default-id'}`);
        
        if (!response.ok) {
          throw new Error('Gagal memuat detail materi');
        }
        
        const result = await response.json();
        setMaterial(result.data);
      } catch (err) {
        // Fallback data dummy sesuai desain jika backend belum siap untuk endpoint detail spesifik
        setMaterial({
          title: "Persamaan Garis Lurus",
          date: "12 Okt 2026",
          category: "Matematika",
          description: `Materi ini membahas konsep dasar persamaan garis lurus, gradien, dan grafiknya. Peserta didik akan memahami cara menentukan gradien dari dua titik, menulis bentuk umum persamaan garis lurus, serta mengenali hubungan antara gradien, kemiringan, dan posisi garis pada bidang koordinat.

Melalui materi ini, peserta didik juga akan belajar menggambar grafik garis lurus dari persamaan yang diberikan serta menerapkan konsep tersebut untuk menyelesaikan masalah sehari-hari yang terkait dengan perubahan posisi, kecepatan, atau keterhubungan antar titik.`,
          objectives: [
            "Menentukan gradien dan persamaan garis lurus dari titik atau grafik yang diketahui.",
            "Menggambar grafik garis lurus dan menerapkannya untuk menyelesaikan masalah sehari-hari."
          ],
          fileName: "Garis Lurus.pdf",
          fileSize: "2.4 MB",
          fileUrl: "#",
          subject: "Matematika",
          targetClass: "X-A",
          uploadDate: "12 Okt 2026",
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

    fetchMaterialDetail();
  }, [materialId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 font-medium">Memuat detail materi...</p>
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
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{material?.title}</h1>
          </div>
          <button 
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition"
          >
            <FiTrash2 size={16} /> Hapus
          </button>
        </div>

        {/* Sub-info Meta */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><FiCalendar size={14} /> {material?.date}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><FiBookOpen size={14} /> {material?.category}</span>
        </div>
      </div>

      {/* Main Layout Grid (Kiri: Konten & Pratinjau, Kanan: Sidebar Informasi) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri (2 Span) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Deskripsi Materi */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Deskripsi Materi</h2>
            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {material?.description}
            </div>

            {material?.objectives && material.objectives.length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-bold text-gray-900 mb-2">Tujuan :</p>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  {material.objectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Card Pratinjau File */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Pratinjau File</h2>
            
            {/* Mockup Container PDF Viewer */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {/* Toolbar Viewer */}
              <div className="bg-white px-4 py-2 border-b border-gray-200 flex justify-between items-center text-xs text-gray-600">
                <span className="font-medium">{material?.fileName}</span>
                <div className="flex items-center gap-4">
                  <span>- 100% +</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded"><FiChevronLeft /></button>
                    <span>1 dari 12</span>
                    <button className="p-1 hover:bg-gray-100 rounded"><FiChevronRight /></button>
                  </div>
                </div>
              </div>

              {/* Isi Pratinjau Dokumen */}
              <div className="p-8 bg-white max-h-[500px] overflow-y-auto space-y-6 text-gray-800">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-base text-gray-900">BAB 4: PERSAMAAN GARIS LURUS</h3>
                  <p className="text-xs text-gray-500">Matematika - Kelas VIII SMP</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-bold text-blue-600 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span> 1. Definisi
                    </h4>
                    <p className="text-gray-600 mt-1 pl-3">
                      Persamaan garis lurus adalah suatu persamaan yang jika digambarkan ke dalam koordinat Kartesius akan membentuk sebuah garis lurus. Hubungan antara variabel x dan y bersifat linear.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-600 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span> 2. Bentuk Umum
                    </h4>
                    <div className="bg-gray-50 p-3 rounded text-center font-mono font-bold my-2 text-gray-800">
                      y = mx + c
                    </div>
                    <ul className="list-disc list-inside text-gray-600 pl-3 space-y-1 text-xs">
                      <li><strong>m</strong> adalah Gradien (kemiringan garis)</li>
                      <li><strong>c</strong> adalah Konstanta (titik potong pada sumbu y)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-600 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span> 4. Contoh Soal
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-xs">
                      <p className="font-semibold">Soal:</p>
                      <p>Tentukan persamaan garis yang melalui titik (0, 3) dan memiliki gradien m = 4.</p>
                      <p className="font-semibold pt-2">Penyelesaian:</p>
                      <p>Gunakan rumus: y = mx + c</p>
                      <p>Karena melalui (0, 3), maka c = 3.</p>
                      <p>Dengan m = 4, maka persamaannya adalah:</p>
                      <p className="font-bold">y = 4x + 3</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination Bawah Viewer */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 flex justify-center items-center gap-3">
                <button className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-600"><FiChevronLeft /></button>
                <span className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded">1 dari 12</span>
                <button className="p-1.5 border rounded-md hover:bg-gray-50 text-gray-600"><FiChevronRight /></button>
              </div>
            </div>

          </div>
        </div>

        {/* Kolom Kanan (1 Span) - Sidebar Informasi */}
        <div className="space-y-6">
          
          {/* Card Lampiran */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Lampiran</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <FiFileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{material?.fileName}</p>
                  <p className="text-xs text-gray-400">{material?.fileSize} • PDF File</p>
                </div>
              </div>
              <a 
                href={material?.fileUrl} 
                className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-lg transition"
                title="Download File"
              >
                <FiDownload size={16} />
              </a>
            </div>
          </div>

          {/* Card Informasi Tambahan */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Informasi Tambahan</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">MATA PELAJARAN</p>
                <p className="font-semibold text-gray-800">{material?.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">KELAS TARGET</p>
                <p className="font-semibold text-gray-800">{material?.targetClass}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">TANGGAL UNGGAH</p>
                <p className="font-semibold text-gray-800">{material?.uploadDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">STATUS</p>
                <div className="flex items-center gap-1.5 text-green-600 font-semibold mt-0.5">
                  <FiCheckCircle size={14} /> {material?.status}
                </div>
              </div>
            </div>
          </div>

          {/* Card Diunggah Oleh */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Diunggah Oleh</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                {material?.author?.name?.[0] || 'K'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{material?.author?.name}</p>
                <p className="text-xs text-gray-400">{material?.author?.role}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DetailFileGuru;