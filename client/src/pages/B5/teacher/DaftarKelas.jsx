import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  ArrowLeft, 
  Image as ImageIcon
} from 'lucide-react';
import SidebarGuru from './SidebarGuru';
import TopbarGuru from './TopbarGuru'; 

const DaftarKelas = ({ tingkat = '10', onKembali, onPilihKelas, onKeProfil, onPilihNotif }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Data daftar kelas yang bisa disesuaikan berdasarkan tingkat (10, 11, atau 12)
  const dataKelasPerTingkat = {
    '10': [
      { id: 'XA', nama: 'Matematika X A', desc: 'Pelajari persamaan linear, fungsi, dan grafik melalui latihan serta diskusi kelas.', materi: 12, tugas: 8, tahun: '2026 / 2027' },
      { id: 'XB', nama: 'Matematika X B', desc: 'Pelajari persamaan linear, fungsi, dan grafik melalui latihan serta diskusi kelas.', materi: 10, tugas: 6, tahun: '2026 / 2027' },
      { id: 'XC', nama: 'Matematika X C', desc: 'Pelajari persamaan linear, fungsi, dan grafik melalui latihan serta diskusi kelas.', materi: 14, tugas: 9, tahun: '2026 / 2027' },
      { id: 'XD', nama: 'Matematika X D', desc: 'Pelajari trigonometri dasar dan perbandingan sudut dengan latihan soal terarah.', materi: 11, tugas: 7, tahun: '2026 / 2027' },
      { id: 'XE', nama: 'Matematika X E', desc: 'Pahami statistika dasar, penyajian data, dan peluang melalui kegiatan kelas.', materi: 13, tugas: 8, tahun: '2026 / 2027' },
    ],
    '11': [
      { id: 'XIA', nama: 'Matematika XI A', desc: 'Pelajari limit fungsi turunan dan integral tentu dengan studi kasus nyata.', materi: 10, tugas: 7, tahun: '2026 / 2027' },
      { id: 'XIB', nama: 'Matematika XI B', desc: 'Pelajari barisan dan deret aritmatika serta geometri secara mendalam.', materi: 9, tugas: 5, tahun: '2026 / 2027' },
      { id: 'XIC', nama: 'Matematika XI C', desc: 'Peluang kejadian majemuk dan kombinatorika untuk tingkat lanjut.', materi: 12, tugas: 8, tahun: '2026 / 2027' },
    ],
    '12': [
      { id: 'XIIA', nama: 'Matematika XII A', desc: 'Persiapan ujian matriks, vektor ruang, dan statistika inferensial.', materi: 15, tugas: 10, tahun: '2026 / 2027' },
      { id: 'XIIB', nama: 'Matematika XII B', desc: 'Pembahasan soal-soal komprehensif dan pendalaman materi akhir.', materi: 14, tugas: 9, tahun: '2026 / 2027' },
    ]
  };

  const daftarKelas = dataKelasPerTingkat[tingkat] || dataKelasPerTingkat['10'];

  const filteredKelas = daftarKelas.filter(k =>
    k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      
      {/* SIDEBAR TERPISAH */}
      <SidebarGuru 
        menuAktif="beranda" 
        onPilihMenu={(menu) => {
          if (menu === 'beranda' && onKembali) {
            onKembali();
          }
        }} 
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        
        {/* TOPBAR GURU*/}
        <TopbarGuru 
          searchTerm={searchTerm}
          onSearchChange={(val) => setSearchTerm(val)}
          placeholder="Cari mata pelajaran..."
          onKeProfil={onKeProfil}
          onPilihNotif={onPilihNotif}
        />

        {/* HEADER TITLE & TOMBOL KEMBALI */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onKembali}
              className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[11px] text-[#71808D] mb-0.5">Beranda / Kelas {tingkat}</p>
              <h2 className="text-2xl font-bold text-[#17242E]">Kelas {tingkat}</h2>
            </div>
          </div>
        </div>

        {/* GRID KELAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredKelas.length > 0 ? (
            filteredKelas.map((kelas) => (
              <div key={kelas.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex flex-col justify-between p-2 w-full hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition-all duration-300">
                <div>
                  <div className="h-28 bg-[#DDF6F9] rounded-2xl flex flex-col items-center justify-center text-[#007088] p-4 relative overflow-hidden">
                    <ImageIcon size={28} className="text-[#0088A8] mb-1 opacity-80" />
                    <span className="text-[10px] font-bold tracking-widest text-[#054C5A]">MATEMATIKA</span>
                  </div>

                  <div className="p-4">
                    <span className="text-[9px] bg-[#EAF7FA] text-[#0088A8] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      KELAS {kelas.id}
                    </span>
                    <h4 className="font-bold text-sm mt-1 mb-1 text-[#17242E]">{kelas.nama}</h4>
                    <p className="text-[11px] text-[#71808D] leading-relaxed mb-3">{kelas.desc}</p>

                    <div className="flex gap-4 text-[11px] text-[#71808D] mb-3">
                      <span className="flex items-center gap-1"><BookOpen size={12} className="text-cyan-600" /> {kelas.materi} Materi</span>
                      <span className="flex items-center gap-1"><FileText size={12} className="text-cyan-600" /> {kelas.tugas} Tugas</span>
                    </div>

                    <div className="text-[10px] text-[#71808D] pt-2 border-t border-gray-100">
                      <p className="font-bold text-[#17242E]">{kelas.tahun}</p>
                    </div>
                  </div>
                </div>

                {/* TOMBOL LIHAT KELAS */}
                <div className="px-4 pb-2">
                  <button
                    onClick={() => onPilihKelas(kelas)}
                    className="w-full py-2 bg-[#054C5A] text-white rounded-xl text-xs font-semibold hover:bg-[#033742] transition cursor-pointer shadow-xs"
                  >
                    Lihat Kelas
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 text-xs">
              Kelas tidak ditemukan.
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default DaftarKelas;