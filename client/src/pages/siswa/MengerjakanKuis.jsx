import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Clock, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// ── Fallback Mock Data Soal (digunakan jika API kosong atau server offline) ─
const fallbackMockQuestions = Array.from({ length: 40 }, (_, i) => ({
  id: `mock-q-${i + 1}`,
  questionText: 'Lorem ipsum dolor sit amet consectetur.',
  questionImage:
    i === 3
      ? '( (27a⁻⁵b⁻³) / (3⁵a⁻⁷b⁻⁵) )⁻¹'
      : null,
  options: [
    { id: `mock-opt-${i + 1}-A`, key: 'A', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { id: `mock-opt-${i + 1}-B`, key: 'B', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { id: `mock-opt-${i + 1}-C`, key: 'C', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { id: `mock-opt-${i + 1}-D`, key: 'D', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { id: `mock-opt-${i + 1}-E`, key: 'E', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
  ],
}));

// ── Helper: format detik → HH:MM:SS ────────────────────────────────────────
function formatTime(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// ═════════════════════════════════════════════════════════════════════════════
//  KOMPONEN UTAMA: MengerjakanKuis (Terintegrasi API B6)
// ═════════════════════════════════════════════════════════════════════════════
export default function MengerjakanKuis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState({
    id: null,
    title: 'Matematika',
    topic: 'Komposisi & Inverse',
    durationMinutes: 75,
  });
  const [questions, setQuestions] = useState(fallbackMockQuestions);
  const [attemptId, setAttemptId] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});        // { [questionId]: { key: 'A', optionId: '...' } }
  const [doubted, setDoubted] = useState({});         // { [questionId]: true }
  const [timeLeft, setTimeLeft] = useState(75 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiNotice, setApiNotice] = useState(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || questions[0];

  // ── 1. Inisialisasi Kuis, Soal, & Sesi Attempt ─────────────────────────────
  useEffect(() => {
    let active = true;

    async function initQuizSession() {
      setLoading(true);
      try {
        let activeQuizId = searchParams.get('quizId');
        let currentQuiz = null;

        // Ambil daftar kuis yang tersedia jika quizId tidak diberikan di URL
        if (!activeQuizId) {
          try {
            const quizList = await apiFetch('/academic/quizzes');
            if (Array.isArray(quizList) && quizList.length > 0) {
              currentQuiz = quizList[0];
              activeQuizId = currentQuiz.id;
            }
          } catch {
            // Abaikan jika offline, gunakan default
          }
        }

        // Ambil data soal kuis dari server jika activeQuizId tersedia
        if (activeQuizId) {
          try {
            const rawQuestions = await apiFetch(`/academic/quizzes/${activeQuizId}/questions`);
            if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
              const formatted = rawQuestions.map((item, idx) => {
                const q = item.questions || item;
                const opts = (q.options || q.question_options || []).map((o, optIdx) => ({
                  id: o.id || `opt-${optIdx}`,
                  key: o.option_label || String.fromCharCode(65 + optIdx),
                  text: o.option_text || '',
                  // Catatan keamanan: is_correct sengaja tidak dimasukkan ke state siswa
                }));

                return {
                  id: q.id || `q-${idx + 1}`,
                  questionText: q.question_text || 'Pertanyaan tidak bermuatan teks.',
                  questionImage: q.image_url || null,
                  options: opts,
                };
              });

              if (active) {
                setQuestions(formatted);
                if (currentQuiz) {
                  setQuizInfo({
                    id: currentQuiz.id,
                    title: currentQuiz.title || 'Matematika',
                    topic: currentQuiz.topic || 'Komposisi & Inverse',
                    durationMinutes: currentQuiz.duration_minutes || 75,
                  });
                  setTimeLeft((currentQuiz.duration_minutes || 75) * 60);
                }
              }
            }
          } catch (err) {
            console.warn('Gagal memuat soal dari server, beralih ke data fallback:', err.message);
          }

          // Buat atau Pulihkan Sesi Attempt Kuis
          try {
            const attemptPayload = { quiz_id: activeQuizId };
            if (user?.id) attemptPayload.student_id = user.id;

            const attemptRes = await apiFetch('/attempts', {
              method: 'POST',
              body: JSON.stringify(attemptPayload),
            });

            const newAttemptId = attemptRes?.id || attemptRes?.attempt_id;
            if (active && newAttemptId) {
              setAttemptId(newAttemptId);

              // Coba pulihkan jawaban jika attempt sudah pernah dimulai sebelumnya
              try {
                const savedAnswers = await apiFetch(`/academic/answers/attempt/${newAttemptId}`);
                if (Array.isArray(savedAnswers) && savedAnswers.length > 0) {
                  const restored = {};
                  savedAnswers.forEach((ans) => {
                    restored[ans.question_id] = {
                      optionId: ans.selected_option_ids?.[0],
                      key: ans.option_label || 'A',
                    };
                  });
                  setAnswers(restored);
                }
              } catch {
                // Tidak ada jawaban sebelumnya
              }
            }
          } catch (attemptErr) {
            console.warn('Attempt backend offline / fallback mode:', attemptErr.message);
          }
        }
      } catch (e) {
        console.error('Error saat inisialisasi sesi kuis:', e);
      } finally {
        if (active) setLoading(false);
      }
    }

    initQuizSession();

    return () => {
      active = false;
    };
  }, [searchParams, user]);

  // ── 2. Countdown Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [loading, timeLeft]);

  // Selesai otomatis saat waktu habis
  useEffect(() => {
    if (!loading && timeLeft === 0 && !isSubmitting) {
      handleFinish(true);
    }
  }, [timeLeft, loading, isSubmitting]);

  // ── 3. Pemilihan Jawaban (Menyimpan secara Realtime via API) ─────────────
  const selectAnswer = async (opt) => {
    if (!currentQuestion) return;

    // Update state lokal seketika (optimistic update)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { key: opt.key, optionId: opt.id },
    }));

    // Simpan ke backend jika sesi attempt aktif
    if (attemptId) {
      try {
        const payload = {
          attempt_id: attemptId,
          question_id: currentQuestion.id,
          option_ids: [opt.id],
        };
        if (user?.id) payload.student_id = user.id;

        await apiFetch('/academic/answers/save', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Gagal sinkronisasi jawaban ke server:', err.message);
        setApiNotice('Koneksi offline, jawaban tersimpan lokal.');
        setTimeout(() => setApiNotice(null), 3000);
      }
    }
  };

  const toggleDoubt = () => {
    if (!currentQuestion) return;
    setDoubted((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const goTo = useCallback(
    (idx) => {
      if (idx >= 0 && idx < totalQuestions) setCurrentIndex(idx);
    },
    [totalQuestions],
  );

  // ── 4. Selesai / Submit Kuis ─────────────────────────────────────────────
  const handleFinish = async (forceTimeout = false) => {
    if (!forceTimeout) {
      const confirmSubmit = window.confirm(
        'Yakin ingin menyelesaikan kuis? Jawaban tidak dapat diubah lagi setelah ini.'
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    const durationUsed = (quizInfo.durationMinutes * 60) - timeLeft;

    if (attemptId) {
      try {
        // Kirim status SELESAI ke server
        await apiFetch(`/attempts/${attemptId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'SELESAI' }),
        });

        // Trigger penilaian otomatis jika endpoint penilaian aktif
        try {
          await apiFetch(`/attempts/${attemptId}/grade`, { method: 'POST' });
        } catch {
          // Abaikan jika penilaian otomatis opsional
        }
      } catch (err) {
        console.warn('Gagal submit attempt ke server:', err.message);
      }
    }

    navigate('/siswa/hasil-akhir', {
      state: {
        attemptId,
        quizId: quizInfo.id,
        quizTitle: quizInfo.title,
        answers,
        totalQuestions,
        durationUsed,
      },
    });
  };

  // ── 5. Status Warna Badge Nomor Soal ─────────────────────────────────────
  const getBadgeStyle = (qId, idx) => {
    if (idx === currentIndex)
      return 'bg-[#004d57] text-white ring-2 ring-[#008994]';
    if (doubted[qId])
      return 'bg-amber-100 text-amber-700 border border-amber-300';
    if (answers[qId])
      return 'bg-[#008994] text-white';
    return 'bg-white text-slate-600 border border-slate-200';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#008994]" />
        <p className="text-sm font-semibold text-slate-600">Memuat soal kuis...</p>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* ───────── KOLOM KIRI: Area Soal ───────── */}
      <div className="flex-1 space-y-6">
        {/* Notifikasi API jika offline */}
        {apiNotice && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{apiNotice}</span>
          </div>
        )}

        {/* Header Materi & Timer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            Materi: {quizInfo.topic}
          </h1>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">Sisa Waktu</span>
            <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Card Soal */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
          {/* Nomor Soal */}
          <h2 className="text-base font-bold text-slate-800">
            Soal {currentIndex + 1}
          </h2>

          {/* Gambar / Rumus (jika ada) */}
          {currentQuestion?.questionImage && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-center">
              <span className="text-lg font-mono text-slate-700">
                {currentQuestion.questionImage}
              </span>
            </div>
          )}

          {/* Teks Pertanyaan */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {currentQuestion?.questionText}
          </p>

          {/* Pilihan Jawaban */}
          <div className="space-y-3">
            {currentQuestion?.options.map((opt) => {
              const isSelected = answers[currentQuestion.id]?.key === opt.key;
              return (
                <button
                  key={opt.id || opt.key}
                  type="button"
                  onClick={() => selectAnswer(opt)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? 'border-[#008994] bg-[#008994] text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-[#008994]/40 hover:bg-[#e6f7f8]'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigasi Bawah: Sebelumnya / Ragu-ragu / Selanjutnya */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 rounded-xl border border-[#008994] px-5 py-2.5 text-sm font-semibold text-[#008994] hover:bg-[#e6f7f8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>

          <button
            type="button"
            onClick={toggleDoubt}
            className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
              currentQuestion && doubted[currentQuestion.id]
                ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flag className={`h-4 w-4 ${currentQuestion && doubted[currentQuestion.id] ? 'text-amber-500' : 'text-slate-400'}`} />
            Ragu-ragu
          </button>

          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === totalQuestions - 1}
            className="flex items-center gap-2 rounded-xl bg-[#008994] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#007a84] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ───────── KOLOM KANAN: Panel Nomor Soal ───────── */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-5 sticky top-6">
          <h3 className="text-base font-bold text-center text-slate-800">
            Nomor Soal
          </h3>

          {/* Info Mapel */}
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-800">{quizInfo.title}</p>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span>📋</span> Jumlah Soal : {totalQuestions}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Durasi: {quizInfo.durationMinutes} Menit
              </span>
            </div>
          </div>

          {/* Grid Nomor */}
          <div className="grid grid-cols-7 gap-2 max-h-72 overflow-y-auto p-1">
            {questions.map((q, idx) => (
              <button
                key={q.id || idx + 1}
                type="button"
                onClick={() => goTo(idx)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${getBadgeStyle(q.id, idx)}`}
                title={`Soal ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Tombol Selesai */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFinish(false)}
            className="w-full rounded-xl border border-[#008994] px-4 py-2.5 text-sm font-semibold text-[#008994] hover:bg-[#e6f7f8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              'Selesai'
            )}
          </button>

          {/* Legenda */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-4 w-4 rounded bg-[#008994]" />
              Sudah dijawab
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-4 w-4 rounded border border-slate-200 bg-white" />
              Belum dijawab
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-4 w-4 rounded bg-amber-100 border border-amber-300" />
              Ragu-ragu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
