import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronRight,
  Upload,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { b6ApiFetch } from './b6-api';

function resolveQuestionBank(banks, quiz) {
  if (quiz.class_id || quiz.subject_id) {
    const courseMatches = banks.filter((bank) => (
      (!quiz.subject_id || String(bank.subject_id) === String(quiz.subject_id))
        && (bank.courses || []).some((course) => (
          (!quiz.class_id || String(course.class_id) === String(quiz.class_id))
            && (!quiz.subject_id || String(course.subject_id) === String(quiz.subject_id))
        ))
    ));
    return courseMatches.length === 1 ? courseMatches[0] : null;
  }

  const attachedBankIds = new Set(
    (quiz.quiz_questions || [])
      .map((item) => item.questions?.question_bank_id)
      .filter(Boolean)
      .map(String),
  );
  const attachedBanks = banks.filter((bank) => attachedBankIds.has(String(bank.id)));
  return attachedBanks.length === 1 ? attachedBanks[0] : null;
}

export default function TambahSoalKuisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialType = location.state?.initialType || 'Benar / Salah';
  const fromSource = location.state?.from || 'buat-kuis';
  const customKelas = location.state?.kelas;
  const customMapel = location.state?.mapel;
  const customMateri = location.state?.materi;
  const sourceBankId = location.state?.bankId;
  const returnKelas = location.state?.returnKelas;
  const returnMapel = location.state?.returnMapel;
  const quizId = location.state?.quizId || sessionStorage.getItem('b6.currentQuizId');
  const [quiz, setQuiz] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionBankId, setQuestionBankId] = useState(sourceBankId || '');
  const [isLoading, setIsLoading] = useState(Boolean(quizId || sourceBankId));
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(
    sourceBankId || quizId
      ? ''
      : fromSource === 'bank-soal'
        ? 'Bank soal tidak ditemukan. Kembali ke halaman Bank Soal dan pilih mata pelajaran.'
        : 'Draft kuis tidak ditemukan. Kembali ke Buat Kuis dan simpan draft terlebih dahulu.',
  );

  // State
  const [jenisSoal, setJenisSoal] = useState(initialType);
  const [pertanyaan, setPertanyaan] = useState('');
  const [kunciJawabanPG, setKunciJawabanPG] = useState('B');
  const [kunciBenarSalah, setKunciBenarSalah] = useState('Benar');
  const [bobot, setBobot] = useState(initialType === 'Esai' ? 10 : 5);
  const [pilihanPG, setPilihanPG] = useState({
    A: '',
    B: '',
    C: '',
    D: '',
  });

  const [jawabanAcuan, setJawabanAcuan] = useState('');
  const [rubric, setRubric] = useState([]);

  const navigateToBankStep = (step) => {
    navigate('/b6/bank-soal', {
      state: returnKelas && returnMapel
        ? {
            restoreStep: step,
            restoreKelas: returnKelas,
            restoreMapel: returnMapel,
            hasReachedStepFour: true,
          }
        : undefined,
      replace: true,
    });
  };

  useEffect(() => {
    if (fromSource === 'bank-soal') {
      if (!sourceBankId) {
        return undefined;
      }

      let active = true;
      Promise.all([
        b6ApiFetch(`/banks/${encodeURIComponent(sourceBankId)}`),
        b6ApiFetch(`/banks/${encodeURIComponent(sourceBankId)}/questions`),
      ])
        .then(([bank, questions]) => {
          if (!active) return;
          setQuestionBankId(bank.id);
          setQuestionNumber((Array.isArray(questions) ? questions.length : 0) + 1);
        })
        .catch((error) => {
          if (active) setLoadError(error.message);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });

      return () => {
        active = false;
      };
    }

    if (!quizId) {
      return undefined;
    }

    let active = true;
    const loadQuizContext = async () => {
      try {
        const [quizData, banksData] = await Promise.all([
          b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}`),
          b6ApiFetch('/banks'),
        ]);
        if (!active) return;

        const attached = quizData.quiz_questions || [];
        setQuiz(quizData);
        setQuestionNumber(attached.reduce(
          (max, item) => Math.max(max, Number(item.question_order) || 0),
          attached.length,
        ) + 1);
        const bank = resolveQuestionBank(
          Array.isArray(banksData) ? banksData : [],
          quizData,
        );
        if (bank) {
          setQuestionBankId(bank.id);
        } else {
          setLoadError(
            'Bank soal tidak dapat ditentukan. Pastikan kuis memiliki kelas dan mata pelajaran yang terhubung, atau buka formulir tambah soal dari Bank Soal yang sesuai.',
          );
        }
        sessionStorage.setItem('b6.currentQuizId', quizData.id);
      } catch (error) {
        if (active) setLoadError(error.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadQuizContext();
    return () => {
      active = false;
    };
  }, [fromSource, quizId, sourceBankId]);

  const handleTabChange = (type) => {
    setJenisSoal(type);
    setPertanyaan('');
    if (type === 'Benar / Salah') {
      setBobot(5);
    } else if (type === 'Esai') {
      setBobot(10);
    } else {
      setBobot(5);
    }
  };

  const handleSimpanSoal = async (e) => {
    e.preventDefault();
    if (isLoading || isSaving) return;
    const bankOnlyMode = fromSource === 'bank-soal';
    if ((!quizId || !quiz) && !bankOnlyMode) {
      window.alert(loadError || 'Draft kuis belum tersedia.');
      return;
    }
    if (!questionBankId) {
      window.alert('Bank soal untuk kuis ini tidak dapat ditentukan dari data mapel/kelas. Simpan kuis dengan mata pelajaran dan kelas yang sesuai sebelum menambah soal.');
      return;
    }
    if (!pertanyaan.trim()) {
      window.alert('Pertanyaan wajib diisi.');
      return;
    }
    if (!Number.isFinite(bobot) || bobot <= 0) {
      window.alert('Bobot nilai harus lebih dari 0.');
      return;
    }
    if (jenisSoal === 'Esai' && rubric.some((item) => (
      !item.text.trim() || !Number.isFinite(Number(item.points)) || Number(item.points) < 0
    ))) {
      window.alert('Lengkapi kriteria penilaian esai dengan teks dan poin yang valid.');
      return;
    }

    const options = jenisSoal === 'Pilihan Ganda'
      ? ['A', 'B', 'C', 'D'].map((optionLabel) => ({
          option_label: optionLabel,
          option_text: pilihanPG[optionLabel].trim(),
          is_correct: kunciJawabanPG === optionLabel,
        }))
      : jenisSoal === 'Benar / Salah'
        ? [
            { option_label: 'B', option_text: 'Benar', is_correct: kunciBenarSalah === 'Benar' },
            { option_label: 'S', option_text: 'Salah', is_correct: kunciBenarSalah === 'Salah' },
          ]
        : undefined;

    if (options?.some((option) => !option.option_text)) {
      window.alert('Lengkapi semua pilihan jawaban sebelum menyimpan.');
      return;
    }

    setIsSaving(true);
    let createdQuestionId;
    let attachmentRequested = false;
    try {
      const question = await b6ApiFetch(
        `/banks/${encodeURIComponent(questionBankId)}/questions/manual`,
        {
          method: 'POST',
          body: JSON.stringify({
            question_text: pertanyaan.trim(),
            question_type: jenisSoal === 'Pilihan Ganda'
              ? 'PILIHAN_GANDA'
              : jenisSoal === 'Benar / Salah' ? 'BENAR_SALAH' : 'ESAI',
            default_points: bobot,
            reference_answer: jenisSoal === 'Esai' ? jawabanAcuan.trim() || null : null,
            grading_rubric: jenisSoal === 'Esai'
              ? rubric.map((item) => ({ ...item, text: item.text.trim(), points: Number(item.points) }))
              : null,
            ...(options ? { options } : {}),
          }),
        },
      );
      createdQuestionId = question.id;

      if (bankOnlyMode) {
        navigateToBankStep(3);
        return;
      }

      const latestQuiz = await b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}`);
      const attachedQuestions = latestQuiz.quiz_questions || [];
      const nextOrder = attachedQuestions.reduce(
        (max, item) => Math.max(max, Number(item.question_order) || 0),
        attachedQuestions.length,
      ) + 1;

      attachmentRequested = true;
      await b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}/questions`, {
        method: 'POST',
        body: JSON.stringify({
          questions: [{
            question_id: question.id,
            points: bobot,
            question_order: nextOrder,
          }],
        }),
      });

      navigate('/b6/buat-kuis', {
        state: { quizId, addedFromBank: true, addedQuestionCount: 1 },
      });
    } catch (error) {
      if (createdQuestionId) {
        if (attachmentRequested) {
          try {
            const latestQuiz = await b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}`);
            const isAttached = (latestQuiz.quiz_questions || []).some(
              (item) => String(item.questions?.id || item.question_id) === String(createdQuestionId),
            );
            if (isAttached) {
              navigate('/b6/buat-kuis', {
                state: { quizId, addedFromBank: true, addedQuestionCount: 1 },
              });
              return;
            }
          } catch (verificationError) {
            window.alert(`Tidak dapat memastikan apakah soal berhasil ditautkan ke kuis (${error.message}). Soal tetap tersimpan di bank; periksa kuis sebelum mencoba lagi. ${verificationError.message}`);
            return;
          }
        }

        try {
          await b6ApiFetch(
            `/banks/${encodeURIComponent(questionBankId)}/questions/${encodeURIComponent(createdQuestionId)}`,
            { method: 'DELETE' },
          );
        } catch (cleanupError) {
          window.alert(`Soal tersimpan di bank, tetapi gagal ditambahkan ke kuis. Penghapusan otomatis juga gagal: ${cleanupError.message}`);
          return;
        }
      }
      window.alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        {fromSource === 'bank-soal' ? (
          <Link to="/b6/bank-soal" className="hover:text-slate-600 transition-colors">
            Bank Soal
          </Link>
        ) : (
          <Link to="/b6/buat-kuis" className="hover:text-slate-600 transition-colors">
            Buat Kuis
          </Link>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Tambah Soal</span>
      </nav>

      {/* 2. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Tambah Soal
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          {quiz?.title || (fromSource === 'bank-soal'
            ? `Bank Soal Kelas ${customKelas || 'XI'} • ${customMapel || 'Mata Pelajaran'}${customMateri ? ` • ${customMateri}` : ''}`
            : 'Ulangan Harian Matematika Kelas XI')}
        </p>
      </div>

      {/* 3. Main Card: Detail Soal */}
      <form onSubmit={handleSimpanSoal} className="space-y-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
          {/* Card Title & Soal 41 Badge */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Detail Soal</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {jenisSoal === 'Esai'
                  ? 'Susun pertanyaan esai, jawaban acuan, dan penilaian.'
                  : jenisSoal === 'Pilihan Ganda'
                    ? 'Susun pertanyaan, pilihan jawaban, dan tentukan kunci jawaban.'
                    : 'Susun pernyataan dan tentukan jawaban yang benar atau salah.'}
              </p>
            </div>
            <span className="rounded-md bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
              Soal {questionNumber}
            </span>
          </div>

          {/* Section: Jenis Soal (3 Tabs: Pilihan Ganda, Benar / Salah, Esai) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Jenis Soal
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Option 1: Pilihan Ganda */}
              <button
                type="button"
                onClick={() => handleTabChange('Pilihan Ganda')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  jenisSoal === 'Pilihan Ganda'
                    ? 'border-2 border-cyan-500 bg-cyan-50/60 text-[#005b64]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {jenisSoal === 'Pilihan Ganda' && (
                  <CheckCircle2 className="h-4 w-4 text-[#008994]" />
                )}
                <span>Pilihan Ganda</span>
              </button>

              {/* Option 2: Benar / Salah */}
              <button
                type="button"
                onClick={() => handleTabChange('Benar / Salah')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  jenisSoal === 'Benar / Salah'
                    ? 'border-2 border-cyan-500 bg-cyan-50/60 text-[#005b64]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {jenisSoal === 'Benar / Salah' && (
                  <CheckCircle2 className="h-4 w-4 text-[#008994]" />
                )}
                <span>Benar / Salah</span>
              </button>

              {/* Option 3: Esai */}
              <button
                type="button"
                onClick={() => handleTabChange('Esai')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  jenisSoal === 'Esai'
                    ? 'border-2 border-cyan-500 bg-cyan-50/60 text-[#005b64]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {jenisSoal === 'Esai' && (
                  <CheckCircle2 className="h-4 w-4 text-[#008994]" />
                )}
                <span>Esai</span>
              </button>
            </div>
          </div>

          {/* Section: Pertanyaan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Pertanyaan
            </label>
            <textarea
              rows={jenisSoal === 'Esai' ? 4 : 3}
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
              placeholder="Tuliskan teks pertanyaan di sini..."
            />
            <div className="text-[11px] text-slate-400">
              {pertanyaan.length} karakter
            </div>
          </div>

          {/* Section: Gambar Soal (Opsional) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Gambar Soal (Opsional)
            </label>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-slate-50/40 p-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100/70 text-[#008994] mb-2">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Pilih gambar untuk melampirkan ke soal
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format PNG atau JPG, ukuran maksimal 5 MB
              </p>
              <button
                type="button"
                onClick={() => alert('Pilih gambar dari file picker')}
                className="mt-3 rounded-xl bg-[#004d57] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003c44] transition-colors"
              >
                Pilih Gambar
              </button>
            </div>
          </div>

          {/* Section: Mode Benar / Salah */}
          {jenisSoal === 'Benar / Salah' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Pilihan Jawaban &amp; Kunci Jawaban
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tentukan apakah pernyataan benar atau salah sebagai kunci.
                </p>
              </div>

              <div className="space-y-2.5">
                {['Benar', 'Salah'].map((val) => {
                  const isChecked = kunciBenarSalah === val;
                  return (
                    <div
                      key={val}
                      onClick={() => setKunciBenarSalah(val)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-2 border-cyan-400 bg-cyan-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                            isChecked
                              ? 'border-[#008994] bg-[#008994]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {val}
                        </span>
                      </div>

                      {isChecked && (
                        <span className="text-xs font-semibold text-[#005b64]">
                          Kunci jawaban
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Mode Pilihan Ganda */}
          {jenisSoal === 'Pilihan Ganda' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Pilihan Jawaban &amp; Kunci Jawaban
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pilih lingkaran pada jawaban yang benar sebagai kunci.
                </p>
              </div>

              <div className="space-y-2.5">
                {['A', 'B', 'C', 'D'].map((key) => {
                  const isChecked = kunciJawabanPG === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setKunciJawabanPG(key)}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-2 border-cyan-400 bg-cyan-50/50 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isChecked
                              ? 'border-[#008994] bg-[#008994]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>

                        <span className="text-xs font-bold text-slate-800">
                          {key}.
                        </span>

                        <input
                          type="text"
                          value={pilihanPG[key]}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setPilihanPG({ ...pilihanPG, [key]: e.target.value })
                          }
                          className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
                        />
                      </div>

                      {isChecked && (
                        <span className="text-xs font-semibold text-[#005b64] pl-2">
                          Kunci jawaban
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Mode Esai (Jawaban Acuan & Pedoman Penilaian) */}
          {jenisSoal === 'Esai' && (
            <div className="space-y-6">
              {/* Jawaban Acuan */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Jawaban Acuan
                </label>
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <textarea
                    value={jawabanAcuan}
                    onChange={(event) => setJawabanAcuan(event.target.value)}
                    rows={4}
                    className="w-full resize-y bg-transparent text-xs sm:text-sm text-slate-800 font-mono leading-relaxed focus:outline-none"
                    placeholder="Tuliskan jawaban acuan untuk soal ini..."
                  />
                  <div className="pt-2 text-xs text-slate-400 border-t border-slate-50">
                    Acuan untuk guru; langkah setara yang benar tetap diterima.
                  </div>
                </div>
              </div>

              {/* Pedoman Penilaian */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Pedoman Penilaian
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Berikan poin untuk setiap kriteria. Poin maksimal soal saat ini {bobot}.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white divide-y divide-slate-100 shadow-2xs">
                  {rubric.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <input
                        type="text"
                        value={item.text}
                        onChange={(event) => setRubric((current) => current.map((entry, entryIndex) => (
                          entryIndex === idx ? { ...entry, text: event.target.value } : entry
                        )))}
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-700 focus:border-[#004d57] focus:outline-none"
                        aria-label={`Kriteria penilaian ${idx + 1}`}
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.points}
                        onChange={(event) => setRubric((current) => current.map((entry, entryIndex) => (
                          entryIndex === idx ? { ...entry, points: event.target.value } : entry
                        )))}
                        className="w-16 rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold text-[#005b64] focus:border-[#004d57] focus:outline-none"
                        aria-label={`Poin kriteria ${idx + 1}`}
                      />
                      <span className="text-xs font-semibold text-[#005b64]">poin</span>
                      <button
                        type="button"
                        onClick={() => setRubric((current) => current.filter((_, entryIndex) => entryIndex !== idx))}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Hapus kriteria ${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => setRubric((current) => [...current, { text: '', points: 0 }])}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#e6f7f8] px-3 py-2 text-xs font-semibold text-[#005b64] hover:bg-[#d5f0f2]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah kriteria
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Bobot Nilai */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Bobot Nilai
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={bobot}
                  onChange={(e) => setBobot(Number(e.target.value))}
                  className="w-24 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:border-[#004d57] focus:outline-none"
                />
                <span className="text-xs font-semibold text-slate-600">poin</span>
              </div>
              <span className="text-xs text-slate-400 sm:ml-4">
                {jenisSoal === 'Esai'
                  ? 'Nilai diberikan guru berdasarkan pedoman penilaian, dari 0 hingga 10 poin. Jawaban kosong bernilai 0.'
                  : `Siswa mendapat ${bobot} poin jika menjawab benar. Jawaban salah atau kosong bernilai 0.`}
              </span>
            </div>
          </div>

          {/* Action Buttons: Kembali & Simpan Soal */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (fromSource === 'bank-soal') {
                  navigateToBankStep(4);
                } else {
                  navigate('/b6/buat-kuis');
                }
              }}
              className="rounded-xl bg-[#e6f7f8] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              Kembali
            </button>

            <button
              type="submit"
              disabled={isLoading || isSaving}
              className="rounded-xl bg-[#004d57] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors disabled:opacity-60"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Soal'}
            </button>
          </div>
        </div>
      </form>

      {/* Bottom Caption */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>Soal akan ditambahkan ke daftar soal kuis ini setelah disimpan.</span>
      </div>
    </div>
  );
}
