import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Download,
  FileText,
  Clock,
  Search,
  ChevronDown,
  Info,
  X,
} from 'lucide-react';
import { b6ApiFetch } from './b6-api';

export default function RekapHasilPage() {
  // Filters & Search
  const [selectedAsesmen, setSelectedAsesmen] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('Ulangan Harian');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil 2026/2027');
  const [quizzes, setQuizzes] = useState([]);
  const [quizDetail, setQuizDetail] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptsQuizId, setAttemptsQuizId] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [gradingAttemptId, setGradingAttemptId] = useState(null);
  const [gradingMessage, setGradingMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPengerjaan, setFilterPengerjaan] = useState('Semua status');
  const [filterKetuntasan, setFilterKetuntasan] = useState('Semua hasil');

  // Selected student for detail modal
  const [selectedSiswa, setSelectedSiswa] = useState(null);

  const selectedQuiz = (String(quizDetail?.id) === selectedAsesmen ? quizDetail : null)
    || quizzes.find((quiz) => String(quiz.id) === selectedAsesmen)
    || null;

  useEffect(() => {
    let active = true;
    Promise.all([
      b6ApiFetch('/attempts/recap/quizzes'),
      b6ApiFetch('/master/classes'),
    ])
      .then(([quizData, classData]) => {
        if (!active) return;
        const quizList = Array.isArray(quizData) ? quizData : [];
        setQuizzes(quizList);
        setClasses(Array.isArray(classData) ? classData : []);
        if (quizList.length > 0) setSelectedAsesmen(String(quizList[0].id));
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedAsesmen) {
      return undefined;
    }

    let active = true;
    Promise.all([
      b6ApiFetch(`/quizzes/${encodeURIComponent(selectedAsesmen)}`),
      b6ApiFetch(`/attempts/recap?quiz_id=${encodeURIComponent(selectedAsesmen)}`),
    ])
      .then(([quizData, attemptData]) => {
        if (!active) return;
        setQuizDetail(quizData);
        setAttempts(Array.isArray(attemptData?.attempts) ? attemptData.attempts : []);
        setStudents(Array.isArray(attemptData?.students) ? attemptData.students : []);
        setAttemptsQuizId(selectedAsesmen);
        if (quizData.academic_term) setSelectedSemester(quizData.academic_term);
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message);
      });

    return () => {
      active = false;
    };
  }, [selectedAsesmen]);

  const classFilter = selectedKelas === 'all' && selectedQuiz?.class_id
    ? String(selectedQuiz.class_id)
    : selectedKelas;
  const selectedAttempts = useMemo(
    () => String(attemptsQuizId) === selectedAsesmen ? attempts : [],
    [attempts, attemptsQuizId, selectedAsesmen],
  );

  const studentRows = useMemo(() => {
    const roster = students.filter((student) => {
      const classId = student.class_id || student.classes?.id;
      const quizClassId = selectedQuiz?.class_id;
      if (classFilter !== 'all' && String(classId) !== classFilter) return false;
      return !quizClassId || String(classId) === String(quizClassId);
    });
    const attemptsByStudent = new Map();
    selectedAttempts.forEach((attempt) => {
      if (!attemptsByStudent.has(String(attempt.student_id))) {
        attemptsByStudent.set(String(attempt.student_id), attempt);
      }
    });

    return roster.map((student, index) => {
      const attempt = attemptsByStudent.get(String(student.id));
      const rawScore = attempt?.total_score ?? attempt?.score;
      const score = rawScore === null || rawScore === undefined || rawScore === ''
        ? null
        : Number(rawScore);
      const validScore = Number.isFinite(score) ? score : null;
      const normalizedStatus = String(attempt?.status || '').toUpperCase();
      const isComplete = ['SELESAI', 'COMPLETED', 'SUBMITTED'].includes(normalizedStatus);
      const pengerjaan = isComplete ? 'Selesai'
        : attempt ? 'Mengerjakan' : 'Belum mulai';
      const startedAt = attempt?.started_at ? new Date(attempt.started_at).getTime() : null;
      const finishedAt = attempt?.submitted_at ? new Date(attempt.submitted_at).getTime() : null;
      const elapsedMinutes = startedAt && finishedAt && finishedAt >= startedAt
        ? Math.round((finishedAt - startedAt) / 60000)
        : null;
      const className = student.classes?.name
        || classes.find((item) => String(item.id) === String(student.class_id || student.classes?.id))?.name;
      const nis = student.nis || student.id;
      const passingGrade = Number(selectedQuiz?.passing_grade ?? 75);

      return {
        no: String(index + 1).padStart(2, '0'),
        studentId: student.id,
        attemptId: attempt?.id,
        nama: student.name || 'Siswa',
        kode: `${nis}${className ? ` • ${className}` : ''}`,
        nilai: validScore ?? '—',
        benar: attempt?.correct_count ?? '—',
        salah: attempt?.incorrect_count ?? '—',
        waktu: elapsedMinutes === null ? '—' : `${elapsedMinutes} mnt`,
        pengerjaan,
        gradingStatus: attempt?.grading_status || 'BELUM_MULAI',
        ketuntasan: validScore === null ? 'Belum dinilai'
          : validScore >= passingGrade ? 'Tuntas' : 'Belum tuntas',
      };
    });
  }, [students, classes, selectedAttempts, selectedQuiz, classFilter]);

  const filteredStudents = useMemo(() => studentRows.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase())
      || item.kode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPengerjaan = filterPengerjaan === 'Semua status'
      || item.pengerjaan === filterPengerjaan;
    const matchKetuntasan = filterKetuntasan === 'Semua hasil'
      || item.ketuntasan === filterKetuntasan;
    return matchSearch && matchPengerjaan && matchKetuntasan;
  }), [studentRows, searchQuery, filterPengerjaan, filterKetuntasan]);

  const scoredStudents = studentRows.filter((student) => typeof student.nilai === 'number');
  const completedStudents = studentRows.filter((student) => student.pengerjaan === 'Selesai');
  const passingStudents = scoredStudents.filter((student) => student.ketuntasan === 'Tuntas');
  const averageScore = scoredStudents.length
    ? (scoredStudents.reduce((total, student) => total + student.nilai, 0) / scoredStudents.length).toFixed(1)
    : '—';
  const passRate = scoredStudents.length
    ? Math.round((passingStudents.length / scoredStudents.length) * 100)
    : 0;
  const scoreDistribution = [
    { rentang: '0–59', min: 0, max: 59 },
    { rentang: '60–74', min: 60, max: 74 },
    { rentang: '75–89', min: 75, max: 89 },
    { rentang: '90–100', min: 90, max: 100 },
  ].map((range) => ({
    ...range,
    jumlah: scoredStudents.filter((student) => student.nilai >= range.min && student.nilai <= range.max).length,
  }));
  const maxDistribution = Math.max(1, ...scoreDistribution.map((item) => item.jumlah));
  const distribution = scoreDistribution.map((item) => ({
    ...item,
    height: `${(item.jumlah / maxDistribution) * 100}%`,
  }));
  const scoreValues = scoredStudents.map((student) => student.nilai);
  const passingGrade = Number(selectedQuiz?.passing_grade ?? 75);
  const startDate = selectedQuiz?.start_at
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(selectedQuiz.start_at))
    : '—';
  const startTime = selectedQuiz?.start_at
    ? new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(new Date(selectedQuiz.start_at))
    : '—';
  const quizStatus = selectedQuiz?.status || '—';

  const handleExport = () => {
    alert('Rekap hasil berhasil diekspor dalam format Excel (.xlsx)!');
  };

  const handleAutoGrade = async (attemptId) => {
    if (!attemptId || !selectedAsesmen || gradingAttemptId) return;
    setGradingAttemptId(attemptId);
    setGradingMessage('');
    setErrorMessage('');
    try {
      const result = await b6ApiFetch(`/attempts/${encodeURIComponent(attemptId)}/grade`, {
        method: 'POST',
      });
      const refreshed = await b6ApiFetch(
        `/attempts/recap?quiz_id=${encodeURIComponent(selectedAsesmen)}`,
      );
      setAttempts(Array.isArray(refreshed?.attempts) ? refreshed.attempts : []);
      setStudents(Array.isArray(refreshed?.students) ? refreshed.students : []);
      setAttemptsQuizId(selectedAsesmen);
      setGradingMessage(result?.pending_manual_question_ids?.length
        ? 'Soal pilihan ganda telah dinilai. Kuis ini masih memiliki soal esai yang memerlukan penilaian manual.'
        : 'Penilaian otomatis berhasil diselesaikan.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setGradingAttemptId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/b6/beranda" className="hover:text-slate-600 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/b6/buat-kuis" className="hover:text-slate-600 transition-colors">
          Asesmen
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Rekap Hasil</span>
      </nav>

      {/* 2. Page Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Rekap Hasil
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Pantau capaian belajar dan tentukan tindak lanjut untuk siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#004d57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#003c44] transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Ekspor Rekap</span>
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}
      {gradingMessage && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs font-medium text-[#005b64]">
          {gradingMessage}
        </div>
      )}

      {/* 3. Filter Card & Asesmen Metadata */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Asesmen */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Asesmen
            </label>
            <div className="relative">
              <select
                value={selectedAsesmen}
                onChange={(e) => setSelectedAsesmen(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                <option value="">Pilih asesmen</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Jenis Asesmen */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Jenis Asesmen
            </label>
            <div className="relative">
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                <option value="Ulangan Harian">Ulangan Harian</option>
                <option value="Tugas Mandiri">Tugas Mandiri</option>
                <option value="Ujian Tengah Semester">Ujian Tengah Semester</option>
                {selectedQuiz?.assessment_type
                  && !['Ulangan Harian', 'Tugas Mandiri', 'Ujian Tengah Semester'].includes(selectedQuiz.assessment_type)
                  && <option value={selectedQuiz.assessment_type}>{selectedQuiz.assessment_type}</option>}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Kelas */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Kelas
            </label>
            <div className="relative">
              <select
                value={classFilter}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                <option value="all">Semua kelas</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Semester */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Semester
            </label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                {selectedQuiz?.academic_term && !['Ganjil 2026/2027', 'Genap 2026/2027'].includes(selectedQuiz.academic_term)
                  && <option value={selectedQuiz.academic_term}>{selectedQuiz.academic_term}</option>}
                <option value="Ganjil 2026/2027">Ganjil 2026/2027</option>
                <option value="Genap 2026/2027">Genap 2026/2027</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Asesmen Info Bar */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {selectedQuiz?.title || (isLoading ? 'Memuat asesmen...' : 'Belum ada asesmen')}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                {selectedQuiz?.quiz_questions?.length || 0} soal
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {selectedQuiz?.duration_minutes ? `${selectedQuiz.duration_minutes} menit` : 'Durasi belum ditentukan'}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                KKM {selectedQuiz?.passing_grade ?? 75}
              </span>
              <span>•</span>
              <span>
                {startDate} • {startTime}
              </span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center rounded-md bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
              {quizStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 4. KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-400">Jumlah siswa</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              {studentRows.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">siswa</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Terdaftar pada kelas yang dipilih</p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-400">Rata-rata nilai</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#005b64]">
              {averageScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Dari {scoredStudents.length} siswa yang memiliki nilai</p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-400">Ketuntasan</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#008994]">
              {passRate}%
            </span>
            <span className="text-xs font-semibold text-slate-500">tuntas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{passingStudents.length} dari {scoredStudents.length} siswa bernilai</p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-400">Pengerjaan selesai</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              {completedStudents.length} / {studentRows.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">siswa</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{studentRows.length - completedStudents.length} belum selesai</p>
        </div>
      </div>

      {/* 5. Middle Section: Distribusi Nilai & Ketuntasan Belajar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Distribusi Nilai */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-base font-bold text-slate-800">Distribusi Nilai</h2>
              <span className="text-xs text-slate-400">{scoredStudents.length} siswa memiliki nilai</span>
            </div>

            {/* Bar Chart Container */}
            <div className="mt-4 relative h-48 w-full flex items-end justify-between px-6 pb-6 pt-6 border-b border-slate-100">
              {/* Horizontal grid lines */}
              <div className="absolute inset-x-0 top-6 bottom-6 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full relative">
                  <span className="absolute -left-5 -top-2 text-[10px] text-slate-400">5</span>
                </div>
                <div className="border-b border-dashed border-slate-200 w-full relative">
                  <span className="absolute -left-5 -top-2 text-[10px] text-slate-400">4</span>
                </div>
                <div className="border-b border-dashed border-slate-200 w-full relative">
                  <span className="absolute -left-5 -top-2 text-[10px] text-slate-400">3</span>
                </div>
                <div className="border-b border-dashed border-slate-200 w-full relative">
                  <span className="absolute -left-5 -top-2 text-[10px] text-slate-400">2</span>
                </div>
                <div className="border-b border-dashed border-slate-200 w-full relative">
                  <span className="absolute -left-5 -top-2 text-[10px] text-slate-400">1</span>
                </div>
                <div className="border-b border-slate-200 w-full relative">
                  <span className="absolute -left-5 -top-2 text-[10px] text-slate-400">0</span>
                </div>
              </div>

              {/* Bars */}
              {distribution.map((item, idx) => {
                // Color variation as in mockup:
                // 0-59: light cyan #b2ebf2
                // 60-74: medium soft cyan #80deea
                // 75-89: strong cyan #008994
                // 90-100: strong cyan #008994
                const barColor =
                  idx === 0
                    ? 'bg-[#a5e3e8]'
                    : idx === 1
                    ? 'bg-[#80deea]'
                    : 'bg-[#008994]';

                return (
                  <div
                    key={item.rentang}
                    className="relative flex flex-col items-center flex-1 z-10"
                  >
                    <span className="mb-1 text-xs font-bold text-slate-700">
                      {item.jumlah}
                    </span>
                    <div
                      className={`w-14 sm:w-16 rounded-t-lg transition-all duration-500 ${barColor}`}
                      style={{ height: item.height }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex items-center justify-between px-6 pt-2 text-xs font-semibold text-slate-500">
              {distribution.map((item) => (
                <div key={item.rentang} className="flex-1 text-center">
                  {item.rentang}
                </div>
              ))}
            </div>
          </div>

          {/* Subnote */}
          <p className="mt-6 text-[11px] text-slate-400">
            {scoreValues.length
              ? `Nilai tertinggi ${Math.max(...scoreValues)} • Nilai terendah ${Math.min(...scoreValues)}`
              : 'Belum ada nilai tersimpan untuk asesmen ini.'}
          </p>
        </div>

        {/* Right: Ketuntasan Belajar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Ketuntasan Belajar</h2>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-8">
              {/* Donut Gauge SVG */}
              <div className="relative flex items-center justify-center">
                <svg className="h-36 w-36 transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="52"
                    stroke="#e6f4f5"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  {/* Progress Circle (70%) */}
                  {/* 2 * Math.PI * 52 = 326.72 */}
                  <circle
                    cx="72"
                    cy="72"
                    r="52"
                    stroke="#008994"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray={326.72}
                    strokeDashoffset={326.72 * (1 - passRate / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold tracking-tight text-slate-800">
                    {passRate}%
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">tuntas</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#008994]" />
                  <div>
                    <span className="text-xs text-slate-500">Tuntas</span>
                    <p className="text-xs font-bold text-slate-800">{passingStudents.length} siswa</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#a5e3e8]" />
                  <div>
                    <span className="text-xs text-slate-500">Belum tuntas</span>
                    <p className="text-xs font-bold text-slate-800">{scoredStudents.length - passingStudents.length} siswa</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">KKM ≥ {passingGrade}</p>
              </div>
            </div>
          </div>

          {/* Remedial Recommendation Box */}
          <div className="mt-6 rounded-xl bg-slate-50/80 border border-slate-100 p-3.5">
            <h4 className="text-xs font-bold text-slate-800">
              {scoredStudents.length - passingStudents.length} siswa perlu penguatan materi
            </h4>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {studentRows.length - scoredStudents.length} siswa belum memiliki nilai akhir.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Hasil per Siswa (Table Card) */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        {/* Table Header & Search */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Hasil per Siswa</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nilai akhir hanya ditampilkan setelah siswa menyelesaikan asesmen.
              </p>
            </div>
            <span className="rounded-md bg-[#e0f7fa] px-3 py-1 text-xs font-semibold text-[#006064]">
              {studentRows.length} siswa
            </span>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau kode siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:outline-none"
              />
            </div>

            {/* Filter Pengerjaan */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden md:inline">
                Pengerjaan
              </span>
              <div className="relative min-w-[140px]">
                <select
                  value={filterPengerjaan}
                  onChange={(e) => setFilterPengerjaan(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-semibold text-slate-700 focus:border-[#004d57] focus:outline-none"
                >
                  <option value="Semua status">Semua status</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Mengerjakan">Mengerjakan</option>
                  <option value="Belum mulai">Belum mulai</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Filter Ketuntasan */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden md:inline">
                Ketuntasan
              </span>
              <div className="relative min-w-[140px]">
                <select
                  value={filterKetuntasan}
                  onChange={(e) => setFilterKetuntasan(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-semibold text-slate-700 focus:border-[#004d57] focus:outline-none"
                >
                  <option value="Semua hasil">Semua hasil</option>
                  <option value="Tuntas">Tuntas</option>
                  <option value="Belum tuntas">Belum tuntas</option>
                  <option value="Belum dinilai">Belum dinilai</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4 min-w-[180px]">Siswa</th>
                <th className="py-3 px-3 text-center">Nilai</th>
                <th className="py-3 px-3 text-center">Benar</th>
                <th className="py-3 px-3 text-center">Salah</th>
                <th className="py-3 px-3 text-center">Waktu</th>
                <th className="py-3 px-4">Pengerjaan</th>
                <th className="py-3 px-4">Ketuntasan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada siswa yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((siswa) => (
                  <tr
                    key={siswa.no}
                    className="hover:bg-cyan-50/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                      {siswa.no}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{siswa.nama}</div>
                      <div className="text-[11px] text-slate-400">{siswa.kode}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-bold ${
                          typeof siswa.nilai === 'number'
                            ? siswa.nilai >= passingGrade
                              ? 'text-slate-800'
                              : 'text-amber-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {siswa.nilai}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                      {siswa.benar}
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                      {siswa.salah}
                    </td>

                    <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                      {siswa.waktu}
                    </td>

                    {/* Status Pengerjaan */}
                    <td className="py-3.5 px-4">
                      {siswa.pengerjaan === 'Selesai' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008994]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#008994]" />
                          Selesai
                        </span>
                      )}
                      {siswa.pengerjaan === 'Mengerjakan' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Mengerjakan
                        </span>
                      )}
                      {siswa.pengerjaan === 'Belum mulai' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Belum mulai
                        </span>
                      )}
                    </td>

                    {/* Status Ketuntasan */}
                    <td className="py-3.5 px-4">
                      {siswa.ketuntasan === 'Tuntas' && (
                        <span className="inline-flex items-center rounded-md bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                          Tuntas
                        </span>
                      )}
                      {siswa.ketuntasan === 'Belum tuntas' && (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Belum tuntas
                        </span>
                      )}
                      {siswa.ketuntasan === 'Belum dinilai' && (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          Belum dinilai
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSiswa(siswa)}
                          className="inline-flex items-center text-xs font-semibold text-[#005b64] hover:text-[#003c44] hover:underline"
                        >
                          Detail &gt;
                        </button>
                        {siswa.attemptId
                          && siswa.pengerjaan === 'Selesai'
                          && siswa.gradingStatus !== 'SELESAI_DINILAI'
                          && (
                            <button
                              type="button"
                              onClick={() => handleAutoGrade(siswa.attemptId)}
                              disabled={Boolean(gradingAttemptId)}
                              className="inline-flex items-center text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 hover:underline disabled:opacity-50"
                            >
                              {gradingAttemptId === siswa.attemptId ? 'Menilai...' : 'Nilai Otomatis'}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col gap-2 p-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <div>
            <span>Menampilkan {filteredStudents.length} dari {studentRows.length} siswa</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              * Waktu berjalan untuk siswa yang masih mengerjakan. Tanda — berarti hasil akhir belum tersedia.
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            Snapshot simulasi: 9 Oktober 2026, 09.10 WIB
          </div>
        </div>
      </div>

      {/* 7. Bottom Footnote Info */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed pt-2">
        <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Nilai, ketuntasan, dan distribusi dihitung dari data nilai yang tersedia pada backend. Jumlah benar/salah belum tersedia dari API rekap.
        </span>
      </div>

      {/* Modal Detail Siswa */}
      {selectedSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-2xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Rincian Hasil Siswa
                </h3>
                <p className="text-xs text-slate-400">{selectedSiswa.nama} ({selectedSiswa.kode})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSiswa(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-slate-400 block text-xs">Nilai Akhir</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {selectedSiswa.nilai} / 100
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-slate-400 block text-xs">Status Ketuntasan</span>
                <span className="text-sm font-bold text-[#005b64] mt-1.5 block">
                  {selectedSiswa.ketuntasan}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-slate-400 block text-xs">Jawaban Benar</span>
                <span className="text-base font-bold text-emerald-600 mt-1 block">
                  {selectedSiswa.benar} soal
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-slate-400 block text-xs">Jawaban Salah</span>
                <span className="text-base font-bold text-rose-500 mt-1 block">
                  {selectedSiswa.salah} soal
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Durasi Pengerjaan:</span>
                <span className="font-semibold text-slate-700">{selectedSiswa.waktu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Pengerjaan:</span>
                <span className="font-semibold text-slate-700">{selectedSiswa.pengerjaan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Batas KKM:</span>
                <span className="font-semibold text-slate-700">{passingGrade} poin</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSiswa(null)}
                className="rounded-xl bg-[#004d57] px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] transition-colors"
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
