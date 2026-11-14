import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    FileText,
    ClipboardList,
    Download,
    CheckCircle,
    MessageSquare,
    HelpCircle
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import TabTugasSiswa from './TabTugasSiswa';
import TabNilaiSiswa from './TabNilaiSiswa';

const COURSE_ID = 'bf720e90-1886-4c01-9868-249181f900dc';

// Pastikan ada onPilihNilai di dalam kurung kurawal parameter ini:
const DetailCourseSiswa = ({ kelasData, onKembali, onKeDaftarKelas, onKeProfil, onPilihMateri, onPilihTugas, onPilihNilai }) => {
    const [daftarBab, setDaftarBab] = useState([]);
    const [daftarMateri, setDaftarMateri] = useState([]);
    const [daftarTugas, setDaftarTugas] = useState([]);
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

    const infoTab = {
        materi: {
            breadcrumb: "MATERI",
            judul: kelasData ? kelasData.nama : "Matematika X A",
            deskripsi: kelasData ? kelasData.desc : "Pelajari persamaan linear, fungsi, dan grafik melalui latihan serta diskusi kelas."
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
        // Ambil data tugas yang sudah disubmit/selesai dari localStorage browser
        const savedSelesai = JSON.parse(localStorage.getItem('tugasSelesai_siswa') || '{}');
        setStatusSelesai(savedSelesai);

        const fetchData = async () => {
            try {
                setLoadingAPI(true);
                setErrorAPI('');

                const [responseSection, responseMateri, responseTugas] = await Promise.all([
                    fetch(`http://localhost:5000/api/v1/b5/courses/${COURSE_ID}/sections`),
                    fetch(`http://localhost:5000/api/v1/b5/courses/${COURSE_ID}/materials`),
                    fetch(`http://localhost:5000/api/v1/b5/courses/${COURSE_ID}/assignments`)
                ]);

                if (!responseSection.ok || !responseMateri.ok) {
                    throw new Error('Gagal mengambil data dari backend.');
                }

                const hasilSection = await responseSection.json();
                const hasilMateri = await responseMateri.json();

                if (!Array.isArray(hasilSection.data)) {
                    throw new Error('Format data Section tidak sesuai.');
                }

                if (!Array.isArray(hasilMateri.data)) {
                    throw new Error('Format data Materi tidak sesuai.');
                }

                setDaftarBab(hasilSection.data);
                setOpenBab(
                    Object.fromEntries(
                        hasilSection.data.map((bab) => [bab.id, true])
                    )
                );
                setDaftarMateri(hasilMateri.data);

                if (responseTugas && responseTugas.ok) {
                    const hasilTugas = await responseTugas.json();
                    if (Array.isArray(hasilTugas.data)) {
                        setDaftarTugas(hasilTugas.data);
                    }
                }
            } catch (error) {
                console.error('Error mengambil data:', error);
                setErrorAPI(error.message);
            } finally {
                setLoadingAPI(false);
            }
        };

        fetchData();
    }, []);

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
                            onClick={() => {
                                window.history.pushState({}, '', '/dashboard-siswa');
                                window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
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

                                            <span className="text-[11px] text-[#71808D]">
                                                12 Okt 2026
                                            </span>
                                        </div>

                                        {/* Isi Bab */}
                                        {openBab[bab.id] && (
                                            <div className="p-6 space-y-4">
                                                {materiPerSection.length === 0 && tugasPerSection.length === 0 ? (
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
                                                        <div>
                                                            <p className="text-xs text-[#71808D] leading-relaxed mb-2">
                                                                {materi.description || "Materi pembelajaran interaktif untuk memahami konsep dasar."}
                                                            </p>
                                                            <p className="text-xs font-semibold text-[#17242E] mb-1">Tujuan :</p>
                                                            <ul className="text-xs text-[#71808D] list-disc list-inside space-y-0.5 pl-1">
                                                                <li>Memahami definisi dan rumus dasar dengan akurat.</li>
                                                                <li>Menerapkan konsep ke dalam latihan soal sehari-hari.</li>
                                                            </ul>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0">
                                                                    <FileText size={18} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-xs text-[#17242E] transition">
                                                                        {materi.title || 'Dokumen Materi.pdf'}
                                                                    </h4>
                                                                    <p className="text-[10px] text-[#71808D] uppercase">DOKUMEN • 2.4 MB</p>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    alert(`Mengunduh file: ${materi.title || 'Dokumen Materi'}`);
                                                                }}
                                                                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-[#054C5A] text-white hover:bg-[#033742]"
                                                            >
                                                                <Download size={14} /> Unduh
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* 2. Contoh Forum */}
                                                <div className="bg-white border border-cyan-100/80 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                            <MessageSquare size={18} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">
                                                                FORUM
                                                            </span>
                                                            <h4 className="font-bold text-xs text-[#17242E] mt-0.5">Contoh Mendeskripsikan Research Gap</h4>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => toggleSelesai('forum-1')}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${statusSelesai['forum-1']
                                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                                            : 'bg-[#E0F7FA] text-[#007088] hover:bg-[#B2EBF2]'
                                                            }`}
                                                    >
                                                        {statusSelesai['forum-1'] ? <CheckCircle size={14} /> : null}
                                                        {statusSelesai['forum-1'] ? 'Selesai' : 'Tandai Selesai'}
                                                    </button>
                                                </div>

                                                {/* 3. List Tugas dalam Bab */}
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
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-pink-50 text-pink-600 px-2 py-0.5 rounded border border-pink-100">
                                                                            TUGAS
                                                                        </span>
                                                                        <h4 className="font-bold text-xs text-[#17242E]">{tugas.title || 'Latihan Mandiri'}</h4>
                                                                    </div>
                                                                    {tugas.instructions && (
                                                                        <p className="text-xs text-[#71808D] leading-relaxed">{tugas.instructions}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                                <span className="text-[11px] text-[#71808D]">
                                                                    Tenggat: <span className="font-semibold text-cyan-800">{tugas.deadline_formatted || '20 Okt 2026'}</span>
                                                                </span>

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

                                                {/* 4. Contoh Quiz */}
                                                <div className="bg-white border border-cyan-100/80 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                            <HelpCircle size={18} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                                                                QUIZ
                                                            </span>
                                                            <h4 className="font-bold text-xs text-[#17242E] mt-0.5">Quiz Logaritma</h4>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => toggleSelesai('quiz-1')}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${statusSelesai['quiz-1']
                                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                                            : 'bg-[#E0F7FA] text-[#007088] hover:bg-[#B2EBF2]'
                                                            }`}
                                                    >
                                                        {statusSelesai['quiz-1'] ? <CheckCircle size={14} /> : null}
                                                        {statusSelesai['quiz-1'] ? 'Selesai' : 'Tandai Selesai'}
                                                    </button>
                                                </div>

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