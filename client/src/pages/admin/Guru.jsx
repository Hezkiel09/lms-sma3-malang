import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function GuruPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    apiFetch('/master/users/teachers')
      .then((data) => {
        if (active) setTeachers(data);
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
          Data Guru &amp; Tenaga Kependidikan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola data pengajar dan staf SMAN 3 Malang.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Memuat data guru...</p>
        ) : error ? (
          <p role="alert" className="py-8 text-center text-sm text-red-600">
            Gagal memuat data guru: {error}
          </p>
        ) : teachers.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Belum ada data guru.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">NIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-4 py-4 font-semibold text-slate-800">{teacher.name}</td>
                  <td className="px-4 py-4">{teacher.nip || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
