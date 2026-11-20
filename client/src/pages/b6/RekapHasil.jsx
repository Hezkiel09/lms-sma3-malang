import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  LoaderCircle,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—';

const attemptStatus = (value) => ({
  SEDANG_MENGERJAKAN: 'BERLANGSUNG',
  BELUM_MULAI: 'BELUM_MULAI',
  SELESAI: 'SELESAI',
}[value] || value || '—');

const gradingStatus = (value) => value || 'BELUM_MULAI';

function StatusPill({ value, grading = false }) {
  const complete = value === 'SELESAI' || value === 'SELESAI_DINILAI';
  const inProgress = value === 'BERLANGSUNG' || value === 'SEDANG_MENGERJAKAN';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      complete ? 'bg-emerald-50 text-emerald-700' : inProgress ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
    }`}>
      {grading ? gradingStatus(value) : attemptStatus(value)}
    </span>
  );
}

export default function RekapHasilPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('SEMUA');
  const [pageError, setPageError] = useState('');
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState('');
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch('/attempts/recap/quizzes')
      .then((data) => {
        if (!active) return;
        const list = data || [];
        setQuizzes(list);
        setIsLoadingAttempts(Boolean(list.length));
        setSelectedQuizId(list[0]?.id || '');
      })
      .catch((error) => active && setPageError(error.message))
      .finally(() => active && setIsLoadingQuizzes(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedQuizId) return undefined;
    let active = true;
    apiFetch(`/attempts/recap?quiz_id=${encodeURIComponent(selectedQuizId)}`)
      .then((data) => active && setAttempts(data?.attempts || []))
      .catch((error) => active && setPageError(error.message))
      .finally(() => active && setIsLoadingAttempts(false));
    return () => { active = false; };
  }, [selectedQuizId]);

  useEffect(() => {
    if (!selectedAttemptId) return undefined;
    let active = true;
    apiFetch(`/attempts/${encodeURIComponent(selectedAttemptId)}/recap`)
      .then((data) => active && setAttemptDetail(data))
      .catch((error) => active && setDetailError(error.message))
      .finally(() => active && setIsLoadingDetail(false));
    return () => { active = false; };
  }, [selectedAttemptId]);

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId);
  const filteredAttempts = useMemo(() => attempts.filter((attempt) => {
    const term = search.trim().toLowerCase();
    const name = attempt.student?.name || '';
    const nis = attempt.student?.nis || '';
    const matchesSearch = !term || name.toLowerCase().includes(term) || String(nis).toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'SEMUA' || attemptStatus(attempt.status) === statusFilter;
    return matchesSearch && matchesStatus;
  }), [attempts, search, statusFilter]);

  const gradedAttempts = attempts.filter((attempt) => Number.isFinite(Number(attempt.total_score)) && attempt.total_score !== null);
  const averageScore = gradedAttempts.length
    ? (gradedAttempts.reduce((sum, attempt) => sum + Number(attempt.total_score), 0) / gradedAttempts.length).toFixed(1)
    : '—';
  const submittedCount = attempts.filter((attempt) => attempt.status === 'SELESAI').length;

  const exportCsv = () => {
    const headers = ['Nama siswa', 'NIS', 'Kuis', 'Status attempt', 'Nilai', 'Benar', 'Salah', 'Mulai', 'Submit', 'Status grading'];
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = filteredAttempts.map((attempt) => [
      attempt.student?.name, attempt.student?.nis, selectedQuiz?.title, attemptStatus(attempt.status),
      attempt.total_score, attempt.correct_count, attempt.incorrect_count, attempt.started_at,
      attempt.submitted_at, gradingStatus(attempt.grading_status),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `rekap-${selectedQuiz?.title || 'hasil'}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="transition-colors hover:text-slate-600">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/b6/buat-kuis" className="transition-colors hover:text-slate-600">Asesmen</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-semibold text-[#005b64]">Rekap Hasil</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Rekap Hasil</h1>
          <p className="mt-1 text-sm text-slate-500">Hasil attempt dan jawaban siswa dari data tersimpan.</p>
        </div>
        <button type="button" onClick={exportCsv} disabled={!filteredAttempts.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#004d57] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003c44] disabled:cursor-not-allowed disabled:opacity-50">
          <Download className="h-4 w-4" /> Ekspor CSV
        </button>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:p-6">
        <label htmlFor="quiz-select" className="mb-2 block text-xs font-semibold text-slate-700">Pilih kuis</label>
        <div className="relative max-w-xl">
          <select id="quiz-select" value={selectedQuizId} onChange={(event) => { setAttempts([]); setPageError(''); setIsLoadingAttempts(true); setSelectedQuizId(event.target.value); }} disabled={isLoadingQuizzes || !quizzes.length} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-slate-800 focus:border-[#004d57] focus:outline-none disabled:bg-slate-50">
            {isLoadingQuizzes && <option value="">Memuat kuis…</option>}
            {!isLoadingQuizzes && !quizzes.length && <option value="">Belum ada kuis milik Anda</option>}
            {quizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {selectedQuiz && <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />{selectedQuiz.status || '—'}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{selectedQuiz.duration_minutes ? `${selectedQuiz.duration_minutes} menit` : 'Durasi tidak diatur'}</span>
          <span>KKM {selectedQuiz.passing_grade ?? '—'}</span>
          {selectedQuiz.start_at && <span>Mulai {formatDate(selectedQuiz.start_at)}</span>}
        </div>}
      </section>

      {pageError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{pageError}</div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total attempt', value: attempts.length },
          { label: 'Sudah submit', value: submittedCount },
          { label: 'Rata-rata nilai dinilai', value: averageScore },
        ].map((item) => <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">{item.label}</p><p className="mt-2 text-2xl font-bold text-slate-800">{item.value}</p>
        </div>)}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
        <div className="space-y-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-base font-bold text-slate-800">Hasil per siswa</h2><p className="mt-0.5 text-xs text-slate-500">Klik detail untuk melihat jawaban tersimpan dan kunci jawaban.</p></div>
            <span className="rounded-md bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{filteredAttempts.length} attempt</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau NIS siswa…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-[#004d57] focus:outline-none" /></div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#004d57] focus:outline-none">
              <option value="SEMUA">Semua status</option><option value="BERLANGSUNG">Berlangsung</option><option value="SELESAI">Selesai</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500"><tr>
              <th className="px-4 py-3 text-center">No.</th><th className="px-4 py-3">Siswa</th><th className="px-3 py-3">Kuis</th><th className="px-3 py-3 text-center">Attempt</th><th className="px-3 py-3 text-center">Nilai</th><th className="px-3 py-3 text-center">Benar</th><th className="px-3 py-3 text-center">Salah</th><th className="px-3 py-3">Mulai</th><th className="px-3 py-3">Submit</th><th className="px-3 py-3">Grading</th><th className="px-4 py-3 text-center">Detail</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoadingAttempts ? <tr><td colSpan={11} className="py-12 text-center text-slate-500"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Memuat rekap…</td></tr>
                : filteredAttempts.length === 0 ? <tr><td colSpan={11} className="py-12 text-center text-sm text-slate-400">{selectedQuizId ? 'Belum ada attempt untuk kuis ini.' : 'Pilih kuis untuk melihat rekap.'}</td></tr>
                  : filteredAttempts.map((attempt, index) => <tr key={attempt.id} className="hover:bg-cyan-50/30">
                    <td className="px-4 py-3.5 text-center text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3.5"><div className="font-semibold text-slate-800">{attempt.student?.name || 'Profil siswa tidak ditemukan'}</div><div className="text-xs text-slate-400">NIS {attempt.student?.nis || '—'}</div></td>
                    <td className="px-3 py-3.5">{selectedQuiz?.title || '—'}</td>
                    <td className="px-3 py-3.5 text-center"><StatusPill value={attempt.status} /></td>
                    <td className="px-3 py-3.5 text-center font-bold">{attempt.total_score ?? '—'}</td>
                    <td className="px-3 py-3.5 text-center">{attempt.correct_count ?? '—'}</td>
                    <td className="px-3 py-3.5 text-center">{attempt.incorrect_count ?? '—'}</td>
                    <td className="px-3 py-3.5 text-xs">{formatDate(attempt.started_at)}</td>
                    <td className="px-3 py-3.5 text-xs">{formatDate(attempt.submitted_at)}</td>
                    <td className="px-3 py-3.5"><StatusPill value={attempt.grading_status} grading /></td>
                    <td className="px-4 py-3.5 text-center"><button type="button" onClick={() => { setAttemptDetail(null); setDetailError(''); setIsLoadingDetail(true); setSelectedAttemptId(attempt.id); }} className="font-semibold text-[#005b64] hover:underline">Lihat</button></td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {selectedAttemptId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedAttemptId(''); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="attempt-detail-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5 sm:p-6">
            <div><h2 id="attempt-detail-title" className="text-lg font-bold text-slate-800">Detail hasil attempt</h2>{attemptDetail && <p className="mt-1 text-sm text-slate-500">{attemptDetail.attempt.student?.name || 'Siswa'} · {attemptDetail.quiz.title}</p>}</div>
            <button type="button" onClick={() => setSelectedAttemptId('')} aria-label="Tutup detail" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </header>
          <div className="space-y-5 p-5 sm:p-6">
            {isLoadingDetail && <p className="py-8 text-center text-sm text-slate-500"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Memuat jawaban…</p>}
            {detailError && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{detailError}</p>}
            {attemptDetail && <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Nilai</span><strong className="mt-1 block text-lg">{attemptDetail.attempt.total_score ?? 'Belum dinilai'}</strong></div>
                <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Status attempt</span><div className="mt-1"><StatusPill value={attemptDetail.attempt.status} /></div></div>
                <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Mulai</span><strong className="mt-1 block text-xs">{formatDate(attemptDetail.attempt.started_at)}</strong></div>
                <div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Submit</span><strong className="mt-1 block text-xs">{formatDate(attemptDetail.attempt.submitted_at)}</strong></div>
              </div>
              <div className="space-y-3">
                {attemptDetail.questions.map((question, index) => <article key={question.question_id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-semibold text-slate-800">Soal {question.question_order || index + 1}. {question.question_text || 'Teks soal tidak tersedia'}</h3>
                    {question.answer?.is_correct === true ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Benar</span>
                      : question.answer?.is_correct === false ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700"><XCircle className="h-4 w-4" />Salah</span>
                        : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Belum dinilai</span>}</div>
                  <p className="mt-2 text-xs text-slate-500">Nilai soal: {question.answer?.score ?? '—'} / {question.points ?? '—'}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">Jawaban siswa</p><p className="mt-1 text-sm text-slate-800">{question.answer?.options?.length ? question.answer.options.map((option) => `${option.option_label ? `${option.option_label}. ` : ''}${option.option_text}`).join(' · ') : question.answer?.text_answer || 'Belum menjawab'}</p></div>
                    <div className="rounded-lg bg-emerald-50/70 p-3"><p className="text-xs font-semibold text-emerald-800">Jawaban benar</p><p className="mt-1 text-sm text-slate-800">{question.correct_answer?.options?.length ? question.correct_answer.options.map((option) => `${option.option_label ? `${option.option_label}. ` : ''}${option.option_text}`).join(' · ') : 'Tidak tersedia / penilaian manual'}</p></div>
                  </div>
                </article>)}
                {!attemptDetail.questions.length && <p className="py-8 text-center text-sm text-slate-500">Kuis ini belum memiliki soal.</p>}
              </div>
            </>}
          </div>
        </section>
      </div>}
    </div>
  );
}
