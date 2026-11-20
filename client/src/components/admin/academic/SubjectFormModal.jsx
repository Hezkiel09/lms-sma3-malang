import UserFormModal from '../users/UserFormModal';

export default function SubjectFormModal({
  isOpen,
  isEdit = false,
  form,
  setForm,
  onClose,
  onSubmit,
  saving = false,
}) {
  return (
    <UserFormModal
      isOpen={isOpen}
      title={isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
      subtitle={
        isEdit
          ? 'Perbarui nama mata pelajaran'
          : 'Tambahkan mata pelajaran ke dalam kurikulum pembelajaran SMANTI'
      }
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Simpan Mata Pelajaran'}
    >
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Nama Mata Pelajaran <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={100}
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Contoh: Matematika Peminatan"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Masukkan nama mata pelajaran kurikulum (maksimal 100 karakter).
        </p>
      </div>
    </UserFormModal>
  );
}
