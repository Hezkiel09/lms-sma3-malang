import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Download, Search, School, Users } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const tabs = ['Data Akademik', 'Presensi', 'Nilai Siswa', 'Bank Soal', 'Aktivitas Pembelajaran'];

function getHomeroomTeacher(classItem) {
  const teacher = classItem.teachers || classItem.homeroom_teacher;
  return Array.isArray(teacher) ? teacher[0] : teacher;
}

function getStudentCount(classItem) {
  return Number(classItem.total_students ?? classItem.students?.[0]?.count ?? 0);
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('Data Akademik');
  const [summary, setSummary] = useState(null);
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadMonitoringData = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryData, classesData, schedulesData, coursesData] = await Promise.all([
          apiFetch('/master/analytics/dashboard'),
          apiFetch('/master/classes'),
          apiFetch('/master/academic/schedules'),
          apiFetch('/master/courses'),
        ]);

        if (!active) return;
        setSummary(summaryData || {});
        setClasses(Array.isArray(classesData) ? classesData : []);
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (loadError) {
        if (active) setError(loadError.message || 'Data monitoring gagal dimuat.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMonitoringData();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const levels = useMemo(
    () => [...new Set(classes.map((item) => item.level).filter(Boolean))].sort(),
    [classes],
  );

  const schedulesByClass = useMemo(
    () => schedules.reduce((counts, item) => {
      counts[item.class_id] = (counts[item.class_id] || 0) + 1;
      return counts;
    }, {}),
    [schedules],
  );

  const monitoredClasses = useMemo(() => classes.map((item) => {
    const teacher = getHomeroomTeacher(item);
    const scheduleCount = schedulesByClass[item.id] || 0;
    const hasTeacher = Boolean(teacher?.id || teacher?.name || item.homeroom_teacher_id);
    return {
      ...item,
      homeroomName: teacher?.name || (hasTeacher ? 'Terdaftar' : 'Belum ditetapkan'),
      studentCount: getStudentCount(item),
      scheduleCount,
      hasTeacher,
      status: hasTeacher && scheduleCount > 0 ? 'Lengkap' : 'Perlu ditinjau',
    };
  }), [classes, schedulesByClass]);

  const filteredClasses = useMemo(() => monitoredClasses.filter((item) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || `${item.name} ${item.homeroomName}`.toLowerCase().includes(keyword);
    const matchesLevel = !selectedTingkat || String(item.level) === selectedTingkat;
    const matchesClass = !selectedKelas || item.id === selectedKelas;
    return matchesSearch && matchesLevel && matchesClass;
  }), [monitoredClasses, search, selectedTingkat, selectedKelas]);

  const completeCount = monitoredClasses.filter((item) => item.hasTeacher && item.scheduleCount > 0).length;
  const noTeacherCount = monitoredClasses.filter((item) => !item.hasTeacher).length;
  const noScheduleCount = monitoredClasses.filter((item) => item.scheduleCount === 0).length;
  const reviewCount = monitoredClasses.length - completeCount;
  const completePercentage = monitoredClasses.length
    ? Math.round((completeCount / monitoredClasses.length) * 100)
    : 0;

  const actions = [
    noTeacherCount > 0 && { id: 'teacher', text: `${noTeacherCount} kelas belum memiliki wali kelas`, dotColor: 'bg-amber-500' },
    noScheduleCount > 0 && { id: 'schedule', text: `${noScheduleCount} kelas belum memiliki jadwal`, dotColor: 'bg-red-500' },
  ].filter(Boolean);

  const downloadReport = () => {
    const rows = [
      ['Kelas', 'Tingkat', 'Wali kelas', 'Jumlah siswa', 'Jumlah jadwal', 'Status'],
      ...filteredClasses.map((item) => [item.name, item.level || '', item.homeroomName, item.studentCount, item.scheduleCount, item.status]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'monitoring-data-akademik.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { title: 'Total siswa', value: summary?.total_students ?? 0, subtitle: 'Data siswa terdaftar', tone: 'cyan', icon: Users },
    { title: 'Total kelas', value: classes.length, subtitle: 'Rombongan belajar', tone: 'blue', icon: School },
    { title: 'Jadwal pelajaran', value: schedules.length, subtitle: 'Jadwal tersimpan', tone: 'amber', icon: CalendarDays },
    { title: 'Course', value: courses.length, subtitle: 'Course terdaftar', tone: 'purple', icon: BookOpen },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Monitoring</h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Pantau kelengkapan data akademik berdasarkan data kelas, jadwal, dan course.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={loading}
          className="rounded-full bg-[#008994] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#007682] disabled:opacity-60 sm:text-sm"
        >
          {loading ? 'Memuat...' : 'Perbarui data'}
        </button>
      </div>

      <div className="flex overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xs">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-xl px-5 py-2 text-xs font-semibold transition-all sm:text-sm ${activeTab === tab ? 'bg-[#008994] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab !== 'Data Akademik' ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-xs">
          <h2 className="text-base font-bold text-slate-800">Data {activeTab} belum tersedia</h2>
        </div>
      ) : (
        <>
          {error && (
            <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <span>Gagal memuat data monitoring: {error}</span>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="font-semibold underline">Coba lagi</button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.title} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone === 'cyan' ? 'bg-cyan-50 text-cyan-600' : card.tone === 'blue' ? 'bg-blue-50 text-blue-600' : card.tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <span className="text-xs font-medium text-slate-400">{card.title}</span>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-slate-800">{loading ? '—' : card.value.toLocaleString('id-ID')}</div>
                  <p className="mt-1 text-[11px] text-slate-400">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              <select value={selectedTingkat} onChange={(event) => setSelectedTingkat(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 sm:text-sm">
                <option value="">Semua tingkat</option>
                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              <select value={selectedKelas} onChange={(event) => setSelectedKelas(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 sm:text-sm">
                <option value="">Semua kelas</option>
                {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <button type="button" onClick={downloadReport} disabled={loading || filteredClasses.length === 0} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:text-sm">
              <Download className="h-4 w-4" /> Unduh laporan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Kelengkapan Data Kelas</h2>
                  <p className="mt-0.5 text-xs text-slate-400">Pemeriksaan wali kelas dan jadwal pelajaran</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kelas atau wali..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#008994] focus:bg-white focus:outline-none sm:w-56" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 sm:text-sm">
                  <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr><th className="px-3 py-3">Kelas</th><th className="px-3 py-3">Wali kelas</th><th className="px-3 py-3">Siswa</th><th className="px-3 py-3">Jadwal</th><th className="px-3 py-3 text-right">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loading ? (
                      <tr><td colSpan="5" className="px-3 py-8 text-center text-slate-400">Memuat data kelas...</td></tr>
                    ) : filteredClasses.length === 0 ? (
                      <tr><td colSpan="5" className="px-3 py-8 text-center text-slate-400">Tidak ada data kelas yang cocok.</td></tr>
                    ) : filteredClasses.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-3 py-4 font-bold text-slate-800">{item.name}</td>
                        <td className="px-3 py-4 text-slate-500">{item.homeroomName}</td>
                        <td className="px-3 py-4">{item.studentCount}</td>
                        <td className="px-3 py-4">{item.scheduleCount}</td>
                        <td className="px-3 py-4 text-right"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === 'Lengkap' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">Menampilkan {loading ? 0 : filteredClasses.length} dari {loading ? 0 : monitoredClasses.length} kelas</div>
            </div>

            <div className="space-y-6">
              <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-800">Status Data Kelas</h3>
                <div className="flex items-center gap-5">
                  <div className="relative flex h-28 w-28 flex-shrink-0 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path className="stroke-slate-100" strokeWidth="3.8" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="stroke-cyan-500" strokeDasharray={`${loading ? 0 : completePercentage}, 100`} strokeWidth="3.8" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute text-center"><span className="block text-base font-bold leading-none text-slate-800">{loading ? '—' : `${completePercentage}%`}</span><span className="text-[10px] font-medium text-slate-400">lengkap</span></div>
                  </div>
                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Lengkap</span><b className="text-slate-800">{loading ? '—' : completeCount}</b></div>
                    <div className="flex justify-between"><span className="text-slate-500">Perlu ditinjau</span><b className="text-slate-800">{loading ? '—' : reviewCount}</b></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total kelas</span><b className="text-slate-800">{loading ? '—' : monitoredClasses.length}</b></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800">Perlu Tindakan</h3>
                  <span className="rounded-full bg-amber-100/70 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">{loading ? '—' : `${actions.length} ITEM`}</span>
                </div>
                {loading ? <p className="text-xs text-slate-400">Memuat pemeriksaan...</p> : actions.length === 0 ? <p className="text-xs text-slate-400">Tidak ada masalah kelengkapan data kelas yang terdeteksi.</p> : (
                  <div className="space-y-2.5">
                    {actions.map((action) => <div key={action.id} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-4 py-3 text-xs font-medium text-slate-700"><span className={`h-2 w-2 rounded-full ${action.dotColor}`} /><span>{action.text}</span></div>)}
                  </div>
                )}
                {!loading && reviewCount > 0 && <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">{reviewCount} dari {monitoredClasses.length} kelas memerlukan pemeriksaan data.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
