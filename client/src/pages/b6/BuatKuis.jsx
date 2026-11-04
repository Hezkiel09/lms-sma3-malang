import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload,
  Clock,
  FileText,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { b6ApiFetch } from './b6-api';
import { getQuestionTypeLabel } from './b6-utils';

export default function BuatKuisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [attachedQuestions, setAttachedQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const quizId = location.state?.quizId || sessionStorage.getItem('b6.currentQuizId');
  const [notice] = useState(() => (
    location.state?.addedFromBank
      ? `${location.state.addedQuestionCount || 0} soal berhasil ditambahkan dari Bank Soal.`
      : ''
  ));

  // Form details
  const [formData, setFormData] = useState({
    judul: '',
    kkm: 75,
    durasi: '75 menit',
    deskripsi: '',
  });

  useEffect(() => {
    if (!location.state) return;

    if (location.state.quizId) {
      sessionStorage.setItem('b6.currentQuizId', location.state.quizId);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.key, location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!quizId) return undefined;
    let active = true;

    b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}`)
      .then((data) => {
        if (!active) return;
        const questions = [...(data.quiz_questions || [])].sort(
          (left, right) => (left.question_order || 0) - (right.question_order || 0),
        );
        setQuiz(data);
        setAttachedQuestions(questions);
        setFormData({
          judul: data.title || '',
          kkm: data.passing_grade ?? 75,
          durasi: data.duration_minutes ? `${data.duration_minutes} menit` : '75 menit',
          deskripsi: data.description || '',
        });
        sessionStorage.setItem('b6.currentQuizId', data.id);
      })
      .catch((error) => window.alert(error.message));

    return () => {
      active = false;
    };
  }, [quizId]);

  const saveDraft = async () => {
    if (!formData.judul.trim()) {
      throw new Error('Judul kuis wajib diisi sebelum menyimpan draft.');
    }

    const duration = Number.parseInt(formData.durasi, 10);
    const passingGrade = Number(formData.kkm);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Durasi kuis harus berupa jumlah menit lebih dari 0.');
    }
    if (!Number.isFinite(passingGrade) || passingGrade < 0 || passingGrade > 100) {
      throw new Error('KKM harus berada di antara 0 sampai 100.');
    }

    const payload = {
      title: formData.judul.trim(),
      description: formData.deskripsi.trim(),
      duration_minutes: duration,
      passing_grade: passingGrade,
      status: 'DRAFT',
    };

    setIsSaving(true);
    try {
      const savedQuiz = await b6ApiFetch(
        quiz?.id ? `/quizzes/${encodeURIComponent(quiz.id)}` : '/quizzes',
        {
          method: quiz?.id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
      );
      setQuiz(savedQuiz);
      sessionStorage.setItem('b6.currentQuizId', savedQuiz.id);
      return savedQuiz;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      window.alert('Draft kuis berhasil disimpan.');
    } catch (error) {
      window.alert(error.message);
    }
  };

  const openQuizSubpage = async (path) => {
    try {
      const savedQuiz = await saveDraft();
      navigate(path, { state: { quizId: savedQuiz.id } });
    } catch (error) {
      window.alert(error.message);
    }
  };

  const totalQuestions = attachedQuestions.length;
  const numbersList = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Title (Persis di Foto: Langsung "Buat Kuis" Tanpa Breadcrumb di Atasnya) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Buat Kuis
        </h1>

      </div>

      {/* 2. Success Alert Banner (Hanya muncul jika soal ditambahkan - Gambar 4) */}
      {notice && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

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
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="rounded-xl bg-[#004d57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
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
              onClick={() => openQuizSubpage('/b6/buat-kuis/import')}
              className="flex items-center gap-2 rounded-xl bg-[#e6f7f8] px-4 py-2 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              <Upload className="h-4 w-4 stroke-[2.2]" />
              <span>Impor</span>
            </button>

            <button
              onClick={() => openQuizSubpage('/b6/buat-kuis/ambil-bank-soal')}
              className="rounded-xl bg-[#004d57] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              Ambil dari Bank Soal
            </button>

            <button
              onClick={() => openQuizSubpage('/b6/buat-kuis/tambah-soal')}
              className="rounded-xl bg-[#004d57] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
            >
              Tambah Soal
            </button>
          </div>
        </div>

        {/* Number badges for questions saved to this quiz */}
        <div className="flex flex-wrap gap-2 pt-2">
          {numbersList.map((num) => {
            return (
              <button
                key={num}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all bg-[#008994] text-white hover:brightness-110"
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

        </div>

        {/* =====================================================================
            BAGIAN GAMBAR 4: "Soal yang baru ditambahkan"
           ===================================================================== */}
        {quiz && attachedQuestions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Soal yang ditambahkan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Soal kuis yang tersimpan di database
                </p>
              </div>
              <span className="rounded-full bg-[#e6f7f8] px-3 py-1 text-xs font-semibold text-[#005b64]">
                {attachedQuestions.length} soal
              </span>
            </div>

            {attachedQuestions.map((item, index) => {
              const question = item.questions || {};
              const correctOption = (question.question_options || []).find((option) => option.is_correct);
              return (
                <div key={item.id || question.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004d57] text-xs font-bold text-white">
                        {item.question_order || index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="rounded-md bg-[#e0f7fa] px-2 py-0.5 text-[11px] font-semibold text-[#006064]">
                            {getQuestionTypeLabel(question.question_type)}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            Dari Bank Soal
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                          {question.question_text}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 whitespace-nowrap pl-2">
                      Bobot: <span className="text-[#005b64]">{item.points}</span>
                    </div>
                  </div>
                  {correctOption && (
                    <p className="pl-10 text-[11px] text-slate-500">
                      Kunci jawaban: {correctOption.option_label || correctOption.option_text}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Info className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span>
                Soal berasal dari bank soal yang tersimpan di database.
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
