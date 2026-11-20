import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Clock } from 'lucide-react';

// ── Mock Data Soal ──────────────────────────────────────────────────────────
const mockQuestions = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  questionText: 'Lorem ipsum dolor sit amet consectetur.',
  questionImage:
    i === 3
      ? '( (27a⁻⁵b⁻³) / (3⁵a⁻⁷b⁻⁵) )⁻¹'
      : null,
  options: [
    { key: 'A', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { key: 'B', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { key: 'C', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { key: 'D', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
    { key: 'E', text: 'Lorem ipsum dolor sit amet consectetur. Libero id pulvinar ornare ipsum.' },
  ],
}));

const TOTAL_QUESTIONS = mockQuestions.length;
const DURATION_SECONDS = 75 * 60; // 75 menit

// ── Helper: format detik → HH:MM:SS ────────────────────────────────────────
function formatTime(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// ═════════════════════════════════════════════════════════════════════════════
//  KOMPONEN UTAMA: MengerjakanKuis
// ═════════════════════════════════════════════════════════════════════════════
export default function MengerjakanKuis() {
  const navigate = useNavigate();

  // State soal aktif, jawaban, ragu‑ragu, dan timer
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});        // { [questionId]: 'A' | 'B' | ... }
  const [doubted, setDoubted] = useState({});         // { [questionId]: true }
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);

  const currentQuestion = mockQuestions[currentIndex];

  // ── Countdown Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Waktu habis → langsung ke halaman Hasil Akhir
  useEffect(() => {
    if (timeLeft === 0) {
      navigate('/siswa/hasil-akhir', {
        state: {
          answers,
          totalQuestions: TOTAL_QUESTIONS,
          durationUsed: DURATION_SECONDS,
        },
      });
    }
  }, [timeLeft, navigate, answers]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const selectAnswer = (key) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));
  };

  const toggleDoubt = () => {
    setDoubted((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const goTo = useCallback(
    (idx) => {
      if (idx >= 0 && idx < TOTAL_QUESTIONS) setCurrentIndex(idx);
    },
    [],
  );

  const handleFinish = () => {
    if (!window.confirm('Yakin ingin menyelesaikan kuis? Jawaban tidak dapat diubah setelah ini.')) return;
    navigate('/siswa/hasil-akhir', {
      state: {
        answers,
        totalQuestions: TOTAL_QUESTIONS,
        durationUsed: DURATION_SECONDS - timeLeft,
      },
    });
  };

  // ── Hitung status badge warna per nomor soal ───────────────────────────
  const getBadgeStyle = (qId, idx) => {
    if (idx === currentIndex)
      return 'bg-[#004d57] text-white ring-2 ring-[#008994]';
    if (doubted[qId])
      return 'bg-amber-100 text-amber-700 border border-amber-300';
    if (answers[qId])
      return 'bg-[#008994] text-white';
    return 'bg-white text-slate-600 border border-slate-200';
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* ───────── KOLOM KIRI: Area Soal ───────── */}
      <div className="flex-1 space-y-6">
        {/* Header Materi & Timer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            Materi: Komposisi &amp; Inverse
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
          {currentQuestion.questionImage && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-center">
              <span className="text-lg font-mono text-slate-700">
                {currentQuestion.questionImage}
              </span>
            </div>
          )}

          {/* Teks Pertanyaan */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {currentQuestion.questionText}
          </p>

          {/* Pilihan Jawaban */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => selectAnswer(opt.key)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? 'border-[#008994] bg-[#008994] text-white'
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
              doubted[currentQuestion.id]
                ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flag className={`h-4 w-4 ${doubted[currentQuestion.id] ? 'text-amber-500' : 'text-slate-400'}`} />
            Ragu-ragu
          </button>

          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === TOTAL_QUESTIONS - 1}
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
            <p className="text-sm font-bold text-slate-800">Matematika</p>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span></span> Jumlah Soal : {TOTAL_QUESTIONS}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Durasi: 75 Menit
              </span>
            </div>
          </div>

          {/* Grid Nomor */}
          <div className="grid grid-cols-7 gap-2">
            {mockQuestions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => goTo(idx)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${getBadgeStyle(q.id, idx)}`}
                title={`Soal ${q.id}`}
              >
                {q.id}
              </button>
            ))}
          </div>

          {/* Tombol Selesai */}
          <button
            type="button"
            onClick={handleFinish}
            className="w-full rounded-xl border border-[#008994] px-4 py-2.5 text-sm font-semibold text-[#008994] hover:bg-[#e6f7f8] transition-colors"
          >
            Selesai
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
