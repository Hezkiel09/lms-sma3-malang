import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, FileText, Download, Calendar, Clock, CheckCircle,
    Upload, Trash2, AlertCircle, Bold, Italic, Underline,
    List, Loader2, ExternalLink, Save, CheckCircle2
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa';
import { getStudentAssignmentDetail, submitStudentAssignment } from './studentApi';

const KirimTugasSiswa = ({
    tugasId,
    onKembali,
    onKeDashboard,
    onKirimSukses,
    onKeProfil,
    onPilihNotif
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [catatan, setCatatan] = useState('');
    const [tugas, setTugas] = useState(null);
    const [existingSubmission, setExistingSubmission] = useState(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const fetchDetail = async () => {
        if (!tugasId) {
            setLoadingDetail(false);
            return;
        }
        try {
            setLoadingDetail(true);
            const data = await getStudentAssignmentDetail(tugasId);
            setTugas(data);

            if (data?.submission || data?.existing_submission) {
                const sub = data.submission || data.existing_submission;
                setExistingSubmission(sub);
                setCatatan(sub.notes || '');
            }
        } catch (err) {
            console.error('Error fetching detail tugas in KirimTugas:', err);
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [tugasId]);

    const handleFileChange = (e) => {
        setErrorMessage(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                setErrorMessage('Ukuran file melebihi batas maksimal 10 MB.');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleHapusFile = () => {
        setSelectedFile(null);
        setErrorMessage(null);
        const fileInput = document.getElementById('upload-file-tugas');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setErrorMessage(null);

        if (!selectedFile && !existingSubmission) {
            setErrorMessage('Harap pilih berkas tugas (PDF) terlebih dahulu sebelum mengirim.');
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            if (selectedFile) {
                formData.append('file', selectedFile);
            }
            if (catatan.trim()) {
                formData.append('notes', catatan.trim());
            }

            await submitStudentAssignment(tugasId || tugas?.id, formData);

            alert(existingSubmission ? 'Tugas berhasil diperbarui (diunggah ulang)!' : 'Tugas berhasil dikumpulkan!');
            setIsEditingMode(false);
            if (onKirimSukses) {
                onKirimSukses();
            } else {
                fetchDetail();
            }
        } catch (err) {
            console.error('Error submitting assignment:', err);
            setErrorMessage(err.message || 'Gagal mengumpulkan tugas. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <span className="font-bold text-[#17242E]">PENGUMPULAN TUGAS</span>
                    </p>
                </div>

                {/* ALERT ERROR JIKA ADA */}
                {errorMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
                        <AlertCircle size={18} className="shrink-0" />
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

                {/* KARTU 1: DETAIL TUGAS */}
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
                            <h2 className="text-sm font-bold text-[#17242E]">Lampiran Tugas</h2>
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
                                            title="Unduh lampiran"
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

                {/* KARTU 2: FORM PENGUMPULAN & STATUS EDIT */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h2 className="text-lg font-bold text-[#17242E]">Pengumpulan Tugas</h2>
                        {existingSubmission && !isEditingMode && (
                            <button
                                type="button"
                                onClick={() => setIsEditingMode(true)}
                                className="px-4 py-2 bg-[#E0F7FA] text-[#0088A8] hover:bg-[#0088A8] hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Edit / Unggah Ulang Tugas
                            </button>
                        )}
                    </div>

                    {existingSubmission && !isEditingMode ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-800">Tugas Telah Dikumpulkan</p>
                                    <p className="text-[11px] text-emerald-600">Terakhir dikirim: {existingSubmission.updated_at || 'Baru saja'}</p>
                                </div>
                            </div>

                            {existingSubmission.file_url && (
                                <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-[#0088A8]" />
                                        <span className="font-semibold">{existingSubmission.file_name || 'Berkas Tugas Terkirim.pdf'}</span>
                                    </div>
                                    <a href={existingSubmission.file_url} target="_blank" rel="noreferrer" className="text-[#0088A8] hover:underline font-bold flex items-center gap-1">
                                        Lihat Berkas <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}

                            {existingSubmission.notes && (
                                <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-700 space-y-1">
                                    <span className="font-bold block text-[#17242E]">Catatan Siswa:</span>
                                    <p>{existingSubmission.notes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {existingSubmission && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center justify-between">
                                    <span>Anda sedang dalam mode <strong>Edit Pengumpulan</strong>. Mengunggah file baru akan menggantikan file sebelumnya.</span>
                                    <button type="button" onClick={() => setIsEditingMode(false)} className="underline font-bold cursor-pointer">Batal</button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#17242E] block">Catatan Tambahan (Opsional):</label>
                                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                                    <div className="bg-[#F8FAFC] border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-2 text-gray-600 text-xs">
                                        <button type="button" onClick={() => document.execCommand('bold', false, null)} className="p-1 hover:bg-gray-200 rounded"><Bold size={14} /></button>
                                        <button type="button" onClick={() => document.execCommand('italic', false, null)} className="p-1 hover:bg-gray-200 rounded"><Italic size={14} /></button>
                                        <button type="button" onClick={() => document.execCommand('underline', false, null)} className="p-1 hover:bg-gray-200 rounded"><Underline size={14} /></button>
                                        <button type="button" onClick={() => document.execCommand('insertUnorderedList', false, null)} className="p-1 hover:bg-gray-200 rounded"><List size={14} /></button>
                                    </div>

                                    <div
                                        contentEditable="true"
                                        dir="ltr"
                                        style={{ direction: 'ltr', unicodeBidi: 'bidi-override', textAlign: 'left' }}
                                        onInput={(e) => setCatatan(e.currentTarget.textContent || '')}
                                        className="w-full p-4 text-xs text-[#17242E] focus:outline-none min-h-[120px] text-left"
                                        placeholder="Tulis catatan atau keterangan untuk guru di sini..."
                                    ></div>
                                    <div className="px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400 text-right">
                                        {catatan.trim().length > 0 ? `${catatan.trim().split(/\s+/).length} kata` : '0 kata'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#17242E] uppercase tracking-wider">BERKAS TUGAS *</h3>
                                <div className="border-2 border-dashed border-cyan-200 rounded-2xl p-8 text-center bg-cyan-50/10 hover:bg-cyan-50/30 transition">
                                    <input
                                        type="file"
                                        id="upload-file-tugas"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                    />
                                    <label htmlFor="upload-file-tugas" className="cursor-pointer flex flex-col items-center space-y-2">
                                        <div className="p-3 bg-white text-[#0088A8] rounded-2xl shadow-xs">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-[#17242E]">Klik untuk mengunggah berkas tugas</p>
                                        <p className="text-[10px] text-gray-400">PDF (Maksimal 10 MB)</p>
                                    </label>
                                </div>

                                {selectedFile ? (
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center justify-between p-3.5 bg-cyan-50/40 border border-cyan-100 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white text-[#0088A8] rounded-xl shadow-2xs">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#17242E]">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap dikirim
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleHapusFile}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                                                title="Hapus berkas"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-medium pt-1">
                                        <AlertCircle size={14} /> {existingSubmission ? 'Pilih file baru jika ingin mengganti file sebelumnya' : 'Belum ada berkas tugas yang dipilih'}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                {existingSubmission && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingMode(false)}
                                        disabled={isSubmitting}
                                        className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || (!selectedFile && !existingSubmission)}
                                    className={`px-8 py-3 rounded-2xl text-xs font-bold text-white transition flex items-center gap-2 shadow-sm ${isSubmitting || (!selectedFile && !existingSubmission)
                                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                            : 'bg-[#054C5A] hover:bg-[#033742] cursor-pointer'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            MENYIMPAN...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={14} />
                                            {existingSubmission ? 'SIMPAN PERUBAHAN' : 'KIRIM TUGAS'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </main>
        </div>
    );
};

export default KirimTugasSiswa;