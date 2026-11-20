import { ChevronDown, Info } from 'lucide-react';
import UserFormModal from '../users/UserFormModal';

export default function CourseFormModal({
  isOpen,
  isEdit = false,
  form,
  setForm,
  classes = [],
  subjects = [],
  teachers = [],
  onClose,
  onSubmit,
  saving = false,
}) {
  // Temukan mapel dan kelas terpilih untuk pratinjau otomatis
  const selectedSubject = subjects.find((s) => s.id === form.subject_id);
  const selectedClass = classes.find((c) => c.id === form.class_id);

  const studentCount = selectedClass
    ? selectedClass.total_students ?? selectedClass.students?.[0]?.count ?? 0
    : 0;

  return (
    <UserFormModal
      isOpen={isOpen}
      title={isEdit ? 'Edit Data Course' : 'Tambah Course Baru'}
      subtitle={
        isEdit
          ? 'Perbarui mata pelajaran, kelas, guru pengampu, atau periode course'
          : 'Bentuk course baru berdasarkan kelas, mata pelajaran, dan guru pengampu'
      }
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Simpan Course'}
    >
      {/* 1. Mata Pelajaran */}
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
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* 2. Kelas */}
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
            {classes.map((cls) => {
              const count = cls.total_students ?? cls.students?.[0]?.count;
              const label = count !== undefined
                ? `${cls.name} — ${count} Siswa`
                : cls.name;
              return (
                <option key={cls.id} value={cls.id}>
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* 3. Guru Pengampu */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
          Guru Pengampu <span className="text-red-500">*</span>
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
            <option value="">-- Pilih Guru Pengampu --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.nip ? `(NIP: ${t.nip})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* 4. Grid 2 Kolom: Tahun Ajaran & Semester */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={20}
            value={form.academic_year}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, academic_year: e.target.value }))
            }
            placeholder="Contoh: 2026/2027"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Semester <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              required
              value={form.semester}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, semester: e.target.value }))
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 5. Kotak Pratinjau Otomatis (Info Box Teal Muda) */}
      {selectedSubject && selectedClass && (
        <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3.5 text-xs text-teal-800 flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-[#008994] mt-0.5" />
          <div className="leading-relaxed font-medium">
            <span className="font-bold text-[#008994]">Pratinjau Course:</span>{' '}
            <strong className="text-slate-800">
              {selectedSubject.name} — {selectedClass.name}
            </strong>{' '}
            • Otomatis mencakup{' '}
            <strong className="text-slate-800">{studentCount}</strong> siswa dari kelas{' '}
            <strong className="text-slate-800">{selectedClass.name}</strong>.
          </div>
        </div>
      )}
    </UserFormModal>
  );
}
