import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Edit3,
  FileUp,
  Upload,
  Book,
  FileText,
  Calculator,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { b6ApiFetch } from './b6-api';
import { getClassLabel, getClassLevel, toQuestionViewModel } from './b6-utils';

export default function BankSoalPage() {
  const navigate = useNavigate();

  // Navigation State:
  // step 1 = Pilih Kelas
  // step 2 = Pilih Mata Pelajaran
  // step 3 = Lihat Soal
  // step 4 = Buat Soal / Tambah & Impor Soal
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [selectedMapel, setSelectedMapel] = useState(null);

  // Data states
  const [banks, setBanks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questionsByBank, setQuestionsByBank] = useState({});
  const [importedQuestionCount, setImportedQuestionCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenisSoal, setSelectedJenisSoal] = useState('Semua jenis');
  const [selectedWaktu, setSelectedWaktu] = useState('Semua waktu');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateBankModal, setShowCreateBankModal] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [newBank, setNewBank] = useState({
    name: '',
    description: '',
    class_level: 'XI',
    subject_name: '',
    topic_name: '',
  });
  const [newQuestion, setNewQuestion] = useState({
    pertanyaan: '',
    tipe: 'Pilihan Ganda',
    pilihanA: '',
    pilihanB: '',
    pilihanC: '',
    pilihanD: '',
    kunci: 'A',
  });

  // Toggle for testing Empty State
  const [showEmptyMapel, setShowEmptyMapel] = useState(false);

  // Modal detail view
  const [viewQuestion, setViewQuestion] = useState(null);

  // Notification toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let active = true;

    const loadBanks = async () => {
      try {
        const [bankResult, importResult, subjectResult] = await Promise.allSettled([
          b6ApiFetch('/banks'),
          b6ApiFetch('/imports'),
          b6ApiFetch('/master/academic/subjects'),
        ]);
        if (!active) return;
        if (bankResult.status === 'rejected') throw bankResult.reason;
        const subjectList = subjectResult.status === 'fulfilled'
          && Array.isArray(subjectResult.value)
          ? subjectResult.value
          : [];
        const subjectById = new Map(
          subjectList.map((subject) => [String(subject.id), subject.name]),
        );
        const bankList = (Array.isArray(bankResult.value) ? bankResult.value : []).map((bank) => ({
          ...bank,
          subject_name: subjectById.get(String(bank.subject_id))
            || bank.subject_name
            || bank.name
            || 'Mata pelajaran',
        }));
        setBanks(bankList);
        setSubjects(subjectList);
        if (subjectResult.status === 'rejected') {
          showToast(
            `Data mata pelajaran master gagal dimuat; nama dari bank soal sementara digunakan. ${subjectResult.reason.message}`,
            'error',
          );
        }
        if (importResult.status === 'fulfilled') {
          setImportedQuestionCount(
            (Array.isArray(importResult.value) ? importResult.value : []).reduce(
            (total, entry) => total + Number(entry.total_valid || 0),
            0,
            ),
          );
        } else {
          showToast(importResult.reason.message, 'error');
        }

        const questionEntries = await Promise.all(
          bankList.map(async (bank) => [
            bank.id,
            await b6ApiFetch(`/banks/${encodeURIComponent(bank.id)}/questions`),
          ]),
        );
        if (active) {
          setQuestionsByBank(Object.fromEntries(
            questionEntries.map(([bankId, data]) => [
              bankId,
              (Array.isArray(data) ? data : []).map((question) => toQuestionViewModel(
                question,
                bankList.find((item) => item.id === bankId) || {},
              )),
            ]),
          ));
        }
      } catch (error) {
        if (active) showToast(error.message, 'error');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadBanks();
    return () => {
      active = false;
    };
  }, []);

  const handleCreateBank = async (event) => {
    event.preventDefault();
    const subjectName = newBank.subject_name.trim();
    const subject = subjects.find(
      (item) => String(item.name || '').trim().toLowerCase() === subjectName.toLowerCase(),
    );
    if (!newBank.name.trim()) {
      showToast('Nama bank soal wajib diisi.', 'error');
      return;
    }
    if (!subject) {
      showToast('Pilih mata pelajaran yang tersedia di data master.', 'error');
      return;
    }

    setIsSavingBank(true);
    try {
      const createdBank = await b6ApiFetch('/banks', {
        method: 'POST',
        body: JSON.stringify({
          ...newBank,
          name: newBank.name.trim(),
          subject_id: subject.id,
          subject_name: subject.name,
        }),
      });
      setBanks((current) => [{
        ...createdBank,
        subject_name: subject.name,
      }, ...current]);
      setQuestionsByBank((current) => ({ ...current, [createdBank.id]: [] }));
      setNewBank({
        name: '',
        description: '',
        class_level: 'XI',
        subject_name: '',
        topic_name: '',
      });
      setShowCreateBankModal(false);
      showToast('Bank soal berhasil dibuat.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  const kelasList = useMemo(() => {
    const grouped = new Map();
    banks.forEach((bank) => {
      const classLevel = getClassLevel(bank.class_level);
      const mapel = {
        id: bank.id,
        bankId: bank.id,
        nama: bank.subject_name || bank.name || 'Mata pelajaran',
        materi: bank.topic_name || bank.name || 'Materi belum ditentukan',
        tipeSoal: 'Lihat jenis soal yang tersedia',
        totalSoal: questionsByBank[bank.id]?.length || 0,
      };
      const kelas = grouped.get(classLevel) || {
        id: classLevel,
        romawi: classLevel,
        nama: getClassLabel(bank.class_level),
        jumlahMapel: 0,
        materiPreview: '',
        totalSoal: 0,
        mapelList: [],
      };
      kelas.mapelList.push(mapel);
      kelas.totalSoal += mapel.totalSoal;
      grouped.set(classLevel, kelas);
    });

    return Array.from(grouped.values()).map((kelas) => ({
      ...kelas,
      jumlahMapel: kelas.mapelList.length,
      materiPreview: kelas.mapelList
        .map((mapel) => `${mapel.nama} • ${mapel.materi}`)
        .join(', '),
    }));
  }, [banks, questionsByBank]);

  const questions = selectedMapel
    ? questionsByBank[selectedMapel.bankId] || []
    : [];
  const totalQuestions = Object.values(questionsByBank)
    .reduce((total, bankQuestions) => total + bankQuestions.length, 0);

  // Handlers for navigation
  const handlePilihKelas = (kelas) => {
    setSelectedKelas(kelas);
    setSelectedMapel(null);
    setCurrentStep(2);
  };

  const handlePilihMapel = (mapel) => {
    setSelectedMapel(mapel);
    setCurrentStep(3);
  };

  // Handler for deleting question
  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      try {
        await b6ApiFetch(`/banks/${encodeURIComponent(selectedMapel.bankId)}/questions/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        setQuestionsByBank((prev) => ({
          ...prev,
          [selectedMapel.bankId]: prev[selectedMapel.bankId].filter((question) => question.id !== id),
        }));
        showToast('Soal berhasil dihapus.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  };

  // Handler for creating question
  const handleCreateQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.pertanyaan.trim()) {
      showToast('Pertanyaan wajib diisi!', 'error');
      return;
    }

    if (!selectedMapel?.bankId) {
      showToast('Pilih bank soal terlebih dahulu.', 'error');
      return;
    }

    const options = newQuestion.tipe === 'Pilihan Ganda'
      ? ['A', 'B', 'C', 'D'].map((optionLabel) => ({
          option_label: optionLabel,
          option_text: newQuestion[`pilihan${optionLabel}`].trim(),
          is_correct: newQuestion.kunci === optionLabel,
        }))
      : [
          { option_label: 'B', option_text: 'Benar', is_correct: newQuestion.kunci === 'B' },
          { option_label: 'S', option_text: 'Salah', is_correct: newQuestion.kunci === 'S' },
        ];

    if (options.some((option) => !option.option_text)) {
      showToast('Lengkapi semua pilihan jawaban sebelum menyimpan.', 'error');
      return;
    }

    setIsSavingQuestion(true);
    try {
      const payload = {
        question_text: newQuestion.pertanyaan.trim(),
        question_type: newQuestion.tipe === 'Pilihan Ganda' ? 'PILIHAN_GANDA' : 'BENAR_SALAH',
        default_points: 1,
        options,
      };
      const savedQuestion = await b6ApiFetch(
        `/banks/${encodeURIComponent(selectedMapel.bankId)}/questions${editingQuestionId ? `/${encodeURIComponent(editingQuestionId)}` : '/manual'}`,
        {
          method: editingQuestionId ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
      );
      const viewModel = toQuestionViewModel(savedQuestion, banks.find((bank) => bank.id === selectedMapel.bankId) || {});
      setQuestionsByBank((prev) => ({
        ...prev,
        [selectedMapel.bankId]: editingQuestionId
          ? prev[selectedMapel.bankId].map((question) => question.id === editingQuestionId ? viewModel : question)
          : [viewModel, ...(prev[selectedMapel.bankId] || [])],
      }));
      setShowAddModal(false);
      setEditingQuestionId(null);
      setNewQuestion({
        pertanyaan: '',
        tipe: 'Pilihan Ganda',
        pilihanA: '',
        pilihanB: '',
        pilihanC: '',
        pilihanD: '',
        kunci: 'A',
      });
      showToast(editingQuestionId ? 'Soal berhasil diperbarui.' : 'Soal baru berhasil ditambahkan ke bank soal!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchJenis =
      selectedJenisSoal === 'Semua jenis' || q.tipe === selectedJenisSoal;
    return matchSearch && matchJenis;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-[#004d57] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-cyan-300" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-200" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal: Buat Bank Soal */}
      {showCreateBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateBank}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">Buat Bank Soal</h2>
              <button
                type="button"
                onClick={() => setShowCreateBankModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block space-y-1 text-xs font-semibold text-slate-700">
              Nama bank soal
              <input
                required
                value={newBank.name}
                onChange={(event) =>
                  setNewBank({ ...newBank, name: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
                placeholder="Contoh: Bank Soal Matematika XI"
              />
            </label>
            <label className="block space-y-1 text-xs font-semibold text-slate-700">
              Deskripsi
              <textarea
                rows={2}
                value={newBank.description}
                onChange={(event) =>
                  setNewBank({ ...newBank, description: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
              />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block space-y-1 text-xs font-semibold text-slate-700">
                Kelas
                <input
                  value={newBank.class_level}
                  onChange={(event) =>
                    setNewBank({ ...newBank, class_level: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="block space-y-1 text-xs font-semibold text-slate-700">
                Mapel
                <select
                  value={newBank.subject_name}
                  onChange={(event) =>
                    setNewBank({ ...newBank, subject_name: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
                >
                  <option value="">Pilih mata pelajaran</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 text-xs font-semibold text-slate-700">
                Materi
                <input
                  value={newBank.topic_name}
                  onChange={(event) =>
                    setNewBank({ ...newBank, topic_name: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateBankModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingBank}
                className="rounded-xl bg-[#004d57] px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {isSavingBank ? 'Menyimpan...' : 'Simpan Bank'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          STEP 1: BREADCRUMBS & HEADER (BERANDA > BANK SOAL)
         ========================================================================= */}
      {currentStep === 1 && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Beranda</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold">Bank Soal</span>
          </nav>

          {/* Header Title & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Bank Soal
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Kelola dan gunakan kembali soal sesuai kelas dan materi.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCreateBankModal(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Buat Bank
              </button>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
              >
                <Upload className="h-4 w-4 stroke-[2.2]" />
                <span>Impor Soal</span>
              </button>
              <button
                onClick={() => {
                  if (!selectedMapel?.bankId) {
                    showToast('Pilih kelas dan materi sebelum menambahkan soal.', 'error');
                    return;
                  }
                  setShowAddModal(true);
                }}
                className="rounded-xl bg-[#004d57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors"
              >
                Tambah Soal
              </button>
            </div>
          </div>

          {/* 3 Summary Stat Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Card 1 */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#00838f]">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {totalQuestions}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">total soal</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {kelasList.length} kelas • {new Set(banks.map((bank) => bank.topic_name).filter(Boolean)).size} materi
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#00838f]">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {banks.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">bank soal</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tersedia di database
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#00838f]">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">
                    {importedQuestionCount ?? '—'}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">soal valid diimpor</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ditambahkan dari Excel
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          STEP 2: BREADCRUMBS & HEADER (BERANDA > BANK SOAL > KELAS XI > MAPEL)
         ========================================================================= */}
      {currentStep === 2 && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button
              onClick={() => setCurrentStep(1)}
              className="hover:text-slate-600 transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button
              onClick={() => setCurrentStep(1)}
              className="hover:text-slate-600 transition-colors"
            >
              Bank Soal
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span>Kelas {selectedKelas.romawi}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold">Mapel</span>
          </nav>

          {/* Header Title & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Mapel
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Pilih mata pelajaran untuk melihat soal di Kelas {selectedKelas.romawi}.
              </p>
            </div>
            <div>
              <button
                onClick={() => setCurrentStep(1)}
                className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
              >
                Kembali ke Pilih Kelas
              </button>
            </div>
          </div>

          {/* Info Summary Box */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:grid-cols-3">
            <div>
              <span className="text-xs text-slate-400 font-medium">Kelas terpilih</span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {selectedKelas.romawi}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">
                Mata pelajaran tersedia
              </span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {showEmptyMapel ? '-' : `${selectedKelas.mapelList.length} bank soal`}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Soal tersedia</span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {showEmptyMapel ? '0 soal' : `${selectedKelas.totalSoal} soal`}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          STEP 3: BREADCRUMBS & HEADER (KELAS MAPEL XI / MATEMATIKA)
         ========================================================================= */}
      {currentStep === 3 && (
        <>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button
              onClick={() => setCurrentStep(1)}
              className="hover:text-slate-600 transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button
              onClick={() => setCurrentStep(1)}
              className="hover:text-slate-600 transition-colors"
            >
              Bank Soal
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button
              onClick={() => setCurrentStep(2)}
              className="hover:text-slate-600 transition-colors"
            >
              Kelas {selectedKelas.romawi}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold">
              {selectedMapel?.nama || 'Mata pelajaran'}
            </span>
          </nav>

          {/* Header Title & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Kelas Mapel {selectedKelas.romawi} / {selectedMapel?.nama || 'Matematika'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Kelola soal {selectedMapel?.nama || 'Matematika'} Kelas {selectedKelas.romawi}{' '}
                pada materi {selectedMapel?.materi || 'Komposisi & invers'}.
              </p>
            </div>
            <div>
              <button
                onClick={() => setCurrentStep(2)}
                className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
              >
                Kembali ke Mapel
              </button>
            </div>
          </div>

          {/* Info Summary Box */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs sm:grid-cols-3">
            <div>
              <span className="text-xs text-slate-400 font-medium">Kelas</span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {selectedKelas.romawi}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Mata pelajaran</span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {selectedMapel?.nama || 'Mata pelajaran'}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Materi</span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {selectedMapel?.materi || 'Materi belum ditentukan'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          MAIN CONTAINER CARD (PANEL DENGAN STEPPER DI DALAMNYA)
         ========================================================================= */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        {/* Header di dalam Panel */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {currentStep === 1 && 'Pilih Kelas'}
              {currentStep === 2 && 'Pilih Mata Pelajaran'}
              {currentStep === 3 &&
                `Soal ${selectedMapel?.materi || 'Komposisi & invers'}`}
              {currentStep === 4 && 'Pilih Cara Membuat Soal'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentStep === 1 &&
                'Pilih kelas untuk melihat mata pelajaran dan soal yang tersedia.'}
              {currentStep === 2 &&
                `Mata pelajaran yang tersedia pada bank soal Kelas ${selectedKelas.romawi}.`}
              {currentStep === 3 &&
                'Soal yang sudah dibuat atau diimpor untuk kelas dan mata pelajaran ini.'}
              {currentStep === 4 &&
                'Input satu per satu atau impor soal yang sudah disiapkan dalam Excel.'}
            </p>
          </div>

          {/* Tombol Buat Soal di Step 3 */}
          {currentStep === 3 && (
            <div>
              <button
                onClick={() => setCurrentStep(4)}
                className="rounded-xl bg-[#004d57] px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
              >
                Buat Soal
              </button>
            </div>
          )}
        </div>

        {/* Stepper Pills Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step 1 Pill */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 1
                ? 'bg-[#004d57] text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            1. Pilih Kelas
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

          {/* Step 2 Pill */}
          <button
            onClick={() => currentStep > 1 && setCurrentStep(2)}
            disabled={currentStep < 2}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 2
                ? 'bg-[#004d57] text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60'
            }`}
          >
            2. Pilih Mata Pelajaran
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

          {/* Step 3 Pill */}
          <button
            onClick={() => currentStep > 2 && setCurrentStep(3)}
            disabled={currentStep < 3}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 3
                ? 'bg-[#004d57] text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60'
            }`}
          >
            3. Lihat Soal
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

          {/* Step 4 Pill */}
          <button
            onClick={() => selectedMapel?.bankId && setCurrentStep(4)}
            disabled={!selectedMapel?.bankId}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 4
                ? 'bg-[#004d57] text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60'
            }`}
          >
            4. Tambah / Impor Soal
          </button>
        </div>

        {/* =====================================================================
            KONTEN STEP 1: PILIH KELAS (3 KARTU KELAS X, XI, XII)
           ===================================================================== */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 pt-2">
            {isLoading ? (
              <div className="col-span-full rounded-xl border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
                Memuat bank soal...
              </div>
            ) : kelasList.length === 0 ? (
              <div className="col-span-full rounded-xl border border-amber-300 bg-amber-50/50 p-6 text-center text-xs font-medium text-amber-800">
                Belum ada bank soal di database.
              </div>
            ) : kelasList.map((kelas) => (
              <div
                key={kelas.id}
                className="flex flex-col justify-between rounded-2xl border border-cyan-100/80 bg-white p-5 shadow-2xs hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top Badge: X, XI, XII & Total Soal */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f7fa] font-bold text-[#006064] text-sm">
                      {kelas.romawi}
                    </div>
                    <span className="rounded-md bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                      {kelas.totalSoal} soal
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-base font-bold text-slate-800">
                    {kelas.nama}
                  </h3>

                  {/* Meta items */}
                  <div className="mt-2 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{kelas.jumlahMapel} mata pelajaran</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Book className="h-3.5 w-3.5 text-slate-400" />
                      <span>{kelas.materiPreview}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-2">
                  <button
                    onClick={() => handlePilihKelas(kelas)}
                    className="w-full rounded-xl bg-[#004d57] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#003c44] transition-colors text-center"
                  >
                    Pilih Mata Pelajaran
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================================
            KONTEN STEP 2: PILIH MATA PELAJARAN
           ===================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-4 pt-2">
            {/* Toggle demo empty state */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowEmptyMapel(!showEmptyMapel)}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                [Demo: {showEmptyMapel ? 'Tampilkan Ada Data' : 'Tampilkan Kondisi Kosong'}]
              </button>
            </div>

            {showEmptyMapel || selectedKelas.mapelList.length === 0 ? (
              /* Empty State (Sesuai Gambar 3) */
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 text-center text-xs font-medium text-amber-800">
                Belum ada mapel yang diinput silahkan hubungi admin.
              </div>
            ) : (
              /* Subject Card (Sesuai Gambar 2) */
              <div className="space-y-4">
                {selectedKelas.mapelList.map((mapel) => (
                  <div key={mapel.bankId} className="rounded-2xl border border-cyan-100/80 bg-white p-5 shadow-2xs space-y-4">
                {/* Header Card: Ikon Calculator & Badge 2 soal */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#006064]">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {mapel.nama}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kelas {selectedKelas.romawi}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
                    {mapel.totalSoal} soal
                  </span>
                </div>

                {/* Inset gray box Materi tersedia */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Materi tersedia</span>
                  <div className="text-sm font-bold text-slate-800">
                    {mapel.materi}
                  </div>
                  <div className="text-xs text-slate-500">
                    {mapel.tipeSoal}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Lihat dan kelola soal {mapel.nama} untuk Kelas{' '}
                    {selectedKelas.romawi}.
                  </span>
                  <button
                    onClick={() => handlePilihMapel(mapel)}
                    className="rounded-xl bg-[#004d57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
                  >
                    Lihat Soal {mapel.nama}
                  </button>
                </div>
              </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            KONTEN STEP 3: LIHAT DAFTAR SOAL (KELAS MAPEL)
           ===================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-5 pt-2">
            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari soal di materi ini..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex items-center gap-3">
                {/* Filter Jenis Soal */}
                <div className="relative">
                  <select
                    value={selectedJenisSoal}
                    onChange={(e) => setSelectedJenisSoal(e.target.value)}
                    className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:border-[#004d57] focus:outline-none"
                  >
                    <option value="Semua jenis">Semua jenis</option>
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Benar / Salah">Benar / Salah</option>
                    <option value="Esai">Esai</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Filter Waktu */}
                <div className="relative">
                  <select
                    value={selectedWaktu}
                    onChange={(e) => setSelectedWaktu(e.target.value)}
                    className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:border-[#004d57] focus:outline-none"
                  >
                    <option value="Semua waktu">Semua waktu</option>
                    <option value="Hari ini">Hari ini</option>
                    <option value="Minggu ini">Minggu ini</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* List of Questions */}
            {filteredQuestions.length === 0 ? (
              /* Empty State Soal */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                  <FileText className="h-6 w-6 stroke-[1.8]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Belum ada soal pada materi ini
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  Mulai dengan membuat soal secara manual atau impor dari file Excel.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="rounded-xl bg-[#004d57] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003c44] transition-colors"
                  >
                    Tambah Soal Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-cyan-100/80 bg-white p-5 shadow-2xs space-y-4 hover:border-cyan-200 transition-colors"
                  >
                    {/* Top Row: Tags & Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                          {q.tipe}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {q.tag}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {q.metode} • {q.tanggal}
                      </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {q.pertanyaan}
                    </p>

                    {/* Options Preview for Pilihan Ganda */}
                    {q.pilihan && q.pilihan.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                        {q.pilihan.map((p) => (
                          <div
                            key={p.key}
                            className={`flex items-center gap-2 p-2 rounded-xl border ${
                              p.key === q.kunciJawaban
                                ? 'bg-cyan-50/60 border-cyan-300 font-semibold text-[#005b64]'
                                : 'bg-slate-50/40 border-slate-100'
                            }`}
                          >
                            <span className="font-bold">{p.key}.</span>
                            <span>{p.teks}</span>
                            {p.key === q.kunciJawaban && (
                              <span className="ml-auto text-[10px] font-bold text-[#008994]">
                                Kunci
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons: Lihat, Hapus */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-[11px] text-slate-400">
                        Kunci Jawaban: <strong className="text-slate-700">{q.kunciJawaban}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewQuestion(q)}
                          className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Lihat
                        </button>

                        {/* Tombol Edit */}
                        <button
                          onClick={() => {
                            setEditingQuestionId(q.id);
                            setNewQuestion({
                              pertanyaan: q.pertanyaan,
                              tipe: q.tipe,
                              pilihanA: q.pilihan?.find((option) => option.key === 'A')?.teks || '',
                              pilihanB: q.pilihan?.find((option) => option.key === 'B')?.teks || '',
                              pilihanC: q.pilihan?.find((option) => option.key === 'C')?.teks || '',
                              pilihanD: q.pilihan?.find((option) => option.key === 'D')?.teks || '',
                              kunci: q.kunciJawaban || 'A',
                            });
                            setShowAddModal(true);
                          }}
                          className="rounded-xl bg-[#e6f7f8] px-3.5 py-1.5 text-xs font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
                        >
                          Edit
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100/50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM CAPTION DENGAN IKON DOKUMEN (PERSIS SEPERTI GAMBAR)
         ========================================================================= */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Bank soal tersinkronisasi otomatis dengan portal ujian dan presensi SMAN 3 Malang.
          Gunakan kembali materi yang telah diuji untuk efisiensi pembuatan kuis.
        </span>
      </div>

      {/* =========================================================================
          MODAL 1: TAMBAH / EDIT SOAL
         ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {editingQuestionId ? 'Edit Soal' : 'Tambah Soal Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingQuestionId(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Soal
                </label>
                <select
                  value={newQuestion.tipe}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    tipe: e.target.value,
                    kunci: e.target.value === 'Pilihan Ganda' ? 'A' : 'B',
                  })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-700 focus:border-[#004d57] focus:outline-none"
                >
                  <option value="Pilihan Ganda">Pilihan Ganda</option>
                  <option value="Benar / Salah">Benar / Salah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pertanyaan
                </label>
                <textarea
                  rows={3}
                  value={newQuestion.pertanyaan}
                  onChange={(event) =>
                    setNewQuestion({ ...newQuestion, pertanyaan: event.target.value })
                  }
                  placeholder="Tuliskan pertanyaan soal di sini..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#004d57] focus:outline-none"
                />
              </div>

              {newQuestion.tipe === 'Pilihan Ganda' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Pilihan Jawaban
                  </label>
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <span className="w-6 text-xs font-bold text-slate-500">{option}.</span>
                      <input
                        type="text"
                        placeholder={`Jawaban ${option}`}
                        value={newQuestion[`pilihan${option}`]}
                        onChange={(event) => setNewQuestion({
                          ...newQuestion,
                          [`pilihan${option}`]: event.target.value,
                        })}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#004d57] focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kunci Jawaban Benar
                    </label>
                    <select
                      value={newQuestion.kunci}
                      onChange={(event) =>
                        setNewQuestion({ ...newQuestion, kunci: event.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-[#004d57]"
                    >
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <option key={option} value={option}>Pilihan {option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kunci Jawaban Benar
                  </label>
                  <select
                    value={newQuestion.kunci}
                    onChange={(event) =>
                      setNewQuestion({ ...newQuestion, kunci: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-[#004d57]"
                  >
                    <option value="B">Benar</option>
                    <option value="S">Salah</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingQuestionId(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="rounded-xl bg-[#004d57] px-5 py-2 text-xs font-semibold text-white hover:bg-[#003c44] disabled:opacity-60"
                >
                  {isSavingQuestion ? 'Menyimpan...' : 'Simpan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: IMPOR SOAL EXCEL
         ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Impor Soal dari Excel
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Unggah file template Excel (.xlsx atau .xls) yang berisi daftar soal beserta kunci jawabannya.
              </p>

              {/* Drag and Drop Box */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50/40 p-6 text-center">
                <FileSpreadsheet className="h-10 w-10 text-[#00838f] mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Klik untuk pilih file atau seret file ke sini
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Format yang didukung: .xlsx, .xls (Maks. 5MB)
                </span>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-4 space-y-2 text-xs text-slate-600">
                <p>• Unduh dan isi templat Excel.</p>
                <p>• Unggah file dan tinjau soal yang diimpor.</p>
                <p>• Simpan pada konteks kelas, mapel, dan materi ini.</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Belum punya formatnya?</span>
                <button
                  type="button"
                  onClick={() => showToast('Template Excel belum tersedia untuk diunduh.', 'error')}
                  className="font-semibold text-[#005b64] hover:underline"
                >
                  Unduh Template Excel
                </button>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMapel?.bankId) {
                      showToast('Pilih bank soal terlebih dahulu untuk mengimpor.', 'error');
                      return;
                    }
                    setShowImportModal(false);
                    navigate('/b6/buat-kuis/import', {
                      state: {
                        from: 'bank-soal',
                        bankId: selectedMapel.bankId,
                        kelas: selectedKelas?.romawi,
                        mapel: selectedMapel.nama,
                        materi: selectedMapel.materi,
                      },
                    });
                  }}
                  className="rounded-xl bg-[#004d57] px-5 py-2 text-xs font-semibold text-white hover:bg-[#003c44]"
                >
                  Mulai Impor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && selectedMapel?.bankId && (
        <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Input Manual</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Pilih jenis soal untuk menambahkan soal ke bank ini.
                </p>
              </div>
              {['Pilihan Ganda', 'Benar / Salah', 'Esai'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => navigate('/b6/buat-kuis/tambah-soal', {
                    state: {
                      initialType: type,
                      from: 'bank-soal',
                      bankId: selectedMapel.bankId,
                      kelas: selectedKelas?.romawi,
                      mapel: selectedMapel.nama,
                      materi: selectedMapel.materi,
                    },
                  })}
                  className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs font-semibold text-[#005b64] hover:bg-[#d5f0f2]"
                >
                  {type}
                </button>
              ))}
            </section>
            <section className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Impor dari Excel</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Impor soal dengan memilih file Excel yang sesuai templat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/b6/buat-kuis/import', {
                  state: {
                    from: 'bank-soal',
                    bankId: selectedMapel.bankId,
                    kelas: selectedKelas?.romawi,
                    mapel: selectedMapel.nama,
                    materi: selectedMapel.materi,
                  },
                })}
                className="w-full rounded-xl bg-[#004d57] py-2.5 text-xs font-semibold text-white hover:bg-[#003c44]"
              >
                Impor dari Excel
              </button>
            </section>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <Info className="h-4 w-4 text-[#008994]" />
            <span>
              Kelas {selectedKelas?.romawi || '—'} • {selectedMapel.nama} • {selectedMapel.materi}
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM CAPTION DENGAN IKON DOKUMEN (PERSIS SEPERTI GAMBAR)
         ========================================================================= */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Lorem ipsum dolor sit amet consectetur. Risus aenean massa congue bibendum nibh consectetur.
        </span>
      </div>

      {/* =========================================================================
          MODAL: LIHAT DETAIL SOAL
         ========================================================================= */}
      {viewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                  {viewQuestion.tipe}
                </span>
                <span className="text-xs text-slate-400">
                  {viewQuestion.metode} • {viewQuestion.tanggal}
                </span>
              </div>
              <button
                onClick={() => setViewQuestion(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800">Pertanyaan:</h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {viewQuestion.pertanyaan}
              </p>

              {viewQuestion.pilihan && viewQuestion.pilihan.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-700">Pilihan Jawaban:</h4>
                  <div className="space-y-1.5">
                    {viewQuestion.pilihan.map((p) => (
                      <div
                        key={p.key}
                        className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium ${
                          p.key === viewQuestion.kunciJawaban
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                            : 'bg-white border border-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="font-bold">{p.key}.</span>
                        <span>{p.teks}</span>
                        {p.key === viewQuestion.kunciJawaban && (
                          <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase">
                            (Kunci Jawaban)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewQuestion.pembahasan && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Pembahasan:</h4>
                  <p className="text-xs text-slate-500 bg-cyan-50/50 p-3 rounded-xl border border-cyan-100/60 leading-relaxed">
                    {viewQuestion.pembahasan}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewQuestion(null)}
                className="rounded-xl bg-[#004d57] px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
