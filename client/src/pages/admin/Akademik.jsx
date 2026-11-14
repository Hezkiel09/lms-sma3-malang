import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import UserPagination from '../../components/admin/users/UserPagination';
import SubjectCardGrid from '../../components/admin/academic/SubjectCardGrid';
import SubjectFormModal from '../../components/admin/academic/SubjectFormModal';
import ScheduleTable from '../../components/admin/academic/ScheduleTable';
import ScheduleFormModal from '../../components/admin/academic/ScheduleFormModal';
import ClassTable from '../../components/admin/academic/ClassTable';
import ClassFormModal from '../../components/admin/academic/ClassFormModal';

export default function AkademikPage() {
  const [activeTab, setActiveTab] = useState('Mata Pelajaran');
  const tabs = ['Mata Pelajaran', 'Jadwal Pelajaran', 'Kelas'];

  // ==========================================
  // SHARED REFERENCE DATA
  // ==========================================
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const data = await apiFetch('/master/classes');
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data kelas:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await apiFetch('/master/users/teachers');
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data guru:', error);
    }
  };

  // ==========================================
  // 1. MATA PELAJARAN (CRUD)
  // ==========================================
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCurrentPage, setSubjectCurrentPage] = useState(1);
  const [subjectItemsPerPage, setSubjectItemsPerPage] = useState(9);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showSubjectAddModal, setShowSubjectAddModal] = useState(false);
  const [showSubjectEditModal, setShowSubjectEditModal] = useState(false);

  const [subjectForm, setSubjectForm] = useState({
    name: '',
  });
  const [savingSubject, setSavingSubject] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const data = await apiFetch('/master/academic/subjects');
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data mata pelajaran:', error);
      alert(error.message);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleOpenSubjectAdd = () => {
    setSubjectForm({ name: '' });
    setShowSubjectAddModal(true);
  };

  const handleCloseSubjectAdd = () => {
    setShowSubjectAddModal(false);
    setSubjectForm({ name: '' });
  };

  const handleSaveSubjectAdd = async (e) => {
    if (e) e.preventDefault();
    const cleanName = subjectForm.name.trim();

    if (!cleanName) {
      alert('Nama mata pelajaran wajib diisi!');
      return;
    }

    try {
      setSavingSubject(true);
      await apiFetch('/master/academic/subjects', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      alert('Mata pelajaran berhasil ditambahkan!');
      handleCloseSubjectAdd();
      await fetchSubjects();
    } catch (error) {
      console.error('Gagal menambahkan mata pelajaran:', error);
      alert(error.message);
    } finally {
      setSavingSubject(false);
    }
  };

  const handleOpenSubjectEdit = (mapel) => {
    setSelectedSubject(mapel);
    setSubjectForm({
      name: mapel.name || '',
    });
    setShowSubjectEditModal(true);
  };

  const handleCloseSubjectEdit = () => {
    setShowSubjectEditModal(false);
    setSelectedSubject(null);
  };

  const handleSaveSubjectEdit = async (e) => {
    if (e) e.preventDefault();
    const cleanName = subjectForm.name.trim();

    if (!cleanName) {
      alert('Nama mata pelajaran wajib diisi!');
      return;
    }

    try {
      setSavingSubject(true);
      await apiFetch(`/master/academic/subjects/${selectedSubject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      alert('Mata pelajaran berhasil diperbarui!');
      handleCloseSubjectEdit();
      await fetchSubjects();
    } catch (error) {
      console.error('Gagal memperbarui mata pelajaran:', error);
      alert(error.message);
    } finally {
      setSavingSubject(false);
    }
  };

  const handleDeleteSubject = async (mapel) => {
    if (!mapel) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus mata pelajaran "${mapel.name}"?\nJadwal pelajaran yang menggunakan mapel ini mungkin terpengaruh.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingSubjectId(mapel.id);
      await apiFetch(`/master/academic/subjects/${mapel.id}`, {
        method: 'DELETE',
      });

      alert('Mata pelajaran berhasil dihapus.');
      await fetchSubjects();
    } catch (error) {
      console.error('Gagal menghapus mata pelajaran:', error);
      alert(error.message);
    } finally {
      setDeletingSubjectId(null);
    }
  };

  // Filter & Pagination Mata Pelajaran
  const filteredSubjects = subjects.filter((s) => {
    const keyword = subjectSearch.toLowerCase();
    return (s.name || '').toLowerCase().includes(keyword);
  });

  const subjectTotalPages = Math.ceil(filteredSubjects.length / subjectItemsPerPage);
  const subjectStartIndex = (subjectCurrentPage - 1) * subjectItemsPerPage;
  const subjectEndIndex = subjectStartIndex + subjectItemsPerPage;
  const paginatedSubjects = filteredSubjects.slice(subjectStartIndex, subjectEndIndex);

  // ==========================================
  // 2. JADWAL PELAJARAN (CRUD)
  // ==========================================
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('Semua Kelas');
  const [selectedDayFilter, setSelectedDayFilter] = useState('Semua Hari');
  const [scheduleCurrentPage, setScheduleCurrentPage] = useState(1);
  const [scheduleItemsPerPage, setScheduleItemsPerPage] = useState(10);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScheduleAddModal, setShowScheduleAddModal] = useState(false);
  const [showScheduleEditModal, setShowScheduleEditModal] = useState(false);

  const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const [scheduleForm, setScheduleForm] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day: 'Senin',
    start_time: '07:30',
    end_time: '09:00',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const data = await apiFetch('/master/academic/schedules');
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data jadwal pelajaran:', error);
      alert(error.message);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleOpenScheduleAdd = () => {
    setScheduleForm({
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      teacher_id: teachers[0]?.id || '',
      day: 'Senin',
      start_time: '07:30',
      end_time: '09:00',
    });
    setShowScheduleAddModal(true);
  };

  const handleCloseScheduleAdd = () => {
    setShowScheduleAddModal(false);
  };

  const handleSaveScheduleAdd = async (e) => {
    if (e) e.preventDefault();
    const { class_id, subject_id, teacher_id, day, start_time, end_time } = scheduleForm;

    if (!class_id || !subject_id || !teacher_id || !day || !start_time || !end_time) {
      alert('Kelas, Mata Pelajaran, Guru Pengajar, Hari, Waktu Mulai, dan Waktu Selesai wajib diisi!');
      return;
    }

    if (start_time >= end_time) {
      alert('Waktu selesai harus lebih besar dari waktu mulai!');
      return;
    }

    try {
      setSavingSchedule(true);
      await apiFetch('/master/academic/schedules', {
        method: 'POST',
        body: JSON.stringify({
          class_id,
          subject_id,
          teacher_id,
          day,
          start_time,
          end_time,
        }),
      });

      alert('Jadwal pelajaran berhasil ditambahkan!');
      handleCloseScheduleAdd();
      await fetchSchedules();
    } catch (error) {
      console.error('Gagal menambahkan jadwal pelajaran:', error);
      alert(error.message);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleOpenScheduleEdit = (jadwal) => {
    setSelectedSchedule(jadwal);
    setScheduleForm({
      class_id: jadwal.class_id || jadwal.classes?.id || '',
      subject_id: jadwal.subject_id || jadwal.subjects?.id || '',
      teacher_id: jadwal.teacher_id || jadwal.teachers?.id || '',
      day: jadwal.day || 'Senin',
      start_time: jadwal.start_time?.slice(0, 5) || '07:30',
      end_time: jadwal.end_time?.slice(0, 5) || '09:00',
    });
    setShowScheduleEditModal(true);
  };

  const handleCloseScheduleEdit = () => {
    setShowScheduleEditModal(false);
    setSelectedSchedule(null);
  };

  const handleSaveScheduleEdit = async (e) => {
    if (e) e.preventDefault();
    const { class_id, subject_id, teacher_id, day, start_time, end_time } = scheduleForm;

    if (!class_id || !subject_id || !teacher_id || !day || !start_time || !end_time) {
      alert('Kelas, Mata Pelajaran, Guru Pengajar, Hari, Waktu Mulai, dan Waktu Selesai wajib diisi!');
      return;
    }

    if (start_time >= end_time) {
      alert('Waktu selesai harus lebih besar dari waktu mulai!');
      return;
    }

    try {
      setSavingSchedule(true);
      await apiFetch(`/master/academic/schedules/${selectedSchedule.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          class_id,
          subject_id,
          teacher_id,
          day,
          start_time,
          end_time,
        }),
      });

      alert('Jadwal pelajaran berhasil diperbarui!');
      handleCloseScheduleEdit();
      await fetchSchedules();
    } catch (error) {
      console.error('Gagal memperbarui jadwal pelajaran:', error);
      alert(error.message);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (jadwal) => {
    if (!jadwal) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus jadwal "${jadwal.subjects?.name || 'Mata Pelajaran'}" untuk ${jadwal.classes?.name || 'Kelas'} pada hari ${jadwal.day}?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingScheduleId(jadwal.id);
      await apiFetch(`/master/academic/schedules/${jadwal.id}`, {
        method: 'DELETE',
      });

      alert('Jadwal pelajaran berhasil dihapus.');
      await fetchSchedules();
    } catch (error) {
      console.error('Gagal menghapus jadwal pelajaran:', error);
      alert(error.message);
    } finally {
      setDeletingScheduleId(null);
    }
  };

  // Filter & Pagination Jadwal
  const filteredSchedules = schedules.filter((s) => {
    const matchClass = selectedClassFilter === 'Semua Kelas' || s.class_id === selectedClassFilter;
    const matchDay = selectedDayFilter === 'Semua Hari' || s.day === selectedDayFilter;
    const search = scheduleSearch.toLowerCase();
    const matchSearch =
      (s.subjects?.name || '').toLowerCase().includes(search) ||
      (s.teachers?.name || '').toLowerCase().includes(search) ||
      (s.classes?.name || '').toLowerCase().includes(search);

    return matchClass && matchDay && matchSearch;
  });

  const scheduleTotalPages = Math.ceil(filteredSchedules.length / scheduleItemsPerPage);
  const scheduleStartIndex = (scheduleCurrentPage - 1) * scheduleItemsPerPage;
  const scheduleEndIndex = scheduleStartIndex + scheduleItemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(scheduleStartIndex, scheduleEndIndex);

  // ==========================================
  // 3. KELAS (CRUD)
  // ==========================================
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [showClassAddModal, setShowClassAddModal] = useState(false);
  const [showClassEditModal, setShowClassEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classForm, setClassForm] = useState({
    name: '',
    level: 'X',
    major: 'MIPA',
    homeroom_teacher_id: '',
  });
  const [savingClass, setSavingClass] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState(null);

  const handleOpenClassAdd = () => {
    setClassForm({
      name: '',
      level: 'X',
      major: 'MIPA',
      homeroom_teacher_id: '',
    });
    setShowClassAddModal(true);
  };

  const handleCloseClassAdd = () => {
    setShowClassAddModal(false);
  };

  const handleSaveClassAdd = async (e) => {
    if (e) e.preventDefault();
    const cleanName = classForm.name.trim();
    if (!cleanName) {
      alert('Nama kelas wajib diisi!');
      return;
    }

    try {
      setSavingClass(true);
      await apiFetch('/master/classes', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          level: classForm.level || null,
          major: classForm.major || null,
          homeroom_teacher_id: classForm.homeroom_teacher_id || null,
        }),
      });

      alert('Kelas berhasil ditambahkan!');
      handleCloseClassAdd();
      await fetchClasses();
    } catch (error) {
      console.error('Gagal menambahkan kelas:', error);
      alert(error.message);
    } finally {
      setSavingClass(false);
    }
  };

  const handleOpenClassEdit = (cls) => {
    setSelectedClass(cls);
    setClassForm({
      name: cls.name || '',
      level: cls.level || 'X',
      major: cls.major || 'MIPA',
      homeroom_teacher_id: cls.homeroom_teacher_id || cls.teachers?.id || '',
    });
    setShowClassEditModal(true);
  };

  const handleCloseClassEdit = () => {
    setShowClassEditModal(false);
    setSelectedClass(null);
  };

  const handleSaveClassEdit = async (e) => {
    if (e) e.preventDefault();
    const cleanName = classForm.name.trim();
    if (!cleanName) {
      alert('Nama kelas wajib diisi!');
      return;
    }

    try {
      setSavingClass(true);
      await apiFetch(`/master/classes/${selectedClass.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: cleanName,
          level: classForm.level || null,
          major: classForm.major || null,
          homeroom_teacher_id: classForm.homeroom_teacher_id || null,
        }),
      });

      alert('Data kelas berhasil diperbarui!');
      handleCloseClassEdit();
      await fetchClasses();
    } catch (error) {
      console.error('Gagal memperbarui kelas:', error);
      alert(error.message);
    } finally {
      setSavingClass(false);
    }
  };

  const handleDeleteClass = async (cls) => {
    if (!cls) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus kelas "${cls.name}"?\nSiswa dan jadwal yang terhubung ke kelas ini mungkin terdampak.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingClassId(cls.id);
      await apiFetch(`/master/classes/${cls.id}`, {
        method: 'DELETE',
      });

      alert('Kelas berhasil dihapus.');
      await fetchClasses();
    } catch (error) {
      console.error('Gagal menghapus kelas:', error);
      alert(error.message);
    } finally {
      setDeletingClassId(null);
    }
  };

  // ==========================================
  // INITIAL FETCH
  // ==========================================
  useEffect(() => {
    fetchSubjects();
    fetchSchedules();
    fetchClasses();
    fetchTeachers();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Dynamic Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Akademik
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Kelola kurikulum mata pelajaran, kelas rombongan belajar, dan jadwal pelajaran sekolah.
          </p>
        </div>

        <div>
          {activeTab === 'Mata Pelajaran' && (
            <button
              onClick={handleOpenSubjectAdd}
              className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Mata Pelajaran</span>
            </button>
          )}

          {activeTab === 'Jadwal Pelajaran' && (
            <button
              onClick={handleOpenScheduleAdd}
              className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Jadwal</span>
            </button>
          )}

          {activeTab === 'Kelas' && (
            <button
              onClick={handleOpenClassAdd}
              className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Kelas</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tab Pills */}
      <div className="flex overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xs">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-[#008994] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MATA PELAJARAN (CRUD)
         ========================================================================= */}
      {activeTab === 'Mata Pelajaran' && (
        <div className="space-y-6">
          {/* KPI Cards Mata Pelajaran */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total Mata Pelajaran</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {subjects.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Status Kurikulum</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                Aktif
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total Kelas Terdaftar</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {classes.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Jadwal Terdaftar</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-[#008994]">
                {schedules.length}
              </div>
            </div>
          </div>

          {/* Search Bar Mapel */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={subjectSearch}
                onChange={(e) => {
                  setSubjectSearch(e.target.value);
                  setSubjectCurrentPage(1);
                }}
                placeholder="Cari nama mata pelajaran..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
              />
            </div>
            <span className="text-xs text-slate-400">
              Menampilkan {paginatedSubjects.length} dari {filteredSubjects.length} mata pelajaran
            </span>
          </div>

          {/* Reusable SubjectCardGrid */}
          <SubjectCardGrid
            subjects={paginatedSubjects}
            loading={loadingSubjects}
            onEdit={handleOpenSubjectEdit}
            onDelete={handleDeleteSubject}
            deletingId={deletingSubjectId}
          />

          {/* Reusable UserPagination */}
          <UserPagination
            currentPage={subjectCurrentPage}
            totalPages={subjectTotalPages}
            totalItems={filteredSubjects.length}
            startIndex={subjectStartIndex}
            endIndex={subjectEndIndex}
            itemsPerPage={subjectItemsPerPage}
            onPageChange={(page) => setSubjectCurrentPage(page)}
            onItemsPerPageChange={(limit) => {
              setSubjectItemsPerPage(limit);
              setSubjectCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: JADWAL PELAJARAN (CRUD)
         ========================================================================= */}
      {activeTab === 'Jadwal Pelajaran' && (
        <div className="space-y-6">
          {/* Controls: Search, Filter Kelas, Filter Hari */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={scheduleSearch}
                  onChange={(e) => {
                    setScheduleSearch(e.target.value);
                    setScheduleCurrentPage(1);
                  }}
                  placeholder="Cari mata pelajaran, guru pengajar, atau kelas..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filter Kelas */}
                <div className="relative">
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => {
                      setSelectedClassFilter(e.target.value);
                      setScheduleCurrentPage(1);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                  >
                    <option value="Semua Kelas">Semua Kelas</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>

                {/* Filter Hari */}
                <div className="relative">
                  <select
                    value={selectedDayFilter}
                    onChange={(e) => {
                      setSelectedDayFilter(e.target.value);
                      setScheduleCurrentPage(1);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                  >
                    <option value="Semua Hari">Semua Hari</option>
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Reusable ScheduleTable */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <ScheduleTable
              schedules={paginatedSchedules}
              loading={loadingSchedules}
              onEdit={handleOpenScheduleEdit}
              onDelete={handleDeleteSchedule}
              deletingId={deletingScheduleId}
            />

            {/* Pagination Jadwal */}
            <UserPagination
              currentPage={scheduleCurrentPage}
              totalPages={scheduleTotalPages}
              totalItems={filteredSchedules.length}
              startIndex={scheduleStartIndex}
              endIndex={scheduleEndIndex}
              itemsPerPage={scheduleItemsPerPage}
              onPageChange={(page) => setScheduleCurrentPage(page)}
              onItemsPerPageChange={(limit) => {
                setScheduleItemsPerPage(limit);
                setScheduleCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: KELAS (CRUD KELAS)
         ========================================================================= */}
      {activeTab === 'Kelas' && (
        <div className="space-y-6">
          <ClassTable
            classes={classes}
            loading={loadingClasses}
            onEdit={handleOpenClassEdit}
            onDelete={handleDeleteClass}
            deletingId={deletingClassId}
          />
        </div>
      )}

      {/* =========================================================================
          MODALS — REUSABLE SubjectFormModal, ScheduleFormModal, & ClassFormModal
         ========================================================================= */}
      {/* Tambah Mata Pelajaran */}
      <SubjectFormModal
        isOpen={showSubjectAddModal}
        isEdit={false}
        form={subjectForm}
        setForm={setSubjectForm}
        onClose={handleCloseSubjectAdd}
        onSubmit={handleSaveSubjectAdd}
        saving={savingSubject}
      />

      {/* Edit Mata Pelajaran */}
      <SubjectFormModal
        isOpen={showSubjectEditModal}
        isEdit={true}
        form={subjectForm}
        setForm={setSubjectForm}
        onClose={handleCloseSubjectEdit}
        onSubmit={handleSaveSubjectEdit}
        saving={savingSubject}
      />

      {/* Tambah Jadwal Pelajaran */}
      <ScheduleFormModal
        isOpen={showScheduleAddModal}
        isEdit={false}
        form={scheduleForm}
        setForm={setScheduleForm}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        daysList={daysList}
        onClose={handleCloseScheduleAdd}
        onSubmit={handleSaveScheduleAdd}
        saving={savingSchedule}
      />

      {/* Edit Jadwal Pelajaran */}
      <ScheduleFormModal
        isOpen={showScheduleEditModal}
        isEdit={true}
        form={scheduleForm}
        setForm={setScheduleForm}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        daysList={daysList}
        onClose={handleCloseScheduleEdit}
        onSubmit={handleSaveScheduleEdit}
        saving={savingSchedule}
      />

      {/* Tambah Kelas */}
      <ClassFormModal
        isOpen={showClassAddModal}
        isEdit={false}
        form={classForm}
        setForm={setClassForm}
        teachers={teachers}
        onClose={handleCloseClassAdd}
        onSubmit={handleSaveClassAdd}
        saving={savingClass}
      />

      {/* Edit Kelas */}
      <ClassFormModal
        isOpen={showClassEditModal}
        isEdit={true}
        form={classForm}
        setForm={setClassForm}
        teachers={teachers}
        onClose={handleCloseClassEdit}
        onSubmit={handleSaveClassEdit}
        saving={savingClass}
      />
    </div>
  );
}
