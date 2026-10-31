import React, { useState } from 'react';
import { 
  FileText, 
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react';

const TabTugasGuru = ({ onKeEditTugas }) => {
  const [daftarTugas] = useState([
    {
      id: 1,
      judul: 'Latihan Mandiri: Grafik Parabola',
      dibuat: 'Dibuat pada 20 Jan 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '27 Jan 2026',
      status: 'Aktif'
    },
    {
      id: 2,
      judul: 'Proyek Matematika: Analisis Data',
      dibuat: 'Dibuat pada 15 Feb 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '05 Mar 2026',
      status: 'Dijadwalkan'
    },
    {
      id: 3,
      judul: 'Tugas Trigonometri',
      dibuat: 'Dibuat pada 10 Feb 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '20 Feb 2026',
      status: 'Tutup'
    }
  ]);

  return (
    <div className="space-y-8 w-full">
      {/* STATS CARDS (4 KOTAK STATISTIK) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-bold text-[#17242E] mb-1">12</h3>
          <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL TUGAS</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-bold text-[#17242E] mb-1">458</h3>
          <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">PENGUMPULAN</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-bold text-[#17242E] mb-1">82%</h3>
          <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TINGKAT PENYELESAIAN</p>
        </div>

        <div className="bg-[#054C5A] p-6 rounded-3xl shadow-[0_8px_20px_rgba(5,76,90,0.2)] flex flex-col justify-center items-center text-center text-white">
          <h3 className="text-3xl font-bold mb-1">5</h3>
          <p className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">PERLU DINILAI</p>
        </div>
      </div>

      {/* TABEL DAFTAR TUGAS */}
      <div className="bg-[#F8FAFC]/60 p-6 rounded-3xl border border-gray-100 shadow-2xs w-full">
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E0F7FA]/40 text-[11px] font-bold text-[#006064] uppercase border-b border-gray-100">
                <th className="py-4 px-5">TUGAS</th>
                <th className="py-4 px-5">MATA PELAJARAN</th>
                <th className="py-4 px-5">KELAS</th>
                <th className="py-4 px-5">TENGGAT</th>
                <th className="py-4 px-5">STATUS</th>
                <th className="py-4 px-5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {daftarTugas.map((tugas) => (
                <tr key={tugas.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-5">
                    <p className="font-bold text-[#17242E]">{tugas.judul}</p>
                    <p className="text-[11px] text-[#71808D] mt-0.5">{tugas.dibuat}</p>
                  </td>
                  <td className="py-4 px-5 text-[#71808D] font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-50 text-[#0088A8] flex items-center justify-center">
                      <FileText size={14} />
                    </span>
                    {tugas.mapel}
                  </td>
                  <td className="py-4 px-5 text-[#71808D] font-medium">{tugas.kelas}</td>
                  <td className="py-4 px-5 text-[#71808D] font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {tugas.tenggat}
                  </td>
                  <td className="py-4 px-5">
                    {tugas.status === 'Aktif' && (
                      <span className="px-3 py-1 rounded-full bg-[#E8F8F0] text-[#10B981] text-[11px] font-bold">Aktif</span>
                    )}
                    {tugas.status === 'Dijadwalkan' && (
                      <span className="px-3 py-1 rounded-full bg-[#E0F7FA] text-[#0088A8] text-[11px] font-bold">Dijadwalkan</span>
                    )}
                    {tugas.status === 'Tutup' && (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold">Tutup</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* TOMBOL IKON PULPEN (EDIT TUGAS) */}
                      <button 
                        onClick={onKeEditTugas}
                        className="p-2 rounded-xl bg-cyan-50 text-[#0088A8] hover:bg-cyan-100 transition cursor-pointer"
                        title="Edit Tugas"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={() => alert(`Hapus tugas: ${tugas.judul}`)}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition cursor-pointer"
                        title="Hapus Tugas"
                      >
                        <Trash2 size={15} />
                      </button>
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

export default TabTugasGuru;