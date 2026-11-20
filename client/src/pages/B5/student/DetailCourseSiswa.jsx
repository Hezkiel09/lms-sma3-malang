import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    FileText,
    ClipboardList,
    Download,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import TabTugasSiswa from './TabTugasSiswa';
import TabNilaiSiswa from './TabNilaiSiswa';
import {
    getStudentCourseSections,
    getStudentCourseMaterials,
    getStudentCourseAssignments,
} from './studentApi';

const DEFAULT_COURSE_ID = 'bf720e90-1886-4c01-9868-249181f900dc';

// Pastikan ada onPilihNilai di dalam kurung kurawal parameter ini:
const DetailCourseSiswa = ({ kelasData, onKembali, onKeDashboard, onKeDaftarKelas, onKeProfil, onPilihMateri, onPilihTugas, onPilihNilai }) => {
    const courseId = kelasData?.id || kelasData?.course_id || DEFAULT_COURSE_ID;
    const [daftarBab, setDaftarBab] = useState([]);
    const [daftarMateri, setDaftarMateri] = useState([]);
    const [daftarTugas, setDaftarTugas] = useState([]);
    const [daftarLink, setDaftarLink] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(`links_${courseId}`) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    });
    const [loadingAPI, setLoadingAPI] = useState(true);
    const [errorAPI, setErrorAPI] = useState('');

    const [tabAktif, setTabAktif] = useState('materi');
    const [keywordPencarian, setKeywordPencarian] = useState('');
    const [openBab, setOpenBab] = useState({});

    // State khusus untuk status klik "Tandai Selesai"
    const [statusSelesai, setStatusSelesai] = useState({});

    const toggleSelesai = (id) => {
        setStatusSelesai(prev => {
            const nextState = {
                ...prev,
                [id]: !prev[id]
            };
            return nextState;
        });
    };

    const filteredBab = daftarBab.filter(bab =>
        bab.title.toLowerCase().includes(keywordPencarian.toLowerCase())
    );

    const filteredMateri = daftarMateri.filter(materi =>
        (materi.title && materi.title.toLowerCase().includes(keywordPencarian.toLowerCase())) ||
        (materi.description && materi.description.toLowerCase().includes(keywordPencarian.toLowerCase()))
    );

    const filteredTugas = daftarTugas.filter(tugas =>
        (tugas.title && tugas.title.toLowerCase().includes(keywordPencarian.toLowerCase())) ||
        (tugas.instructions && tugas.instructions.toLowerCase().includes(keywordPencarian.toLowerCase()))
    );

    const filteredLink = daftarLink.filter(link =>
        (link.title && link.title.toLowerCase().includes(keywordPencarian.toLowerCase())) ||
        (link.description && link.description.toLowerCase().includes(keywordPencarian.toLowerCase())) ||
        (link.url && link.url.toLowerCase().includes(keywordPencarian.toLowerCase()))
    );

    const infoTab = {
        materi: {
            breadcrumb: "MATERI",
            judul: kelasData ? (kelasData.nama || kelasData.title || "") : "",
            deskripsi: kelasData ? (kelasData.desc || kelasData.deskripsi || "") : ""
        },
        tugas: {
            breadcrumb: "TUGAS",
            judul: "Tugas Siswa",
            deskripsi: "Daftar tugas dan evaluasi pembelajaran mata pelajaran ini."
        },
        nilai: {
            breadcrumb: "NILAI",
            judul: "Rekap Nilai Saya",
            deskripsi: "Daftar nilai dan hasil pengumpulan tugas yang telah dinilai oleh guru."
        }
    };

    const kontenAktif = infoTab[tabAktif] || infoTab.materi;

    const toggleBab = (id) => {
        setOpenBab((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        const syncSavedLinks = () => {
            try {
                const saved = JSON.parse(localStorage.getItem(`links_${courseId}`) || '[]');
                setDaftarLink(Array.isArray(saved) ? saved : []);
            } catch {
                setDaftarLink([]);
            }
        };

        syncSavedLinks();
        window.addEventListener('focus', syncSavedLinks);
        window.addEventListener('storage', syncSavedLinks);
        return () => {
            window.removeEventListener('focus', syncSavedLinks);
            window.removeEventListener('storage', syncSavedLinks);
        };
    }, [courseId, tabAktif]);

    useEffect(() => {
        // Ambil data tugas yang sudah disubmit/selesai dari localStorage browser
        const savedSelesai = JSON.parse(localStorage.getItem('tugasSelesai_siswa') || '{}');
        setStatusSelesai(savedSelesai);

        const fetchData = async () => {
            try {
                setLoadingAPI(true);
                setErrorAPI('');

                const [hasilSection, hasilMateri, hasilTugas] = await Promise.all([
                    getStudentCourseSections(courseId),
                    getStudentCourseMaterials(courseId),
                    getStudentCourseAssignments(courseId),
                ]);

                setDaftarBab(hasilSection || []);
                setOpenBab(
                    Object.fromEntries(
                        (hasilSection || []).map((bab) => [bab.id, true])
                    )
                );
                setDaftarMateri(hasilMateri || []);
                setDaftarTugas(hasilTugas || []);
            } catch (error) {
                console.error('Error mengambil data course siswa:', error);
                setErrorAPI(error.message || 'Gagal mengambil data dari server');
            } finally {
                setLoadingAPI(false);
            }
        };

        fetchData();
    }, [courseId]);

    return (
        <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">

            {/* --- SIDEBAR SISWA --- */}
            <SidebarSiswa
                menuAktif="beranda"
                onPilihMenu={(menu) => {
                    if (menu === 'beranda' && onKembali) {
                        onKembali();
                    }
                }}
            />

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">

                {/* TOPBAR SISWA */}
                <TopbarSiswa
                    searchTerm={keywordPencarian}
                    onSearchChange={(val) => setKeywordPencarian(val)}
                    placeholder="Cari informasi..."
                    onKeProfil={onKeProfil}
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
                        {/* 1. Tombol BERANDA ke Dashboard Utama */}
                        <button
                            type="button"
                            onClick={() => { if (onKeDashboard) onKeDashboard(); else if (onKembali) onKembali(); }}
                            className="hover:text-[#0088A8] hover:underline cursor-pointer font-medium"
                        >
                            BERANDA
                        </button>
                        <span>/</span>
                        {/* 2. Tombol KELAS SAYA ke Halaman Daftar Kelas */}
                        <button
                            type="button"
                            onClick={() => {
                                if (onKeDaftarKelas) {
                                    onKeDaftarKelas(); // Panggil fungsi khusus ke daftar kelas
                                } else if (onKembali) {
                                    onKembali();
                                }
                            }}
                            className="hover:text-[#0088A8] hover:underline cursor-pointer font-medium"
                        >
                            KELAS SAYA
                        </button>
                        <span>/</span>
                        {/* 3. Posisi Tab Aktif */}
                        <span className="font-bold text-[#17242E] uppercase">{kontenAktif.breadcrumb}</span>
                    </p>
                </div>

                {/* HEADER COURSE */}
                <div className="mb-6 w-full">
                    <h2 className="text-2xl font-bold text-[#17242E]">{kontenAktif.judul}</h2>
                    <p className="text-xs text-[#71808D] mt-1">{kontenAktif.deskripsi}</p>
                </div>

                {/* TAB NAVIGASI (MATERI / TUGAS / NILAI) */}
                <div className="flex gap-8 border-b border-gray-200 mb-6 text-sm font-bold">
                    <button
                        onClick={() => setTabAktif('materi')}
                        className={`pb-3 transition cursor-pointer ${tabAktif === 'materi'
                            ? 'text-[#0088A8] border-b-2 border-[#0088A8]'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Materi
                    </button>
                    <button
                        onClick={() => setTabAktif('tugas')}
                        className={`pb-3 transition cursor-pointer ${tabAktif === 'tugas'
                            ? 'text-[#0088A8] border-b-2 border-[#0088A8]'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Tugas
                    </button>
                    <button
                        onClick={() => setTabAktif('nilai')}
                        className={`pb-3 transition cursor-pointer ${tabAktif === 'nilai'
                            ? 'text-[#0088A8] border-b-2 border-[#0088A8]'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Nilai
                    </button>
                </div>

                {/* ISI TAB: MATERI */}
                {tabAktif === 'materi' && (
                    <div className="space-y-6 w-full">

                        {loadingAPI ? (
                            <p className="text-sm text-gray-500">Memuat data materi...</p>
                        ) : errorAPI ? (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600">{errorAPI}</p>
                            </div>
                        ) : filteredBab.length === 0 ? (
                            <p className="text-sm text-gray-500">Materi atau bab tidak ditemukan.</p>
                        ) : (
                            filteredBab.map((bab) => {
                                const materiPerSection = filteredMateri.filter(
                                    (materi) => materi.section_id === bab.id
                                );
                                const tugasPerSection = filteredTugas.filter(
                                    (tugas) => tugas.section_id === bab.id
                                );
                                const linkPerSection = filteredLink.filter(
                                    (link) => link.section_id === bab.id
                                );

                                return (
                                    <div
                                        key={bab.id}
                                        className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,136,168,0.08)] overflow-hidden"
                                    >
                                        {/* Header Bab Akordeon */}
                                        <div
                                            onClick={() => toggleBab(bab.id)}
                                            className="p-5 flex justify-between items-center bg-[#F8FAFC]/60 border-b border-gray-100 cursor-pointer hover:bg-cyan-50/20 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                {openBab[bab.id] ? (
                                                    <ChevronUp size={18} className="text-[#0088A8]" />
                                                ) : (
                                                    <ChevronDown size={18} className="text-gray-400" />
                                                )}
                                                <h3 className="font-bold text-base text-[#17242E]">
                                                    {bab.title}
                                                </h3>
                                            </div>

                                            {bab.created_at_formatted || bab.date_formatted ? (
                                                <span className="text-[11px] text-[#71808D]">
                                                    {bab.created_at_formatted || bab.date_formatted}
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Isi Bab */}
                                        {openBab[bab.id] && (
                                            <div className="p-6 space-y-4">
                                                {materiPerSection.length === 0 && tugasPerSection.length === 0 && linkPerSection.length === 0 ? (
                                                    <p className="text-xs text-gray-500">Belum ada materi atau tugas pada bagian ini.</p>
                                                ) : null}

                                                {/* 1. List Materi Dokumen PDF */}
                                                {materiPerSection.map((materi) => (
                                                    <div
                                                        key={materi.id}
                                                        onClick={() => {
                                                            if (onPilihMateri) {
                                                                onPilihMateri(materi.id);
                                                            }
                                                        }}
                                                        className="bg-white border border-cyan-100/80 p-4 rounded-2xl shadow-2xs space-y-3 cursor-pointer hover:border-[#0088A8] transition"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0 mt-0.5">
                                                                    <FileText size={18} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-xs text-[#17242E] transition">
                                                                        {materi.title || materi.file_name || ''}
                                                                    </h4>
                                                                    {materi.description && (
                                                                        <p className="text-xs text-[#71808D] leading-relaxed mt-0.5">
                                                                            {materi.description}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-[10px] text-[#71808D] uppercase mt-1">
                                                                        {materi.file_name ? materi.file_name : 'DOKUMEN'}{materi.file_size ? ` • ${Math.round(materi.file_size / 1024)} KB` : ''}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (materi.file_url) {
                                                                        window.open(materi.file_url, '_blank');
                                                                    } else {
                                                                        alert(`File materi ${materi.title || ''} belum tersedia.`);
                                                                    }
                                                                }}
                                                                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-[#054C5A] text-white hover:bg-[#033742]"
                                                            >
                                                                <Download size={14} /> Unduh
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* List Tautan (URL) dalam Bab */}
                                                {linkPerSection.map((link) => (
                                                    <div
                                                        key={link.id}
                                                        className="bg-white border border-cyan-100/80 p-4 rounded-2xl shadow-2xs space-y-2.5 hover:border-[#0088A8] transition"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-start gap-3 min-w-0">
                                                                <div className="w-9 h-9 rounded-xl bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0 mt-0.5">
                                                                    <ExternalLink size={18} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-cyan-50 text-[#0088A8] px-2 py-0.5 rounded border border-cyan-100 inline-block">
                                                                        TAUTAN (URL)
                                                                    </span>
                                                                    <h4 className="font-bold text-xs text-[#17242E] mt-1">
                                                                        {link.title}
                                                                    </h4>
                                                                    {link.description && (
                                                                        <p className="text-xs text-[#71808D] leading-relaxed mt-0.5">
                                                                            {link.description}
                                                                        </p>
                                                                    )}
                                                                    <a
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[11px] text-[#0088A8] hover:underline break-all inline-block mt-1"
                                                                    >
                                                                        {link.url}
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            <a
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-[#054C5A] text-white hover:bg-[#033742]"
                                                            >
                                                                <ExternalLink size={14} /> Buka
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* 2. List Tugas dalam Bab */}
                                                {tugasPerSection.map((tugas) => {
                                                    // Cek status dari state lokal atau localStorage
                                                    const savedSelesai = JSON.parse(localStorage.getItem('tugasSelesai_siswa') || '{}');
                                                    const isSelesai = statusSelesai[tugas.id] || savedSelesai[tugas.id] || savedSelesai[tugas.title];

                                                    return (
                                                        <div
                                                            key={tugas.id}
                                                            onClick={() => {
                                                                if (onPilihTugas) {
                                                                    onPilihTugas(tugas.id);
                                                                }
                                                            }}
                                                            className="bg-white border border-cyan-100/80 p-4 rounded-2xl shadow-2xs space-y-3 cursor-pointer hover:border-[#0088A8] transition"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                                                                    <ClipboardList size={18} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-pink-50 text-pink-600 px-2 py-0.5 rounded border border-pink-100 inline-block">
                                                                        TUGAS
                                                                    </span>
                                                                    <h4 className="font-bold text-xs text-[#17242E] mt-1">{tugas.title || ''}</h4>
                                                                    {tugas.instructions && (
                                                                        <p className="text-xs text-[#71808D] leading-relaxed mt-0.5">{tugas.instructions}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                                {tugas.deadline_formatted ? (
                                                                    <span className="text-[11px] text-[#71808D]">
                                                                        Tenggat: <span className="font-semibold text-cyan-800">{tugas.deadline_formatted}</span>
                                                                    </span>
                                                                ) : (
                                                                    <span />
                                                                )}

                                                                {/* TOMBOL STATUS SELESAI */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleSelesai(tugas.id);
                                                                    }}
                                                                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${isSelesai
                                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                                                        : 'bg-[#E0F7FA] text-[#007088] hover:bg-[#B2EBF2]'
                                                                        }`}
                                                                >
                                                                    {isSelesai ? <CheckCircle size={14} /> : null}
                                                                    {isSelesai ? 'Selesai' : 'Tandai Selesai'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                    </div>
                )}

                {tabAktif === 'tugas' && (
                    <TabTugasSiswa
                        daftarTugas={daftarTugas}
                        onPilihTugas={onPilihTugas}
                    />
                )}

                {tabAktif === 'nilai' && (
                    <TabNilaiSiswa
                        courseId={courseId}
                        onPilihNilai={(idNilai) => {
                            if (onPilihNilai) {
                                onPilihNilai(idNilai);
                            } else {
                                console.error("onPilihNilai belum dikirim dari DashboardSiswa ke DetailCourseSiswa!");
                            }
                        }}
                    />
                )}

            </main>
        </div>
    );
};

export default DetailCourseSiswa;