import { GraduationCap, Edit2, Trash2, Users } from 'lucide-react';

export default function CourseTable({
  courses = [],
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
            <th className="py-3 px-4">NAMA COURSE</th>
            <th className="py-3 px-4">KELAS</th>
            <th className="py-3 px-4">GURU PENGAMPU</th>
            <th className="py-3 px-4">ANGGOTA & KONTEN</th>
            <th className="py-3 px-4">PERIODE & STATUS</th>
            <th className="py-3 px-4 text-right">AKSI</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 font-medium">
          {loading ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-slate-400">
                Memuat data course...
              </td>
            </tr>
          ) : courses.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-slate-400">
                Course tidak ditemukan.
              </td>
            </tr>
          ) : (
            courses.map((course) => {
              const subjectName = course.subject?.name || course.subjects?.name || 'Mata Pelajaran';
              const className = course.class?.name || course.classes?.name || 'Kelas';
              const teacherName = course.teacher?.name || course.teachers?.name || 'Belum Ditentukan';
              const studentCount = course.student_count ?? 0;
              const sectionCount = course.section_count ?? 0;
              const academicYear = course.academic_year || '2026/2027';
              const semester = course.semester || 'Ganjil';

              return (
                <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Nama Course */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#008994]">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {subjectName} — {className}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400">
                          {subjectName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Kelas */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {className}
                    </span>
                  </td>

                  {/* Guru Pengampu */}
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    {teacherName}
                  </td>

                  {/* Anggota & Konten */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{studentCount} Siswa</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">{sectionCount} Section</span>
                    </div>
                  </td>

                  {/* Periode & Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs font-semibold text-slate-700">
                        {academicYear} • {semester}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Aktif
                      </span>
                    </div>
                  </td>

                  {/* Aksi */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(course)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#008994] transition-colors"
                          title="Edit Course"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(course)}
                          disabled={deletingId === course.id}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Hapus Course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
