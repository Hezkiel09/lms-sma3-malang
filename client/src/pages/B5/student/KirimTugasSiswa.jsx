import React, { useState } from 'react';
import {
    ArrowLeft, FileText, Download, Calendar, Clock, CheckCircle,
    Upload, Trash2, AlertCircle, Bold, Italic, Underline,
    Strikethrough, AlignLeft, AlignCenter, AlignRight, List
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';

const KirimTugasSiswa = ({ onKembali, onKirimSukses, onKeProfil, onPilihNotif }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [catatan, setCatatan] = useState('');

    const [fileDiunggah, setFileDiunggah] = useState([
        {
            id: 1,
            name: "Tugas_Grafikparabola_dedi_kurniawan.pdf",
            size: "0.0 MB",
            date: "00/00/2026"
        }
    ]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const fileBaru = e.target.files[0];
            setFileDiunggah([{
                id: Date.now(),
                name: fileBaru.name,
                size: `${(fileBaru.size / (1024 * 1024)).toFixed(1)} MB`,
                date: new Date().toLocaleDateString('id-ID')
            }]);
        }
    };

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

                {/* BREADCRUMB */}
                <div className="mb-4 flex items-center gap-3 mt-2">
                    <button
                        onClick={onKembali}
                        className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <p className="text-[11px] text-[#71808D]">
                        BERANDA &nbsp;/&nbsp; KELAS SAYA &nbsp;/&nbsp; TUGAS &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">DETAIL TUGAS</span>
                    </p>
                </div>

                {/* KARTU 1: DETAIL TUGAS (SESUAI GAMBAR FIGMA 1) */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#17242E]">Latihan Mandiri: Grafik Parabola</h1>
                        <p className="text-xs text-[#71808D] mt-1">Kelas: Matematika Kelas X-A</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center font-bold text-sm shadow-2xs">K</div>
                        <div>
                            <p className="text-xs font-bold text-[#17242E]">Karina</p>
                            <p className="text-[11px] text-[#71808D]">Guru Matematika</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Tanggal Mulai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]"><Calendar size={14} className="text-[#0088A8]" /> 20 Jan 2026</div>
                        </div>
                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Waktu Mulai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]"><Clock size={14} className="text-[#0088A8]" /> 10:00 AM</div>
                        </div>
                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Tanggal Selesai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]"><Calendar size={14} className="text-[#0088A8]" /> 27 Jan 2026</div>
                        </div>
                        <div className="p-4 rounded-2xl border border-gray-200 bg-[#F8FAFC]/50 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Waktu Selesai</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#17242E]"><Clock size={14} className="text-[#0088A8]" /> 23:59</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-[#17242E]">Instruksi</h2>
                        <div className="p-5 rounded-2xl bg-[#E0F7FA]/30 border border-cyan-100 space-y-3 text-xs text-[#17242E] leading-relaxed">
                            <p>Selesaikan 5 soal sistem persamaan linear dua variabel. Gunakan metode eliminasi atau substitusi. Lampirkan langkah-langkah penyelesaian dan jawaban akhir.</p>
                            <ul className="list-disc list-inside space-y-1 font-medium">
                                <li>Gunakan metode eliminasi atau substitusi.</li>
                                <li>Lampirkan langkah-langkah penyelesaian.</li>
                                <li>Tulis jawaban akhir dengan jelas.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-[#17242E]">Lampiran</h2>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl"><FileText size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-[#17242E]">latihan_grafik_parabola.pdf</p>
                                    <p className="text-[10px] text-gray-400">PDF • 2.4 MB</p>
                                </div>
                            </div>
                            <button onClick={() => alert("Mengunduh lampiran...")} className="p-2.5 bg-[#054C5A] text-white rounded-xl cursor-pointer">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <h2 className="text-sm font-bold text-[#17242E]">Jenis Pengumpulan</h2>
                        <span className="px-4 py-2 rounded-xl bg-[#E0F7FA] border border-cyan-200 text-[#007088] font-bold text-xs inline-flex items-center gap-2">
                            <CheckCircle size={14} className="text-[#0088A8]" /> PDF
                        </span>
                    </div>
                </div>

                {/* KARTU 2: FORM PENGUMPULAN */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full">
                    <h2 className="text-lg font-bold text-[#17242E]">Pengumpulan</h2>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#17242E] block">Catatan:</label>
                        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                            <div className="bg-[#F8FAFC] border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-2 text-gray-600 text-xs">
                                <span className="font-bold text-gray-500 mr-2">Insert</span>
                                <span className="font-bold text-gray-500 mr-2">Format</span>
                                <span className="font-bold text-gray-500 mr-2">Tools</span>
                                <span className="font-bold text-gray-500 mr-4">Table</span>
                                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => document.execCommand('bold', false, null)} className="p-1 hover:bg-gray-200 rounded"><Bold size={14} /></button>
                                <button type="button" onClick={() => document.execCommand('italic', false, null)} className="p-1 hover:bg-gray-200 rounded"><Italic size={14} /></button>
                                <button type="button" onClick={() => document.execCommand('underline', false, null)} className="p-1 hover:bg-gray-200 rounded"><Underline size={14} /></button>
                                <button type="button" onClick={() => document.execCommand('insertUnorderedList', false, null)} className="p-1 hover:bg-gray-200 rounded"><List size={14} /></button>
                            </div>

                            <div
                                contentEditable="true"
                                onInput={(e) => setCatatan(e.currentTarget.textContent || '')}
                                className="w-full p-4 text-xs text-[#17242E] focus:outline-none min-h-[120px]"
                                placeholder="Tulis konten pembelajaran di sini..."
                            ></div>
                            <div className="px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400 text-right">{catatan.length} kata</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-[#17242E] uppercase tracking-wider">LAMPIRAN</h3>
                        <div className="border-2 border-dashed border-cyan-200 rounded-2xl p-8 text-center bg-cyan-50/10 hover:bg-cyan-50/30 transition">
                            <input type="file" id="upload-file-tugas" className="hidden" onChange={handleFileChange} accept=".pdf" />
                            <label htmlFor="upload-file-tugas" className="cursor-pointer flex flex-col items-center space-y-2">
                                <div className="p-3 bg-white text-[#0088A8] rounded-2xl shadow-xs"><Upload size={24} /></div>
                                <p className="text-xs font-bold text-[#17242E]">Klik untuk mengunggah atau seret dan lepas</p>
                                <p className="text-[10px] text-gray-400">PDF, DOC, ZIP or PPTX (Maks 10MB)</p>
                            </label>
                        </div>
                        <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-medium pt-1">
                            <AlertCircle size={14} /> Lampiran hanya boleh PDF
                        </div>

                        <div className="space-y-2 pt-2">
                            {fileDiunggah.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-3.5 bg-cyan-50/40 border border-cyan-100 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white text-[#0088A8] rounded-xl shadow-2xs"><FileText size={18} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-[#17242E]">{file.name}</p>
                                            <p className="text-[10px] text-gray-400">{file.size} • {file.date}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setFileDiunggah([])} className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TOMBOL KIRIM TUGAS (MEMICU PINDAH KE FILE STATUS TERKIRIM) */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                // 1. Simpan catatan siswa ke localStorage agar tidak hilang
                                localStorage.setItem('catatanTugas_default', catatan);

                                // 2. Simpan status tugas selesai ke localStorage
                                const tugasSelesai = JSON.parse(localStorage.getItem('tugasSelesai_siswa') || '{}');
                                tugasSelesai['nyoba fix'] = true;
                                tugasSelesai['tugas2222'] = true;
                                localStorage.setItem('tugasSelesai_siswa', JSON.stringify(tugasSelesai));

                                // 3. Panggil fungsi untuk pindah halaman sukses
                                if (onKirimSukses) {
                                    onKirimSukses();
                                }
                            }}
                            className="px-8 py-3 rounded-2xl text-xs font-bold text-white transition cursor-pointer shadow-sm bg-[#054C5A] hover:bg-[#033742]"
                        >
                            KIRIM TUGAS
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default KirimTugasSiswa;