export default function UserFormModal({
  isOpen,
  title,
  subtitle,
  onClose,
  onSubmit,
  saving = false,
  submitLabel = 'Simpan',
  savingLabel = 'Menyimpan...',
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="space-y-4 px-6 py-6 max-h-[75vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#008994] px-5 py-2 text-xs font-semibold text-white hover:bg-[#007682] transition-colors disabled:opacity-50"
            >
              {saving ? savingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
