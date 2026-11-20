import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    FileText,
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import bannerSiswaImg from '../../../assets/siswa.png';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import ProfilSiswa from './ProfilSiswa';
import DaftarKelas from './DaftarKelas';
import DetailCourseSiswa from './DetailCourseSiswa';
import DetailMateriSiswa from './DetailMateriSiswa';
import DetailTugasSiswa from './DetailTugasSiswa';
import KirimTugasSiswa from './KirimTugasSiswa';
import StatusTugasSiswa from './StatusTugasSiswa';
import DetailNilaiSiswa from './DetailNilaiSiswa';
import {
    getStudentProfile,
    getStudentCourses,
    getStudentTimelineAssignments,
} from './studentApi';

const DashboardSiswa = () => {
    const [halamanAktif, setHalamanAktif] = useState('beranda');
    const [keywordPencarian, setKeywordPencarian] = useState('');

    // --- STATE KALENDER & FILTER TIMELINE (Fokus pada DL) ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null); // Null artinya tampilkan semua tugas aktif

    // Data Kelas Saya & Timeline Tugas dari Backend
    const [kelasSaya, setKelasSaya] = useState([]);
    const [timelineTugas, setTimelineTugas] = useState([]);
    const [studentName, setStudentName] = useState('Siswa');
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    const [kelasTerpilih, setKelasTerpilih] = useState(null);
    const [idMateriTerpilih, setIdMateriTerpilih] = useState(null);
    const [idTugasTerpilih, setIdTugasTerpilih] = useState(null);
    const [idNilaiTerpilih, setIdNilaiTerpilih] = useState(null);

    // Ambil data riil dashboard siswa saat komponen dimuat
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoadingDashboard(true);
                const [profileRes, coursesRes, timelineRes] = await Promise.allSettled([
                    getStudentProfile(),
                    getStudentCourses(),
                    getStudentTimelineAssignments(),
                ]);

                if (profileRes.status === 'fulfilled' && profileRes.value?.name) {
                    const firstName = profileRes.value.name.split(',')[0].split(' ')[0];
                    setStudentName(firstName || 'Siswa');
                }

                if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) {
                    setKelasSaya(coursesRes.value);
                }

                if (timelineRes.status === 'fulfilled' && Array.isArray(timelineRes.value)) {
                    setTimelineTugas(timelineRes.value);
                }
            } catch (err) {
                console.warn('Gagal memuat data dashboard siswa:', err);
            } finally {
                setLoadingDashboard(false);
            }
        };

        loadDashboard();
    }, []);

    // Filter hanya tugas yang belum selesai
    const activeTasksOnly = timelineTugas.filter(tugas => tugas.status !== 'SELESAI');

    // Navigasi Bulan Kalender
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentDate.getMonth(), 1).getDay();

    // Tanggal deadline tugas aktif
    const deadlineDates = activeTasksOnly
        .filter(t => t.month === currentDate.getMonth() && t.year === currentYear)
        .map(t => t.day);

    // Filter Timeline Tugas berdasarkan pencarian & tanggal DL yang diklik
    const filteredTimelineTugas = activeTasksOnly.filter(tugas => {
        const matchKeyword = tugas.judul.toLowerCase().includes(keywordPencarian.toLowerCase()) ||
            tugas.kelas.toLowerCase().includes(keywordPencarian.toLowerCase());
        if (!matchKeyword) return false;

        if (selectedDate !== null) {
            return tugas.day === selectedDate && tugas.month === currentDate.getMonth() && tugas.year === currentYear;
        }
        return true;
    });

    // Card Batas Waktu Mendatang di bawah kalender
    const activeDeadlineDate = selectedDate !== null ? selectedDate : (deadlineDates[0] || 6);
    const deadlineCardTugas = activeTasksOnly.filter(tugas =>
        tugas.day === activeDeadlineDate && tugas.month === currentDate.getMonth() && tugas.year === currentYear
    );

    // Sinkronisasi URL browser secara aman tanpa merusak fungsi state (persis seperti DashboardGuru)
    const ubahHalaman = (halaman, urlPath) => {
        window.history.pushState({}, '', urlPath);
        setHalamanAktif(halaman);
    };

    // Fungsi Terpusat untuk Profil Siswa
    const handleKeProfil = () => {
        ubahHalaman('profil', '/profil-siswa');
    };

    useEffect(() => {
        const handlePopState = () => {
            if (window.location.pathname === '/profil-siswa') {
                setHalamanAktif('profil');
            } else if (window.location.pathname === '/kelas-saya') {
                setHalamanAktif('daftarKelas');
            } else if (window.location.pathname === '/kelas/detail') {
                setHalamanAktif('detailCourseSiswa');
            } else {
                setHalamanAktif('beranda');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Render Halaman Profil Siswa secara kondisional (persis seperti DashboardGuru)
    if (halamanAktif === 'profil') {
        return (
            <ProfilSiswa
                onKembali={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onLogout={() => alert("Berhasil keluar akun")}
            />
        );
    }

    // Rute Kirim Tugas Siswa (Form Input Catatan & Upload File)
    if (halamanAktif === 'kirimTugasSiswa') {
        return (
            <KirimTugasSiswa
                tugasId={idTugasTerpilih}
                onKembali={() => ubahHalaman('detailTugasSiswa', '/kelas/detail/tugas')}
                onKeDashboard={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onKirimSukses={() => {
                    // Di sini kita bisa arahkan ke halaman status terkirim
                    ubahHalaman('statusTugasSiswa', '/kelas/detail/tugas/terkirim');
                }}
                onKeProfil={handleKeProfil}
            />
        );
    }

    // Rute Status Tugas Berhasil Terkirim (Halaman setelah tombol KIRIM TUGAS diklik)
    if (halamanAktif === 'statusTugasSiswa') {
        return (
            <StatusTugasSiswa
                tugasId={idTugasTerpilih}
                onKembali={() => ubahHalaman('detailTugasSiswa', '/kelas/detail/tugas')}
                onKeDashboard={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onKeKirimUlang={() => ubahHalaman('kirimTugasSiswa', '/kelas/detail/tugas/kirim')}
                onKeProfil={handleKeProfil}
            />
        );
    }

    // Tambahkan rute DetailNilaiSiswa:
    if (halamanAktif === 'detailNilaiSiswa') {
        return (
            <DetailNilaiSiswa
                nilaiId={idNilaiTerpilih}
                onKembali={() => ubahHalaman('detailCourseSiswa', '/kelas/detail')}
                onKeDashboard={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onKeProfil={handleKeProfil}
            />
        );
    }

    // Tambahkan rute DetailTugasSiswa:
    if (halamanAktif === 'detailTugasSiswa') {
        return (
            <DetailTugasSiswa
                tugasId={idTugasTerpilih}
                onKembali={() => ubahHalaman('detailCourseSiswa', '/kelas/detail')}
                onKeDashboard={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onKeKirimTugas={() => ubahHalaman('kirimTugasSiswa', '/kelas/detail/tugas/kirim')}
                onKeStatusTugas={() => ubahHalaman('statusTugasSiswa', '/kelas/detail/tugas/terkirim')}
                onKeProfil={handleKeProfil}
            />
        );
    }

    // Render Halaman Detail Materi Siswa
    if (halamanAktif === 'detailMateriSiswa') {
        return (
            <DetailMateriSiswa
                materialId={idMateriTerpilih}
                onKembali={() => ubahHalaman('detailCourseSiswa', '/kelas/detail')}
                onKeDashboard={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onKeProfil={handleKeProfil}
            />
        );
    }

    // Render Halaman Detail Course Siswa
    if (halamanAktif === 'detailCourseSiswa') {
        return (
            <DetailCourseSiswa
                kelasData={kelasTerpilih}
                onKembali={() => ubahHalaman('beranda', '/dashboard-siswa')} 
                onKeDashboard={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onKeDaftarKelas={() => ubahHalaman('daftarKelas', '/kelas-saya')}
                onPilihMateri={(idMateri) => {
                    setIdMateriTerpilih(idMateri);
                    ubahHalaman('detailMateriSiswa', `/kelas/detail/file/${idMateri}`);
                }}
                onPilihTugas={(idTugas) => {
                    setIdTugasTerpilih(idTugas);
                    ubahHalaman('detailTugasSiswa', `/kelas/detail/tugas/${idTugas}`);
                }}
                onPilihNilai={(idNilai) => {
                    setIdNilaiTerpilih(idNilai);
                    ubahHalaman('detailNilaiSiswa', `/kelas/detail/nilai/${idNilai}`);
                }}
                onKeProfil={handleKeProfil}
            />
        );
    }

    // Render Halaman Daftar Kelas / Kelas Saya
    if (halamanAktif === 'daftarKelas') {
        return (
            <DaftarKelas
                onKembali={() => ubahHalaman('beranda', '/dashboard-siswa')}
                onPilihKelas={(kelas) => {
                    setKelasTerpilih(kelas);
                    ubahHalaman('detailCourseSiswa', '/kelas/detail');
                }}
                onKeProfil={handleKeProfil}
            />
        );
    }

    return (
        <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">

            <SidebarSiswa
                menuAktif="beranda"
                onPilihMenu={(menu) => {
                    if (menu === 'beranda') ubahHalaman('beranda', '/dashboard-siswa');
                }}
            />

            <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">

                <TopbarSiswa
                    searchTerm={keywordPencarian}
                    onSearchChange={(val) => setKeywordPencarian(val)}
                    placeholder="Cari informasi..."
                    onKeProfil={handleKeProfil}
                    onPilihNotif={(notif) => {
                        const targetCourseId =
                            notif?.course_id ||
                            notif?.courseId ||
                            notif?.data?.course_id ||
                            notif?.data?.courseId;

                        if (targetCourseId && kelasSaya.length > 0) {
                            const matchedCourse = kelasSaya.find(
                                (k) =>
                                    String(k.id) === String(targetCourseId) ||
                                    String(k.course_id) === String(targetCourseId)
                            );
                            if (matchedCourse) {
                                setKelasTerpilih(matchedCourse);
                            }
                        }

                        const teksNotif = (
                            notif?.text ||
                            notif?.title ||
                            notif?.message ||
                            ''
                        ).toLowerCase();

                        // Cek jika teks notifikasi mengandung kata 'nilai', arahkan langsung ke Detail Nilai beserta ID-nya
                        if (
                            notif?.type === 'grade' ||
                            notif?.type === 'nilai' ||
                            teksNotif.includes('nilai') ||
                            teksNotif.includes('memberikan nilai')
                        ) {
                            const nilaiId =
                                notif?.nilai_id ||
                                notif?.grade_id ||
                                notif?.submission_id ||
                                notif?.submissionId ||
                                notif?.assignment_id ||
                                notif?.assignmentId ||
                                notif?.target_id ||
                                notif?.data?.submission_id ||
                                notif?.data?.assignment_id ||
                                notif?.id ||
                                null;
                            setIdNilaiTerpilih(nilaiId);
                            ubahHalaman(
                                'detailNilaiSiswa',
                                nilaiId ? `/kelas/detail/nilai/${nilaiId}` : '/kelas/detail/nilai'
                            );
                        } else {
                            // Jika notifikasi tugas baru, ambil ID tugas dan arahkan langsung ke Detail Tugas
                            const tugasId =
                                notif?.assignment_id ||
                                notif?.assignmentId ||
                                notif?.tugas_id ||
                                notif?.tugasId ||
                                notif?.task_id ||
                                notif?.taskId ||
                                notif?.target_id ||
                                notif?.reference_id ||
                                notif?.entity_id ||
                                notif?.data?.assignment_id ||
                                notif?.data?.tugas_id ||
                                notif?.id ||
                                null;

                            setIdTugasTerpilih(tugasId);
                            ubahHalaman(
                                'detailTugasSiswa',
                                tugasId ? `/kelas/detail/tugas/${tugasId}` : '/kelas/detail/tugas'
                            );
                        }
                    }}
                />

                <div className="mb-6">
                    <p className="text-[11px] text-[#71808D] mb-1">Beranda /</p>
                    <h2 className="text-2xl font-bold text-[#17242E]">Beranda</h2>
                </div>

                {/* WELCOME BANNER SISWA */}
                <section className="bg-[#DDF6F9] px-6 sm:px-8 py-6 rounded-3xl mb-8 flex justify-between items-center relative overflow-hidden shadow-xs w-full min-h-[150px]">
                    <div className="w-full lg:max-w-[65%] z-10 pr-2">
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#007088] mb-2 leading-tight">
                            Selamat Datang,<br />{studentName}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#005B66] font-medium leading-relaxed">
                            Siap untuk belajar hari ini? Jangan lupa selesaikan tugas sebelum batas waktu ya!
                        </p>
                    </div>

                    <div className="hidden lg:flex absolute right-4 bottom-0 h-full items-end justify-end pointer-events-none z-10">
                        <img
                            src={bannerSiswaImg}
                            alt="Ilustrasi siswa 3D"
                            className="h-[115%] w-auto object-contain object-bottom max-w-[260px]"
                        />
                    </div>
                </section>

                {/* SECTION: KELAS SAYA */}
                <section className="mb-8 w-full">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">KELAS SAYA</p>
                        <button
                            onClick={() => ubahHalaman('daftarKelas', '/kelas-saya')}
                            className="text-xs font-bold text-[#0088A8] hover:underline cursor-pointer"
                        >
                            Lihat Semua
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                        {loadingDashboard ? (
                            <div className="col-span-full py-8 text-center text-gray-400 text-xs">
                                Memuat data kelas saya...
                            </div>
                        ) : kelasSaya.length === 0 ? (
                            <div className="col-span-full py-8 text-center text-gray-400 text-xs">
                                Belum ada kelas yang terdaftar untuk akun Anda.
                            </div>
                        ) : (
                            kelasSaya.map((kelas) => (
                                <div
                                    key={kelas.id}
                                    className="bg-white rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 overflow-hidden flex flex-col justify-between transition hover:shadow-lg"
                                >
                                    <div className={`h-28 ${kelas.coverBg || 'bg-[#DDF6F9]'} p-4 flex items-center justify-center text-[#007088] relative`}>
                                        <div className="absolute inset-0 bg-black/5"></div>
                                        <span className="text-xs font-semibold bg-white/60 backdrop-blur-xs px-3 py-1 rounded-full z-10 uppercase tracking-wider text-[#054C5A]">
                                            {kelas.kelasBadge || 'KELAS X A'}
                                        </span>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-base text-[#17242E] mb-1">{kelas.nama}</h4>
                                            <p className="text-xs text-[#71808D] line-clamp-2 mb-4 leading-relaxed">
                                                {kelas.desc || kelas.deskripsi || 'Mata pelajaran untuk semester aktif.'}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs text-[#0088A8] font-medium mb-4">
                                                <span className="flex items-center gap-1.5 bg-[#E0F7FA] px-2.5 py-1 rounded-lg">
                                                    <BookOpen size={14} /> {kelas.materi ?? kelas.materiCount ?? 0} Materi
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-[#E0F7FA] px-2.5 py-1 rounded-lg">
                                                    <FileText size={14} /> {kelas.tugas ?? kelas.tugasCount ?? 0} Tugas
                                                </span>
                                            </div>

                                            <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-400 space-y-1">
                                                <p>{kelas.tahun || kelas.tahunAjaran || '2026/2027 • Semester Ganjil'}</p>
                                                <p className="text-[#17242E] font-medium">Guru pengajar: {kelas.guru || 'Guru Pengajar'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="flex justify-between text-[11px] font-bold text-[#71808D] mb-1">
                                                <span>Progress</span>
                                                <span>{kelas.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                                                <div
                                                    className="bg-[#0088A8] h-full rounded-full"
                                                    style={{ width: `${kelas.progress || 0}%` }}
                                                ></div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setKelasTerpilih(kelas);
                                                    ubahHalaman('detailCourseSiswa', '/kelas/detail');
                                                }}
                                                className="w-full py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-xs"
                                            >
                                                Lihat Kelas
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* SECTION: TIMELINE TUGAS & KALENDER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

                    {/* TIMELINE TUGAS (2 Kolom) */}
                    <section className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    TIMELINE DEADLINE TUGAS
                                </p>
                                {selectedDate !== null && (
                                    <p className="text-xs text-[#0088A8] font-semibold mt-0.5 flex items-center gap-2">
                                        <span>Filter deadline tanggal: {selectedDate} {currentMonthName} {currentYear}</span>
                                        <button
                                            onClick={() => setSelectedDate(null)}
                                            className="text-[10px] bg-cyan-50 text-[#0088A8] hover:bg-cyan-100 px-2 py-0.5 rounded-md border border-cyan-200 transition cursor-pointer font-bold flex items-center gap-1"
                                        >
                                            <span>Reset Filter</span>
                                            <X size={12} />
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                            {filteredTimelineTugas.length > 0 ? (
                                filteredTimelineTugas.map((tugas) => (
                                    <div
                                        key={tugas.id}
                                        onClick={() => {
                                            // Simpan ID tugas dan arahkan ke halaman detail tugas
                                            setIdTugasTerpilih(tugas.id);
                                            ubahHalaman('detailTugasSiswa', `/kelas/detail/tugas/${tugas.id}`);
                                        }}
                                        className="p-4 rounded-2xl border border-gray-100 hover:border-cyan-300 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition cursor-pointer hover:shadow-xs"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0 mt-0.5">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-[#17242E] hover:text-[#0088A8] transition">{tugas.judul}</h4>
                                                <p className="text-xs text-[#71808D] mt-0.5">Kelas: {tugas.kelas}</p>
                                                <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                                                    <span>📅 Deadline: {tugas.deadlineStr}</span>
                                                    <span>⏰ {tugas.waktu}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="px-3 py-1 rounded-lg text-[10px] font-bold self-start sm:self-center bg-[#FFF3C4] text-[#8C6D00]">
                                            {tugas.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-400 text-xs">
                                    {selectedDate !== null
                                        ? `Tidak ada deadline tugas pada tanggal ${selectedDate} ${currentMonthName} ${currentYear}.`
                                        : 'Hore! Tidak ada deadline tugas aktif saat ini.'}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* KALENDER & BATAS WAKTU (1 Kolom) */}
                    <section className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 font-bold text-sm text-[#17242E]">
                                    <CalendarIcon size={18} className="text-[#0088A8]" />
                                    <span>Kalender Deadline</span>
                                </div>
                                <span className="text-xs font-bold text-[#0088A8]">{currentMonthName} {currentYear}</span>
                            </div>

                            {/* Kalender Interaktif */}
                            <div className="text-center mb-6">
                                <div className="flex justify-between items-center text-xs font-bold text-[#71808D] mb-3">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="p-1.5 hover:bg-cyan-50 text-[#0088A8] rounded-lg transition cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span>{currentMonthName} {currentYear}</span>
                                    <button
                                        onClick={handleNextMonth}
                                        className="p-1.5 hover:bg-cyan-50 text-[#0088A8] rounded-lg transition cursor-pointer"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-[11px] font-bold text-gray-400 mb-2">
                                    <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-xs text-[#17242E]">
                                    {Array.from({ length: firstDayIndex }, (_, i) => (
                                        <span key={`empty-${i}`} className="py-1.5"></span>
                                    ))}

                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                        const day = i + 1;
                                        const hasDeadline = deadlineDates.includes(day);
                                        const isSelected = selectedDate === day;

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    if (selectedDate === day) {
                                                        setSelectedDate(null);
                                                    } else {
                                                        setSelectedDate(day);
                                                    }
                                                }}
                                                className={`relative py-1.5 rounded-xl font-medium transition flex flex-col items-center justify-center cursor-pointer ${isSelected
                                                    ? 'bg-[#0088A8] text-white font-bold shadow-xs'
                                                    : 'hover:bg-cyan-50 text-[#17242E]'
                                                    }`}
                                            >
                                                <span>{day}</span>
                                                {hasDeadline && !isSelected && (
                                                    <span className="absolute bottom-1 w-1 h-1 bg-[#0088A8] rounded-full"></span>
                                                )}
                                                {hasDeadline && isSelected && (
                                                    <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Batas Waktu Mendatang */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                DEADLINE ({activeDeadlineDate} {currentMonthName})
                            </p>
                            {deadlineCardTugas.length > 0 ? (
                                deadlineCardTugas.map((tugas) => (
                                    <div key={tugas.id} className="p-3.5 bg-[#E0F7FA]/60 rounded-2xl border border-cyan-100 flex items-center gap-3 mb-2 last:mb-0">
                                        <div className="bg-white px-2.5 py-1.5 rounded-xl text-center shadow-xs shrink-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{currentMonthName.substring(0, 3)}</p>
                                            <p className="text-base font-bold text-[#0088A8]">{activeDeadlineDate}</p>
                                        </div>
                                        <div className="overflow-hidden">
                                            <h5 className="font-bold text-xs text-[#17242E] truncate">{tugas.judul}</h5>
                                            <p className="text-[10px] text-[#71808D] mt-0.5">{tugas.deadlineStr} • {tugas.waktu}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-xl text-center text-[11px] text-gray-400 border border-gray-100">
                                    Tidak ada deadline tugas di tanggal ini.
                                </div>
                            )}
                        </div>

                    </section>

                </div>

            </main>
        </div>
    );
};

export default DashboardSiswa;