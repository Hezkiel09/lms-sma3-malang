import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function BuatKuisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [selectedQuestions, setSelectedQuestions] = useState(location.state?.selectedQuestions || []);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(location.state?.flashMessage ? { type: 'success', message: location.state.flashMessage } : null);

  // Form details
  const [formData, setFormData] = useState({
    judul: '',
    kkm: 75,
    jumlahSoal: location.state?.formData?.jumlahSoal || 0,
    durasi: '75 menit',
    deskripsi: location.state?.formData?.deskripsi || '',
  });

  useEffect(() => {
    if (location.state?.selectedQuestions) {
      setSelectedQuestions([...new Map(location.state.selectedQuestions.map((question) => [String(question.id), question])).values()]);
      setFormData((current) => ({ ...current, judul: location.state.formData?.judul || current.judul, kkm: location.state.formData?.kkm ?? current.kkm, durasi: location.state.formData?.durasi || current.durasi, deskripsi: location.state.formData?.deskripsi || current.deskripsi }));
    }
  }, [location.state]);

  const hasAddedFromBank = selectedQuestions.length > 0;
  const totalQuestions = selectedQuestions.length;
  const numbersList = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  const handleSaveQuiz = async () => {
    if (!formData.judul.trim()) return setFeedback({ type: 'error', message: 'Judul kuis wajib diisi.' });
    if (!selectedQuestions.length) return setFeedback({ type: 'error', message: 'Pilih minimal satu soal dari Bank Soal sebelum menyimpan.' });
    const duration = Number.parseInt(formData.durasi, 10);
    if (!Number.isFinite(duration) || duration <= 0) return setFeedback({ type: 'error', message: 'Durasi harus berupa jumlah menit yang valid.' });

    setSubmitting(true);
    setFeedback(null);
    let createdQuiz;
    try {
      createdQuiz = await apiFetch('/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.judul.trim(),
          description: formData.deskripsi.trim() || null,
          duration_minutes: duration,
          passing_grade: Number(formData.kkm),
          status: 'DRAFT',
          ...((user?.id || user?.user_id) ? { teacher_id: user.id || user.user_id } : {}),
        }),
      });
      const attached = await apiFetch(`/quizzes/${encodeURIComponent(createdQuiz.id)}/questions`, {
        method: 'POST',
        body: JSON.stringify({ questions: selectedQuestions.map((question, index) => ({
          question_id: question.id,
          question_order: index + 1,
          points: Number(question.points ?? question.default_points ?? 1),
        })) }),
      });
      if (!Array.isArray(attached) || attached.length !== selectedQuestions.length) {
        throw new Error('Backend belum mengonfirmasi seluruh relasi quiz_questions.');
      }
      navigate('/b6/buat-kuis', { replace: true, state: { savedQuizId: createdQuiz.id, flashMessage: 'Kuis berhasil disimpan sebagai draft.' } });
    } catch (error) {
      let detail = error.message;
      if (createdQuiz?.id) {
        try {
          await apiFetch(`/quizzes/${encodeURIComponent(createdQuiz.id)}`, { method: 'DELETE' });
          detail = `Draft kuis yang belum lengkap sudah dibatalkan. ${error.message}`;
        } catch (cleanupError) {
          detail = `Draft kuis dibuat tetapi soal gagal ditambahkan; penghapusan draft juga gagal. ${error.message} ${cleanupError.message}`;
        }
      }
      setFeedback({ type: 'error', message: `Gagal menyimpan kuis: ${detail}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Title (Persis di Foto: Langsung "Buat Kuis" Tanpa Breadcrumb di Atasnya) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Buat Kuis
        </h1>

        <div className="flex items-center gap-3">
          {/* Badge Gambar 4 jika ada soal dari bank */}
          {hasAddedFromBank && (
            <span className="rounded-full bg-[#e6f7f8] px-3.5 py-1 text-xs font-semibold text-[#005b64]">
              Soal dari Bank Ditambahkan
            </span>
          )}

        </div>
      </div>

      {/* 2. Success Alert Banner (Hanya muncul jika soal ditambahkan - Gambar 4) */}
      {(hasAddedFromBank || location.state?.flashMessage) && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{location.state?.flashMessage || `${selectedQuestions.length} soal dari Bank Soal siap ditambahkan`}</span>
        </div>
      )}

      {feedback && <div role={feedback.type === 'error' ? 'alert' : 'status'} className={`flex items-center gap-2 rounded-xl p-3 text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{feedback.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{feedback.message}</div>}

      {/* 3. Card 1: Detail Kuis */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Detail Kuis</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur judul, durasi, dan jumlah soal untuk kuis ini.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleSaveQuiz}
              disabled={submitting}
              className="rounded-xl bg-[#004d57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Judul Kuis */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Judul Kuis
            </label>
            <input
              type="text"
              placeholder="Contoh: Ulangan Harian Matematika XI"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
            />
          </div>

          {/* Row: KKM, Jumlah Soal, Durasi */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                KKM
              </label>
              <input
                type="number"
                value={formData.kkm}
                onChange={(e) => setFormData({ ...formData, kkm: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-[#004d57] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Jumlah Soal
              </label>
              <input
                type="number"
                value={totalQuestions}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Durasi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.durasi}
                  onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 focus:border-[#004d57] focus:outline-none"
                />
                <Clock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan instruksi singkat untuk siswa sebelum memulai kuis."
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Card 2: Daftar Soal */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Soal</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola soal yang sudah ditambahkan ke kuis ini.
            </p>
          </div>

          {/* 3 Tombol Aksi: Impor, Ambil dari Bank Soal, Tambah Soal */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/b6/buat-kuis/import')}
              className="flex items-center gap-2 rounded-xl bg-[#e6f7f8] px-4 py-2 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              <Upload className="h-4 w-4 stroke-[2.2]" />
              <span>Impor</span>
            </button>

            <button
              onClick={() => navigate('/b6/buat-kuis/ambil-bank-soal', { state: { selectedQuestions, formData } })}
              className="rounded-xl bg-[#004d57] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              Ambil dari Bank Soal
            </button>

            <button
              onClick={() => navigate('/b6/buat-kuis/ambil-bank-soal', { state: { selectedQuestions, formData } })}
              className="rounded-xl bg-[#004d57] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              Tambah Soal
            </button>
          </div>
        </div>

        {/* Number Badges Grid (1 s/d 40 atau 42) */}
        <div className="flex flex-wrap gap-2 pt-2">
          {numbersList.map((num) => {
            const isNewlyAdded = num > 40;
            return (
              <button
                key={num}
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                  isNewlyAdded
                    ? 'bg-[#004d57] text-white ring-2 ring-cyan-400 hover:brightness-110'
                    : 'bg-[#008994] text-white hover:brightness-110'
                }`}
                title={`Soal nomor ${num}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Sub-info line below numbers */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span>
              {totalQuestions} soal tersedia untuk diedit atau ditambahkan.
            </span>
          </div>

          {hasAddedFromBank && (
            <span className="rounded-full bg-[#e0f7fa] px-2.5 py-0.5 text-xs font-semibold text-[#006064]">
              41–42 baru
            </span>
          )}
        </div>

        {selectedQuestions.length > 0 && (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {selectedQuestions.map((question, index) => (
              <div key={question.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004d57] text-xs font-bold text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <span className="rounded-md bg-[#e0f7fa] px-2 py-0.5 text-[11px] font-semibold text-[#006064]">{question.question_type || 'Soal'}</span>
                  <p className="mt-1.5 text-xs font-semibold text-slate-800 sm:text-sm">{question.question_text}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Dari Bank Soal · {question.points ?? question.default_points ?? 1} poin</p>
                </div>
                <button type="button" onClick={() => setSelectedQuestions((current) => current.filter((item) => String(item.id) !== String(question.id)))} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Hapus</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
