export default function UserDetailModal({
  isOpen,
  title = 'Detail Pengguna',
  subtitle = 'Informasi lengkap data pengguna',
  user,
  avatarSubtitle,
  fields = [],
  onClose,
  onEdit,
  onDelete,
  deleting = false,
  deleteLabel = 'Hapus',
  editLabel = 'Edit Data',
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
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
        <div className="space-y-4 px-6 py-6 max-h-[75vh] overflow-y-auto">
          {/* Top user badge */}
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-800">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div>
              <h3 className="font-bold text-slate-800">{user.name || '-'}</h3>
              {avatarSubtitle && (
                <p className="text-xs text-slate-400">{avatarSubtitle}</p>
              )}
            </div>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f, idx) => (
              <div
                key={idx}
                className={f.fullWidth ? 'sm:col-span-2' : ''}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {f.label}
                </p>
                {f.isBadge ? (
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${f.badgeClass || 'bg-emerald-50 text-emerald-700'}`}>
                    {f.value || 'Aktif'}
                  </span>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {f.value || '-'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(user)}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Menghapus...' : deleteLabel}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Tutup
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(user)}
                disabled={deleting}
                className="rounded-xl bg-[#008994] px-5 py-2 text-xs font-semibold text-white hover:bg-[#007682] transition-colors disabled:opacity-50"
              >
                {editLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
