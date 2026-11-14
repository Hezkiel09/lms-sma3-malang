import React, { useState } from 'react';
import { FileText, CheckCircle, Search } from 'lucide-react';

const TabTugasSiswa = ({ daftarTugas = [], onPilihTugas }) => {
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('Terbaru');

  // 1. Filter tugas berdasarkan kata kunci pencarian
  const filteredTugas = daftarTugas.filter(tugas =>
    (tugas.title && tugas.title.toLowerCase().includes(keyword.toLowerCase())) ||
    (tugas.instructions && tugas.instructions.toLowerCase().includes(keyword.toLowerCase()))
  );

  // 2. Urutkan (Sort) berdasarkan pilihan Sort by
  const sortedTugas = [...filteredTugas].sort((a, b) => {
    if (sortBy === 'Deadline Terdekat') {
      // Mengurutkan berdasarkan tanggal deadline terdekat
      const dateA = new Date(a.deadline_raw || a.deadline || '2026-12-31');
      const dateB = new Date(b.deadline_raw || b.deadline || '2026-12-31');
      return dateA - dateB;
    } else {
      // Default: Terbaru (berdasarkan ID atau tanggal dibuat, misal ID terbesar di atas)
      return (b.id || 0) - (a.id || 0);
    }
  });

  return (
    <div className="space-y-6 w-full">
      {/* FILTER PENCARIAN & SORTING */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari tugas..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#71808D] font-medium">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#17242E] focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="Terbaru">Terbaru</option>
            <option value="Deadline Terdekat">Deadline Terdekat</option>
          </select>
        </div>
      </div>

      {/* LIST KARTU TUGAS (Menggunakan data dari sortedTugas) */}
      <div className="space-y-4">
        {sortedTugas.length > 0 ? (
          sortedTugas.map((tugas) => {
            const savedSelesai = JSON.parse(localStorage.getItem('tugasSelesai_siswa') || '{}');
            const isSelesai = savedSelesai[tugas.id] || savedSelesai[tugas.title];

            return (
              <div 
                key={tugas.id}
                onClick={() => {
                  if (onPilihTugas) onPilihTugas(tugas.id);
                }}
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4 cursor-pointer hover:border-[#0088A8] transition w-full"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-md border border-pink-100">
                        TUGAS
                      </span>
                      <h3 className="text-base font-bold text-[#17242E]">{tugas.title || 'Latihan Mandiri: Grafik Parabola'}</h3>
                    </div>
                    <p className="text-xs text-[#71808D]">Kelas: Matematika X-A</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">DEADLINE</p>
                    <p className="text-xs font-bold text-[#17242E] mt-0.5">{tugas.deadline_formatted || '12/10/2026'}</p>
                  </div>
                </div>

                <p className="text-xs text-[#17242E] leading-relaxed">
                  {tugas.instructions || 'Selesaikan soal sesuai petunjuk yang terlampir. Lampirkan langkah-langkah penyelesaian.'}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <FileText size={12} /> Lampiran
                    </span>
                    <a 
                      href="#" 
                      onClick={(e) => { e.stopPropagation(); alert("Mengunduh lampiran tugas..."); }}
                      className="text-xs font-semibold text-[#0088A8] hover:underline flex items-center gap-1"
                    >
                      {tugas.file_name || 'Soal_SPL_01.pdf'}
                    </a>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPilihTugas) onPilihTugas(tugas.id);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                      isSelesai
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#054C5A] hover:bg-[#033742] text-white'
                    }`}
                  >
                    {isSelesai ? <CheckCircle size={14} /> : null}
                    {isSelesai ? 'Selesai' : 'Tandai selesai'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-400 text-xs bg-white rounded-3xl border border-gray-200">
            Belum ada tugas untuk mata pelajaran ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default TabTugasSiswa;