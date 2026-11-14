import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, FileText, Download,
    Calendar, Clock, CheckCircle
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';

const DetailTugasSiswa = ({ tugasId, onKembali, onKeProfil, onPilihNotif, onKeKirimTugas }) => {
    const [tugas, setTugas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTugasDetail = async () => {
        if (!tugasId) {
            setTugas({
                title: "Latihan Mandiri: Grafik Parabola",
                kelas_nama: "Matematika Kelas X-A",
                guru_nama: "Karina",
                guru_role: "Guru Matematika",
                start_date: "20 Jan 2026",
                start_time: "10:00 AM",
                due_date: "27 Jan 2026",
                due_time: "23:59",
                instructions: `Selesaikan 5 soal sistem persamaan linear dua variabel. Gunakan metode eliminasi atau substitusi. Lampirkan langkah-langkah penyelesaian dan jawaban akhir.\n\nPastikan jawaban akhir ditulis dengan jelas dan konsisten dengan format yang diminta.`,
                instructions_list: [
                    "Gunakan metode eliminasi atau substitusi.",
                    "Lampirkan langkah-langkah penyelesaian.",
                    "Tulis jawaban akhir dengan jelas."
                ],
                submission_type: "PDF",
                assignment_files: [
                    {
                        id: 1,
                        file_name: "latihan_grafik_parabola.pdf",
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
            const response = await fetch(`http://localhost:5000/api/v1/b5/assignments/${tugasId}`);
            if (!response.ok) throw new Error('Gagal memuat detail tugas dari server');
            const result = await response.json();
            setTugas(result.data);
        } catch (err) {
            console.error('Error fetching detail tugas:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTugasDetail();
    }, [tugasId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white font-sans text-xs text-gray-500">
                Memuat detail tugas...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
            <SidebarSiswa
                menuAktif="beranda"
                onPilihMenu={(menu) => {
                    if (menu === 'beranda' && onKembali) onKembali();
                }}
            />

            <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
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
                            onClick={() => {
                                // Langsung arahkan kembali ke Beranda utama
                                window.history.pushState({}, '', '/dashboard-siswa');
                                window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
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
                        <span className="font-bold text-[#17242E] uppercase">DETAIL TUGAS</span>
                    </p>
                </div>

                {/* KARTU UTAMA DETAIL TUGAS */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full">
                    <div>
                        <h1 className="text-2xl font-bold text-[#17242E]">{tugas?.title || 'Latihan Mandiri: Grafik Parabola'}</h1>
                        <p className="text-xs text-[#71808D] mt-1">Kelas: {tugas?.kelas_nama || 'Matematika Kelas X-A'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center font-bold text-sm shadow-2xs">
                            {tugas?.guru_nama ? tugas.guru_nama.charAt(0) : 'K'}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#17242E]">{tugas?.guru_nama || 'Karina'}</p>
                            <p className="text-[11px] text-[#71808D]">{tugas?.guru_role || 'Guru Matematika'}</p>
                        </div>
                    </div>

                    {/* GRID WAKTU */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Tanggal Mulai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]">
                                <Calendar size={14} className="text-[#0088A8]" />
                                {tugas?.start_date ? new Date(tugas.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '20 Jan 2026'}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Waktu Mulai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]">
                                <Clock size={14} className="text-[#0088A8]" />
                                {tugas?.start_time || '10:00 AM'}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Tanggal Selesai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]">
                                <Calendar size={14} className="text-[#0088A8]" />
                                {tugas?.due_date ? new Date(tugas.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '27 Jan 2026'}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Waktu Selesai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]">
                                <Clock size={14} className="text-[#0088A8]" />
                                {tugas?.due_time || '23:59'}
                            </div>
                        </div>
                    </div>

                    {/* INSTRUKSI */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-[#17242E]">Instruksi</h2>
                        <div className="p-5 rounded-2xl bg-[#E0F7FA]/30 border border-cyan-100 space-y-3 text-xs text-[#17242E] leading-relaxed">
                            <p className="whitespace-pre-line">{tugas?.instructions || 'Selesaikan soal sesuai petunjuk guru.'}</p>
                            {tugas?.instructions_list && (
                                <ul className="list-disc list-inside space-y-1 pl-1 text-[#17242E] font-medium">
                                    {tugas.instructions_list.map((item, idx) => (<li key={idx}>{item}</li>))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* LAMPIRAN */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-[#17242E]">Lampiran</h2>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#17242E]">latihan_grafik_parabola.pdf</p>
                                    <p className="text-[10px] text-gray-400">PDF • 2.4 MB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => alert("Mengunduh lampiran...")}
                                className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    {/* JENIS PENGUMPULAN */}
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                        <h2 className="text-sm font-bold text-[#17242E]">Jenis Pengumpulan</h2>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 rounded-xl bg-[#E0F7FA] border border-cyan-200 text-[#007088] font-bold text-xs flex items-center gap-2 shadow-2xs">
                                <CheckCircle size={14} className="text-[#0088A8]" /> PDF
                            </span>
                        </div>
                    </div>

                    {/* TOMBOL KUMPULKAN TUGAS (MEMICU PINDAH KE HALAMAN KIRIM TUGAS) */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => {
                                if (onKeKirimTugas) onKeKirimTugas();
                            }}
                            className="px-7 py-3 rounded-2xl text-xs font-bold text-white transition cursor-pointer shadow-sm flex items-center gap-2 bg-[#054C5A] hover:bg-[#033742]"
                        >
                            KUMPULKAN TUGAS
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DetailTugasSiswa;