import React, { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  Award, 
  TrendingDown, 
  Clock, 
  ChevronDown,
  FileText
} from 'lucide-react';

const TabNilaiGuru = ({ onKeDetailNilai, onKeInputNilai }) => {
  const [filterAsesmen, setFilterAsesmen] = useState('Latihan Mandiri: Grafik Parabola');
  const [filterJenis, setFilterJenis] = useState('Tugas');
  const [cariSiswa, setCariSiswa] = useState('');

  const [daftarNilai] = useState([
    { id: 1, nama: 'Aditya Pratama', nis: '0012345', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '21 Jan 2026', status: 'SUDAH DINILAI', nilai: 85 },
    { id: 2, nama: 'Nadia Putri', nis: '0012346', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '21 Jan 2026', status: 'SUDAH DINILAI', nilai: 98 },
    { id: 3, nama: 'Rizky Ramadhan', nis: '0012347', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '21 Jan 2026', status: 'SUDAH DINILAI', nilai: 65 },
    { id: 4, nama: 'Dedi Kurniawan', nis: '0012348', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '20 Jan 2026', status: 'BELUM DINILAI', nilai: '--' },
    { id: 5, nama: 'Siti Aisyah', nis: '0012349', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '20 Jan 2026', status: 'SUDAH DINILAI', nilai: 90 },
    { id: 6, nama: 'Bima Saputra', nis: '0012350', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '20 Jan 2026', status: 'BELUM DINILAI', nilai: '--' },
    { id: 7, nama: 'Rani Maharani', nis: '0012351', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '21 Jan 2026', status: 'TERLAMBAT', nilai: '--' },
    { id: 8, nama: 'Fajar Hidayat', nis: '0012352', asesmen: 'Latihan Mandiri: Grafik Parabola', jenis: 'TUGAS', dikumpulkan: '--', status: 'TERLEWAT', nilai: '--' },
  ]);

  return (
    <div className="space-y-8 w-full">
      
      {/* FILTER & PENCARIAN BOX */}
      {/* FILTER & PENCARIAN BOX */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.06)] grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative">
          <label className="block text-[10px] font-bold text-[#71808D] uppercase tracking-wider mb-2">Asesmen</label>
          <div className="relative w-full">
            <select 
              value={filterAsesmen}
              onChange={(e) => setFilterAsesmen(e.target.value)}
              className="w-full px-4 py-3 bg-cyan-50/30 rounded-2xl border border-cyan-100 text-xs font-semibold text-[#17242E] focus:outline-none appearance-none cursor-pointer pr-10"
            >
              <option>Latihan Mandiri: Grafik Parabola</option>
              <option>Proyek Analisis Data</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="relative">
          <label className="block text-[10px] font-bold text-[#71808D] uppercase tracking-wider mb-2">Jenis Asesmen</label>
          <div className="relative w-full">
            <select 
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-4 py-3 bg-cyan-50/30 rounded-2xl border border-cyan-100 text-xs font-semibold text-[#17242E] focus:outline-none appearance-none cursor-pointer pr-10"
            >
              <option>Tugas</option>
              <option>Quiz</option>
              <option>Ujian</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="relative">
          <label className="block text-[10px] font-bold text-[#71808D] uppercase tracking-wider mb-2">Cari Siswa</label>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" size={16} />
            <input 
              type="text" 
              placeholder="Nama..." 
              value={cariSiswa}
              onChange={(e) => setCariSiswa(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cyan-50/30 rounded-2xl border border-cyan-100 text-xs text-[#17242E] focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* STATS CARDS (4 KOTAK STATISTIK NILAI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider mb-1">RATA-RATA NILAI</p>
            <h3 className="text-3xl font-bold text-[#17242E]">84,5</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#0088A8] flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider mb-1">NILAI TERTINGGI</p>
            <h3 className="text-3xl font-bold text-[#17242E]">98</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#0088A8] flex items-center justify-center">
            <Award size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider mb-1">NILAI TERENDAH</p>
            <h3 className="text-3xl font-bold text-[#17242E]">65</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#0088A8] flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider mb-1">BELUM DINILAI</p>
            <h3 className="text-3xl font-bold text-[#17242E]">4</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-[#0088A8] flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

      </div>

      {/* TABEL REKAP NILAI SISWA */}
      <div className="bg-[#F8FAFC]/60 p-6 rounded-3xl border border-gray-100 shadow-2xs w-full">
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E0F7FA]/40 text-[11px] font-bold text-[#006064] uppercase border-b border-gray-100">
                <th className="py-4 px-5">SISWA</th>
                <th className="py-4 px-5">ASESMEN</th>
                <th className="py-4 px-5">JENIS ASESMEN</th>
                <th className="py-4 px-5">DIKUMPULKAN</th>
                <th className="py-4 px-5">STATUS</th>
                <th className="py-4 px-5">NILAI</th>
                <th className="py-4 px-5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {daftarNilai.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-5">
                    <p className="font-bold text-[#17242E]">{item.nama}</p>
                    <p className="text-[10px] text-[#71808D] mt-0.5">NIS: {item.nis}</p>
                  </td>
                  <td className="py-4 px-5 text-[#17242E] font-medium">{item.asesmen}</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-[#0088A8] text-[10px] font-bold border border-cyan-100">
                      {item.jenis}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[#71808D]">{item.dikumpulkan}</td>
                  <td className="py-4 px-5">
                    {item.status === 'SUDAH DINILAI' && (
                      <span className="px-3 py-1 rounded-full bg-[#E8F8F0] text-[#10B981] text-[10px] font-bold">Sudah Dinilai</span>
                    )}
                    {item.status === 'BELUM DINILAI' && (
                      <span className="px-3 py-1 rounded-full bg-[#E0F7FA] text-[#0088A8] text-[10px] font-bold">Belum Dinilai</span>
                    )}
                    {item.status === 'TERLAMBAT' && (
                      <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-[10px] font-bold">Terlambat</span>
                    )}
                    {item.status === 'TERLEWAT' && (
                      <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-bold">Terlewat</span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`font-bold text-sm px-3 py-1 rounded-xl ${item.nilai !== '--' ? 'bg-cyan-50/50 text-[#0088A8] border border-cyan-100' : 'text-gray-400 border border-dashed border-gray-200'}`}>
                      {item.nilai}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.nilai !== '--' ? (
                        <>
                          <button 
                            onClick={onKeDetailNilai}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 text-[#17242E] hover:bg-gray-200 transition font-bold text-[11px] cursor-pointer"
                          >
                            Lihat Nilai
                          </button>
                          <button 
                            onClick={onKeInputNilai}
                            className="px-3 py-1.5 rounded-xl bg-[#054C5A] text-white hover:bg-[#033742] transition font-bold text-[11px] cursor-pointer shadow-xs"
                          >
                            Edit Nilai
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={onKeInputNilai}
                          className="px-4 py-1.5 rounded-xl bg-[#054C5A] text-white hover:bg-[#033742] transition font-bold text-[11px] cursor-pointer shadow-xs w-full"
                        >
                          Lihat
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TabNilaiGuru;