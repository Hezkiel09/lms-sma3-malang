import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';

const DetailNilaiSiswa = ({ nilaiId, onKembali, onKeProfil, onPilihNotif }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Contoh data dummy: Kamu bisa atur hasFeedback jadi true (pakai feedback) atau false (tanpa feedback)
    // Atau nanti bisa dihubungkan langsung dengan data dari API backend.
    const [detailNilai] = useState({
        namaSiswa: "Dedi Kurniawan",
        nis: "0012345",
        kelas: "X - A",
        namaTugas: "Latihan Mandiri: Grafik Parabola",
        waktuPengumpulan: "18 Jan 2026, 14:30 PM",
        nilai: 85,
        kkm: 75,
        hasFeedback: true, // Ubah ke false untuk melihat tampilan "Nilai Saja / Tanpa Feedback"
        feedbackText: "Pemahaman yang sangat baik tentang konsep inti. Langkah-langkah derivasinya logis dan terdokumentasi dengan baik. Namun, harap kerjakan konsistensi notasi matematika Anda di bagian akhir.",
        fileKoreksi: "Koreksi_Tugas_Grafikparabola_dedi_kurniawan.pdf"
    });

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
                                    DK
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#17242E]">{detailNilai.namaSiswa}</h2>
                                    <p className="text-xs text-[#71808D] mt-0.5">NIS: {detailNilai.nis}</p>
                                </div>
                            </div>
                            <span className="px-3.5 py-1.5 bg-[#0088A8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                                <CheckCircle size={14} /> SUDAH DINILAI
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
                            <span className="text-4xl font-extrabold tracking-tight">{detailNilai.nilai}</span>
                        </div>
                        <p className="text-xs font-medium text-cyan-100 mt-4">KKM: {detailNilai.kkm}</p>
                    </div>

                </div>

                {/* BAGIAN BAWAH: KONDISIONAL BERDASARKAN ADA/TIDAKNYA FEEDBACK */}
                {detailNilai.hasFeedback ? (
                    <>
                        {/* KOTAK UMPAN BALIK GURU */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-3 mb-6">
                            <h3 className="text-sm font-bold text-[#17242E]">Umpan Balik Guru</h3>
                            <div className="p-5 rounded-2xl bg-[#E0F7FA]/30 border border-cyan-100 text-xs text-[#17242E] leading-relaxed font-medium">
                                {detailNilai.feedbackText}
                            </div>
                        </div>

                        {/* KOTAK FILE HASIL KOREKSI */}
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

                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl"><FileText size={20} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-[#17242E]">{detailNilai.fileKoreksi}</p>
                                        <p className="text-[10px] text-gray-400">PDF • Hasil koreksi guru</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => alert("Mengunduh file koreksi...")}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-cyan-50 hover:border-[#0088A8] text-[#17242E] font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                                    >
                                        Unduh
                                    </button>
                                    <button
                                        onClick={() => alert("Membuka file koreksi...")}
                                        className="px-5 py-2 bg-[#054C5A] hover:bg-[#033742] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                                    >
                                        Buka
                                    </button>
                                </div>
                            </div>
                        </div>
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
                )}

            </main>
        </div>
    );
};

export default DetailNilaiSiswa;