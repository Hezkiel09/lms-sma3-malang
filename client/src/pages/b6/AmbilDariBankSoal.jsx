import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Info,
  X,
} from 'lucide-react';
import { b6ApiFetch } from './b6-api';
import { getClassLabel, toQuestionViewModel } from './b6-utils';

export default function AmbilDariBankSoalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const quizId = location.state?.quizId || sessionStorage.getItem('b6.currentQuizId');

  // Dropdowns source selection
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [banks, setBanks] = useState([]);
  const [quizContext, setQuizContext] = useState(null);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenisSoal, setSelectedJenisSoal] = useState('Semua jenis');

  // Selected questions checkbox state
  const [items, setItems] = useState([]);
  const [loadedBankId, setLoadedBankId] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      b6ApiFetch('/banks'),
      quizId ? b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}`) : Promise.resolve(null),
    ])
      .then(([data, quizData]) => {
        if (!active) return;
        const bankList = Array.isArray(data) ? data : [];
        setQuizContext(quizData);
        setBanks(bankList);
        const firstBank = bankList.find((bank) => (bank.courses || []).some(
          (course) => course.class_id
            && course.subject_id
            && String(course.subject_id) === String(bank.subject_id)
            && course.classes?.id
            && (!quizData?.class_id || String(course.class_id) === String(quizData.class_id))
            && (!quizData?.subject_id || String(bank.subject_id) === String(quizData.subject_id)),
        ));
        if (firstBank) {
          const firstCourse = firstBank.courses.find(
            (course) => String(course.subject_id) === String(firstBank.subject_id)
              && course.classes?.id,
          );
          setSelectedBankId(firstBank.id);
          setSelectedKelas(firstCourse.class_id);
          setSelectedMapel(firstCourse.subject_id);
        }
      })
      .catch((error) => window.alert(error.message))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [quizId]);

  useEffect(() => {
    if (!selectedBankId) {
      return undefined;
    }

    let active = true;
    const bank = banks.find((item) => item.id === selectedBankId);
    b6ApiFetch(`/banks/${encodeURIComponent(selectedBankId)}/questions`)
      .then((data) => {
        if (active) {
          setItems((Array.isArray(data) ? data : []).map((question) => ({
            ...toQuestionViewModel(question, bank || {}),
            selected: false,
          })));
          setLoadedBankId(selectedBankId);
        }
      })
      .catch((error) => {
        if (active) window.alert(error.message);
      });

    return () => {
      active = false;
    };
  }, [banks, selectedBankId]);

  const bankCourseLinks = useMemo(
    () => banks.flatMap((bank) => (bank.courses || [])
      .filter((course) => course.class_id
        && course.subject_id
        && String(course.subject_id) === String(bank.subject_id)
        && course.classes?.id
        && course.subjects?.id
        && (!quizContext?.class_id || String(course.class_id) === String(quizContext.class_id))
        && (!quizContext?.subject_id || String(bank.subject_id) === String(quizContext.subject_id)))
      .map((course) => ({ bank, course }))),
    [banks, quizContext],
  );
  const kelasOptions = useMemo(() => {
    const classesById = new Map();
    bankCourseLinks.forEach(({ course }) => {
      classesById.set(String(course.class_id), {
        id: course.class_id,
        name: getClassLabel(course.classes.name),
      });
    });
    return [...classesById.values()];
  }, [bankCourseLinks]);
  const mapelOptions = useMemo(() => {
    const subjectsById = new Map();
    bankCourseLinks
      .filter(({ course }) => String(course.class_id) === String(selectedKelas))
      .forEach(({ course }) => {
        subjectsById.set(String(course.subject_id), {
          id: course.subject_id,
          name: course.subjects.name,
        });
      });
    return [...subjectsById.values()];
  }, [bankCourseLinks, selectedKelas]);
  const materiOptions = useMemo(
    () => bankCourseLinks
      .filter(({ course }) => String(course.class_id) === String(selectedKelas)
        && String(course.subject_id) === String(selectedMapel))
      .reduce((uniqueBanks, { bank }) => {
        if (!uniqueBanks.some((item) => String(item.id) === String(bank.id))) {
          uniqueBanks.push(bank);
        }
        return uniqueBanks;
      }, []),
    [bankCourseLinks, selectedKelas, selectedMapel],
  );
  const selectedMapelName = mapelOptions.find(
    (subject) => String(subject.id) === String(selectedMapel),
  )?.name || '';
  const selectedBank = banks.find((bank) => String(bank.id) === String(selectedBankId));
  const selectedMateriName = selectedBank?.topic_name || selectedBank?.name || '';
  const selectedKelasName = kelasOptions.find(
    (kelas) => String(kelas.id) === String(selectedKelas),
  )?.name || '';

  const activeItems = loadedBankId === selectedBankId ? items : [];
  const filteredItems = activeItems.filter((item) => {
    const matchesSearch = item.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedJenisSoal === 'Semua jenis' || item.tipe === selectedJenisSoal;
    return matchesSearch && matchesType;
  });

  // Toggle single item
  const handleToggle = (id) => {
    if (loadedBankId !== selectedBankId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Toggle select all
  const allSelected = activeItems.length > 0 && activeItems.every((i) => i.selected);
  const handleToggleAll = () => {
    if (loadedBankId !== selectedBankId) return;
    const nextState = !allSelected;
    setItems((prev) => prev.map((i) => ({ ...i, selected: nextState })));
  };

  // Selected count
  const selectedCount = activeItems.filter((i) => i.selected).length;

  const handleTambahkanKeKuis = async () => {
    if (!quizId) {
      window.alert('Simpan draft kuis terlebih dahulu sebelum menambahkan soal.');
      return;
    }

    try {
      const selectedItems = activeItems.filter((item) => item.selected);
      const quiz = await b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}`);
      const bankMatchesQuiz = selectedBank
        && (!quiz.subject_id || String(selectedBank.subject_id) === String(quiz.subject_id))
        && (!quiz.class_id || (selectedBank.courses || []).some((course) => (
          String(course.class_id) === String(quiz.class_id)
            && (!quiz.subject_id || String(course.subject_id) === String(quiz.subject_id))
        )));
      if (!bankMatchesQuiz) {
        window.alert('Bank soal yang dipilih tidak sesuai dengan kelas atau mata pelajaran kuis.');
        return;
      }

      const existingQuestions = quiz.quiz_questions || [];
      const existingQuestionIds = new Set(
        existingQuestions.map((item) => String(item.questions?.id || item.question_id)),
      );
      const questionsToAdd = selectedItems.filter(
        (item) => !existingQuestionIds.has(String(item.id)),
      );

      if (questionsToAdd.length === 0) {
        window.alert('Semua soal yang dipilih sudah ada di kuis.');
        return;
      }

      const nextOrder = existingQuestions.reduce(
        (max, item) => Math.max(max, Number(item.question_order) || 0),
        0,
      ) + 1;
      await b6ApiFetch(`/quizzes/${encodeURIComponent(quizId)}/questions`, {
        method: 'POST',
        body: JSON.stringify({
          questions: questionsToAdd.map((item, index) => ({
            question_id: item.id,
            points: item.default_points || 1,
            question_order: nextOrder + index,
          })),
        }),
      });
      navigate('/b6/buat-kuis', {
        state: { quizId, addedFromBank: true, addedQuestionCount: questionsToAdd.length },
      });
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/b6/buat-kuis" className="hover:text-slate-600">
          Buat Kuis
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Ambil dari Bank Soal</span>
      </nav>

      {/* 2. Header Title & Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Pilih Soal dari Bank Soal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Pilih soal yang ingin ditambahkan ke kuis yang sedang Anda buat.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/b6/buat-kuis', { state: { quizId, formData: location.state?.formData } })}
            className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
          >
            Kembali ke Kuis
          </button>
        </div>
      </div>

      {/* 3. Card 1: Pilih Sumber Bank Soal */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Pilih sumber Bank Soal
          </h2>
          <span className="text-xs text-slate-400">
            Kelas &rarr; Mata pelajaran &rarr; Materi
          </span>
        </div>

        {/* 3 Dropdown Filters: Kelas, Mata Pelajaran, Materi */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kelas
            </label>
            <div className="relative">
              <select
                value={selectedKelas}
                onChange={(e) => {
                  const classId = e.target.value;
                  const firstLink = bankCourseLinks.find(
                    ({ course }) => String(course.class_id) === String(classId),
                  );
                  setSelectedKelas(classId);
                  setSelectedMapel(firstLink?.course.subject_id || '');
                  setSelectedBankId(firstLink?.bank.id || '');
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                {kelasOptions.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mata pelajaran
            </label>
            <div className="relative">
              <select
                value={selectedMapel}
                onChange={(e) => {
                  const subjectId = e.target.value;
                  const firstLink = bankCourseLinks.find(({ course }) => (
                    String(course.class_id) === String(selectedKelas)
                      && String(course.subject_id) === String(subjectId)
                  ));
                  setSelectedMapel(subjectId);
                  setSelectedBankId(firstLink?.bank.id || '');
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                {mapelOptions.map((mapel) => <option key={mapel.id} value={mapel.id}>{mapel.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Materi */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Materi
            </label>
            <div className="relative">
              <select
                value={selectedBankId}
                onChange={(e) => {
                  setSelectedBankId(e.target.value);
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                {materiOptions.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.topic_name || bank.name || 'Materi belum ditentukan'}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 pt-1">
          Daftar hanya menampilkan soal dari {selectedKelasName} sesuai mata pelajaran dan materi yang dipilih.
        </p>
      </div>

      {/* 4. Card 2: Soal Komposisi & Invers (Checklist Soal) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Soal {selectedMateriName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLoading ? 'Memuat soal...' : `${activeItems.length} soal tersedia untuk ditambahkan ke kuis.`}
            </p>
          </div>
          <span className="rounded-full bg-[#e6f7f8] px-3.5 py-1 text-xs font-semibold text-[#005b64]">
            {selectedKelasName} • {selectedMapelName}
          </span>
        </div>

        {/* Filter Bar: Cari & Jenis Soal */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan dalam materi ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:bg-white focus:outline-none"
            />
          </div>

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
        </div>

        {/* Select All Row */}
        <div className="flex items-center justify-between border-y border-slate-100 py-3 text-xs">
          <label className="flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleToggleAll}
              className="h-4 w-4 rounded accent-[#004d57]"
            />
            <span>Pilih semua ({activeItems.length} soal)</span>
          </label>
          <span className="text-slate-400">
            Menampilkan {filteredItems.length} dari {activeItems.length} soal
          </span>
        </div>

        {/* Question Cards List */}
        <div className="space-y-3.5">
          {filteredItems.map((q) => (
            <div
              key={q.id}
              onClick={() => handleToggle(q.id)}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition-all cursor-pointer select-none ${
                q.selected
                  ? 'border-cyan-200 bg-cyan-50/20 shadow-2xs'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={q.selected}
                  onChange={() => {}} // handled by parent onClick
                  className="h-4 w-4 rounded accent-[#004d57]"
                />
              </div>

              {/* Question Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#e0f7fa] px-2 py-0.5 text-xs font-semibold text-[#006064]">
                      {q.tipe}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {q.metode} • {q.tanggal}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {q.pertanyaan}
                </p>

                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-400">
                    <div>{q.tag}</div>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      Kunci jawaban: {q.kunciJawaban}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(q);
                    }}
                    className="rounded-xl bg-[#e6f7f8] px-4 py-1.5 text-xs font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
                  >
                    Pratinjau
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Floating/Sticky Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {selectedCount} soal dipilih
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Soal yang telah dipilih akan ditambahkan ke kuis.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/b6/buat-kuis', { state: { quizId, formData: location.state?.formData } })}
              className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              Batal
            </button>

            <button
              onClick={handleTambahkanKeKuis}
              disabled={selectedCount === 0}
              className="rounded-xl bg-[#004d57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors disabled:opacity-50"
            >
              Tambahkan {selectedCount} Soal ke Kuis
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-50">
          <Info className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span>Soal disalin ke kuis. Soal pada Bank Soal sumber tidak berubah.</span>
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="rounded-lg bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                Pratinjau Soal • {previewItem.tipe}
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                {previewItem.pertanyaan}
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Kunci Jawaban: </span>
                {previewItem.kunciJawaban}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewItem(null)}
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
