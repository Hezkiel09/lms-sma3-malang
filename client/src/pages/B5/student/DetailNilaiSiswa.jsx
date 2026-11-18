import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, CheckCircle, Download, AlertCircle, Clock } from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import { getStudentGradeDetail } from './studentApi';

const DetailNilaiSiswa = ({ nilaiId, onKembali, onKeDashboard, onKeProfil, onPilihNotif }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [detailNilai, setDetailNilai] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!nilaiId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const data = await getStudentGradeDetail(nilaiId);
                setDetailNilai(data);
            } catch (err) {
                console.error('[DetailNilaiSiswa] Error:', err);
                setError(err.message || 'Gagal memuat detail penilaian.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [nilaiId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white font-sans text-xs text-gray-500">
                Memuat detail penilaian...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white font-sans text-xs text-gray-500 gap-3">
                <AlertCircle size={24} className="text-red-400" />
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

    if (!detailNilai) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white font-sans text-xs text-gray-500 gap-3">
                <p>Data penilaian tidak tersedia.</p>
                <button
                    onClick={onKembali}
                    className="px-4 py-2 bg-[#054C5A] text-white rounded-xl text-xs font-bold"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const isGraded = detailNilai.isGraded && detailNilai.nilai !== null;
    const initials = detailNilai.namaSiswa
        ? detailNilai.namaSiswa.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'S';

    return (
        <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
            <SidebarSiswa
                menuAktif="beranda"
                onPilihMenu={(menu) => { if (menu === 'beranda' && onKembali) onKembali(); }}
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
                            NILAI
                        </button>
                        <span>/</span>
                        <span className="font-bold text-[#17242E] uppercase">DETAIL NILAI</span>
                    </p>
                </div>

                {/* BAGIAN ATAS: INFO SISWA & LINGKARAN NILAI */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* KARTU KIRI: DETAIL PENGUMPULAN */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                                    {initials}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#17242E]">{detailNilai.namaSiswa}</h2>
                                    <p className="text-xs text-[#71808D] mt-0.5">NIS: {detailNilai.nis}</p>
                                </div>
                            </div>
                            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                                isGraded
                                    ? 'bg-[#0088A8] text-white'
                                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                                {isGraded ? <CheckCircle size={14} /> : <Clock size={14} />}
                                {isGraded ? 'SUDAH DINILAI' : 'MENUNGGU PENILAIAN'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-100 text-xs">
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">KELAS</p>
                                <p className="font-bold text-[#17242E] mt-1">{detailNilai.kelas}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">WAKTU PENGUMPULAN</p>
                                <p className="font-bold text-[#17242E] mt-1">{detailNilai.waktuPengumpulan}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">TUGAS</p>
                                <p className="font-bold text-[#17242E] mt-1">{detailNilai.namaTugas}</p>
                            </div>
                        </div>
                    </div>

                    {/* KARTU KANAN: LINGKARAN NILAI */}
                    <div className="bg-[#054C5A] p-8 rounded-3xl text-white flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
                        <p className="text-xs font-bold uppercase tracking-wider text-cyan-200 mb-4">NILAI</p>
                        <div className="w-32 h-32 rounded-full border-4 border-dashed border-cyan-300/60 flex flex-col items-center justify-center bg-[#033742]/50 shadow-inner">
                            <span className="text-4xl font-extrabold tracking-tight">
                                {isGraded ? detailNilai.nilai : '—'}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-cyan-100 mt-4">KKM: {detailNilai.kkm || 75}</p>
                    </div>

                </div>

                {/* BAGIAN BAWAH: KONDISIONAL BERDASARKAN ADA/TIDAKNYA FEEDBACK */}
                {isGraded ? (
                    detailNilai.hasFeedback ? (
                        <>
                            {/* KOTAK UMPAN BALIK GURU (jika ada feedbackText) */}
                            {detailNilai.feedbackText && (
                                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-3 mb-6">
                                    <h3 className="text-sm font-bold text-[#17242E]">Umpan Balik Guru</h3>
                                    <div className="p-5 rounded-2xl bg-[#E0F7FA]/30 border border-cyan-100 text-xs text-[#17242E] leading-relaxed font-medium">
                                        {detailNilai.feedbackText}
                                    </div>
                                </div>
                            )}

                            {/* KOTAK FILE HASIL KOREKSI */}
                            {detailNilai.correction_files && detailNilai.correction_files.length > 0 ? (
                                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-base font-bold text-[#17242E]">File</h3>
                                            <p className="text-xs text-[#71808D] mt-0.5">Hasil koreksi tinjauan guru</p>
                                        </div>
                                        <span className="px-3 py-1 bg-cyan-50 text-[#0088A8] border border-cyan-200 rounded-lg text-xs font-bold">
                                            SUDAH KOREKSI
                                        </span>
                                    </div>

                                    {detailNilai.correction_files.map((file, idx) => (
                                        <div key={file.id || idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl"><FileText size={20} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#17242E]">{file.file_name}</p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {file.file_type || 'PDF'} • {file.file_size_formatted || 'Hasil koreksi guru'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {(file.signed_url || file.file_url) && (
                                                    <>
                                                        <a
                                                            href={file.signed_url || file.file_url}
                                                            download
                                                            className="px-4 py-2 bg-white border border-gray-200 hover:bg-cyan-50 hover:border-[#0088A8] text-[#17242E] font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                                                        >
                                                            Unduh
                                                        </a>
                                                        <a
                                                            href={file.signed_url || file.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-5 py-2 bg-[#054C5A] hover:bg-[#033742] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                                                        >
                                                            Buka
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Jika ada feedback teks tapi TIDAK ada file koreksi */
                                !detailNilai.feedbackText && (
                                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-base font-bold text-[#17242E]">Detail Nilai</h3>
                                                <p className="text-xs text-[#71808D] mt-0.5">Guru hanya memberikan nilai tanpa umpan balik dan lampiran koreksi.</p>
                                            </div>
                                            <span className="px-3 py-1 bg-cyan-50 text-[#0088A8] border border-cyan-200 rounded-lg text-xs font-bold">
                                                NILAI SAJA
                                            </span>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                                            <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl"><FileText size={20} /></div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#17242E]">Nilai akhir telah ditetapkan</h4>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Tidak ada umpan balik maupun file koreksi yang diunggah oleh guru.</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </>
                    ) : (
                        /* TAMPILAN JIKA GURU HANYA MEMBERIKAN NILAI SAJA (TANPA FEEDBACK/KOREKSI) */
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold text-[#17242E]">Detail Nilai</h3>
                                    <p className="text-xs text-[#71808D] mt-0.5">Guru hanya memberikan nilai tanpa umpan balik dan lampiran koreksi.</p>
                                </div>
                                <span className="px-3 py-1 bg-cyan-50 text-[#0088A8] border border-cyan-200 rounded-lg text-xs font-bold">
                                    NILAI SAJA
                                </span>
                            </div>

                            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl"><FileText size={20} /></div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#17242E]">Nilai akhir telah ditetapkan</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Tidak ada umpan balik maupun file koreksi yang diunggah oleh guru.</p>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    /* TAMPILAN JIKA BELUM DINILAI */
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-[#17242E]">Status Penilaian</h3>
                                <p className="text-xs text-[#71808D] mt-0.5">Tugas sedang menunggu pemeriksaan guru.</p>
                            </div>
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                                MENUNGGU PENILAIAN
                            </span>
                        </div>

                        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center gap-3">
                            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl"><Clock size={20} /></div>
                            <div>
                                <h4 className="text-xs font-bold text-[#17242E]">Tugas sudah dikumpulkan</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">Guru belum memberikan nilai pada tugas ini. Silakan cek kembali nanti.</p>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default DetailNilaiSiswa;
