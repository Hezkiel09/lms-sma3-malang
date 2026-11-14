import { GraduationCap, Edit2, Trash2 } from 'lucide-react';

export default function SubjectCardGrid({
  subjects = [],
  loading = false,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-xs text-slate-400">
        Memuat data mata pelajaran...
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-xs text-slate-400">
        Mata pelajaran tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {subjects.map((mapel) => (
        <div
          key={mapel.id}
          className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition-all group"
        >
          <div>
            {/* Header: Icon, Badge, and Edit/Delete Actions */}
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  Mapel
                </span>

                <button
                  type="button"
                  onClick={() => onEdit(mapel)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#008994] transition-colors"
                  title="Edit Mata Pelajaran"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(mapel)}
                  disabled={deletingId === mapel.id}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Hapus Mata Pelajaran"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="mt-4">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-[#008994] transition-colors">
                {mapel.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kurikulum SMA Negeri 3 Malang
              </p>
            </div>

            {/* Info: Status Kurikulum */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs text-slate-500 font-medium">
              <span>Status Kurikulum</span>
              <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Aktif
              </span>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onEdit(mapel)}
              className="text-xs font-semibold text-[#008994] hover:text-[#00707a] transition-colors"
            >
              Ubah Nama
            </button>

            <button
              type="button"
              onClick={() => onDelete(mapel)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
