import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, FileText, Download,
    Calendar, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import { getStudentAssignmentDetail, getStudentMySubmission } from './studentApi';

const DetailTugasSiswa = ({
    tugasId,
    onKembali,
    onKeDashboard,
    onKeProfil,
    onPilihNotif,
    onKeKirimTugas,
    onKeStatusTugas,
    onKeNilai,
}) => {
    const [tugas, setTugas] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
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
            const [detailRes, subRes] = await Promise.all([
                getStudentAssignmentDetail(tugasId),
                getStudentMySubmission(tugasId).catch(() => null),
            ]);
            setTugas(detailRes);
            setMySubmission(subRes || detailRes?.my_submission || null);
        } catch (err) {
            console.error('Error fetching detail tugas:', err);
            setError(err.message || 'Gagal memuat detail tugas');
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

    const isSubmitted = Boolean(mySubmission);
    const isGraded = isSubmitted && mySubmission.score !== null;
    const isDeadlinePassed = tugas?.deadline_raw ? new Date() > new Date(tugas.deadline_raw) : false;
    const canSubmit = !isGraded && (!isDeadlinePassed || Boolean(tugas?.allow_late_submission));

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
                        <span className="font-bold text-[#17242E] uppercase">DETAIL TUGAS</span>
                    </p>
                </div>

                {/* KARTU UTAMA DETAIL TUGAS */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full">
                    <div>
                        <h1 className="text-2xl font-bold text-[#17242E]">{tugas?.title || 'Latihan Mandiri: Grafik Parabola'}</h1>
                        <p className="text-xs text-[#71808D] mt-1">Kelas: {tugas?.class_name || tugas?.kelas_nama || 'Matematika Kelas X-A'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center font-bold text-sm shadow-2xs">
                            {tugas?.teacher_name ? tugas.teacher_name.charAt(0).toUpperCase() : (tugas?.guru_nama ? tugas.guru_nama.charAt(0).toUpperCase() : 'G')}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#17242E]">{tugas?.teacher_name || tugas?.guru_nama || 'Guru Pengampu'}</p>
                            <p className="text-[11px] text-[#71808D]">{tugas?.guru_role || (tugas?.subject_name ? `Guru ${tugas.subject_name}` : 'Guru Mata Pelajaran')}</p>
                        </div>
                    </div>

                    {/* GRID WAKTU */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Tanggal Mulai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]">
                                <Calendar size={14} className="text-[#0088A8]" />
                                {tugas?.start_date || (tugas?.start_at_raw ? new Date(tugas.start_at_raw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '20 Jan 2026')}
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
                                {tugas?.due_date || (tugas?.deadline_raw ? new Date(tugas.deadline_raw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '27 Jan 2026')}
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
                        {tugas?.assignment_files && tugas.assignment_files.length > 0 ? (
                            tugas.assignment_files.map((file, idx) => (
                                <div key={file.id || idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#17242E]">{file.file_name || 'Lampiran Tugas'}</p>
                                            <p className="text-[10px] text-gray-400">
                                                {file.file_type || 'PDF'} • {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'Lampiran'}
                                            </p>
                                        </div>
                                    </div>
                                    {file.file_url || file.signed_url ? (
                                        <a
                                            href={file.signed_url || file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center"
                                            title="Unduh lampiran"
                                        >
                                            <Download size={16} />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => alert("File tidak dapat diakses")}
                                            className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs"
                                        >
                                            <Download size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-400">
                                Tidak ada lampiran berkas pada tugas ini.
                            </div>
                        )}
                    </div>

                    {/* JENIS PENGUMPULAN & STATUS AKSI */}
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                        <h2 className="text-sm font-bold text-[#17242E]">Jenis Pengumpulan</h2>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 rounded-xl bg-[#E0F7FA] border border-cyan-200 text-[#007088] font-bold text-xs flex items-center gap-2 shadow-2xs">
                                <CheckCircle size={14} className="text-[#0088A8]" /> PDF
                            </span>
                        </div>
                    </div>

                    {/* STATUS PENGUMPULAN INFO BOX */}
                    {isSubmitted && (
                        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                            isGraded
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : mySubmission?.is_late
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                        }`}>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="shrink-0" />
                                <div>
                                    <p className="font-bold">
                                        {isGraded
                                            ? `Tugas telah dinilai — Skor: ${mySubmission.score} / 100`
                                            : `Tugas sudah dikumpulkan (${mySubmission?.is_late ? 'Terlambat' : 'Tepat Waktu'})`}
                                    </p>
                                    <p className="text-[11px] opacity-80">
                                        Percobaan ke-{mySubmission.submission_attempt || 1} • Dikumpulkan pada: {mySubmission.submitted_at_formatted || 'Tersimpan'}
                                    </p>
                                </div>
                            </div>
                            {isGraded && (
                                <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl text-[11px]">
                                    Selesai
                                </span>
                            )}
                        </div>
                    )}

                    {!isSubmitted && isDeadlinePassed && !tugas?.allow_late_submission && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
                            <AlertCircle size={18} className="shrink-0" />
                            <p className="font-medium">
                                Batas waktu pengumpulan telah berakhir dan tugas ini tidak menerima pengumpulan terlambat.
                            </p>
                        </div>
                    )}

                    {/* TOMBOL AKSI PENGUMPULAN */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        {isSubmitted && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onKeStatusTugas) onKeStatusTugas();
                                }}
                                className="px-5 py-3 rounded-2xl text-xs font-bold text-[#054C5A] border border-[#054C5A] hover:bg-cyan-50 transition cursor-pointer shadow-xs"
                            >
                                LIHAT STATUS PENGUMPULAN
                            </button>
                        )}

                        {isGraded ? (
                            <button
                                type="button"
                                disabled
                                className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-400 bg-gray-100 cursor-not-allowed shadow-none"
                                title="Tugas sudah dinilai oleh guru dan tidak dapat dikirim ulang"
                            >
                                SUDAH DINILAI
                            </button>
                        ) : canSubmit ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onKeKirimTugas) onKeKirimTugas();
                                }}
                                className="px-7 py-3 rounded-2xl text-xs font-bold text-white transition cursor-pointer shadow-sm flex items-center gap-2 bg-[#054C5A] hover:bg-[#033742]"
                            >
                                {isSubmitted ? 'KIRIM ULANG TUGAS' : 'KUMPULKAN TUGAS'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-400 bg-gray-100 cursor-not-allowed shadow-none"
                                title="Batas waktu telah berakhir"
                            >
                                PENGUMPULAN DITUTUP
                            </button>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DetailTugasSiswa;