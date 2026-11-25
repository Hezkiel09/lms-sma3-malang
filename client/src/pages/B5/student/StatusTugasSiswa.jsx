import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, FileText, Download, Calendar, Clock,
    CheckCircle, AlertCircle, RefreshCw, Loader2
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import {
    getStudentAssignmentDetail,
    getStudentMySubmission,
    getStudentProfile,
    downloadFileDirect
} from './studentApi';

const StatusTugasSiswa = ({
    tugasId,
    onKembali,
    onKeDashboard,
    onKeKirimUlang,
    onKeProfil,
    onPilihNotif
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tugas, setTugas] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
    const [profilSiswa, setProfilSiswa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingFile, setDownloadingFile] = useState(null);

    const handleDownloadFile = async (url, fileName, fileId) => {
        if (!url) return;
        const targetId = fileId || fileName;
        try {
            setDownloadingFile(targetId);
            await downloadFileDirect(url, fileName);
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setDownloadingFile(null);
        }
    };

    const fetchData = async () => {
        if (!tugasId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const [tugasRes, subRes, profileRes] = await Promise.all([
                getStudentAssignmentDetail(tugasId),
                getStudentMySubmission(tugasId).catch(() => null),
                getStudentProfile().catch(() => null),
            ]);

            setTugas(tugasRes);
            setMySubmission(subRes || tugasRes?.my_submission || null);
            setProfilSiswa(profileRes);
        } catch (err) {
            console.error('Error fetching data in StatusTugasSiswa:', err);
            setError(err.message || 'Gagal memuat status pengumpulan tugas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tugasId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white font-sans text-xs text-gray-500">
                Memuat status pengumpulan...
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

    const isGraded = mySubmission && mySubmission.score !== null;
    const isDeadlinePassed = tugas?.deadline_raw ? new Date() > new Date(tugas.deadline_raw) : false;
    const canResubmit = !isGraded && (!isDeadlinePassed || Boolean(tugas?.allow_late_submission));
    const studentName = profilSiswa?.name || 'Siswa SMAN 3 Malang';
    const submittedFile = mySubmission?.submission_files?.[0] || null;

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

                {/* BREADCRUMB */}
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
                                if (onKeDashboard) onKeDashboard();
                                else if (onKembali) onKembali();
                            }}
                            className="hover:text-[#0088A8] hover:underline cursor-pointer font-medium"
                        >
                            BERANDA
                        </button>
                        <span>/</span>
                        <button
                            type="button"
                            onClick={onKembali}
                            className="hover:text-[#0088A8] hover:underline cursor-pointer font-medium"
                        >
                            TUGAS
                        </button>
                        <span>/</span>
                        <span className="font-bold text-[#17242E]">STATUS PENGUMPULAN</span>
                    </p>
                </div>

                {/* KARTU 1: DETAIL TUGAS ATAS */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#17242E]">
                            {tugas?.title || 'Latihan Mandiri: Grafik Parabola'}
                        </h1>
                        <p className="text-xs text-[#71808D] mt-1">
                            Kelas: {tugas?.kelas_nama || 'Matematika Kelas X-A'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center font-bold text-sm shadow-2xs">
                            {tugas?.guru_nama ? tugas.guru_nama.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#17242E]">
                                {tugas?.guru_nama || 'Guru Pengampu'}
                            </p>
                            <p className="text-[11px] text-[#71808D]">
                                {tugas?.guru_role || 'Guru Mata Pelajaran'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Tanggal Mulai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]">
                                <Calendar size={14} className="text-[#0088A8]" />
                                {tugas?.start_date || '20 Jan 2026'}
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
                                {tugas?.due_date || '27 Jan 2026'}
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

                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-[#17242E]">Instruksi</h2>
                        <div className="p-5 rounded-2xl bg-[#E0F7FA]/30 border border-cyan-100 space-y-3 text-xs text-[#17242E] leading-relaxed">
                            <p className="whitespace-pre-line">{tugas?.instructions || 'Selesaikan soal sesuai petunjuk guru.'}</p>
                            {tugas?.instructions_list && (
                                <ul className="list-disc list-inside space-y-1 font-medium">
                                    {tugas.instructions_list.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {tugas?.assignment_files && tugas.assignment_files.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold text-[#17242E]">Lampiran Soal</h2>
                            {tugas.assignment_files.map((file, idx) => (
                                <div key={file.id || idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#17242E]">{file.file_name || 'Lampiran Tugas'}</p>
                                            <p className="text-[10px] text-gray-400">
                                                {file.file_type || 'PDF'} • {file.file_size_formatted || `${Math.round((file.file_size || 0) / 1024)} KB`}
                                            </p>
                                        </div>
                                    </div>
                                    {file.signed_url || file.file_url ? (
                                        <a
                                            href={file.signed_url || file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center"
                                            title="Unduh lampiran soal"
                                        >
                                            <Download size={16} />
                                        </a>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <h2 className="text-sm font-bold text-[#17242E]">Jenis Pengumpulan</h2>
                        <span className="px-4 py-2 rounded-xl bg-[#E0F7FA] border border-cyan-200 text-[#007088] font-bold text-xs inline-flex items-center gap-2">
                            <CheckCircle size={14} className="text-[#0088A8]" /> PDF
                        </span>
                    </div>
                </div>

                {/* KARTU 2: STATUS PENGIRIMAN */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[#17242E]">Pengumpulan</h2>
                        <span className={`px-3 py-1 border rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                            mySubmission?.is_late
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-cyan-50 text-[#0088A8] border-cyan-200'
                        }`}>
                            <CheckCircle size={14} />
                            {mySubmission?.is_late ? 'Terlambat' : 'Terkirim'}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-[#E0F7FA]/60 border border-cyan-200 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-[#0088A8] text-white rounded-full mt-0.5">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[#17242E]">
                                    {isGraded
                                        ? `Tugas telah diperiksa guru (Nilai: ${mySubmission.score} / 100)`
                                        : 'Tugas berhasil terkirim!'}
                                </h3>
                                <p className="text-xs text-[#71808D] mt-0.5">
                                    {isGraded
                                        ? 'Guru telah memberikan penilaian pada tugas yang Anda kumpulkan.'
                                        : 'Tugasmu sudah diterima di sistem. Lampiran tersimpan untuk diperiksa oleh guru.'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-100 text-xs">
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold">Dikumpulkan oleh</p>
                                <p className="font-bold text-[#17242E] mt-0.5">{studentName}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold">Waktu pengumpulan</p>
                                <p className="font-bold text-[#17242E] mt-0.5">
                                    {mySubmission?.submitted_at_formatted || 'Tersimpan'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold">Status pengumpulan</p>
                                <p className={`font-bold mt-0.5 ${
                                    mySubmission?.is_late ? 'text-amber-600' : 'text-emerald-600'
                                }`}>
                                    {mySubmission?.is_late ? 'Terkirim (Terlambat)' : 'Sudah dikumpulkan'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold">Percobaan</p>
                                <p className="font-bold text-[#054C5A] mt-0.5">
                                    Percobaan ke-{mySubmission?.submission_attempt || 1}
                                </p>
                            </div>
                        </div>

                        {/* CATATAN SISWA JIKA ADA */}
                        {mySubmission?.feedback && (
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    FEEDBACK GURU
                                </p>
                                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed font-medium">
                                    {mySubmission.feedback}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    BERKAS YANG DIKUMPULKAN
                                </p>
                                <span className="text-[11px] text-gray-400">
                                    {mySubmission?.submission_files?.length || 0} berkas
                                </span>
                            </div>

                            {submittedFile ? (
                                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#17242E]">
                                                {submittedFile.file_name}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {submittedFile.file_type || 'PDF'} • {submittedFile.file_size_formatted || `${Math.round((submittedFile.file_size || 0) / 1024)} KB`}
                                            </p>
                                        </div>
                                    </div>
                                    {submittedFile.signed_url || submittedFile.file_url ? (
                                        <button
                                            type="button"
                                            disabled={downloadingFile === (submittedFile.id || submittedFile.file_name)}
                                            onClick={() => handleDownloadFile(submittedFile.signed_url || submittedFile.file_url, submittedFile.file_name, submittedFile.id)}
                                            className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                            title="Unduh berkas yang dikumpulkan"
                                        >
                                            {downloadingFile === (submittedFile.id || submittedFile.file_name) ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Download size={16} />
                                            )}
                                        </button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-400">
                                    Tidak ada file yang tercatat pada submission ini.
                                </div>
                            )}

                            {/* FILE KOREKSI GURU (KONDISIONAL) */}
                            {mySubmission?.correction_files && mySubmission.correction_files.length > 0 && (
                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            FILE KOREKSI GURU
                                        </p>
                                        <span className="text-[11px] text-gray-400">
                                            {mySubmission.correction_files.length} berkas
                                        </span>
                                    </div>

                                    {mySubmission.correction_files.map((file, idx) => (
                                        <div
                                            key={file.id || idx}
                                            className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#17242E]">
                                                        {file.file_name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {file.file_type || 'PDF'} • {file.file_size_formatted || `${Math.round((file.file_size || 0) / 1024)} KB`}
                                                    </p>
                                                </div>
                                            </div>
                                            {file.signed_url || file.file_url ? (
                                                <button
                                                    type="button"
                                                    disabled={downloadingFile === (file.id || file.file_name)}
                                                    onClick={() => handleDownloadFile(file.signed_url || file.file_url, file.file_name, file.id)}
                                                    className="p-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                                    title="Unduh file koreksi guru"
                                                >
                                                    {downloadingFile === (file.id || file.file_name) ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Download size={16} />
                                                    )}
                                                </button>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-[11px] font-medium italic">
                                    {isGraded ? (
                                        <span className="text-emerald-700 font-bold">
                                            ✓ Tugas telah selesai diperiksa oleh guru.
                                        </span>
                                    ) : (
                                        <span className="text-amber-600">
                                            ⏳ Tugas menunggu pemeriksaan guru.
                                        </span>
                                    )}
                                </p>

                                {canResubmit && onKeKirimUlang && (
                                    <button
                                        type="button"
                                        onClick={onKeKirimUlang}
                                        className="px-4 py-2 bg-white border border-[#054C5A] text-[#054C5A] hover:bg-cyan-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <RefreshCw size={12} />
                                        Kirim Ulang Berkas
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
};

export default StatusTugasSiswa;
