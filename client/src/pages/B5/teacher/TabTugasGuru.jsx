import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Pencil, 
  Trash2 
} from 'lucide-react';

const DEFAULT_COURSE_ID = "bf720e90-1886-4c01-9868-249181f900dc";

const TabTugasGuru = ({ searchTerm = '', courseId = DEFAULT_COURSE_ID, onKeEditTugas, onPilihTugas }) => {
  const [daftarTugas, setDaftarTugas] = useState([
    {
      id: '5b889cf4-a272-4095-b5b9-053b76e4d7e9',
      judul: 'Latihan Mandiri: Grafik Parabola',
      dibuat: 'Dibuat pada 20 Jan 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '27 Jan 2026',
      status: 'Aktif'
    },
    {
      id: '01d765c1-eea2-44c9-95f2-64e703a63a39',
      judul: 'Proyek Matematika: Analisis Data',
      dibuat: 'Dibuat pada 15 Feb 2026',
      mapel: 'Matematika X A',
      kelas: 'Kelas X-A',
      tenggat: '05 Mar 2026',
      status: 'Dijadwalkan'
    },
  ]);

  useEffect(() => {
    const fetchTugas = async () => {
      try {
        const id = courseId || DEFAULT_COURSE_ID;
        const res = await fetch(`http://localhost:5000/api/v1/b5/courses/${id}/assignments`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped = json.data.map((t) => {
              const now = new Date();
              const deadlineDate = t.deadline ? new Date(t.deadline) : null;
              const isAktif = deadlineDate ? deadlineDate > now : true;

              return {
                id: t.id,
                judul: t.title,
                dibuat: t.created_at
                  ? `Dibuat pada ${new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : '-',
                mapel: 'Matematika X A',
                kelas: 'Kelas X-A',
                tenggat: t.deadline
                  ? new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '-',
                status: isAktif ? 'Aktif' : 'Tutup',
              };
            });
            setDaftarTugas(mapped);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat tugas dari API di TabTugasGuru:', err);
      }
    };

    fetchTugas();
  }, [courseId]);

  const filteredDaftarTugas = daftarTugas.filter(tugas =>
    tugas.judul.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    tugas.mapel.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="space-y-8 w-full">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-bold text-[#17242E] mb-1">{daftarTugas.length}</h3>
          <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL TUGAS</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-bold text-[#17242E] mb-1">{daftarTugas.length * 30}</h3>
          <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">ESTIMASI SISWA</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_20px_rgba(0,136,168,0.08)] flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl font-bold text-[#17242E] mb-1">100%</h3>
          <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">AKTIVITAS</p>
        </div>

        <div className="bg-[#054C5A] p-6 rounded-3xl shadow-[0_8px_20px_rgba(5,76,90,0.2)] flex flex-col justify-center items-center text-center text-white">
          <h3 className="text-3xl font-bold mb-1">{daftarTugas.filter(t => t.status === 'Aktif').length}</h3>
          <p className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider">TUGAS AKTIF</p>
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
              {filteredDaftarTugas.length > 0 ? (
                filteredDaftarTugas.map((tugas) => (
                  <tr key={tugas.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-5">
                      <p 
                        onClick={() => {
                          if (onPilihTugas) {
                            onPilihTugas(tugas.id);
                          }
                        }}
                        className="font-bold text-[#17242E] hover:text-[#0088A8] transition cursor-pointer"
                      >
                        {tugas.judul}
                      </p>
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
                        <button 
                          onClick={() => {
                            if (onKeEditTugas) {
                              onKeEditTugas(tugas.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-cyan-50 text-[#0088A8] hover:bg-cyan-100 transition cursor-pointer" 
                          title="Edit Tugas"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    Tugas tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TabTugasGuru;
