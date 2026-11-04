import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import {
  mockBankSoalStats,
  mockKelasList,
  mockQuestionsList,
} from '../../data/mockBankSoal';

export default function BankSoalPage() {
  // Navigation State: step 1 = Pilih Kelas, step 2 = Mapel, step 3 = Lihat Soal
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedKelas, setSelectedKelas] = useState(mockKelasList[1]); // Default XI
  const [selectedMapel, setSelectedMapel] = useState(mockKelasList[1].mapelList[0]);

  // Data states
  const [questions, setQuestions] = useState(mockQuestionsList);
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [showCreateBankModal, setShowCreateBankModal] = useState(false);
  const [newBank, setNewBank] = useState({
    name: '',
    description: '',
    class_level: 'XI',
    subject_name: 'Matematika',
    topic_name: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenisSoal, setSelectedJenisSoal] = useState('Semua jenis');
  const [selectedWaktu, setSelectedWaktu] = useState('Semua waktu');

  // Toggle for testing Empty State
  const [showEmptyMapel, setShowEmptyMapel] = useState(false);
  const [showEmptySoal, setShowEmptySoal] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [viewQuestion, setViewQuestion] = useState(null);

  // Form state for Tambah Soal
  const [newQuestion, setNewQuestion] = useState({
    pertanyaan: '',
    tipe: 'Pilihan Ganda',
    pilihanA: '',
    pilihanB: '',
    pilihanC: '',
    pilihanD: '',
    kunci: 'A',
  });

  // Notification toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let active = true;
    apiFetch('/banks')
      .then((data) => {
        if (!active) return;
        const bankList = Array.isArray(data) ? data : [];
        setBanks(bankList);
        setSelectedBankId((current) => current || bankList[0]?.id || '');
        if (bankList.length > 0) setIsLoadingQuestions(true);
      })
      .catch((error) => {
        if (active) showToast(`Bank soal backend gagal dimuat: ${error.message}`, 'error');
      })
      .finally(() => {
        if (active) setIsLoadingBanks(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (currentStep !== 3 || !selectedBankId) return undefined;
    let active = true;
    apiFetch(`/banks/${encodeURIComponent(selectedBankId)}/questions`)
      .then((data) => {
        if (!active) return;
        setQuestions((Array.isArray(data) ? data : []).map((question) => {
          const options = question.question_options || [];
          return {
            id: question.id,
            bankId: selectedBankId,
            tipe: question.question_type || 'Soal',
            metode: 'Backend',
            tanggal: question.created_at ? new Date(question.created_at).toLocaleDateString('id-ID') : 'Tersimpan',
            pertanyaan: question.question_text || '',
            tag: `${selectedKelas.romawi} • ${selectedMapel?.nama || 'Matematika'} • ${selectedMapel?.materi || 'Bank Soal'}`,
            kelasId: selectedKelas.id,
            mapelId: selectedMapel?.id,
            materi: selectedMapel?.materi,
            pilihan: options.map((option) => ({ key: option.option_label, teks: option.option_text })),
            kunciJawaban: options.find((option) => option.is_correct)?.option_label || '-',
          };
        }));
      })
      .catch((error) => {
        if (active) showToast(`Gagal memuat soal bank: ${error.message}`, 'error');
      })
      .finally(() => {
        if (active) setIsLoadingQuestions(false);
      });

    return () => { active = false; };
  }, [currentStep, selectedBankId, selectedKelas, selectedMapel]);

  const handleCreateBank = async (event) => {
    event.preventDefault();
    if (!newBank.name.trim()) {
      showToast('Nama bank soal wajib diisi.', 'error');
      return;
    }

    setIsSavingBank(true);
    try {
      const createdBank = await apiFetch('/banks', {
        method: 'POST',
        body: JSON.stringify({ ...newBank, name: newBank.name.trim() }),
      });
      setBanks((current) => [createdBank, ...current]);
      setSelectedBankId(createdBank.id);
      setShowCreateBankModal(false);
      setNewBank({ name: '', description: '', class_level: 'XI', subject_name: 'Matematika', topic_name: '' });
      setCurrentStep(3);
      showToast('Bank soal berhasil dibuat di database.');
    } catch (error) {
      showToast(`Gagal membuat bank soal: ${error.message}`, 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  // Handlers for navigation
  const handlePilihKelas = (kelas) => {
    setSelectedKelas(kelas);
    setSelectedMapel(kelas.mapelList[0] || null);
    setCurrentStep(2);
  };

  const handlePilihMapel = (mapel) => {
    setSelectedMapel(mapel);
    setCurrentStep(3);
  };

  // Handler for deleting question
  const handleDeleteQuestion = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showToast('Soal berhasil dihapus.');
    }
  };

  // Handler for creating question
  const handleCreateQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.pertanyaan.trim()) {
      showToast('Pertanyaan wajib diisi!', 'error');
      return;
    }

    const created = {
      id: Date.now(),
      tipe: newQuestion.tipe,
      metode: 'Dibuat',
      tanggal: 'Hari ini',
      pertanyaan: newQuestion.pertanyaan,
      tag: `${selectedKelas.romawi} • ${selectedMapel?.nama || 'Matematika'} • ${selectedMapel?.materi || 'Komposisi & invers'}`,
      kelasId: selectedKelas.id,
      mapelId: selectedMapel?.id || 'mat-xi',
      materi: selectedMapel?.materi || 'Komposisi & invers',
      pilihan:
        newQuestion.tipe === 'Pilihan Ganda'
          ? [
              { key: 'A', teks: newQuestion.pilihanA || 'Pilihan A' },
              { key: 'B', teks: newQuestion.pilihanB || 'Pilihan B' },
              { key: 'C', teks: newQuestion.pilihanC || 'Pilihan C' },
              { key: 'D', teks: newQuestion.pilihanD || 'Pilihan D' },
            ]
          : [
              { key: 'B', teks: 'Benar' },
              { key: 'S', teks: 'Salah' },
            ],
      kunciJawaban: newQuestion.kunci,
    };

    setQuestions((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewQuestion({
      pertanyaan: '',
      tipe: 'Pilihan Ganda',
      pilihanA: '',
      pilihanB: '',
      pilihanC: '',
      pilihanD: '',
      kunci: 'A',
    });
    showToast('Soal baru berhasil ditambahkan ke bank soal!');
  };

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    if (showEmptySoal) return false;
    const matchSearch = q.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchJenis =
      selectedJenisSoal === 'Semua jenis' || q.tipe === selectedJenisSoal;
    return matchSearch && matchJenis;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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

      {showCreateBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <form onSubmit={handleCreateBank} className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">Buat Bank Soal</h2>
              <button type="button" onClick={() => setShowCreateBankModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block space-y-1 text-xs font-semibold text-slate-700">
              Nama bank soal
              <input required value={newBank.name} onChange={(event) => setNewBank({ ...newBank, name: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" placeholder="Contoh: Bank Soal Matematika XI" />
            </label>
            <label className="block space-y-1 text-xs font-semibold text-slate-700">
              Deskripsi
              <textarea rows={2} value={newBank.description} onChange={(event) => setNewBank({ ...newBank, description: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block space-y-1 text-xs font-semibold text-slate-700">Kelas
                <input value={newBank.class_level} onChange={(event) => setNewBank({ ...newBank, class_level: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <label className="block space-y-1 text-xs font-semibold text-slate-700">Mapel
                <input value={newBank.subject_name} onChange={(event) => setNewBank({ ...newBank, subject_name: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <label className="block space-y-1 text-xs font-semibold text-slate-700">Materi
                <input value={newBank.topic_name} onChange={(event) => setNewBank({ ...newBank, topic_name: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setShowCreateBankModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Batal</button>
              <button type="submit" disabled={isSavingBank} className="rounded-xl bg-[#004d57] px-5 py-2 text-xs font-semibold text-white disabled:opacity-60">{isSavingBank ? 'Menyimpan...' : 'Simpan Bank'}</button>
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
                onClick={() => setShowCreateBankModal(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Buat Bank
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
              >
                <Upload className="h-4 w-4 stroke-[2.2]" />
                <span>Impor Soal</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
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
                    {mockBankSoalStats.totalSoal}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">total soal</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mockBankSoalStats.totalKelas} kelas • {mockBankSoalStats.totalMateri} materi
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
                    {mockBankSoalStats.dibuat}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">dibuat</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ditulis langsung di aplikasi
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
                    {mockBankSoalStats.diimpor}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">diimpor</span>
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
            <button onClick={() => setCurrentStep(1)} className="hover:text-slate-600">
              Beranda
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => setCurrentStep(1)} className="hover:text-slate-600">
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
                {showEmptyMapel ? '-' : selectedMapel?.nama || 'Matematika'}
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
            <button onClick={() => setCurrentStep(1)} className="hover:text-slate-600">
              Beranda
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => setCurrentStep(1)} className="hover:text-slate-600">
              Bank Soal
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => setCurrentStep(2)} className="hover:text-slate-600">
              Kelas {selectedKelas.romawi}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold">
              {selectedMapel?.nama || 'Matematika'}
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
                {selectedMapel?.nama || 'Matematika'}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Materi</span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {selectedMapel?.materi || 'Komposisi & invers'}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          MAIN CONTAINER CARD (PANEL DENGAN STEPPER DI DALAMNYA)
         ========================================================================= */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        {currentStep === 3 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="b6-bank-selector" className="text-xs font-semibold text-slate-600">
              Bank soal backend
            </label>
            <select
              id="b6-bank-selector"
              value={selectedBankId}
              onChange={(event) => {
                setIsLoadingQuestions(true);
                setSelectedBankId(event.target.value);
              }}
              disabled={isLoadingBanks || banks.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:w-96 sm:text-sm"
            >
              {isLoadingBanks && <option value="">Memuat bank...</option>}
              {!isLoadingBanks && banks.length === 0 && <option value="">Belum ada bank backend</option>}
              {banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
            </select>
          </div>
        )}
        {/* Header di dalam Panel */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {currentStep === 1 && 'Pilih Kelas'}
              {currentStep === 2 && 'Pilih Mata Pelajaran'}
              {currentStep === 3 &&
                `Soal ${selectedMapel?.materi || 'Komposisi & invers'}`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentStep === 1 &&
                'Pilih kelas untuk melihat mata pelajaran dan soal yang tersedia.'}
              {currentStep === 2 &&
                `Mata pelajaran yang tersedia pada bank soal Kelas ${selectedKelas.romawi}.`}
              {currentStep === 3 &&
                'Soal yang sudah dibuat atau diimpor untuk kelas dan mata pelajaran ini.'}
            </p>
          </div>

          {/* Tombol Buat Soal di Step 3 */}
          {currentStep === 3 && (
            <div>
              <button
                onClick={() => setShowAddModal(true)}
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
            onClick={() => setShowAddModal(true)}
            className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 transition-colors"
          >
            4. Tambah / Impor Soal
          </button>
        </div>

        {/* =====================================================================
            KONTEN STEP 1: PILIH KELAS (3 KARTU KELAS X, XI, XII)
           ===================================================================== */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 pt-2">
            {mockKelasList.map((kelas) => (
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
                    <span className="rounded-full bg-[#e0f7fa] px-2.5 py-0.5 text-xs font-semibold text-[#006064]">
                      {kelas.totalSoal} soal
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-800">{kelas.nama}</h3>

                    <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Book className="h-3.5 w-3.5 text-slate-400" />
                        <span>{kelas.jumlahMapel} mata pelajaran</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span>{kelas.materiPreview}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Button Pilih Mata Pelajaran */}
                <div className="mt-6">
                  <button
                    onClick={() => handlePilihKelas(kelas)}
                    className="w-full rounded-xl bg-[#004d57] py-2.5 text-center text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
                  >
                    Pilih Mata Pelajaran
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================================
            KONTEN STEP 2: PILIH MATA PELAJARAN (ADA DATA & EMPTY STATE)
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

            {showEmptyMapel ? (
              /* Empty State (Sesuai Gambar 3) */
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 text-center text-xs font-medium text-amber-800">
                Belum ada mapel yang diinput silahkan hubungi admin.
              </div>
            ) : (
              /* Subject Card (Sesuai Gambar 2) */
              <div className="rounded-2xl border border-cyan-100/80 bg-white p-5 shadow-2xs space-y-4">
                {/* Header Card: Ikon Calculator & Badge 2 soal */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#006064]">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {selectedMapel?.nama || 'Matematika'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kelas {selectedKelas.romawi}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
                    {selectedKelas.totalSoal} soal
                  </span>
                </div>

                {/* Inset gray box Materi tersedia */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Materi tersedia</span>
                  <div className="text-sm font-bold text-slate-800">
                    {selectedMapel?.materi || 'Komposisi & invers'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedMapel?.tipeSoal || 'Pilihan Ganda • Benar / Salah'}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Lihat dan kelola soal {selectedMapel?.nama || 'Matematika'} untuk Kelas{' '}
                    {selectedKelas.romawi}.
                  </span>
                  <button
                    onClick={() => handlePilihMapel(selectedMapel)}
                    className="rounded-xl bg-[#004d57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
                  >
                    Lihat Soal {selectedMapel?.nama || 'Matematika'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            KONTEN STEP 3: LIHAT SOAL (FILTER & LIST KARTU SOAL)
           ===================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-4 pt-1">
            {/* Filter bar: Search, Jenis Soal, Waktu Dibuat */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pertanyaan dalam materi ini..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#004d57] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Dropdown Jenis Soal */}
              <div className="relative w-full sm:w-48">
                <select
                  value={selectedJenisSoal}
                  onChange={(e) => setSelectedJenisSoal(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:border-[#004d57] focus:outline-none"
                >
                  <option value="Semua jenis">Semua jenis</option>
                  <option value="Pilihan Ganda">Pilihan Ganda</option>
                  <option value="Benar / Salah">Benar / Salah</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Dropdown Waktu Dibuat */}
              <div className="relative w-full sm:w-48">
                <select
                  value={selectedWaktu}
                  onChange={(e) => setSelectedWaktu(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:border-[#004d57] focus:outline-none"
                >
                  <option value="Semua waktu">Semua waktu</option>
                  <option value="Hari ini">Hari ini</option>
                  <option value="7 hari terakhir">7 hari terakhir</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Toggle demo empty state */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>
                Menampilkan {filteredQuestions.length} dari {questions.length} soal •{' '}
                {selectedMapel?.materi || 'Komposisi & invers'}
              </span>
              <button
                onClick={() => setShowEmptySoal(!showEmptySoal)}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                [Demo: {showEmptySoal ? 'Tampilkan Ada Soal' : 'Tampilkan Kosong'}]
              </button>
            </div>

            {/* Empty State Soal (Sesuai Gambar 5) */}
            {isLoadingQuestions ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                Memuat soal dari bank...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-6 text-center text-xs font-medium text-amber-800">
                Belum ada soal yang dibuat.
              </div>
            ) : (
              /* Question Cards List (Sesuai Gambar 4) */
              <div className="space-y-3.5">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs hover:shadow-sm transition-shadow space-y-3"
                  >
                    {/* Top Row: Badge & Timestamp */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                        {q.tipe}
                      </span>
                      <span className="text-xs text-slate-400">
                        {q.metode} • {q.tanggal}
                      </span>
                    </div>

                    {/* Question Statement */}
                    <div className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {q.pertanyaan}
                    </div>

                    {/* Bottom Row: Tags & Action Buttons (Lihat, Edit, Hapus) */}
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-slate-400">{q.tag}</span>
                      <div className="flex items-center gap-2">
                        {/* Tombol Lihat */}
                        <button
                          onClick={() => setViewQuestion(q)}
                          className="rounded-xl bg-[#e6f7f8] px-3.5 py-1.5 text-xs font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
                        >
                          Lihat
                        </button>

                        {/* Tombol Edit */}
                        <button
                          onClick={() => {
                            setNewQuestion({
                              pertanyaan: q.pertanyaan,
                              tipe: q.tipe,
                              pilihanA: q.pilihan?.[0]?.teks || '',
                              pilihanB: q.pilihan?.[1]?.teks || '',
                              pilihanC: q.pilihan?.[2]?.teks || '',
                              pilihanD: q.pilihan?.[3]?.teks || '',
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
                Tambah Soal Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, tipe: e.target.value })
                  }
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
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, pertanyaan: e.target.value })
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
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="w-6 text-xs font-bold text-slate-500">{opt}.</span>
                      <input
                        type="text"
                        placeholder={`Jawaban ${opt}`}
                        value={newQuestion[`pilihan${opt}`]}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            [`pilihan${opt}`]: e.target.value,
                          })
                        }
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
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, kunci: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-[#004d57]"
                    >
                      <option value="A">Pilihan A</option>
                      <option value="B">Pilihan B</option>
                      <option value="C">Pilihan C</option>
                      <option value="D">Pilihan D</option>
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
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, kunci: e.target.value })
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
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#004d57] px-5 py-2 text-xs font-semibold text-white hover:bg-[#003c44]"
                >
                  Simpan Soal
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

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Belum punya formatnya?</span>
                <button
                  type="button"
                  onClick={() => showToast('Template Excel berhasil diunduh.')}
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
                    setShowImportModal(false);
                    showToast('3 soal berhasil diimpor dari Excel!');
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

      {/* =========================================================================
          MODAL 3: LIHAT DETAIL SOAL
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
                className="rounded-xl bg-[#004d57] px-5 py-2 text-xs font-semibold text-white hover:bg-[#003c44]"
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

