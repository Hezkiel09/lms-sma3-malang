import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  FileText,
  Info,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function BuatSoal() {
  const navigate = useNavigate();
  const location = useLocation();

  const kelas = location.state?.kelas || 'XI';
  const mapel = location.state?.mapel || 'Matematika';
  const materi = location.state?.materi || 'Komposisi & invers';
  const bankId = location.state?.bankId;
  const [questionType, setQuestionType] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [answerOptions, setAnswerOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [referenceAnswer, setReferenceAnswer] = useState('');
  const [points, setPoints] = useState(1);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const submitQuestion = async (event) => {
    event.preventDefault();
    if (!bankId) {
      setFeedback({ type: 'error', message: 'Bank soal belum dipilih. Kembali ke Bank Soal dan pilih bank terlebih dahulu.' });
      return;
    }
    const isEssay = questionType === 'Esai';
    const isTrueFalse = questionType === 'Benar / Salah';
    const options = isEssay ? [] : (isTrueFalse ? ['Benar', 'Salah'] : answerOptions)
      .map((option, index) => ({
        option_label: String.fromCharCode(65 + index),
        option_text: option.trim(),
        is_correct: index === correctOption,
      }));
    if (!questionText.trim() || (!isEssay && options.some((option) => !option.option_text))) {
      setFeedback({ type: 'error', message: 'Pertanyaan dan seluruh opsi jawaban wajib diisi.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      await apiFetch(`/banks/${encodeURIComponent(bankId)}/questions/manual`, {
        method: 'POST',
        body: JSON.stringify({
          question_text: questionText.trim(),
          question_type: isEssay ? 'ESSAY' : isTrueFalse ? 'BENAR_SALAH' : 'PILIHAN_GANDA',
          default_points: Number(points),
          reference_answer: isEssay ? referenceAnswer || null : null,
          options,
        }),
      });
      setFeedback({ type: 'success', message: 'Soal berhasil disimpan.' });
      navigate('/b6/bank-soal', { state: { refreshBankId: bankId, flashMessage: 'Soal berhasil disimpan.' }, replace: true });
    } catch (error) {
      setFeedback({ type: 'error', message: `Gagal menyimpan soal: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/b6/bank-soal" className="hover:text-slate-600 transition-colors">
          Bank Soal
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-slate-400">Kelas {kelas}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-slate-400">{mapel}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Buat Soal</span>
      </nav>

      {/* 2. Header Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Buat Soal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Pilih cara menambahkan soal ke Bank Soal {kelas} / {mapel}.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-xl bg-[#e0f7fa] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#006064] hover:bg-[#b2ebf2] transition-colors"
          >
            Kembali ke Kelas Mapel
          </button>
        </div>
      </div>

      {/* 3. Info Summary Box */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:grid-cols-3">
        <div>
          <span className="text-xs text-slate-400 font-medium">Kelas</span>
          <div className="text-sm font-bold text-slate-800 mt-1">{kelas}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Mata pelajaran</span>
          <div className="text-sm font-bold text-slate-800 mt-1">{mapel}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Materi</span>
          <div className="text-sm font-bold text-slate-800 mt-1">{materi}</div>
        </div>
      </div>

      {/* 4. Main Card: Stepper & 2 Options */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Pilih Cara Membuat Soal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Input satu per satu atau impor soal yang sudah disiapkan dalam Excel.
          </p>
        </div>

        {/* Stepper Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            1. Pilih Kelas
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            2. Pilih Mata Pelajaran
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            type="button"
            onClick={() => navigate('/b6/bank-soal')}
            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            3. Lihat Soal
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="rounded-full bg-[#004d57] px-3.5 py-1 text-xs font-semibold text-white shadow-xs">
            4. Tambah / Impor Soal
          </span>
        </div>

        {/* 2 Side-by-side Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Input Manual */}
          <div className="rounded-2xl border border-cyan-100/90 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                <Edit3 className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Input Manual
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tulis pertanyaan, kunci jawaban, dan pembahasan langsung di aplikasi.
                  Pilih jenis soal untuk mulai.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => { setQuestionType('Pilihan Ganda'); setFeedback(null); }}
                className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors text-center border border-cyan-100/60"
              >
                Pilihan Ganda
              </button>

              <button
                type="button"
                onClick={() => { setQuestionType('Benar / Salah'); setFeedback(null); }}
                className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors text-center border border-cyan-100/60"
              >
                Benar / Salah
              </button>

              <button
                type="button"
                onClick={() => { setQuestionType('Esai'); setFeedback(null); }}
                className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors text-center border border-cyan-100/60"
              >
                Esai
              </button>
            </div>
          </div>

          {/* Card 2: Impor dari Excel */}
          <div className="rounded-2xl border border-cyan-100/90 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                <FileSpreadsheet className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Impor dari Excel
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tambahkan soal dari file Excel sesuai templat. Periksa isi soal sebelum
                  menyimpan ke bank soal.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-4 space-y-2 text-xs text-slate-600">
                <p>• Unduh dan isi templat Excel.</p>
                <p>• Unggah file dan tinjau soal yang diimpor.</p>
                <p>• Simpan pada konteks kelas, mapel, dan materi ini.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  navigate('/b6/buat-kuis/import', {
                    state: {
                      from: 'bank-soal',
                      bankId,
                      kelas,
                      mapel,
                      materi,
                    },
                  })
                }
                className="w-full rounded-xl bg-[#004d57] py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors text-center"
              >
                Impor dari Excel
              </button>
            </div>
          </div>
        </div>

        {/* Context alert */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <Info className="h-4 w-4 text-[#008994] flex-shrink-0" />
          <span>
            Soal baru akan ditambahkan ke Kelas {kelas} • {mapel} • {materi}.
          </span>
        </div>
      </div>

      {/* 5. Bottom Caption */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Bank soal tersinkronisasi otomatis dengan portal ujian dan presensi SMAN 3 Malang. Gunakan kembali materi yang telah diuji untuk efisiensi pembuatan kuis.
        </span>
      </div>

      {questionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={submitQuestion} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Input {questionType}</h2>
              <button type="button" onClick={() => setQuestionType(null)} aria-label="Tutup" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            {feedback && <div role="alert" className={`flex items-center gap-2 rounded-xl p-3 text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{feedback.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{feedback.message}</div>}
            <label className="block space-y-1 text-sm font-semibold text-slate-700">Pertanyaan<textarea required rows={4} value={questionText} onChange={(event) => setQuestionText(event.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" /></label>
            {questionType !== 'Esai' && (questionType === 'Benar / Salah' ? ['Benar', 'Salah'] : answerOptions).map((option, index) => (
              <label key={index} className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="correct-option" checked={correctOption === index} onChange={() => setCorrectOption(index)} />{String.fromCharCode(65 + index)}.<input required value={option} readOnly={questionType === 'Benar / Salah'} onChange={(event) => setAnswerOptions((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2" /></label>
            ))}
            {questionType === 'Esai' && <label className="block space-y-1 text-sm font-semibold text-slate-700">Jawaban acuan<textarea rows={3} value={referenceAnswer} onChange={(event) => setReferenceAnswer(event.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" /></label>}
            <label className="block space-y-1 text-sm font-semibold text-slate-700">Poin<input type="number" min="0" step="0.1" value={points} onChange={(event) => setPoints(event.target.value)} className="w-32 rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => setQuestionType(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Batal</button><button type="submit" disabled={saving} className="rounded-xl bg-[#004d57] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan Soal'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
