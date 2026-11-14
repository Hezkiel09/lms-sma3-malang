import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Upload,
  Download,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">

            <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">
                  ID/NIS
                </th>

                <th className="py-3 px-4">
                  NAMA SISWA
                </th>

                <th className="py-3 px-4">
                  KELAS
                </th>

                <th className="py-3 px-4">
                  ORANG TUA/WALI
                </th>

                <th className="py-3 px-4">
                  STATUS
                </th>

                <th className="py-3 px-4 text-right">
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">

              {/* Loading */}
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-slate-400"
                  >
                    Memuat data siswa...
                  </td>
                </tr>

              ) : filteredStudents.length === 0 ? (

                /* Empty */
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-slate-400"
                  >
                    Data siswa tidak ditemukan.
                  </td>
                </tr>

              ) : (

                /* Data */
                paginatedStudents.map((siswa) => (
                  <tr
                    key={siswa.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >

                    {/* NIS */}
                    <td className="py-4 px-4 text-slate-500">
                      {siswa.nis || '-'}
                    </td>

                    {/* Nama */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100/70 text-xs font-bold text-cyan-800">
                          {siswa.name
                            ?.charAt(0)
                            ?.toUpperCase() || '?'}
                        </div>

                        <span className="font-bold text-slate-800">
                          {siswa.name}
                        </span>

                      </div>
                    </td>

                    {/* Kelas */}
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {siswa.classes?.name || '-'}
                    </td>

                    {/* Orang Tua */}
                    <td className="py-4 px-4 text-slate-500">
                      {siswa.parents?.name || '-'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Aktif
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDetail(siswa)}
                        className="text-xs font-semibold text-[#008994] hover:text-[#00707a] transition-colors"
                      >
                        Detail ...
                      </button>
                    </td>

                  </tr>
                ))

              )}

            </tbody>
          </table>
        </div>

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
        {/* =========================
            MODAL DETAIL SISWA
        ========================= */}
        {showDetailModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Detail Siswa
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Informasi lengkap data siswa
                  </p>
                </div>

                <button
                  onClick={handleCloseDetail}
                  className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 px-6 py-6">

                <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-800">
                    {selectedStudent.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      {selectedStudent.name || '-'}
                    </h3>

                    <p className="text-xs text-slate-400">
                      NIS: {selectedStudent.nis || '-'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      NIS
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.nis || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Kelas
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.classes?.name || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Tingkat
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.classes?.level || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Jurusan
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.classes?.major || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Orang Tua/Wali
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.parents?.name || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      No. Telepon Wali
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedStudent.parents?.phone || '-'}
                    </p>
                  </div>

                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Email Akun
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {selectedStudent.users?.email || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Aktif
                  </span>
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                <button
                  onClick={handleCloseDetail}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>

                <button
                  onClick={() => handleEdit(selectedStudent)}
                  className="rounded-xl bg-[#008994] px-5 py-2 text-xs font-semibold text-white hover:bg-[#007682] transition-colors"
                >
                  Edit Data
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =========================
            MODAL EDIT SISWA
        ========================= */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Edit Data Siswa
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Perbarui data siswa, kelas, dan orang tua/wali
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={savingEdit}
                  className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEdit}>
                <div className="space-y-4 px-6 py-6">

                  {/* Nama Siswa */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Masukkan nama lengkap siswa"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                    />
                  </div>

                  {/* NIS */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                      NIS (Nomor Induk Siswa) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.nis}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, nis: e.target.value }))
                      }
                      placeholder="Masukkan NIS siswa"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                    />
                  </div>

                  {/* Dropdown Kelas */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                      Kelas
                    </label>
                    <div className="relative">
                      <select
                        value={editForm.class_id}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, class_id: e.target.value }))
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                      >
                        <option value="">-- Pilih Kelas (Opsional) --</option>
                        {availableClasses.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} {cls.major ? `(${cls.major})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Dropdown Orang Tua/Wali */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                      Orang Tua / Wali
                    </label>
                    <div className="relative">
                      <select
                        value={editForm.parent_id}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, parent_id: e.target.value }))
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                      >
                        <option value="">-- Pilih Orang Tua / Wali (Opsional) --</option>
                        {availableParents.map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            {parent.name} {parent.phone ? `(${parent.phone})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={savingEdit}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="rounded-xl bg-[#008994] px-5 py-2 text-xs font-semibold text-white hover:bg-[#007682] transition-colors disabled:opacity-50"
                  >
                    {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}