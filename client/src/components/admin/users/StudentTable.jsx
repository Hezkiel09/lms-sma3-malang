export default function StudentTable({
  students = [],
  loading = false,
  onDetail,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm text-slate-600">
        <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <tr>
            <th className="py-3 px-4">ID/NIS</th>
            <th className="py-3 px-4">NAMA SISWA</th>
            <th className="py-3 px-4">KELAS</th>
            <th className="py-3 px-4">ORANG TUA/WALI</th>
            <th className="py-3 px-4">STATUS</th>
            <th className="py-3 px-4 text-right">AKSI</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 font-medium">
          {loading ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-slate-400">
                Memuat data siswa...
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-slate-400">
                Data siswa tidak ditemukan.
              </td>
            </tr>
          ) : (
            students.map((siswa) => (
              <tr
                key={siswa.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {/* NIS */}
                <td className="py-4 px-4 text-slate-500">
                  {siswa.nis || '-'}
                </td>

                {/* Nama */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100/70 text-xs font-bold text-cyan-800">
                      {siswa.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="font-bold text-slate-800">
                      {siswa.name}
                    </span>
                  </div>
                </td>

                {/* Kelas */}
                <td className="py-4 px-4 text-slate-700 font-medium">
                  {siswa.classes?.name || '-'}
                </td>

                {/* Orang Tua */}
                <td className="py-4 px-4 text-slate-500">
                  {siswa.parents?.name || '-'}
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Aktif
                  </span>
                </td>

                {/* Action */}
                <td className="py-4 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDetail(siswa)}
                    className="text-xs font-semibold text-[#008994] hover:text-[#00707a] transition-colors"
                  >
                    Detail ...
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
