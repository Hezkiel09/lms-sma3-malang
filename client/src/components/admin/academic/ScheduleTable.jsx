import { Clock, BookOpen, Edit2, Trash2 } from 'lucide-react';

export default function ScheduleTable({
  schedules = [],
  loading = false,
  onEdit,
  onDelete,
  deletingId,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm text-slate-600">
        <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <tr>
            <th className="py-3 px-4">HARI & WAKTU</th>
            <th className="py-3 px-4">MATA PELAJARAN</th>
            <th className="py-3 px-4">KELAS</th>
            <th className="py-3 px-4">GURU PENGAJAR</th>
            <th className="py-3 px-4">STATUS</th>
            <th className="py-3 px-4 text-right">AKSI</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 font-medium">
          {loading ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-slate-400">
                Memuat data jadwal pelajaran...
              </td>
            </tr>
          ) : schedules.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-slate-400">
                Jadwal pelajaran tidak ditemukan.
              </td>
            </tr>
          ) : (
            schedules.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Hari & Waktu */}
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#008994]">{item.day}</span>
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                    </span>
                  </div>
                </td>

                {/* Mata Pelajaran */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <div className="font-bold text-slate-800">
                      {item.subjects?.name || '-'}
                    </div>
                  </div>
                </td>

                {/* Kelas */}
                <td className="py-4 px-4">
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {item.classes?.name || '-'}
                  </span>
                </td>

                {/* Guru */}
                <td className="py-4 px-4 text-slate-700 font-medium">
                  {item.teachers?.name || '-'}
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Aktif
                  </span>
                </td>

                {/* Aksi */}
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#008994] transition-colors"
                      title="Edit Jadwal"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      disabled={deletingId === item.id}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
