export default function StudentDetailModal({
  isOpen,
  student,
  onClose,
  onEdit,
  onDelete,
  deleting,
}) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Detail Siswa</h2>
            <p className="mt-1 text-xs text-slate-400">
              Informasi lengkap data siswa
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-6">
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-800">
              {student.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                {student.name || '-'}
              </h3>
              <p className="text-xs text-slate-400">
                NIS: {student.nis || '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                NIS
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {student.nis || '-'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Kelas
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {student.classes?.name || '-'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Tingkat
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {student.classes?.level || '-'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Jurusan
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {student.classes?.major || '-'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Orang Tua/Wali
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {student.parents?.name || '-'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                No. Telepon Wali
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {student.parents?.phone || '-'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Email Akun
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {student.users?.email || '-'}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Status
            </p>
            <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Aktif
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={() => onDelete(student)}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Menghapus...' : 'Hapus Siswa'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={() => onEdit(student)}
              disabled={deleting}
              className="rounded-xl bg-[#008994] px-5 py-2 text-xs font-semibold text-white hover:bg-[#007682] transition-colors disabled:opacity-50"
            >
              Edit Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
