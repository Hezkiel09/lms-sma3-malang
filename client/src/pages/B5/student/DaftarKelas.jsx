import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import SidebarSiswa from './SidebarSiswa';
import TopbarSiswa from './TopbarSiswa'; 

const DaftarKelas = ({ onKembali, onPilihKelas, onKeProfil }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Data daftar kelas siswa (Sesuai dengan gambar desain Figma)
  const [daftarKelas] = useState([
    {
      id: 'matematika',
      nama: 'Matematika X A',
      mapel: 'MATEMATIKA',
      kelasBadge: 'KELAS X A',
      desc: 'Pelajari persamaan linear, fungsi, dan grafik melalui latihan soal.',
      materi: 12,
      tugas: 8,
      tahun: '2026 / 2027 • Semester Ganjil',
      guru: 'Budi Santoso',
      progress: 75,
      coverBg: 'bg-[#DDF6F9]',
    },
    {
      id: 'biologi',
      nama: 'Biologi X A',
      mapel: 'BIOLOGI',
      kelasBadge: 'KELAS X A',
      desc: 'Kenali sel, keanekaragaman hayati, dan ekosistem di sekitar kita.',
      materi: 10,
      tugas: 6,
      tahun: '2026 / 2027 • Semester Ganjil',
      guru: 'Siti Rahayu',
      progress: 40,
      coverBg: 'bg-[#DDF6F9]',
    },
    {
      id: 'inggris',
      nama: 'Bahasa Inggris X A',
      mapel: 'BAHASA INGGRIS',
      kelasBadge: 'KELAS X A',
      desc: 'Latih speaking, reading, dan writing untuk komunikasi sehari-hari.',
      materi: 14,
      tugas: 7,
      tahun: '2026 / 2027 • Semester Ganjil',
      guru: 'Dewi Lestari',
      progress: 100,
      coverBg: 'bg-[#DDF6F9]',
    },
    {
      id: 'indo',
      nama: 'Bahasa Indonesia X A',
      mapel: 'BAHASA INDONESIA',
      kelasBadge: 'KELAS X A',
      desc: 'Pelajari teks observasi, anekdot, dan cara menulis dengan baik.',
      materi: 12,
      tugas: 6,
      tahun: '2026 / 2027 • Semester Ganjil',
      guru: 'Rina Wulandari',
      progress: 60,
      coverBg: 'bg-[#DDF6F9]',
    },
    {
      id: 'kimia',
      nama: 'Kimia X A',
      mapel: 'KIMIA',
      kelasBadge: 'KELAS X A',
      desc: 'Pahami struktur atom, tabel periodik, dan dasar ikatan kimia.',
      materi: 11,
      tugas: 8,
      tahun: '2026 / 2027 • Semester Ganjil',
      guru: 'Agus Pratama',
      progress: 25,
      coverBg: 'bg-[#DDF6F9]',
    },
    {
      id: 'ips',
      nama: 'IPS X A',
      mapel: 'IPS',
      kelasBadge: 'KELAS X A',
      desc: 'Jelajahi interaksi sosial, kegiatan ekonomi, dan kondisi geografis.',
      materi: 10,
      tugas: 5,
      tahun: '2026 / 2027 • Semester Ganjil',
      guru: 'Andi Saputra',
      progress: 10,
      coverBg: 'bg-[#DDF6F9]',
    },
  ]);

  // Logika Pencarian
  const filteredKelas = daftarKelas.filter(k =>
    k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.guru.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      
      {/* SIDEBAR SISWA */}
      <SidebarSiswa 
        menuAktif="beranda" 
        onPilihMenu={(menu) => {
          if (menu === 'beranda' && onKembali) {
            onKembali();
          }
        }} 
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        
        {/* TOPBAR SISWA */}
        <TopbarSiswa 
          searchTerm={searchTerm}
          onSearchChange={(val) => setSearchTerm(val)}
          placeholder="Cari kelas..."
          onKeProfil={onKeProfil}
        />

        {/* BREADCRUMB DENGAN TOMBOL KEMBALI */}
        <div className="mb-4 flex items-center gap-3 mt-4">
          <button 
            onClick={onKembali}
            className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">KELAS SAYA</span>
          </p>
        </div>

        {/* HEADER TITLE */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#17242E]">Kelas Saya</h2>
        </div>

        {/* GRID KELAS SISWA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredKelas.length > 0 ? (
            filteredKelas.map((kelas) => (
              <div key={kelas.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex flex-col justify-between p-2 w-full hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition-all duration-300">
                <div>
                  {/* Header Cover Kartu */}
                  <div className={`h-28 ${kelas.coverBg} rounded-2xl flex flex-col items-center justify-center text-[#007088] p-4 relative overflow-hidden`}>
                    <ImageIcon size={28} className="text-[#0088A8] mb-1 opacity-80" />
                    <span className="text-[10px] font-bold tracking-widest text-[#054C5A]">{kelas.mapel}</span>
                  </div>

                  <div className="p-4">
                    <span className="text-[9px] bg-[#EAF7FA] text-[#0088A8] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                      {kelas.kelasBadge}
                    </span>
                    <h4 className="font-bold text-base mt-2 mb-1 text-[#17242E]">{kelas.nama}</h4>
                    <p className="text-xs text-[#71808D] leading-relaxed mb-4 line-clamp-2">{kelas.desc}</p>

                    {/* Info Materi & Tugas */}
                    <div className="flex gap-4 text-xs text-[#0088A8] font-medium mb-4">
                      <span className="flex items-center gap-1.5 bg-[#E0F7FA] px-2.5 py-1 rounded-lg">
                        <BookOpen size={14} /> {kelas.materi} Materi
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#E0F7FA] px-2.5 py-1 rounded-lg">
                        <FileText size={14} /> {kelas.tugas} Tugas
                      </span>
                    </div>

                    {/* Informasi Tahun & Pengajar */}
                    <div className="text-[11px] text-[#71808D] pt-3 border-t border-gray-100 space-y-0.5">
                      <p>{kelas.tahun}</p>
                      <p className="font-medium text-[#17242E]">Guru pengajar: {kelas.guru}</p>
                    </div>

                    {/* Progress Bar Belajar */}
                    <div className="mt-4 mb-2">
                      <div className="flex justify-between text-[11px] font-bold text-[#71808D] mb-1">
                        <span>Progress</span>
                        <span>{kelas.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0088A8] h-full rounded-full transition-all duration-500"
                          style={{ width: `${kelas.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOMBOL LIHAT KELAS */}
                <div className="px-4 pb-3">
                  <button
                    onClick={() => onPilihKelas(kelas)}
                    className="w-full py-2.5 bg-[#054C5A] text-white rounded-2xl text-xs font-bold hover:bg-[#033742] transition cursor-pointer shadow-xs"
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