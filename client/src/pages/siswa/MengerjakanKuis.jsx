import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Flag, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function resolveQuestionType(question) {
  const value = String(question.question_type || question.type || '').toUpperCase();
  if (value === 'PILIHAN_GANDA') return 'PILIHAN_GANDA';
  if (value === 'BENAR_SALAH') return 'BENAR_SALAH';
  if (value === 'ESAI') return 'ESAI';
  return 'UNKNOWN';
}

export default function MengerjakanKuis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quizInfo, setQuizInfo] = useState({ id: null, title: '', topic: '', durationMinutes: 0 });
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [doubted, setDoubted] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiNotice, setApiNotice] = useState('');
  const attemptStartPromises = useRef(new Map());

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    let active = true;

    async function initQuizSession() {
      setLoading(true);
      setLoadError('');
      try {
        const requestedQuizId = searchParams.get('quizId');
        const quizList = await apiFetch('/quizzes');
      const classQuizzes = (Array.isArray(quizList) ? quizList : []).filter((quiz) => (
        user?.profile?.class_id
        && String(quiz.class_id) === String(user.profile.class_id)
        && String(quiz.status || '').toUpperCase() !== 'DRAFT'
      ));
        const quiz = requestedQuizId
          ? classQuizzes.find((item) => String(item.id) === String(requestedQuizId))
          : classQuizzes[0];
        if (!quiz) {
          throw new Error(requestedQuizId
            ? 'Kuis tidak ditemukan atau bukan untuk kelasmu.'
            : 'Belum ada kuis untuk kelasmu.');
        }

        const durationMinutes = Number(quiz.duration_minutes);
        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
          throw new Error('Durasi kuis belum diatur dengan benar.');
        }

        const rawQuestions = await apiFetch(
          `/academic/quizzes/${encodeURIComponent(quiz.id)}/questions`,
        );
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
          throw new Error('Kuis ini belum memiliki soal.');
        }
        const loadedQuestions = rawQuestions.map((item) => {
          const question = item.questions || {};
          return {
            id: question.id,
            questionText: question.question_text || '',
            questionImage: question.image_url || null,
            questionType: resolveQuestionType(question),
            points: item.points,
            options: (question.options || question.question_options || []).map((option) => ({
              id: option.id,
              key: option.option_label,
              text: option.option_text || '',
            })),
          };
        });
        if (loadedQuestions.some((question) => !question.id || question.questionType === 'UNKNOWN')) {
          throw new Error('Ada tipe soal yang belum didukung Student UI. Hubungi guru.');
        }

        const attempts = await apiFetch(`/attempts?quiz_id=${encodeURIComponent(quiz.id)}`);
        let attempt = (Array.isArray(attempts) ? attempts : []).find(
          (item) => item.status === 'SEDANG_MENGERJAKAN',
        );
        if (!attempt) {
          let startPromise = attemptStartPromises.current.get(String(quiz.id));
          if (!startPromise) {
            startPromise = apiFetch('/attempts', {
              method: 'POST',
              body: JSON.stringify({ quiz_id: quiz.id }),
            });
            attemptStartPromises.current.set(String(quiz.id), startPromise);
          }
          attempt = await startPromise;
        }
        if (!attempt?.id) throw new Error('Server tidak mengembalikan ID attempt.');

        const savedAnswers = await apiFetch(
          `/academic/answers/attempt/${encodeURIComponent(attempt.id)}`,
        );
        const restoredAnswers = {};
        (Array.isArray(savedAnswers) ? savedAnswers : []).forEach((answer) => {
          const optionIds = (answer.student_answer_options || []).map((row) => row.option_id);
          const question = loadedQuestions.find((item) => String(item.id) === String(answer.question_id));
          restoredAnswers[answer.question_id] = {
            optionId: optionIds[0] || '',
            key: question?.options.find((option) => String(option.id) === String(optionIds[0]))?.key || '',
            textAnswer: answer.text_answer || '',
          };
        });

        if (active) {
          setQuizInfo({
            id: quiz.id,
            title: quiz.title,
            topic: quiz.description || quiz.title,
            durationMinutes,
          });
          setQuestions(loadedQuestions);
          setAttemptId(attempt.id);
          setAnswers(restoredAnswers);
          const startedAt = attempt.started_at ? new Date(attempt.started_at).getTime() : Date.now();
          const elapsedSeconds = Number.isFinite(startedAt)
            ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
            : 0;
          setTimeLeft(Math.max(0, durationMinutes * 60 - elapsedSeconds));
        }
      } catch (error) {
        if (active) setLoadError(error.message || 'Gagal memuat kuis.');
      } finally {
        if (active) setLoading(false);
      }
    }

    initQuizSession();
    return () => { active = false; };
  }, [searchParams, user?.profile?.class_id]);

  useEffect(() => {
    if (loading || !attemptId || timeLeft <= 0) return undefined;
    const timer = setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [loading, attemptId, timeLeft]);

  const saveAnswer = async (question, answer) => {
    // Backend saat ini hanya mempersist jawaban objektif, belum kolom text_answer.
    if (question.questionType === 'ESAI') return;
    const payload = { attempt_id: attemptId, question_id: question.id };
    payload.option_ids = answer.optionId ? [answer.optionId] : [];
    await apiFetch('/academic/answers/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const selectOption = async (option) => {
    if (!currentQuestion || isSubmitting) return;
    const answer = { optionId: option.id, key: option.key, textAnswer: '' };
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: answer }));
    try {
      await saveAnswer(currentQuestion, answer);
      setApiNotice('');
    } catch (error) {
      setApiNotice(`Jawaban belum tersimpan: ${error.message}`);
    }
  };

  const updateEssay = (value) => {
    if (!currentQuestion || isSubmitting) return;
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: { ...previous[currentQuestion.id], textAnswer: value },
    }));
    setApiNotice('Jawaban esai belum didukung penyimpanan server; jawaban ini hanya ada selama halaman terbuka.');
  };

  const goTo = useCallback((index) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  }, [totalQuestions]);

  const handleFinish = async (forceTimeout = false) => {
    if (isSubmitting || !attemptId) return;
    if (!forceTimeout && !window.confirm('Yakin ingin menyelesaikan kuis? Jawaban tidak dapat diubah lagi setelah ini.')) return;
    const hasEssayAnswer = questions.some(
      (question) => question.questionType === 'ESAI' && answers[question.id]?.textAnswer?.trim(),
    );
    if (hasEssayAnswer && !forceTimeout && !window.confirm('Backend belum menyimpan jawaban esai. Jika lanjut, jawaban esai tidak masuk ke hasil server. Tetap submit?')) return;

    setIsSubmitting(true);
    const durationUsed = (quizInfo.durationMinutes * 60) - timeLeft;
    try {
      await Promise.all(questions.map((question) => {
        const answer = answers[question.id];
        return answer ? saveAnswer(question, answer) : Promise.resolve();
      }));
      await apiFetch(`/attempts/${encodeURIComponent(attemptId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SELESAI' }),
      });
      let gradingNotice = '';
      try {
        await apiFetch(`/attempts/${encodeURIComponent(attemptId)}/grade`, { method: 'POST' });
      } catch (error) {
        gradingNotice = `Kuis berhasil dikirim. Nilai belum tersedia: ${error.message}`;
      }
      navigate(`/siswa/hasil-akhir?attemptId=${encodeURIComponent(attemptId)}${hasEssayAnswer ? '&essayNotPersisted=1' : ''}`, {
        replace: true,
        state: { attemptId, quizId: quizInfo.id, quizTitle: quizInfo.title, totalQuestions, durationUsed, essayNotPersisted: hasEssayAnswer, gradingNotice },
      });
    } catch (error) {
      setApiNotice(`Attempt belum berhasil dikirim: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !loadError && attemptId && timeLeft === 0 && !isSubmitting) {
      handleFinish(true);
    }
  }, [timeLeft, loading, loadError, attemptId, isSubmitting]);

  const getBadgeStyle = (questionId, index) => {
    if (doubted[questionId]) {
      return index === currentIndex
        ? 'bg-amber-100 text-amber-800 border border-amber-400 ring-2 ring-[#008994]'
        : 'bg-amber-100 text-amber-700 border border-amber-300';
    }
    if (index === currentIndex) return 'bg-[#004d57] text-white ring-2 ring-[#008994]';
    const answer = answers[questionId];
    if (answer?.optionId || answer?.textAnswer?.trim()) return 'bg-[#008994] text-white';
    return 'bg-white text-slate-600 border border-slate-200';
  };

  if (loading) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3"><Loader2 className="h-8 w-8 animate-spin text-[#008994]" /><p className="text-sm font-semibold text-slate-600">Memuat soal kuis...</p></div>;
  }
  if (loadError) {
    return <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900"><p>{loadError}</p><button type="button" onClick={() => navigate('/siswa/beranda')} className="mt-4 font-semibold underline">Kembali ke beranda</button></div>;
  }
  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      <div className="flex-1 space-y-6">
        {apiNotice && <div role="status" className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800"><AlertCircle className="h-4 w-4 shrink-0" /><span>{apiNotice}</span></div>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-lg sm:text-xl font-bold text-slate-800">{quizInfo.title}</h1><p className="text-sm text-slate-500">{quizInfo.topic}</p></div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><Clock className="h-4 w-4 text-slate-400" /><span className="text-xs text-slate-400">Sisa Waktu</span><span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-slate-800'}`}>{formatTime(timeLeft)}</span></div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between"><h2 className="text-base font-bold text-slate-800">Soal {currentIndex + 1}</h2><span className="text-xs text-slate-500">{currentQuestion.points} poin</span></div>
          {currentQuestion.questionImage && <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-center"><span className="text-lg font-mono text-slate-700">{currentQuestion.questionImage}</span></div>}
          <p className="text-sm text-slate-700 leading-relaxed">{currentQuestion.questionText}</p>
          {currentQuestion.questionType === 'ESAI' ? (
            <>
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Penyimpanan jawaban esai belum tersedia di backend. Jangan tutup atau refresh halaman jika ingin mempertahankan jawaban sementara ini.</p>
            <textarea
              rows={6}
              value={answers[currentQuestion.id]?.textAnswer || ''}
              onChange={(event) => updateEssay(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:border-[#008994] focus:outline-none"
              placeholder="Tulis jawaban esai di sini..."
            />
            </>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const selected = String(answers[currentQuestion.id]?.optionId) === String(option.id);
                return <button key={option.id} type="button" onClick={() => selectOption(option)} disabled={isSubmitting} className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${selected ? 'border-[#008994] bg-[#008994] text-white shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:border-[#008994]/40 hover:bg-[#e6f7f8]'}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{option.key}</span><span className="pt-0.5">{option.text}</span></button>;
              })}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} className="flex items-center gap-2 rounded-xl border border-[#008994] px-5 py-2.5 text-sm font-semibold text-[#008994] hover:bg-[#e6f7f8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" />Sebelumnya</button>
          <button type="button" aria-pressed={Boolean(doubted[currentQuestion.id])} onClick={() => setDoubted((previous) => ({ ...previous, [currentQuestion.id]: !previous[currentQuestion.id] }))} className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${doubted[currentQuestion.id] ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}><Flag className="h-4 w-4" />{doubted[currentQuestion.id] ? 'Hapus tanda ragu-ragu' : 'Ragu-ragu'}</button>
          <button type="button" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === totalQuestions - 1} className="flex items-center gap-2 rounded-xl bg-[#008994] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#007a84] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Selanjutnya<ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <aside className="w-full lg:w-72 shrink-0"><div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-5 sticky top-6"><h3 className="text-base font-bold text-center text-slate-800">Nomor Soal</h3><div className="text-center space-y-1"><p className="text-sm font-bold text-slate-800">Jumlah soal: {totalQuestions}</p><p className="text-xs text-slate-400">Durasi: {quizInfo.durationMinutes} menit</p></div><div className="grid grid-cols-7 gap-2 max-h-72 overflow-y-auto p-1">{questions.map((question, index) => <button key={question.id} type="button" aria-current={index === currentIndex ? 'step' : undefined} aria-label={`Soal ${index + 1}${doubted[question.id] ? ', ragu-ragu' : ''}${answers[question.id]?.optionId || answers[question.id]?.textAnswer?.trim() ? ', sudah dijawab' : ', belum dijawab'}`} onClick={() => goTo(index)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${getBadgeStyle(question.id, index)}`} title={`Soal ${index + 1}${doubted[question.id] ? ' — ragu-ragu' : ''}`}>{index + 1}</button>)}</div><button type="button" disabled={isSubmitting} onClick={() => handleFinish(false)} className="w-full rounded-xl border border-[#008994] px-4 py-2.5 text-sm font-semibold text-[#008994] hover:bg-[#e6f7f8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim...</> : 'Selesai'}</button><div className="space-y-2 pt-2 border-t border-slate-100"><div className="flex items-center gap-2 text-xs text-slate-500"><span className="flex h-4 w-4 rounded bg-[#008994]" />Sudah dijawab</div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="flex h-4 w-4 rounded border border-slate-200 bg-white" />Belum dijawab</div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="flex h-4 w-4 rounded bg-amber-100 border border-amber-300" />Ragu-ragu</div></div></div></aside>
    </div>
  );
}
