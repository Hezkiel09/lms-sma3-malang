import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours && minutes) return `${hours} jam ${minutes} menit`;
  if (hours) return `${hours} jam`;
  return `${minutes} menit`;
}

function ScoreDonut({ percentage }) {
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  return <div className="relative flex items-center justify-center"><svg height={radius * 2} width={radius * 2} className="-rotate-90"><circle stroke="#e2e8f0" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} /><circle stroke="#008994" fill="transparent" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} r={normalizedRadius} cx={radius} cy={radius} className="transition-all duration-700 ease-out" /></svg><div className="absolute flex flex-col items-center"><span className="text-2xl font-bold text-[#008994]">{percentage}%</span><span className="mt-0.5 text-xs text-slate-400">Skor akhir</span></div></div>;
}

export default function HasilAkhir() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const attemptId = location.state?.attemptId || searchParams.get('attemptId');
  const essayNotPersisted = location.state?.essayNotPersisted || searchParams.get('essayNotPersisted') === '1';
  const [loading, setLoading] = useState(Boolean(attemptId));
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    title: location.state?.quizTitle || 'Hasil Asesmen',
    totalQuestions: location.state?.totalQuestions ?? null,
    duration: location.state?.durationUsed ?? null,
    score: null,
    correct: null,
    incorrect: null,
    unanswered: null,
    gradingStatus: '',
  });

  useEffect(() => {
    let active = true;
    async function loadResult() {
      if (!attemptId) {
        setError('ID attempt hasil tidak ditemukan.');
        setLoading(false);
        return;
      }
      try {
        const attempt = await apiFetch(`/attempts/${encodeURIComponent(attemptId)}`);
        const [quizList, quizQuestions] = await Promise.all([
          apiFetch('/quizzes'),
          apiFetch(`/academic/quizzes/${encodeURIComponent(attempt.quiz_id)}/questions`),
        ]);
        const quiz = (Array.isArray(quizList) ? quizList : []).find(
          (item) => String(item.id) === String(attempt.quiz_id),
        );
        const totalQuestions = Array.isArray(quizQuestions) ? quizQuestions.length : 0;
        const correct = attempt.correct_count == null ? null : Number(attempt.correct_count);
        const incorrect = attempt.incorrect_count == null ? null : Number(attempt.incorrect_count);
        const duration = attempt.started_at && attempt.submitted_at
          ? Math.max(0, Math.round((new Date(attempt.submitted_at) - new Date(attempt.started_at)) / 1000))
          : location.state?.durationUsed ?? null;
        if (active) {
          setStats({
            title: quiz?.title || location.state?.quizTitle || 'Hasil Asesmen',
            totalQuestions,
            duration,
            score: attempt.total_score == null ? null : Number(attempt.total_score),
            correct,
            incorrect,
            unanswered: correct == null || incorrect == null ? null : Math.max(0, totalQuestions - correct - incorrect),
            gradingStatus: attempt.grading_status || '',
          });
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'Gagal memuat hasil attempt.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadResult();
    return () => { active = false; };
  }, [attemptId, location.state]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Hasil Akhir</h1><p className="mt-1 text-sm text-slate-400">Ringkasan hasil asesmen {stats.title}.</p></div><span className="inline-flex self-start rounded-full border border-[#008994]/20 bg-[#e6f7f8] px-4 py-1.5 text-xs font-semibold text-[#005b64]">{stats.title}</span></div>
      <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs sm:p-8">
        {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="flex min-h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#008994]" /></div> : !error && <>
          <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-slate-800">{stats.title}</h2><p className="mt-0.5 text-sm text-slate-400">Hasil akhir asesmen</p></div>{stats.score != null && <span className="rounded-full bg-[#e6f7f8] px-3 py-1 text-xs font-bold text-[#008994]">{Math.round(stats.score)}%</span>}</div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2"><div className="rounded-xl border border-[#008994]/15 bg-[#f0fafb] p-5"><span className="text-xs font-semibold text-[#008994]">Nilai</span><p className="mt-1 text-2xl font-bold text-[#008994]">{stats.score == null ? 'Menunggu penilaian' : `${stats.score} / 100`}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Clock className="h-3.5 w-3.5" />Durasi</div><p className="mt-1 text-2xl font-bold text-slate-800">{stats.duration == null ? '—' : formatDuration(stats.duration)}</p></div></div><div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-5">{stats.score == null ? <span className="text-center text-sm text-slate-500">Nilai belum tersedia</span> : <ScoreDonut percentage={Math.max(0, Math.min(100, stats.score))} />}</div></div>
          <section className="space-y-3"><h3 className="text-base font-bold text-slate-800">Jawaban objektif</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{[['Benar', stats.correct], ['Salah', stats.incorrect], ['Tidak dijawab', stats.unanswered]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><span className="text-xs font-semibold text-slate-500">{label}</span><p className="mt-1 text-2xl font-bold text-slate-800">{value ?? '—'}</p></div>)}</div></section>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5"><h4 className="text-sm font-bold text-slate-700">Status penilaian</h4><p className="mt-1 text-xs leading-relaxed text-slate-500">{essayNotPersisted ? 'Jawaban esai tidak tersimpan karena backend saat ini belum mendukung penyimpanan text_answer.' : stats.score == null ? 'Penilaian esai menunggu pemeriksaan guru, atau kuis belum memiliki soal objektif yang dapat dinilai otomatis.' : `Status: ${stats.gradingStatus || 'Selesai dinilai'}.`}</p></div>
        </>}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-400">Hasil attempt tersimpan di server.</p><button type="button" onClick={() => navigate('/siswa/beranda')} className="rounded-xl bg-[#004d57] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#003c44]">Kembali ke Beranda</button></div>
      </div>
    </div>
  );
}
