import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Loader2, User } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { isQuizAvailableNow } from '../../lib/quizAvailability';

export default function SiswaDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const profile = user?.profile || {};

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch('/quizzes'), apiFetch('/attempts'), apiFetch('/master/student/courses')])
      .then(([quizData, attemptData, courseData]) => {
        if (!active) return;
        const classCourses = Array.isArray(courseData) ? courseData : [];
        const courseSubjectIds = new Set(classCourses.map((course) => String(course.subject_id)));
        const classQuizzes = (Array.isArray(quizData) ? quizData : []).filter((quiz) => (
          profile.class_id
          && String(quiz.class_id) === String(profile.class_id)
          && quiz.subject_id
          && courseSubjectIds.has(String(quiz.subject_id))
          && isQuizAvailableNow(quiz)
        ));
        setQuizzes(classQuizzes);
        setAttempts(Array.isArray(attemptData) ? attemptData : []);
        setCourses(classCourses);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Gagal memuat kuis.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile.class_id]);

  const attemptByQuiz = new Map();
  attempts.forEach((attempt) => {
    if (!attemptByQuiz.has(String(attempt.quiz_id))) attemptByQuiz.set(String(attempt.quiz_id), attempt);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#008994] to-[#0b5566] p-8 text-white shadow-sm">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">Siswa Aktif</span>
        <h1 className="mt-2 text-2xl font-bold">Selamat Datang, {user?.name}!</h1>
        <p className="mt-1 text-sm text-cyan-100">Lihat mata pelajaran kelasmu, lalu mulai atau lanjutkan kuis yang tersedia.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-2 flex items-center gap-3 text-slate-400"><User className="h-5 w-5 text-[#008994]" /><span className="text-xs font-semibold uppercase tracking-wider">Identitas</span></div><p className="text-lg font-bold text-slate-800">{user?.name || '-'}</p><p className="mt-1 text-xs text-slate-400">NIS: {profile.nis || '-'}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-2 flex items-center gap-3 text-slate-400"><BookOpen className="h-5 w-5 text-[#008994]" /><span className="text-xs font-semibold uppercase tracking-wider">Kelas</span></div><p className="text-lg font-bold text-slate-800">{profile.classes?.name || '-'}</p><p className="mt-1 text-xs text-slate-400">{profile.classes?.level || ''} {profile.classes?.major || ''}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-2 flex items-center gap-3 text-slate-400"><Calendar className="h-5 w-5 text-[#008994]" /><span className="text-xs font-semibold uppercase tracking-wider">Asesmen</span></div><p className="text-lg font-bold text-slate-800">{quizzes.length} kuis</p><p className="mt-1 text-xs text-slate-400">Tersedia untuk kelasmu</p></div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="mb-5"><h2 className="text-lg font-bold text-slate-800">Mata Pelajaran Kelas</h2><p className="mt-1 text-sm text-slate-500">Course yang terdaftar untuk kelasmu.</p></div>
        {loading ? <div className="flex items-center gap-2 py-5 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Memuat mata pelajaran...</div>
          : error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
            : courses.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">Belum ada mata pelajaran terdaftar untuk kelas ini.</p>
              : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <article key={course.id} className="rounded-xl border border-slate-200 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-[#008994]"><BookOpen className="h-5 w-5" /></div><h3 className="mt-3 font-bold text-slate-800">{course.subjects?.name || 'Mata Pelajaran'}</h3><p className="mt-1 text-xs text-slate-500">{[course.academic_year, course.semester].filter(Boolean).join(' · ') || 'Course kelas'}</p></article>)}</div>}
      </section>

      <section id="asesmen" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="mb-5"><h2 className="text-lg font-bold text-slate-800">Kuis & Asesmen</h2><p className="mt-1 text-sm text-slate-500">Pilih kuis untuk mulai atau lanjutkan pengerjaan.</p></div>
        {loading ? <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Memuat daftar kuis...</div>
        : error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
            : quizzes.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{profile.class_id ? 'Belum ada kuis yang tersedia untuk kelas ini.' : 'Data kelas akun siswa belum tersedia. Hubungi administrator untuk melengkapi profil kelas.'}</p>
              : <div className="grid gap-4 md:grid-cols-2">{quizzes.map((quiz) => {
                const attempt = attemptByQuiz.get(String(quiz.id));
                const isFinished = attempt?.status === 'SELESAI';
                return <article key={quiz.id} className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-800">{quiz.title}</h3><p className="mt-1 text-sm text-slate-500">{quiz.description || 'Asesmen'}</p></div><span className="shrink-0 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{quiz.status || '—'}</span></div>
                  <p className="mt-3 text-xs text-slate-500">Durasi: {quiz.duration_minutes || '—'} menit</p>
                  <button type="button" onClick={() => navigate(isFinished
                    ? `/siswa/hasil-akhir?attemptId=${encodeURIComponent(attempt.id)}`
                    : `/siswa/mengerjakan-kuis?quizId=${encodeURIComponent(quiz.id)}`)} className="mt-4 w-full rounded-xl bg-[#004d57] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003c44]">
                    {isFinished ? 'Lihat Hasil' : attempt?.status === 'SEDANG_MENGERJAKAN' ? 'Lanjutkan Kuis' : 'Mulai Kuis'}
                  </button>
                </article>;
              })}</div>}
      </section>
    </div>
  );
}
