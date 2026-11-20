import { Edit2, Trash2 } from 'lucide-react';

export default function ClassTable({
  classes = [],
  loading = false,
  onEdit,
  onDelete,
  deletingId,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Daftar Kelas Aktif</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Informasi kelas, tingkat, jurusan, dan wali kelas terdaftar di SMANTI Connect
          </p>
        </div>
        <span className="text-xs font-semibold text-[#008994]">
          Total: {classes.length} Kelas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-600">
          <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-4">NAMA KELAS</th>
              <th className="py-3 px-4">TINGKAT</th>
              <th className="py-3 px-4">JURUSAN</th>
              <th className="py-3 px-4">JUMLAH SISWA</th>
              <th className="py-3 px-4">WALI KELAS</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">AKSI</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">
                  Memuat data kelas...
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">
                  Belum ada data kelas terdaftar.
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-800">{cls.name}</td>
                  <td className="py-4 px-4 text-slate-600">Kelas {cls.level || '-'}</td>
                  <td className="py-4 px-4 text-slate-600">{cls.major || '-'}</td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    {cls.total_students || 0} Siswa
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {cls.teachers?.name || 'Belum Ditentukan'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Aktif
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(cls)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#008994] transition-colors"
                          title="Edit Kelas"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(cls)}
                          disabled={deletingId === cls.id}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
