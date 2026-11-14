import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Calendar, Clock, CheckCircle } from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa'; 

const StatusTugasSiswa = ({ onKembali, onKeProfil, onPilihNotif }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [catatanTerkirim, setCatatanTerkirim] = useState('');

  useEffect(() => {
    // Ambil catatan yang disimpan dari localStorage saat halaman dimuat
    const savedCatatan = localStorage.getItem('catatanTugas_default') 
      || localStorage.getItem('catatanTugas_') 
      || "Berikut saya lampirkan penyelesaian 5 soal sistem persamaan linear dua variabel, beserta langkah-langkah pengerjaan dan jawaban akhir. Terima kasih, Pak.";
    setCatatanTerkirim(savedCatatan);
  }, []);

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

        {/* KARTU 1: DETAIL TUGAS ATAS */}
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

        {/* KARTU 2: STATUS PENGIRIMAN (SESUAI GAMBAR FIGMA 2) */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#17242E]">Pengumpulan</h2>
            <span className="px-3 py-1 bg-cyan-50 text-[#0088A8] border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <CheckCircle size={14} /> Terkirim
            </span>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-[#E0F7FA]/60 border border-cyan-200 rounded-2xl flex items-start gap-4">
              <div className="p-2 bg-[#0088A8] text-white rounded-full mt-0.5"><CheckCircle size={20} /></div>
              <div>
                <h3 className="font-bold text-sm text-[#17242E]">Tugas berhasil terkirim!</h3>
                <p className="text-xs text-[#71808D] mt-0.5">Tugasmu sudah diterima. Catatan dan lampiran tersimpan untuk diperiksa oleh guru.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100 text-xs">
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-bold">Dikumpulkan oleh</p>
                <p className="font-bold text-[#17242E] mt-0.5">Dedi Kurniawan</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-bold">Waktu pengumpulan</p>
                <p className="font-bold text-[#17242E] mt-0.5">22 Jan 2026, 11:05</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-bold">Status pengumpulan</p>
                <p className="font-bold text-emerald-600 mt-0.5">Sudah dikumpulkan</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CATATAN</p>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-[#17242E] leading-relaxed">
                {catatanTerkirim}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">LAMPIRAN</p>
                <span className="text-[11px] text-gray-400">1 berkas</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-100 text-[#0088A8] rounded-xl"><FileText size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-[#17242E]">Tugas_Grafikparabola_dedi_kurniawan.pdf</p>
                    <p className="text-[10px] text-gray-400">PDF • Dikumpulkan pada 22 Jan 2026, 11:05</p>
                  </div>
                </div>
                <button onClick={() => alert("Mengunduh file...")} className="p-2.5 bg-[#054C5A] text-white rounded-xl cursor-pointer">
                  <Download size={16} />
                </button>
              </div>

              <p className="text-[11px] text-amber-600 font-medium italic pt-1">
                ⏳ Tugas menunggu pemeriksaan guru.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default StatusTugasSiswa;