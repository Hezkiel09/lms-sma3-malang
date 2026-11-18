import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, FileText, Download,
    Calendar, BookOpen, CheckCircle, Layers
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import { getStudentMaterialDetail } from './studentApi';

const DetailMateriSiswa = ({ materialId, onKembali, onKeDashboard, onKeProfil, onPilihNotif }) => {
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const formatSafeDate = (val, options = { day: 'numeric', month: 'short', year: 'numeric' }, fallback = '12 Okt 2026') => {
        if (!val) return fallback;
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d.toLocaleDateString('id-ID', options);
    };

    // State interaktif untuk tombol "Mark as Completed"
    const [isCompleted, setIsCompleted] = useState(false);

    const fetchMaterialDetail = async () => {
        if (!materialId) {
            // Data dummy/fallback jika materialId belum dikirim secara spesifik
            setMaterial({
                title: "Persamaan Garis Lurus",
                description: `Materi ini membahas konsep dasar persamaan garis lurus, gradien, dan grafiknya. Peserta didik akan memahami cara menentukan gradien dari dua titik, menulis bentuk umum persamaan garis, serta mengenali hubungan antara gradien, kemiringan, dan posisi garis pada bidang koordinat.\n\nMelalui materi ini, peserta didik juga akan belajar menggambar grafik garis lurus dari persamaan yang diberikan serta menerapkan konsep tersebut untuk menyelesaikan masalah sehari-hari yang terkait dengan perubahan posisi, kecepatan, atau keterhubungan antar titik.\n\nTujuan:\n1. Menentukan gradien dan persamaan garis lurus dari titik atau grafik yang diketahui.\n2. Menggambar grafik garis lurus dan menerapkannya untuk menyelesaikan masalah sehari-hari.`,
                created_at: "2026-10-12",
                status: "published",
                section: { title: "Persamaan Garis Lurus" },
                material_files: [
                    {
                        id: 1,
                        file_name: "Garis Lurus.pdf",
                        file_size: 2516582,
                        file_url: "#"
                    }
                ]
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await getStudentMaterialDetail(materialId);
            setMaterial(result);
        } catch (err) {
            console.error('Error fetching detail materi:', err);
            setError(err.message || 'Gagal memuat detail materi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterialDetail();
    }, [materialId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white font-sans text-xs text-gray-500">
                Memuat detail materi...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white font-sans text-xs text-gray-500 gap-3">
                <p className="text-red-500 font-semibold">{error}</p>
                <button
                    onClick={onKembali}
                    className="px-4 py-2 bg-[#054C5A] text-white rounded-xl text-xs font-bold"
                >
                    Kembali
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">

            {/* SIDEBAR SISWA */}
            <SidebarSiswa
                menuAktif="beranda"
                onPilihMenu={(menu) => {
                    if (menu === 'beranda' && onKembali) onKembali();
                }}
            />

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">

                {/* TOPBAR SISWA */}
                <TopbarSiswa
                    searchTerm={searchTerm}
                    onSearchChange={(val) => setSearchTerm(val)}
                    placeholder="Cari informasi..."
                    onKeProfil={onKeProfil}
                    onPilihNotif={onPilihNotif}
                />

                {/* BREADCRUMB INTERAKTIF */}
        <div className="mb-4 flex items-center gap-3 mt-2">
          <button 
            onClick={onKembali}
            className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D] flex items-center gap-2">
            <button
              type="button"
              onClick={() => { if (onKeDashboard) onKeDashboard(); }}
              className="hover:text-[#0088A8] hover:underline cursor-pointer font-medium"
            >
              BERANDA
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={onKembali}
              className="hover:text-[#0088A8] hover:underline cursor-pointer font-medium uppercase"
            >
              MATERI
            </button>
            <span>/</span>
            <span className="font-bold text-[#17242E] uppercase">DETAIL MATERI</span>
          </p>
        </div>

                {/* HEADER JUDUL & TOMBOL MARK AS COMPLETED */}
                <div className="flex justify-between items-start mb-6 w-full">
                    <div>
                        <h1 className="text-2xl font-bold text-[#17242E]">{material?.title || 'Tanpa Judul'}</h1>

                        {/* SUB-INFO META */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#71808D]">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-cyan-600" />
                                {formatSafeDate(material?.created_at, { day: 'numeric', month: 'short', year: 'numeric' }, '12 Okt 2026')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <Layers size={14} className="text-cyan-600" />
                                {material?.section_title || material?.section?.title || material?.class_name || 'X-A'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <BookOpen size={14} className="text-cyan-600" />
                                {material?.subject_name || 'Matematika'}
                            </span>
                        </div>
                    </div>

                    {/* TOMBOL INTERAKTIF MARK AS COMPLETED SESUAI FIGMA */}
                    <button
                        onClick={() => setIsCompleted(!isCompleted)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shrink-0 ${isCompleted
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-[#E0F7FA] text-[#007088] hover:bg-[#B2EBF2]'
                            }`}
                    >
                        {isCompleted ? <CheckCircle size={16} /> : <CheckCircle size={16} className="text-[#0088A8]" />}
                        {isCompleted ? 'Completed' : 'Mark as Completed'}
                    </button>
                </div>

                {/* MAIN LAYOUT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* KOLOM KIRI */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* CARD DESKRIPSI MATERI */}
                        <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                            <h2 className="text-sm font-bold text-[#17242E]">Deskripsi Materi</h2>
                            <div className="text-[#17242E] text-xs leading-relaxed whitespace-pre-line">
                                {material?.description || 'Tidak ada deskripsi materi.'}
                            </div>
                        </div>

                        {/* CARD PRATINJAU FILE */}
                        <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                            <h2 className="text-sm font-bold text-[#17242E]">Pratinjau File</h2>

                            {material?.material_files && material.material_files.length > 0 ? (
                                <div className="space-y-4">
                                    {material.material_files.map((file) => {
                                        const fileLink = file.file_url.startsWith('http')
                                            ? file.file_url
                                            : `http://localhost:5000/${file.file_url}`;

                                        const isWordFile = file.file_name.endsWith('.docx') || file.file_name.endsWith('.doc');

                                        return (
                                            <div key={file.id || 1} className="space-y-3">
                                                <p className="text-xs font-bold text-[#0088A8]">{file.file_name}</p>

                                                {/* Jika file Word, tampilkan card unduh agar tidak auto-download di iframe */}
                                                {isWordFile ? (
                                                    <div className="p-6 bg-[#E0F7FA]/40 border border-cyan-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                                                        <div className="p-3 bg-white text-[#0088A8] rounded-2xl shadow-xs">
                                                            <FileText size={32} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#17242E]">Dokumen Microsoft Word (.docx)</p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5">Pratinjau langsung tidak tersedia untuk format Word. Silakan unduh file untuk melihat isinya.</p>
                                                        </div>
                                                        <a
                                                            href={fileLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-5 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
                                                        >
                                                            <Download size={14} /> Unduh Dokumen
                                                        </a>
                                                    </div>
                                                ) : (
                                                    /* Jika PDF, aman ditampilkan di iframe */
                                                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                                                        <iframe
                                                            src={fileLink}
                                                            title={file.file_name}
                                                            className="w-full h-[500px] border-0"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 p-4">
                                    <iframe
                                        src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                                        title="Pratinjau PDF"
                                        className="w-full h-[500px] border-0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN - SIDEBAR INFORMASI */}
                    <div className="space-y-6">

                        {/* CARD LAMPIRAN */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Lampiran</h3>
                            {material?.material_files && material.material_files.length > 0 ? (
                                material.material_files.map((file) => {
                                    const fileLink = file.file_url.startsWith('http')
                                        ? file.file_url
                                        : `http://localhost:5000/${file.file_url}`;

                                    return (
                                        <div key={file.id || 1} className="flex items-center justify-between p-3.5 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2.5 bg-cyan-100/50 text-[#0088A8] rounded-xl shrink-0">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[#17242E] truncate">{file.file_name}</p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : '2.4 MB'} • PDF File
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={fileLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs shrink-0 ml-2"
                                                title="Unduh file"
                                            >
                                                <Download size={14} />
                                            </a>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-between p-3.5 bg-[#E0F7FA]/30 border border-cyan-100 rounded-2xl">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2.5 bg-cyan-100/50 text-[#0088A8] rounded-xl shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#17242E] truncate">Garis Lurus.pdf</p>
                                            <p className="text-[10px] text-gray-400">2.4 MB • PDF File</p>
                                        </div>
                                    </div>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); alert('Mengunduh file Garis Lurus.pdf'); }}
                                        className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs shrink-0 ml-2"
                                        title="Unduh file"
                                    >
                                        <Download size={14} />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* CARD INFORMASI TAMBAHAN */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Informasi Tambahan</h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wide">MATA PELAJARAN</p>
                                    <p className="font-semibold text-[#17242E] mt-0.5">{material?.subject_name || 'Matematika'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wide">KELAS TARGET</p>
                                    <p className="font-semibold text-[#17242E] mt-0.5">{material?.class_name || 'X-A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wide">TANGGAL UNGGAH</p>
                                    <p className="font-semibold text-[#17242E] mt-0.5">
                                        {formatSafeDate(material?.created_at, { day: 'numeric', month: 'long', year: 'numeric' }, '12 Okt 2026')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wide">STATUS</p>
                                    <div className="flex items-center gap-1.5 text-[#2E7D32] font-semibold mt-0.5">
                                        <CheckCircle size={14} className="text-[#2E7D32]" /> Published
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD DIUNGGAH OLEH */}
                        <div className="bg-[#054C5A] p-6 rounded-3xl shadow-2xs space-y-3 text-white">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">Diunggah Oleh</h3>
                            <div className="flex items-center gap-3 pt-1">
                                <div className="w-10 h-10 rounded-full bg-white text-[#054C5A] flex items-center justify-center font-bold text-sm shadow-xs">
                                    {material?.teacher_name ? material.teacher_name.charAt(0).toUpperCase() : 'G'}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">{material?.teacher_name || 'Guru Pengampu'}</p>
                                    <p className="text-[11px] text-cyan-100 font-medium">Guru {material?.subject_name || 'Mata Pelajaran'}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

export default DetailMateriSiswa;