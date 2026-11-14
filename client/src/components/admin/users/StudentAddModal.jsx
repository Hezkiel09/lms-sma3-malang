import { ChevronDown } from 'lucide-react';

export default function StudentAddModal({
  isOpen,
  addForm,
  setAddForm,
  onClose,
  onSubmit,
  saving,
  classes = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Tambah Siswa Baru
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Daftarkan akun dan data siswa baru ke sistem
            </p>
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

        {/* Form Content */}
        <form onSubmit={onSubmit}>
          <div className="space-y-4 px-6 py-6">
            {/* Nama Siswa */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Masukkan nama lengkap siswa"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Nama lengkap siswa sesuai dokumen resmi (maks. 100 karakter).
              </p>
            </div>

            {/* NIS */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
                  NIS (Nomor Induk Siswa) <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {addForm.nis.length}/10 digit
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={10}
                value={addForm.nis}
                onChange={(e) =>
                  setAddForm((prev) => ({
                    ...prev,
                    nis: e.target.value.replace(/\D/g, '').slice(0, 10),
                  }))
                }
                placeholder="Contoh: 2026101"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Hanya angka, antara 5 - 10 digit (contoh: 2026101).
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                Email Akun <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                maxLength={100}
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="contoh: siswa.nama@sman3malang.sch.id"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Gunakan alamat email aktif siswa (maks. 100 karakter).
              </p>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
                  Password Akun <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Min. 6 - Maks. 50 karakter
                </span>
              </div>
              <input
                type="password"
                required
                minLength={6}
                maxLength={50}
                value={addForm.password}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Minimal 6 karakter dan maksimal 50 karakter untuk keamanan akun.
              </p>
            </div>

            {/* Dropdown Kelas */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                Kelas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={addForm.class_id}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, class_id: e.target.value }))
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.major ? `(${cls.major})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              {classes.length === 0 ? (
                <p className="mt-1 text-[11px] text-amber-600 font-medium">
                  Belum ada data kelas yang dapat dipilih.
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400">
                  Wajib memilih kelas tempat siswa terdaftar.
                </p>
              )}
            </div>
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
              {saving ? 'Menyimpan...' : 'Simpan Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
