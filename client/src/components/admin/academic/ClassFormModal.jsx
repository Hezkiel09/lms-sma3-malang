import UserFormModal from '../users/UserFormModal';

export default function ClassFormModal({
  isOpen,
  isEdit = false,
  form,
  setForm,
  teachers = [],
  onClose,
  onSubmit,
  saving = false,
}) {
  return (
    <UserFormModal
      isOpen={isOpen}
      title={isEdit ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
      subtitle={
        isEdit
          ? 'Perbarui nama, tingkat, jurusan, atau wali kelas'
          : 'Tambahkan rombongan belajar kelas baru ke dalam sistem SMANTI Connect'
      }
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Simpan Kelas'}
    >
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Nama Kelas <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={50}
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Contoh: XII MIPA 1"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Format umum: [Tingkat] [Jurusan] [Nomor], misal: X MIPA 2.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Tingkat
          </label>
          <select
            value={form.level || ''}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, level: e.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          >
            <option value="">Pilih Tingkat</option>
            <option value="X">Kelas X (10)</option>
            <option value="XI">Kelas XI (11)</option>
            <option value="XII">Kelas XII (12)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Jurusan
          </label>
          <select
            value={form.major || ''}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, major: e.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          >
            <option value="">Pilih Jurusan</option>
            <option value="MIPA">MIPA / IPA</option>
            <option value="IPS">IPS / Sosial</option>
            <option value="BAHASA">Bahasa</option>
            <option value="UMUM">Umum</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Wali Kelas
        </label>
        <select
          value={form.homeroom_teacher_id || ''}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              homeroom_teacher_id: e.target.value || null,
            }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
        >
          <option value="">-- Belum Ditentukan --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} {t.nip ? `(${t.nip})` : ''}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-slate-400">
          Guru yang bertugas mendampingi kelas ini.
        </p>
      </div>
    </UserFormModal>
  );
}
