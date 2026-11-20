import { ChevronDown } from 'lucide-react';
import UserFormModal from '../users/UserFormModal';

export default function ScheduleFormModal({
  isOpen,
  isEdit = false,
  form,
  setForm,
  classes = [],
  subjects = [],
  teachers = [],
  daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  onClose,
  onSubmit,
  saving = false,
}) {
  return (
    <UserFormModal
      isOpen={isOpen}
      title={isEdit ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran Baru'}
      subtitle={
        isEdit
          ? 'Perbarui guru, waktu, atau ruang sesi pembelajaran'
          : 'Tetapkan alokasi mata pelajaran, guru, hari, dan ruang belajar'
      }
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Simpan Jadwal'}
    >
      {/* Dropdown Kelas */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Kelas <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            required
            value={form.class_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, class_id: e.target.value }))
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
      </div>

      {/* Dropdown Mata Pelajaran */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Mata Pelajaran <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            required
            value={form.subject_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, subject_id: e.target.value }))
            }
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          >
            <option value="">-- Pilih Mata Pelajaran --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.code ? `(${s.code})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Dropdown Guru Pengajar */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Guru Pengajar <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            required
            value={form.teacher_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, teacher_id: e.target.value }))
            }
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          >
            <option value="">-- Pilih Guru Pengajar --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.nip ? `(NIP: ${t.nip})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Hari & Waktu */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Hari <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              required
              value={form.day}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, day: e.target.value }))
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            >
              {daysList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Waktu Mulai <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            value={form.start_time}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, start_time: e.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Waktu Selesai <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            required
            value={form.end_time}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, end_time: e.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
        </div>
      </div>
    </UserFormModal>
  );
}
