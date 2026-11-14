import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Upload,
  Download,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import StudentTable from '../../components/admin/users/StudentTable';
import StudentDetailModal from '../../components/admin/users/StudentDetailModal';
import StudentEditModal from '../../components/admin/users/StudentEditModal';
import StudentAddModal from '../../components/admin/users/StudentAddModal';

export default function PenggunaPage() {
  const [activeTab, setActiveTab] = useState('Siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua kelas');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    nis: '',
    class_id: '',
    parent_id: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    nis: '',
    email: '',
    password: '',
    class_id: '',
  });
  const [savingAdd, setSavingAdd] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableParents, setAvailableParents] = useState([]);

  // =========================
  // DATA SISWA
  // =========================
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);


  // =========================
  // PAGINATION
  // =========================
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    'Siswa',
    'Orang Tua/Wali',
    'Guru',
    'Akun Pengguna',
  ];

  // =========================
  // GET DATA SISWA
  // =========================
  // GET DATA SISWA, KELAS, WALI
  // =========================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/master/users/students');
      setStudents(data);
    } catch (error) {
      console.error('Gagal mengambil data siswa:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await apiFetch('/master/classes');
      setAvailableClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data kelas:', error);
    }
  };

  const fetchParents = async () => {
    try {
      const data = await apiFetch('/master/users/parents');
      setAvailableParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data orang tua:', error);
    }
  };

  const handleDetail = (siswa) => {
    setSelectedStudent(siswa);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedStudent(null);
    setShowDetailModal(false);
  };

  const handleEdit = (siswa) => {
    setSelectedStudent(siswa);

    setEditForm({
      name: siswa.name || '',
      nis: siswa.nis || '',
      class_id: siswa.class_id || siswa.classes?.id || '',
      parent_id: siswa.parent_id || siswa.parents?.id || '',
    });

    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();

    if (!editForm.name.trim() || !editForm.nis.trim()) {
      alert('Nama dan NIS wajib diisi!');
      return;
    }

    try {
      setSavingEdit(true);

      await apiFetch(`/master/users/students/${selectedStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name.trim(),
          nis: editForm.nis.trim(),
          class_id: editForm.class_id || null,
          parent_id: editForm.parent_id || null,
        }),
      });

      alert('Data siswa berhasil diperbarui.');

      setShowEditModal(false);
      setSelectedStudent(null);

      await fetchStudents();
    } catch (error) {
      console.error('Gagal memperbarui data siswa:', error);
      alert(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (siswa) => {
    if (!siswa) return;

    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data siswa "${siswa.name}" (NIS: ${siswa.nis})?\nData akun terkait juga akan dihapus permanen.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingStudent(true);

      await apiFetch(`/master/users/students/${siswa.id}`, {
        method: 'DELETE',
      });

      alert('Data siswa berhasil dihapus.');

      setShowDetailModal(false);
      setSelectedStudent(null);

      await fetchStudents();
    } catch (error) {
      console.error('Gagal menghapus data siswa:', error);
      alert(error.message);
    } finally {
      setDeletingStudent(false);
    }
  };

  const handleOpenAdd = () => {
    setAddForm({
      name: '',
      nis: '',
      email: '',
      password: '',
      class_id: '',
    });
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
    setAddForm({
      name: '',
      nis: '',
      email: '',
      password: '',
      class_id: '',
    });
  };

  const handleSaveAdd = async (e) => {
    if (e) e.preventDefault();

    const cleanName = addForm.name.trim();
    const cleanNis = addForm.nis.trim();
    const cleanEmail = addForm.email.trim();
    const password = addForm.password;
    const classId = addForm.class_id;

    if (!cleanName || !cleanNis || !cleanEmail || !password) {
      alert('Nama, NIS, Email, dan Password wajib diisi!');
      return;
    }

    if (cleanNis.length < 5 || cleanNis.length > 10) {
      alert('NIS harus berupa 5 - 10 digit angka!');
      return;
    }

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(cleanEmail)) {
      alert('Format email tidak valid! Contoh: siswa@sman3malang.sch.id');
      return;
    }

    if (password.length < 6 || password.length > 50) {
      alert('Password harus antara 6 - 50 karakter!');
      return;
    }

    if (!classId) {
      alert('Silakan pilih kelas terlebih dahulu!');
      return;
    }

    try {
      setSavingAdd(true);

      await apiFetch('/master/users/students', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          nis: cleanNis,
          email: cleanEmail,
          password: password,
          class_id: classId,
        }),
      });

      alert('Siswa baru berhasil ditambahkan!');

      setShowAddModal(false);
      setAddForm({
        name: '',
        nis: '',
        email: '',
        password: '',
        class_id: '',
      });

      await fetchStudents();
    } catch (error) {
      console.error('Gagal menambahkan siswa:', error);
      alert(error.message);
    } finally {
      setSavingAdd(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchParents();
  }, []);

  // =========================
  // FILTER DATA
  // =========================
  const filteredStudents = students.filter((siswa) => {
    const keyword = searchQuery.toLowerCase();

    const matchSearch =
      siswa.name?.toLowerCase().includes(keyword) ||
      siswa.nis?.toLowerCase().includes(keyword);

    const matchClass =
      selectedClass === 'Semua kelas' ||
      siswa.classes?.name === selectedClass;

    return matchSearch && matchClass;
  });

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(
    filteredStudents.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedStudents =
    filteredStudents.slice(
      startIndex,
      endIndex
    );

  // =========================
  // DAFTAR KELAS
  // =========================
  const classOptions = [
    'Semua kelas',
    ...new Set(
      students
        .map((siswa) => siswa.classes?.name)
        .filter(Boolean)
    ),
  ];

  const classDropdownList = availableClasses.length > 0
    ? availableClasses
    : Array.from(
        new Map(
          students
            .filter((s) => s.classes?.id && s.classes?.name)
            .map((s) => [s.classes.id, s.classes])
        ).values()
      ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* =========================
          1. HEADER
      ========================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Data Pengguna
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Kelola data siswa, orang tua/wali, guru, dan akses akun dalam satu tempat.
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* =========================
          2. TABS
      ========================= */}
      <div className="flex overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xs">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${activeTab === tab
                ? 'bg-[#008994] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* =========================
          3. KPI
      ========================= */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

        {/* Total Data */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">
            Total data
          </span>

          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {students.length}
          </div>
        </div>

        {/* Akun Aktif */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">
            Akun aktif
          </span>

          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {students.length}
          </div>
        </div>

        {/* Perlu Dilengkapi */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">
            Perlu dilengkapi
          </span>

          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600">
            {students.filter(
              (siswa) =>
                !siswa.classes ||
                !siswa.parents ||
                !siswa.users?.email
            ).length}
          </div>
        </div>

      </div>

      {/* =========================
          4. TABLE CONTAINER
      ========================= */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">

        {/* =========================
            SEARCH + FILTER
        ========================= */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Cari data siswa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            />
          </div>

          {/* Right Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Filter Kelas */}
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#008994]"
              >
                {classOptions.map((kelas) => (
                  <option
                    key={kelas}
                    value={kelas}
                  >
                    {kelas}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Import */}
            <button
              className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Impor PDF/Dokumen</span>
            </button>

            {/* Export */}
            <button
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Ekspor
            </button>

          </div>
        </div>

        {/* =========================
            TABLE
        ========================= */}
        <StudentTable
          students={paginatedStudents}
          loading={loading}
          onDetail={handleDetail}
        />

        {/* =========================
            FOOTER PAGINATION
        ========================= */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">

          {/* Info + Items Per Page */}
          <div className="flex items-center gap-2">

            <span>
              Menampilkan{' '}
              {filteredStudents.length === 0
                ? 0
                : startIndex + 1}
              -
              {Math.min(
                endIndex,
                filteredStudents.length
              )}
              {' '}dari{' '}
              {filteredStudents.length}
              {' '}data
            </span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(
                  Number(e.target.value)
                );
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:border-[#008994]"
            >
              <option value={10}>
                10
              </option>

              <option value={20}>
                20
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>
            </select>

            <span>
              per halaman
            </span>

          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1.5">

            {/* Previous */}
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  (prev) => prev - 1
                )
              }
              className={`rounded-xl border px-3 py-1.5 font-medium ${currentPage === 1
                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              Sebelumnya
            </button>

            {/* Page Numbers */}
            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() =>
                  setCurrentPage(page)
                }
                className={`h-8 w-8 rounded-xl font-bold ${currentPage === page
                  ? 'bg-[#008994] text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(
                  (prev) => prev + 1
                )
              }
              className={`rounded-xl border px-3 py-1.5 font-medium ${currentPage === totalPages ||
                totalPages === 0
                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              Berikutnya
            </button>

          </div>

        </div>

      </div>

      {/* =========================
          MODALS
      ========================= */}
      <StudentDetailModal
        isOpen={showDetailModal}
        student={selectedStudent}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleting={deletingStudent}
      />

      <StudentEditModal
        isOpen={showEditModal}
        student={selectedStudent}
        editForm={editForm}
        setEditForm={setEditForm}
        onClose={handleCloseEdit}
        onSubmit={handleSaveEdit}
        saving={savingEdit}
        classes={classDropdownList}
        parents={availableParents}
      />

      <StudentAddModal
        isOpen={showAddModal}
        addForm={addForm}
        setAddForm={setAddForm}
        onClose={handleCloseAdd}
        onSubmit={handleSaveAdd}
        saving={savingAdd}
        classes={classDropdownList}
      />
    </div>
  );
}