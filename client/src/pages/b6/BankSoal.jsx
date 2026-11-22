import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Edit3,
  FileUp,
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
  const location = useLocation();

  // Navigation State:
  // step 1 = Pilih Kelas | step 2 = Pilih Mapel | step 3 = Lihat Soal | step 4 = Tambah/Impor Soal
  const savedNavigation = location.state?.bankSoalNavigation;
  const hasRestoredContext = Boolean(location.state?.restoreKelas);
  const [currentStep, setCurrentStep] = useState(
    savedNavigation?.step
      || (hasRestoredContext
      ? Math.min(
          location.state?.restoreStep || (location.state?.restoreMapel ? 3 : 2),
          location.state?.hasReachedStepFour ? 4 : (location.state?.restoreMapel ? 3 : 2),
        )
      : 1),
  );
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(() => (
    savedNavigation?.maxUnlockedStep
      ?? (location.state?.hasReachedStepFour
      ? 4
      : location.state?.restoreMapel
        ? 3
        : location.state?.restoreKelas
          ? 2
          : 1)
  ));
  const [selectedKelas, setSelectedKelas] = useState(
    savedNavigation?.selectedKelas ?? location.state?.restoreKelas ?? null,
  );
  const [selectedMapel, setSelectedMapel] = useState(
    savedNavigation?.selectedMapel ?? location.state?.restoreMapel ?? null,
  );

  useEffect(() => {
    const restoreFromHistory = () => {
      const historyState = window.history.state?.usr || {};
      const navigation = historyState.bankSoalNavigation;
      if (navigation) {
        setCurrentStep(navigation.step);
        setSelectedKelas(navigation.selectedKelas || null);
        setSelectedMapel(navigation.selectedMapel || null);
        setMaxUnlockedStep(navigation.maxUnlockedStep);
        return;
      }

      const restoredKelas = historyState.restoreKelas || null;
      const restoredMapel = historyState.restoreMapel || null;
      setCurrentStep(
        restoredKelas
          ? Math.min(
              historyState.restoreStep || (restoredMapel ? 3 : 2),
              historyState.hasReachedStepFour ? 4 : (restoredMapel ? 3 : 2),
            )
          : 1,
      );
      setSelectedKelas(restoredKelas);
      setSelectedMapel(restoredMapel);
      setMaxUnlockedStep(
        historyState.hasReachedStepFour
          ? 4
          : restoredMapel
            ? 3
            : restoredKelas
              ? 2
              : 1,
      );
    };

    window.addEventListener('popstate', restoreFromHistory);
    return () => window.removeEventListener('popstate', restoreFromHistory);
  }, []);

  // Data states
  const [banks, setBanks] = useState([]);
  const [masterClasses, setMasterClasses] = useState([]);
  const [masterCourses, setMasterCourses] = useState([]);
  const [questionsByBank, setQuestionsByBank] = useState({});
  const [importedQuestionCount, setImportedQuestionCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [provisioningCourseId, setProvisioningCourseId] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenisSoal, setSelectedJenisSoal] = useState('Semua jenis');
  const [selectedWaktu, setSelectedWaktu] = useState('Semua waktu');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
        const [bankResult, importResult, subjectResult, classResult, courseResult] = await Promise.allSettled([
          b6ApiFetch('/banks'),
          b6ApiFetch('/imports'),
          b6ApiFetch('/master/academic/subjects'),
          b6ApiFetch('/master/classes'),
          b6ApiFetch('/master/courses'),
        ]);
        if (!active) return;
        if (bankResult.status === 'rejected') throw bankResult.reason;

        const subjectList = subjectResult.status === 'fulfilled' && Array.isArray(subjectResult.value)
          ? subjectResult.value
          : [];
        const subjectById = new Map(
          subjectList.map((subject) => [String(subject.id), subject.name]),
        );
        const bankList = (Array.isArray(bankResult.value) ? bankResult.value : []).map((bank) => ({
          ...bank,
          subject_name: subjectById.get(String(bank.subject_id))
            || (bank.subject_id
              ? 'Mapel tidak ditemukan di data master'
              : 'Mapel belum terhubung ke data master'),
        }));
        setBanks(bankList);
        if (classResult.status === 'fulfilled') {
          setMasterClasses(Array.isArray(classResult.value) ? classResult.value : []);
        } else {
          setMasterClasses([]);
          showToast(
            `Data kelas master gagal dimuat. ${classResult.reason.message}`,
            'error',
          );
        }

        if (courseResult.status === 'fulfilled') {
          setMasterCourses(Array.isArray(courseResult.value) ? courseResult.value : []);
        } else {
          setMasterCourses([]);
          showToast(`Data Course gagal dimuat. ${courseResult.reason.message}`, 'error');
        }

        if (subjectResult.status === 'rejected') {
          showToast(
            `Data mata pelajaran master gagal dimuat. ${subjectResult.reason.message}`,
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

  const kelasList = useMemo(() => {
    const grouped = new Map();
    masterClasses.forEach((masterClass) => {
      const classValue = masterClass.level || masterClass.name;
      if (!masterClass.id) return;

      const kelas = {
        id: masterClass.id,
        classId: masterClass.id,
        romawi: getClassLevel(classValue),
        nama: getClassLabel(masterClass.name),
        jumlahMapel: 0,
        materiPreview: '',
        totalSoal: 0,
        mapelList: [],
      };
      const classCourses = masterCourses.filter(
        (course) => String(course.class_id) === String(masterClass.id)
          && course.subject_id,
      );
      classCourses.forEach((course) => {
        const subjectId = String(course.subject_id);
        const subjectName = course.subject?.name
          || course.subjects?.name
          || banks.find((bank) => String(bank.subject_id) === subjectId)?.subject_name
          || 'Mata pelajaran';
        const linkedBanks = banks.filter((bank) => (
          String(bank.subject_id) === subjectId
            && (bank.courses || []).some(
              (linkedCourse) => String(linkedCourse.id) === String(course.id),
            )
        ));

        const courseEntries = linkedBanks.length
          ? linkedBanks.map((bank) => ({
              id: bank.id,
              bankId: bank.id,
              courseId: course.id,
              course,
              subjectId: course.subject_id,
              nama: subjectName,
              materi: bank.topic_name || bank.name || 'Materi belum ditentukan',
              tipeSoal: 'Lihat jenis soal yang tersedia',
              totalSoal: questionsByBank[bank.id]?.length || 0,
            }))
          : [{
              id: `course-${course.id}`,
              bankId: null,
              courseId: course.id,
              course,
              subjectId: course.subject_id,
              nama: subjectName,
              materi: 'Bank soal umum',
              tipeSoal: 'Belum ada soal',
              totalSoal: 0,
            }];

        kelas.mapelList.push(...courseEntries);
        kelas.totalSoal += courseEntries.reduce((total, entry) => total + entry.totalSoal, 0);
      });

      kelas.jumlahMapel = new Set(
        kelas.mapelList.map((mapel) => mapel.subjectId || mapel.bankId),
      ).size;
      kelas.materiPreview = kelas.mapelList.length
        ? kelas.mapelList.map((mapel) => `${mapel.nama} • ${mapel.materi}`).join(', ')
        : 'Belum ada bank soal';
      grouped.set(String(masterClass.id), kelas);
    });

    return Array.from(grouped.values());
  }, [banks, masterClasses, masterCourses, questionsByBank]);

  const questions = selectedMapel
    ? questionsByBank[selectedMapel.bankId] || []
    : [];

  const totalQuestions = Object.values(questionsByBank)
    .reduce((total, bankQuestions) => total + bankQuestions.length, 0);

  // Handlers Navigation
  const navigateToStep = (
    step,
    kelas = selectedKelas,
    mapel = selectedMapel,
    unlockedStep = Math.max(maxUnlockedStep, step),
  ) => {
    setSelectedKelas(kelas);
    setSelectedMapel(mapel);
    setCurrentStep(step);
    setMaxUnlockedStep(unlockedStep);
    navigate(location.pathname, {
      state: {
        ...location.state,
        bankSoalNavigation: {
          step,
          selectedKelas: kelas,
          selectedMapel: mapel,
          maxUnlockedStep: unlockedStep,
        },
      },
      preventScrollReset: true,
    });
  };

  const handlePilihKelas = (kelas) => {
    navigateToStep(2, kelas, null, 2);
  };

  const handlePilihMapel = async (mapel) => {
    if (mapel.bankId) {
      navigateToStep(3, selectedKelas, mapel);
      return;
    }

    const course = mapel.course;
    if (!course?.id || !course.subject_id) {
      showToast('Data Course tidak lengkap untuk menyiapkan bank soal.', 'error');
      return;
    }

    setProvisioningCourseId(String(course.id));
    try {
      // Recheck before creating so returning to this page reuses an existing bank.
      const currentBanks = await b6ApiFetch('/banks');
      const existingBank = (Array.isArray(currentBanks) ? currentBanks : []).find((bank) => (
        String(bank.subject_id) === String(course.subject_id)
          && (bank.courses || []).some(
            (linkedCourse) => String(linkedCourse.id) === String(course.id),
          )
      ));

      const bank = existingBank || await b6ApiFetch('/banks', {
        method: 'POST',
        body: JSON.stringify({
          name: `Bank Soal ${mapel.nama} - ${selectedKelas.nama}`,
          description: `Bank soal untuk ${mapel.nama} pada ${selectedKelas.nama}.`,
          subject_id: course.subject_id,
          subject_name: mapel.nama,
          teacher_id: course.teacher_id,
          class_level: course.classes?.level || course.classes?.name || selectedKelas.nama,
          topic_name: 'Umum',
          course_ids: [String(course.id)],
        }),
      });

      if (!bank?.id) throw new Error('Server tidak mengembalikan bank soal yang dibuat.');
      setBanks((previous) => [
        ...previous.filter((item) => String(item.id) !== String(bank.id)),
        bank,
      ]);
      setQuestionsByBank((previous) => ({ ...previous, [bank.id]: previous[bank.id] || [] }));
      navigateToStep(3, selectedKelas, {
        ...mapel,
        id: bank.id,
        bankId: bank.id,
        materi: bank.topic_name || bank.name || mapel.materi,
      });
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setProvisioningCourseId('');
    }
  };

  const handleOpenStepFour = () => {
    navigateToStep(4);
  };

  const handleOpenQuestionForm = (initialType) => {
    if (!selectedKelas || !selectedMapel?.bankId) {
      showToast('Pilih kelas dan mata pelajaran terlebih dahulu.', 'error');
      return;
    }

    navigate('/b6/buat-kuis/tambah-soal', {
      state: {
        initialType,
        from: 'bank-soal',
        bankId: selectedMapel.bankId,
        kelas: selectedKelas.romawi,
        mapel: selectedMapel.nama,
        materi: selectedMapel.materi,
        returnKelas: selectedKelas,
        returnMapel: selectedMapel,
      },
    });
  };

  // Handler Hapus Soal
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

  // Handler Submit Tambah/Edit Soal
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
      showToast(editingQuestionId ? 'Soal berhasil diperbarui.' : 'Soal baru berhasil ditambahkan!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Filtered questions
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('id-ID').replace(/\s+/g, ' ');
  const filteredQuestions = questions.filter((q) => {
    const searchableText = [
      q.pertanyaan,
      q.jawabanAcuan,
      q.kunciJawaban,
      q.pembahasan,
      q.tag,
      q.tipe,
      ...(q.pilihan || []).flatMap((option) => [option.key, option.teks]),
      ...(Array.isArray(q.pedomanPenilaian)
        ? q.pedomanPenilaian.map((item) => item?.text)
        : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('id-ID')
      .replace(/\s+/g, ' ');
    const matchSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchJenis = selectedJenisSoal === 'Semua jenis' || q.tipe === selectedJenisSoal;
    const createdAt = q.created_at ? new Date(q.created_at) : null;
    let matchWaktu = selectedWaktu === 'Semua waktu';

    if (createdAt && !Number.isNaN(createdAt.getTime())) {
      const now = new Date();
      if (selectedWaktu === 'Hari ini') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        matchWaktu = createdAt >= startOfToday && createdAt <= now;
      } else if (selectedWaktu === 'Minggu ini') {
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysSinceMonday = (startOfWeek.getDay() + 6) % 7;
        startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
        matchWaktu = createdAt >= startOfWeek && createdAt <= now;
      }
    }

    return matchSearch && matchJenis && matchWaktu;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg text-sm font-semibold transition-all ${
            toast.type === 'success' ? 'bg-[#004d57] text-white' : 'bg-red-600 text-white'
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

      {/* BREADCRUMBS & HEADER STEP 1 */}
      {currentStep === 1 && (
        <>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/b6/beranda')}
              className="hover:text-slate-600 transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold">Bank Soal</span>
          </nav>

          <div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Bank Soal</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Kelola dan gunakan kembali soal sesuai kelas dan materi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#00838f]">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">{totalQuestions}</span>
                  <span className="text-xs font-semibold text-slate-700">total soal</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {kelasList.length} kelas • {new Set(banks.map((bank) => bank.topic_name).filter(Boolean)).size} materi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#00838f]">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">{banks.length}</span>
                  <span className="text-xs font-semibold text-slate-700">bank soal</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Tersedia di database</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#00838f]">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">{importedQuestionCount ?? '—'}</span>
                  <span className="text-xs font-semibold text-slate-700">soal valid diimpor</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Ditambahkan dari Excel</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* BREADCRUMBS & HEADER STEP 2 */}
      {currentStep === 2 && selectedKelas && (
        <>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button onClick={() => navigate('/b6/beranda')} className="hover:text-slate-600 transition-colors">Beranda</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(1)} className="hover:text-slate-600 transition-colors">Bank Soal</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(1)} className="hover:text-slate-600 transition-colors">
              Kelas {selectedKelas.romawi}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold" aria-current="page">Mapel</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Mapel</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Pilih mata pelajaran untuk melihat soal di Kelas {selectedKelas.romawi}.
              </p>
            </div>
            <div>
              <button
                onClick={() => navigateToStep(1)}
                className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
              >
                Kembali ke Pilih Kelas
              </button>
            </div>
          </div>
        </>
      )}

      {/* BREADCRUMBS & HEADER STEP 3 */}
      {currentStep === 3 && selectedKelas && selectedMapel && (
        <>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button onClick={() => navigate('/b6/beranda')} className="hover:text-slate-600 transition-colors">Beranda</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(1)} className="hover:text-slate-600 transition-colors">Bank Soal</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(2)} className="hover:text-slate-600 transition-colors">Kelas {selectedKelas.romawi}</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(2)} className="hover:text-slate-600 transition-colors">Mapel</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold">{selectedMapel.nama}</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Kelas Mapel {selectedKelas.romawi} / {selectedMapel.nama}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Kelola soal {selectedMapel.nama} Kelas {selectedKelas.romawi} pada materi {selectedMapel.materi}.
              </p>
            </div>
            <div>
              <button
                onClick={() => navigateToStep(2)}
                className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
              >
                Kembali ke Mapel
              </button>
            </div>
          </div>
        </>
      )}

      {/* BREADCRUMBS & HEADER STEP 4 */}
      {currentStep === 4 && selectedKelas && selectedMapel && (
        <>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button onClick={() => navigate('/b6/beranda')} className="hover:text-slate-600 transition-colors">Beranda</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(1)} className="hover:text-slate-600 transition-colors">Bank Soal</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(2)} className="hover:text-slate-600 transition-colors">Kelas {selectedKelas.romawi}</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(2)} className="hover:text-slate-600 transition-colors">Mapel</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <button onClick={() => navigateToStep(3)} className="hover:text-slate-600 transition-colors">{selectedMapel.nama}</button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-[#005b64] font-semibold">Buat Soal</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Buat Soal</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Pilih cara menambahkan soal ke Bank Soal {selectedKelas.romawi} / {selectedMapel.nama}.
              </p>
            </div>
            <div>
              <button
                onClick={() => navigateToStep(3)}
                className="rounded-xl bg-[#e0f7fa] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#006064] hover:bg-[#b2ebf2] transition-colors"
              >
                Kembali ke Kelas Mapel
              </button>
            </div>
          </div>
        </>
      )}

      {/* MAIN CONTAINER CARD */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {currentStep === 1 && 'Pilih Kelas'}
              {currentStep === 2 && 'Pilih Mata Pelajaran'}
              {currentStep === 3 && `Soal ${selectedMapel?.materi || ''}`}
              {currentStep === 4 && 'Pilih Cara Membuat Soal'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentStep === 1 && 'Pilih kelas untuk melihat mata pelajaran dan soal yang tersedia.'}
              {currentStep === 2 && `Mata pelajaran yang tersedia pada bank soal Kelas ${selectedKelas?.romawi || ''}.`}
              {currentStep === 3 && 'Soal yang sudah dibuat atau diimpor untuk kelas dan mata pelajaran ini.'}
              {currentStep === 4 && 'Input satu per satu atau impor soal dari file Excel.'}
            </p>
          </div>

          {currentStep === 3 && (
            <div>
              <button
                onClick={handleOpenStepFour}
                className="rounded-xl bg-[#004d57] px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
              >
                Buat Soal
              </button>
            </div>
          )}
        </div>

        {/* Stepper Pills Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigateToStep(1)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 1 ? 'bg-[#004d57] text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            1. Pilih Kelas
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            onClick={() => navigateToStep(2)}
            disabled={maxUnlockedStep < 2 || !selectedKelas}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 2 ? 'bg-[#004d57] text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60'
            }`}
          >
            2. Pilih Mata Pelajaran
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            onClick={() => navigateToStep(3)}
            disabled={maxUnlockedStep < 3 || !selectedMapel}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 3 ? 'bg-[#004d57] text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60'
            }`}
          >
            3. Lihat Soal
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button
            onClick={() => navigateToStep(4)}
            disabled={maxUnlockedStep < 4 || !selectedMapel}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              currentStep === 4 ? 'bg-[#004d57] text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-60'
            }`}
          >
            4. Tambah / Impor Soal
          </button>
        </div>

        {/* STEP 1 CONTENT */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 pt-2">
            {isLoading ? (
              <div className="col-span-full rounded-xl border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
                Memuat bank soal...
              </div>
            ) : kelasList.length === 0 ? (
              <div className="col-span-full rounded-xl border border-amber-300 bg-amber-50/50 p-6 text-center text-xs font-medium text-amber-800">
                Belum ada data kelas pada tabel master.
              </div>
            ) : (
              kelasList.map((kelas) => (
                <div
                  key={kelas.id}
                  className="flex flex-col justify-between rounded-2xl border border-cyan-100/80 bg-white p-5 shadow-2xs hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex h-10 w-fit min-w-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-[#e0f7fa] px-2.5 font-bold leading-none text-[#006064] text-sm">
                        {kelas.romawi}
                      </div>
                      <span className="rounded-md bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                        {kelas.totalSoal} soal
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-800">{kelas.nama}</h3>

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

                  <div className="mt-6 pt-2">
                    <button
                      onClick={() => handlePilihKelas(kelas)}
                      className="w-full rounded-xl bg-[#004d57] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#003c44] transition-colors text-center"
                    >
                      Pilih Mata Pelajaran
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 2 CONTENT */}
        {currentStep === 2 && selectedKelas && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-end">
              <button
                onClick={() => setShowEmptyMapel(!showEmptyMapel)}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                [Demo: {showEmptyMapel ? 'Tampilkan Ada Data' : 'Tampilkan Kondisi Kosong'}]
              </button>
            </div>

            {showEmptyMapel || selectedKelas.mapelList.length === 0 ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 text-center text-xs font-medium text-amber-800">
                Belum ada mapel yang diinput, silahkan hubungi admin.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedKelas.mapelList.map((mapel) => (
                  <div key={mapel.id} className="rounded-2xl border border-cyan-100/90 bg-white p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f7fa] text-[#006064]">
                          <Calculator className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-800">{mapel.nama}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Kelas {selectedKelas.romawi}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
                        {mapel.totalSoal} soal
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Materi tersedia</span>
                      <div className="text-sm font-bold text-slate-800">{mapel.materi}</div>
                      <div className="text-xs text-slate-500">{mapel.tipeSoal}</div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                      <span className="text-xs text-slate-500">
                        Lihat dan kelola soal {mapel.nama} untuk Kelas {selectedKelas.romawi}.
                      </span>
                      <button
                        onClick={() => handlePilihMapel(mapel)}
                        disabled={provisioningCourseId === String(mapel.courseId)}
                        className="rounded-xl bg-[#004d57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
                      >
                        {provisioningCourseId === String(mapel.courseId)
                          ? 'Menyiapkan Bank Soal...'
                          : `Lihat Soal ${mapel.nama}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 CONTENT */}
        {currentStep === 3 && (
          <div className="space-y-5 pt-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

              <div className="flex items-center gap-3">
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

            {/* List Questions */}
            {filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                  <FileText className="h-6 w-6 stroke-[1.8]" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Belum ada soal pada materi ini</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                  Mulai dengan membuat soal secara manual atau impor dari file Excel.
                </p>
                <div className="mt-4">
                  <button
                    onClick={handleOpenStepFour}
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
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                          {q.tipe}
                        </span>
                        {q.tag && (
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {q.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {q.metode || 'Tersimpan'} • {q.tanggal || 'Baru'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {q.pertanyaan}
                    </p>

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
                              <span className="ml-auto text-[10px] font-bold text-[#008994]">Kunci</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span
                        className="line-clamp-2 max-w-[70%] whitespace-pre-line break-words text-[11px] text-slate-400"
                        title={q.kunciJawaban || ''}
                      >
                        {q.labelJawaban || 'Kunci jawaban'}:{' '}
                        <strong className="text-slate-700">{q.kunciJawaban || '-'}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const bank = banks.find(
                              (item) => String(item.id) === String(selectedMapel.bankId),
                            );
                            const query = new URLSearchParams({
                              bankId: selectedMapel.bankId,
                              questionId: q.id,
                            });
                            navigate(`/b6/bank-soal/lihat-soal?${query.toString()}`, {
                              state: {
                                bankId: selectedMapel.bankId,
                                questionId: q.id,
                                question: q,
                                bank,
                                className: selectedKelas?.romawi,
                                classId: selectedKelas?.classId,
                                returnKelas: selectedKelas,
                                returnMapel: selectedMapel,
                              },
                            });
                          }}
                          className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Lihat
                        </button>
                        <button
                          onClick={() => {
                            const bank = banks.find(
                              (item) => String(item.id) === String(selectedMapel.bankId),
                            );
                            const query = new URLSearchParams({
                              bankId: selectedMapel.bankId,
                              questionId: q.id,
                            });
                            navigate(`/b6/bank-soal/edit-soal?${query.toString()}`, {
                              state: {
                                bankId: selectedMapel.bankId,
                                questionId: q.id,
                                question: q,
                                bank,
                                className: selectedKelas?.romawi,
                                classId: selectedKelas?.classId,
                                returnKelas: selectedKelas,
                                returnMapel: selectedMapel,
                                hasReachedStepFour: maxUnlockedStep >= 4,
                              },
                            });
                          }}
                          className="rounded-xl bg-[#e6f7f8] px-3.5 py-1.5 text-xs font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
                        >
                          Edit
                        </button>
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

        {/* STEP 4 CONTENT */}
        {currentStep === 4 && selectedMapel && selectedKelas && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manual Input Card */}
              <div className="rounded-2xl border border-cyan-100/90 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
                <div className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                    <Edit3 className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Input Manual</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Tulis pertanyaan, kunci jawaban, dan pembahasan langsung di aplikasi.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionForm('Pilihan Ganda')}
                    className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors border border-cyan-100/60"
                  >
                    Tambah Pilihan Ganda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionForm('Benar / Salah')}
                    className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors border border-cyan-100/60"
                  >
                    Tambah Benar / Salah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionForm('Esai')}
                    className="w-full rounded-xl bg-[#e6f7f8] py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors border border-cyan-100/60"
                  >
                    Tambah Esai
                  </button>
                </div>
              </div>

              {/* Excel Import Card */}
              <div className="rounded-2xl border border-cyan-100/90 bg-white p-6 space-y-5 flex flex-col justify-between shadow-2xs">
                <div className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-[#008994]">
                    <FileSpreadsheet className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Impor dari Excel</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Tambahkan banyak soal sekaligus dari file Excel sesuai templat.
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 p-4 space-y-2 text-xs text-slate-600">
                    <p>• Unduh dan isi templat Excel.</p>
                    <p>• Unggah file dan tinjau soal yang diimpor.</p>
                    <p>• Simpan pada materi ini.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="w-full rounded-xl bg-[#004d57] py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors"
                  >
                    Buka Dialog Impor Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <Info className="h-4 w-4 text-[#008994] flex-shrink-0" />
              <span>
                Soal baru akan ditambahkan ke Kelas {selectedKelas.romawi} • {selectedMapel.nama} • {selectedMapel.materi}.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CAPTION */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Bank soal tersinkronisasi otomatis dengan portal ujian dan presensi SMAN 3 Malang. Gunakan kembali materi yang telah diuji untuk efisiensi pembuatan kuis.
        </span>
      </div>

      {/* MODAL 1: TAMBAH / EDIT SOAL */}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Soal</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pertanyaan</label>
                <textarea
                  rows={3}
                  value={newQuestion.pertanyaan}
                  onChange={(e) => setNewQuestion({ ...newQuestion, pertanyaan: e.target.value })}
                  placeholder="Tuliskan pertanyaan soal di sini..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#004d57] focus:outline-none"
                />
              </div>

              {newQuestion.tipe === 'Pilihan Ganda' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Pilihan Jawaban</label>
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <span className="w-6 text-xs font-bold text-slate-500">{option}.</span>
                      <input
                        type="text"
                        placeholder={`Jawaban ${option}`}
                        value={newQuestion[`pilihan${option}`]}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          [`pilihan${option}`]: e.target.value,
                        })}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#004d57] focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kunci Jawaban Benar</label>
                    <select
                      value={newQuestion.kunci}
                      onChange={(e) => setNewQuestion({ ...newQuestion, kunci: e.target.value })}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kunci Jawaban Benar</label>
                  <select
                    value={newQuestion.kunci}
                    onChange={(e) => setNewQuestion({ ...newQuestion, kunci: e.target.value })}
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

      {/* MODAL 2: IMPOR SOAL EXCEL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Impor Soal dari Excel</h3>
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

              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50/40 p-6 text-center">
                <FileSpreadsheet className="h-10 w-10 text-[#00838f] mb-2" />
                <span className="text-xs font-semibold text-slate-700">Klik untuk pilih file atau seret file ke sini</span>
                <span className="text-[11px] text-slate-400 mt-1">Format yang didukung: .xlsx, .xls (Maks. 5MB)</span>
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
                        returnKelas: selectedKelas,
                        returnMapel: selectedMapel,
                        hasReachedStepFour: maxUnlockedStep >= 4,
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

    </div>
  );
}
