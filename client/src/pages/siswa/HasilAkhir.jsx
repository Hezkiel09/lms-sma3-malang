import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

// ── Helper: format detik → teks "X jam Y menit" ────────────────────────────
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} menit`;
  if (hours > 0) return `${hours} jam`;
  return `${minutes} menit`;
}

// ── Donut Chart (SVG) ───────────────────────────────────────────────────────
function ScoreDonut({ percentage }) {
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        {/* Background track */}
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Filled arc */}
        <circle
          stroke="#008994"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center label */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-[#008994]">{percentage}%</span>
        <span className="text-xs text-slate-400 mt-0.5">Skor akhir</span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  KOMPONEN UTAMA: HasilAkhir (Terintegrasi API B6)
// ═════════════════════════════════════════════════════════════════════════════
export default function HasilAkhir() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    attemptId = null,
    quizTitle = 'Matematika',
    answers = {},
    totalQuestions = 40,
    durationUsed = 4800,
  } = location.state || {};

  const [loading, setLoading] = useState(Boolean(attemptId));
  const [stats, setStats] = useState(() => {
    // Perhitungan awal / fallback
    const totalAnswered = Object.keys(answers).length;
    const benar = Math.min(totalAnswered, 30);
    const salah = Math.max(0, totalAnswered - benar);
    const tidakDijawab = Math.max(0, totalQuestions - totalAnswered);
    const poin = benar;
    const percentage = totalQuestions > 0 ? Math.round((poin / totalQuestions) * 100) : 0;

    return {
      poin,
      totalSoal: totalQuestions,
      durasi: durationUsed,
      benar,
      salah,
      tidakDijawab,
      percentage,
      mapel: quizTitle,
    };
  });

  // ── Ambil Data Attempt Resmi dari Server ──────────────────────────────────
  useEffect(() => {
    let active = true;

    async function fetchAttemptDetails() {
      if (!attemptId) return;

      try {
        const attempt = await apiFetch(`/attempts/${attemptId}`);
        if (active && attempt) {
          const totalQ = totalQuestions;
          let calculatedDuration = durationUsed;

          if (attempt.started_at && attempt.submitted_at) {
            const start = new Date(attempt.started_at).getTime();
            const end = new Date(attempt.submitted_at).getTime();
            calculatedDuration = Math.max(0, Math.round((end - start) / 1000));
          }

          const benar = attempt.correct_count ?? stats.benar;
          const salah = attempt.incorrect_count ?? stats.salah;
          const poin = attempt.total_score ?? benar;
          const totalAnswered = benar + salah;
          const tidakDijawab = Math.max(0, totalQ - totalAnswered);
          const percentage = totalQ > 0 ? Math.round((poin / totalQ) * 100) : 0;

          setStats({
            poin,
            totalSoal: totalQ,
            durasi: calculatedDuration,
            benar,
            salah,
            tidakDijawab,
            percentage,
            mapel: quizTitle,
          });
        }
      } catch (err) {
        console.warn('Gagal memuat detail attempt dari server, menggunakan hasil lokal:', err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAttemptDetails();

    return () => {
      active = false;
    };
  }, [attemptId, durationUsed, quizTitle, totalQuestions]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Hasil Akhir
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Lihat ringkasan hasil asesmen {stats.mapel} dan tinjau kembali jawabanmu.
          </p>
        </div>
        <span className="inline-flex items-center self-start rounded-full border border-[#008994]/20 bg-[#e6f7f8] px-4 py-1.5 text-xs font-semibold text-[#005b64]">
          {stats.mapel}
        </span>
      </div>

      {/* Main Result Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title Row + Percentage Badge */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{stats.mapel}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Hasil akhir asesmen</p>
          </div>
          <span className="rounded-full bg-[#e6f7f8] px-3 py-1 text-xs font-bold text-[#008994]">
            {stats.percentage}%
          </span>
        </div>

        {/* Grid: Poin + Durasi + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Poin & Durasi */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Poin */}
            <div className="rounded-xl border border-[#008994]/15 bg-[#f0fafb] p-5">
              <span className="text-xs font-semibold text-[#008994]">Poin</span>
              <p className="mt-1 text-2xl font-bold text-[#008994]">
                {loading ? '...' : `${stats.poin} / ${stats.totalSoal}`}
              </p>
            </div>

            {/* Durasi */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Durasi
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {loading ? '...' : formatDuration(stats.durasi)}
              </p>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-5">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#008994]" />
            ) : (
              <ScoreDonut percentage={stats.percentage} />
            )}
          </div>
        </div>

        {/* Jawaban Breakdown */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-800">Jawaban</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-semibold text-slate-500">Benar</span>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {loading ? '...' : stats.benar}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-semibold text-slate-500">Salah</span>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {loading ? '...' : stats.salah}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-semibold text-slate-500">Tidak dijawab</span>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {loading ? '...' : stats.tidakDijawab}
              </p>
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
          <h4 className="text-sm font-bold text-slate-700">Catatan</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Kamu sudah menyelesaikan seluruh soal. Tinjau jawaban yang salah untuk memperbaiki pemahamanmu.
          </p>
        </div>

        {/* Footer & Kembali */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Hasil ini dapat dilihat kembali dari halaman Beranda.
          </p>
          <button
            type="button"
            onClick={() => navigate('/siswa/beranda')}
            className="rounded-xl bg-[#004d57] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
