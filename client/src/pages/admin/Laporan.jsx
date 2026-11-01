import { useEffect, useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import {
  mockLaporanJenis,
  mockLaporanFormat,
  mockLaporanCards,
} from '../../data/mockLaporan';
import { apiFetch } from '../../lib/api';

async function fetchMasterData(resource) {
  const data = await apiFetch(`/master/${resource}`);

  if (!Array.isArray(data)) {
    throw new Error(`Backend mengirim format data ${resource} yang tidak sesuai.`);
  }

  return data;
}

async function fetchAcademicData() {
  const [classes, subjects, teachers, courses] = await Promise.all([
    fetchMasterData('classes'),
    fetchMasterData('subjects'),
    fetchMasterData('users/teachers'),
    fetchMasterData('courses'),
  ]);
  return { classes, subjects, teachers, courses };
}

function firstRelation(relation) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function escapeCsvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function LaporanPage() {
  const [selectedJenis, setSelectedJenis] = useState('data_akademik');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [academicYears, setAcademicYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAcademicYears() {
      try {
        const { courses } = await fetchAcademicData();
        if (isMounted) {
          setAcademicYears(
            [...new Set(courses.map((course) => course.academic_year).filter(Boolean))]
              .sort()
              .reverse(),
          );
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Gagal memuat data dari backend.',
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAcademicYears();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleGenerateReport() {
    setErrorMessage('');
    setSuccessMessage('');

    if (selectedJenis !== 'data_akademik') {
      setErrorMessage(
        'Backend belum menyediakan endpoint untuk jenis laporan yang dipilih.',
      );
      return;
    }

    if (selectedFormat !== 'csv') {
      setErrorMessage('Format PDF dan Excel belum tersedia. Silakan pilih CSV.');
      return;
    }

    setIsGenerating(true);
    try {
      const { classes, subjects, teachers, courses } = await fetchAcademicData();
      const filteredCourses = courses.filter(
        (course) => !selectedPeriode || course.academic_year === selectedPeriode,
      );
      const headers = [
        'Jenis Data',
        'ID Course',
        'ID Data',
        'Nama',
        'Tingkat',
        'Jurusan',
        'NIP',
        'Kelas',
        'Mata Pelajaran',
        'Guru',
        'Tahun Akademik',
        'Semester',
      ];
      const rows = [
        ...classes.map((schoolClass) => [
          'Kelas',
          '',
          schoolClass.id,
          schoolClass.name,
          schoolClass.level,
          schoolClass.major,
          '',
          '',
          '',
          firstRelation(schoolClass.teachers)?.name,
          '',
          '',
        ]),
        ...subjects.map((subject) => [
          'Mata Pelajaran',
          '',
          subject.id,
          subject.name,
          '',
          '',
          '',
          '',
          subject.name,
          '',
          '',
          '',
        ]),
        ...teachers.map((teacher) => [
          'Guru',
          '',
          teacher.id,
          teacher.name,
          '',
          '',
          teacher.nip,
          '',
          '',
          teacher.name,
          '',
          '',
        ]),
        ...filteredCourses.map((course) => [
          'Course',
          course.id,
          '',
          '',
          '',
          '',
          firstRelation(course.teachers)?.nip,
          firstRelation(course.classes)?.name,
          firstRelation(course.subjects)?.name,
          firstRelation(course.teachers)?.name,
          course.academic_year,
          course.semester,
        ]),
      ];
      const csv = [
        headers,
        ...rows,
      ].map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `laporan-data-akademik-${selectedPeriode || 'semua-tahun'}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setSuccessMessage(
        `Laporan CSV berhasil dibuat (${classes.length} kelas, ${subjects.length} mata pelajaran, ${teachers.length} guru, dan ${filteredCourses.length} course).`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Gagal membuat laporan dari backend.',
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Laporan
        </h1>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Buat, unduh, dan arsipkan laporan operasional sekolah.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-[#008994] to-[#00b4d8] p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/70">
              Jenis Laporan
            </label>
            <div className="relative">
              <select
                value={selectedJenis}
                onChange={(event) => setSelectedJenis(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {mockLaporanJenis.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/70">
              Tahun Akademik
            </label>
            <div className="relative">
              <select
                value={selectedPeriode}
                onChange={(event) => setSelectedPeriode(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="">Semua tahun akademik</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/70">
              Format
            </label>
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(event) => setSelectedFormat(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/20 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {mockLaporanFormat.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    disabled={item.value !== 'csv'}
                  >
                    {item.value === 'csv' ? item.label : `${item.label} (belum tersedia)`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="lg:flex-shrink-0">
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full rounded-xl bg-slate-800 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              {isGenerating ? 'Membuat...' : 'Buat Laporan'}
            </button>
          </div>
        </div>
        {isLoading && (
          <p className="mt-3 text-xs text-white/80">Memuat tahun akademik dari backend...</p>
        )}
        {errorMessage && (
          <p role="alert" className="mt-3 text-sm font-medium text-white">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p role="status" className="mt-3 text-sm font-medium text-white">
            {successMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {mockLaporanCards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${card.iconBg} ${card.iconColor}`}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-snug text-slate-800 sm:text-base">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {card.available
                  ? 'Data diambil langsung dari backend'
                  : 'Endpoint backend belum tersedia'}
              </span>
              {card.available ? (
                <Download className="h-4 w-4 text-[#008994]" aria-label="Tersedia" />
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">
                  Belum tersedia
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
