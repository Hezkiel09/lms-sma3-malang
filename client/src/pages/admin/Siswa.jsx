import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function SiswaPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    apiFetch('/master/users/students')
      .then((data) => {
        if (active) setStudents(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
          Data Siswa
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola data induk peserta didik SMAN 3 Malang.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Memuat data siswa...</p>
        ) : error ? (
          <p role="alert" className="py-8 text-center text-sm text-red-600">
            Gagal memuat data siswa: {error}
          </p>
        ) : students.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Belum ada data siswa.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Orang tua/wali</th>
                <th className="px-4 py-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-4">{student.nis}</td>
                  <td className="px-4 py-4 font-semibold text-slate-800">{student.name}</td>
                  <td className="px-4 py-4">{student.classes?.name || '-'}</td>
                  <td className="px-4 py-4">{student.parents?.name || '-'}</td>
                  <td className="px-4 py-4">{student.users?.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
