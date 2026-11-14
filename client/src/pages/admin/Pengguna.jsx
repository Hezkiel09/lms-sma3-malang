import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Upload,
  Download,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import UserTable from '../../components/admin/users/UserTable';
import UserPagination from '../../components/admin/users/UserPagination';
import UserDetailModal from '../../components/admin/users/UserDetailModal';
import UserFormModal from '../../components/admin/users/UserFormModal';

export default function PenggunaPage() {
  const [activeTab, setActiveTab] = useState('Siswa');
  const tabs = ['Siswa', 'Guru', 'Orang Tua/Wali', 'Akun Pengguna'];

  // ==========================================
  // SHARED REFERENCE DATA (KELAS)
  // ==========================================
  const [availableClasses, setAvailableClasses] = useState([]);

  const fetchClasses = async () => {
    try {
      const data = await apiFetch('/master/classes');
      setAvailableClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data kelas:', error);
    }
  };

  // ==========================================
  // 1. DATA SISWA
  // ==========================================
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua kelas');
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [studentItemsPerPage, setStudentItemsPerPage] = useState(10);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showStudentEditModal, setShowStudentEditModal] = useState(false);
  const [studentEditForm, setStudentEditForm] = useState({
    name: '',
    nis: '',
    class_id: '',
    parent_id: '',
  });
  const [savingStudentEdit, setSavingStudentEdit] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);

  const [showStudentAddModal, setShowStudentAddModal] = useState(false);
  const [studentAddForm, setStudentAddForm] = useState({
    name: '',
    nis: '',
    email: '',
    password: '',
    class_id: '',
  });
  const [savingStudentAdd, setSavingStudentAdd] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await apiFetch('/master/users/students');
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data siswa:', error);
      alert(error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Siswa Handlers
  const handleStudentDetail = (siswa) => {
    setSelectedStudent(siswa);
    setShowStudentDetailModal(true);
  };

  const handleCloseStudentDetail = () => {
    setSelectedStudent(null);
    setShowStudentDetailModal(false);
  };

  const handleOpenStudentEdit = (siswa) => {
    setSelectedStudent(siswa);
    setStudentEditForm({
      name: siswa.name || '',
      nis: siswa.nis || '',
      class_id: siswa.class_id || siswa.classes?.id || '',
      parent_id: siswa.parent_id || siswa.parents?.id || '',
    });
    setShowStudentDetailModal(false);
    setShowStudentEditModal(true);
  };

  const handleCloseStudentEdit = () => {
    setShowStudentEditModal(false);
    setSelectedStudent(null);
  };

  const handleSaveStudentEdit = async (e) => {
    if (e) e.preventDefault();
    if (!studentEditForm.name.trim() || !studentEditForm.nis.trim()) {
      alert('Nama dan NIS wajib diisi!');
      return;
    }

    try {
      setSavingStudentEdit(true);
      await apiFetch(`/master/users/students/${selectedStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: studentEditForm.name.trim(),
          nis: studentEditForm.nis.trim(),
          class_id: studentEditForm.class_id || null,
          parent_id: studentEditForm.parent_id || null,
        }),
      });

      alert('Data siswa berhasil diperbarui.');
      setShowStudentEditModal(false);
      setSelectedStudent(null);
      await fetchStudents();
    } catch (error) {
      console.error('Gagal memperbarui data siswa:', error);
      alert(error.message);
    } finally {
      setSavingStudentEdit(false);
    }
  };

  const handleDeleteStudent = async (siswa) => {
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
      setShowStudentDetailModal(false);
      setSelectedStudent(null);
      await fetchStudents();
    } catch (error) {
      console.error('Gagal menghapus data siswa:', error);
      alert(error.message);
    } finally {
      setDeletingStudent(false);
    }
  };

  const handleOpenStudentAdd = () => {
    setStudentAddForm({
      name: '',
      nis: '',
      email: '',
      password: '',
      class_id: '',
    });
    setShowStudentAddModal(true);
  };

  const handleCloseStudentAdd = () => {
    setShowStudentAddModal(false);
    setStudentAddForm({
      name: '',
      nis: '',
      email: '',
      password: '',
      class_id: '',
    });
  };

  const handleSaveStudentAdd = async (e) => {
    if (e) e.preventDefault();

    const cleanName = studentAddForm.name.trim();
    const cleanNis = studentAddForm.nis.trim();
    const cleanEmail = studentAddForm.email.trim();
    const password = studentAddForm.password;
    const classId = studentAddForm.class_id;

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
      setSavingStudentAdd(true);
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
      setShowStudentAddModal(false);
      setStudentAddForm({
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
      setSavingStudentAdd(false);
    }
  };

  // Siswa Filter & Pagination
  const filteredStudents = students.filter((siswa) => {
    const keyword = studentSearchQuery.toLowerCase();
    const matchSearch =
      (siswa.name || '').toLowerCase().includes(keyword) ||
      (siswa.nis || '').toLowerCase().includes(keyword);

    const matchClass =
      selectedClass === 'Semua kelas' ||
      siswa.classes?.name === selectedClass;

    return matchSearch && matchClass;
  });

  const studentTotalPages = Math.ceil(filteredStudents.length / studentItemsPerPage);
  const studentStartIndex = (studentCurrentPage - 1) * studentItemsPerPage;
  const studentEndIndex = studentStartIndex + studentItemsPerPage;
  const paginatedStudents = filteredStudents.slice(studentStartIndex, studentEndIndex);

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

  // Siswa Table Columns
  const studentColumns = [
    {
      header: 'ID/NIS',
      key: 'nis',
    },
    {
      header: 'NAMA SISWA',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100/70 text-xs font-bold text-cyan-800">
            {row.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="font-bold text-slate-800">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'KELAS',
      render: (row) => row.classes?.name || '-',
    },
    {
      header: 'ORANG TUA/WALI',
      render: (row) => row.parents?.name || '-',
    },
    {
      header: 'STATUS',
      render: () => (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          Aktif
        </span>
      ),
    },
  ];

  // Siswa Detail Fields
  const studentDetailFields = selectedStudent
    ? [
        { label: 'NIS', value: selectedStudent.nis || '-' },
        { label: 'Kelas', value: selectedStudent.classes?.name || '-' },
        { label: 'Tingkat', value: selectedStudent.classes?.level || '-' },
        { label: 'Jurusan', value: selectedStudent.classes?.major || '-' },
        { label: 'Orang Tua/Wali', value: selectedStudent.parents?.name || '-' },
        { label: 'No. Telepon Wali', value: selectedStudent.parents?.phone || '-' },
        { label: 'Email Akun', value: selectedStudent.users?.email || '-', fullWidth: true },
        { label: 'Status', value: 'Aktif', isBadge: true },
      ]
    : [];

  // ==========================================
  // 2. DATA GURU
  // ==========================================
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1);
  const [teacherItemsPerPage, setTeacherItemsPerPage] = useState(10);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherDetailModal, setShowTeacherDetailModal] = useState(false);
  const [showTeacherEditModal, setShowTeacherEditModal] = useState(false);
  const [teacherEditForm, setTeacherEditForm] = useState({
    name: '',
    nip: '',
    phone: '',
  });
  const [savingTeacherEdit, setSavingTeacherEdit] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState(false);

  const [showTeacherAddModal, setShowTeacherAddModal] = useState(false);
  const [teacherAddForm, setTeacherAddForm] = useState({
    name: '',
    nip: '',
    email: '',
    password: '',
    phone: '',
  });
  const [savingTeacherAdd, setSavingTeacherAdd] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const data = await apiFetch('/master/users/teachers');
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data guru:', error);
      alert(error.message);
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Guru Handlers
  const handleTeacherDetail = (guru) => {
    setSelectedTeacher(guru);
    setShowTeacherDetailModal(true);
  };

  const handleCloseTeacherDetail = () => {
    setSelectedTeacher(null);
    setShowTeacherDetailModal(false);
  };

  const handleOpenTeacherEdit = (guru) => {
    setSelectedTeacher(guru);
    setTeacherEditForm({
      name: guru.name || '',
      nip: guru.nip || '',
      phone: guru.phone || '',
    });
    setShowTeacherDetailModal(false);
    setShowTeacherEditModal(true);
  };

  const handleCloseTeacherEdit = () => {
    setShowTeacherEditModal(false);
    setSelectedTeacher(null);
  };

  const handleSaveTeacherEdit = async (e) => {
    if (e) e.preventDefault();
    if (!teacherEditForm.name.trim() || !teacherEditForm.nip.trim()) {
      alert('Nama dan NIP wajib diisi!');
      return;
    }

    try {
      setSavingTeacherEdit(true);
      await apiFetch(`/master/users/teachers/${selectedTeacher.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: teacherEditForm.name.trim(),
          nip: teacherEditForm.nip.trim(),
          phone: teacherEditForm.phone.trim() || null,
        }),
      });

      alert('Data guru berhasil diperbarui.');
      setShowTeacherEditModal(false);
      setSelectedTeacher(null);
      await fetchTeachers();
    } catch (error) {
      console.error('Gagal memperbarui data guru:', error);
      alert(error.message);
    } finally {
      setSavingTeacherEdit(false);
    }
  };

  const handleDeleteTeacher = async (guru) => {
    if (!guru) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data guru "${guru.name}" (NIP: ${guru.nip || '-'})?\nData akun terkait juga akan dihapus permanen.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingTeacher(true);
      await apiFetch(`/master/users/teachers/${guru.id}`, {
        method: 'DELETE',
      });

      alert('Data guru berhasil dihapus.');
      setShowTeacherDetailModal(false);
      setSelectedTeacher(null);
      await fetchTeachers();
    } catch (error) {
      console.error('Gagal menghapus data guru:', error);
      alert(error.message);
    } finally {
      setDeletingTeacher(false);
    }
  };

  const handleOpenTeacherAdd = () => {
    setTeacherAddForm({
      name: '',
      nip: '',
      email: '',
      password: '',
      phone: '',
    });
    setShowTeacherAddModal(true);
  };

  const handleCloseTeacherAdd = () => {
    setShowTeacherAddModal(false);
    setTeacherAddForm({
      name: '',
      nip: '',
      email: '',
      password: '',
      phone: '',
    });
  };

  const handleSaveTeacherAdd = async (e) => {
    if (e) e.preventDefault();

    const cleanName = teacherAddForm.name.trim();
    const cleanNip = teacherAddForm.nip.trim();
    const cleanEmail = teacherAddForm.email.trim();
    const password = teacherAddForm.password;
    const cleanPhone = teacherAddForm.phone.trim();

    if (!cleanName || !cleanNip || !cleanEmail || !password) {
      alert('Nama, NIP, Email, dan Password wajib diisi!');
      return;
    }

    if (cleanNip.length < 5 || cleanNip.length > 20) {
      alert('NIP harus antara 5 - 20 digit angka!');
      return;
    }

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(cleanEmail)) {
      alert('Format email tidak valid! Contoh: guru@sman3malang.sch.id');
      return;
    }

    if (password.length < 6 || password.length > 50) {
      alert('Password harus antara 6 - 50 karakter!');
      return;
    }

    try {
      setSavingTeacherAdd(true);
      await apiFetch('/master/users/teachers', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          nip: cleanNip,
          email: cleanEmail,
          password: password,
          phone: cleanPhone || null,
        }),
      });

      alert('Guru baru berhasil didaftarkan!');
      setShowTeacherAddModal(false);
      setTeacherAddForm({
        name: '',
        nip: '',
        email: '',
        password: '',
        phone: '',
      });

      await fetchTeachers();
    } catch (error) {
      console.error('Gagal menambahkan guru:', error);
      alert(error.message);
    } finally {
      setSavingTeacherAdd(false);
    }
  };

  // Guru Filter & Pagination
  const filteredTeachers = teachers.filter((guru) => {
    const keyword = teacherSearchQuery.toLowerCase();
    return (
      (guru.name || '').toLowerCase().includes(keyword) ||
      (guru.nip || '').toLowerCase().includes(keyword) ||
      (guru.phone || '').toLowerCase().includes(keyword) ||
      (guru.users?.email || '').toLowerCase().includes(keyword)
    );
  });

  const teacherTotalPages = Math.ceil(filteredTeachers.length / teacherItemsPerPage);
  const teacherStartIndex = (teacherCurrentPage - 1) * teacherItemsPerPage;
  const teacherEndIndex = teacherStartIndex + teacherItemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(teacherStartIndex, teacherEndIndex);

  // Guru Table Columns
  const teacherColumns = [
    {
      header: 'ID/NIP',
      key: 'nip',
    },
    {
      header: 'NAMA GURU',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100/80 text-xs font-bold text-emerald-800">
            {row.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="font-bold text-slate-800">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'NO. TELEPON',
      render: (row) => row.phone || '-',
    },
    {
      header: 'EMAIL AKUN',
      render: (row) => row.users?.email || '-',
    },
    {
      header: 'STATUS',
      render: () => (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          Aktif
        </span>
      ),
    },
  ];

  // Guru Detail Fields
  const teacherDetailFields = selectedTeacher
    ? [
        { label: 'NIP', value: selectedTeacher.nip || '-' },
        { label: 'No. Telepon', value: selectedTeacher.phone || '-' },
        { label: 'Email Akun', value: selectedTeacher.users?.email || '-', fullWidth: true },
        { label: 'Peran Akun', value: 'Tenaga Pendidik / Guru' },
        { label: 'Status Akun', value: 'Aktif', isBadge: true },
      ]
    : [];

  // ==========================================
  // 3. DATA ORANG TUA / WALI
  // ==========================================
  const [parents, setParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [parentCurrentPage, setParentCurrentPage] = useState(1);
  const [parentItemsPerPage, setParentItemsPerPage] = useState(10);

  const [selectedParent, setSelectedParent] = useState(null);
  const [showParentDetailModal, setShowParentDetailModal] = useState(false);
  const [showParentEditModal, setShowParentEditModal] = useState(false);
  const [parentEditForm, setParentEditForm] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [savingParentEdit, setSavingParentEdit] = useState(false);
  const [deletingParent, setDeletingParent] = useState(false);

  const [showParentAddModal, setShowParentAddModal] = useState(false);
  const [parentAddForm, setParentAddForm] = useState({
    name: '',
    nis: '',
    password: '',
    phone: '',
  });
  const [savingParentAdd, setSavingParentAdd] = useState(false);

  const fetchParents = async () => {
    try {
      setLoadingParents(true);
      const data = await apiFetch('/master/users/parents');
      setParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil data orang tua:', error);
      alert(error.message);
    } finally {
      setLoadingParents(false);
    }
  };

  // Parent Handlers
  const handleParentDetail = (parent) => {
    setSelectedParent(parent);
    setShowParentDetailModal(true);
  };

  const handleCloseParentDetail = () => {
    setSelectedParent(null);
    setShowParentDetailModal(false);
  };

  const handleOpenParentEdit = (parent) => {
    setSelectedParent(parent);
    setParentEditForm({
      name: parent.name || '',
      phone: parent.phone || '',
      address: parent.address || '',
    });
    setShowParentDetailModal(false);
    setShowParentEditModal(true);
  };

  const handleCloseParentEdit = () => {
    setShowParentEditModal(false);
    setSelectedParent(null);
  };

  const handleSaveParentEdit = async (e) => {
    if (e) e.preventDefault();
    if (!parentEditForm.name.trim()) {
      alert('Nama orang tua/wali wajib diisi!');
      return;
    }

    try {
      setSavingParentEdit(true);
      await apiFetch(`/master/users/parents/${selectedParent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: parentEditForm.name.trim(),
          phone: parentEditForm.phone.trim() || null,
          address: parentEditForm.address.trim() || null,
        }),
      });

      alert('Data orang tua/wali berhasil diperbarui.');
      setShowParentEditModal(false);
      setSelectedParent(null);
      await fetchParents();
      await fetchStudents();
    } catch (error) {
      console.error('Gagal memperbarui data orang tua:', error);
      alert(error.message);
    } finally {
      setSavingParentEdit(false);
    }
  };

  const handleDeleteParent = async (parent) => {
    if (!parent) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data wali "${parent.name}"?\nData akun terkait juga akan dihapus permanen.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingParent(true);
      await apiFetch(`/master/users/parents/${parent.id}`, {
        method: 'DELETE',
      });

      alert('Data orang tua/wali berhasil dihapus.');
      setShowParentDetailModal(false);
      setSelectedParent(null);
      await fetchParents();
      await fetchStudents();
    } catch (error) {
      console.error('Gagal menghapus data orang tua:', error);
      alert(error.message);
    } finally {
      setDeletingParent(false);
    }
  };

  const handleOpenParentAdd = () => {
    setParentAddForm({
      name: '',
      nis: '',
      password: '',
      phone: '',
    });
    setShowParentAddModal(true);
  };

  const handleCloseParentAdd = () => {
    setShowParentAddModal(false);
    setParentAddForm({
      name: '',
      nis: '',
      password: '',
      phone: '',
    });
  };

  const handleSaveParentAdd = async (e) => {
    if (e) e.preventDefault();

    const cleanName = parentAddForm.name.trim();
    const cleanNis = parentAddForm.nis.trim();
    const password = parentAddForm.password;
    const cleanPhone = parentAddForm.phone.trim();

    if (!cleanName || !cleanNis || !password) {
      alert('Nama wali, NIS anak, dan Password wajib diisi!');
      return;
    }

    if (cleanNis.length < 5 || cleanNis.length > 10) {
      alert('NIS anak harus berupa 5 - 10 digit angka!');
      return;
    }

    if (password.length < 6 || password.length > 50) {
      alert('Password harus antara 6 - 50 karakter!');
      return;
    }

    try {
      setSavingParentAdd(true);
      await apiFetch('/master/users/parents', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          nis: cleanNis,
          password: password,
          phone: cleanPhone || null,
        }),
      });

      alert('Data orang tua/wali baru berhasil ditambahkan!');
      setShowParentAddModal(false);
      setParentAddForm({
        name: '',
        nis: '',
        password: '',
        phone: '',
      });

      await fetchParents();
      await fetchStudents();
    } catch (error) {
      console.error('Gagal menambahkan orang tua/wali:', error);
      alert(error.message);
    } finally {
      setSavingParentAdd(false);
    }
  };

  // Parent Filter & Pagination
  const filteredParents = parents.filter((parent) => {
    const keyword = parentSearchQuery.toLowerCase();
    const studentInfo = Array.isArray(parent.students)
      ? parent.students.map((s) => `${s.name} ${s.nis}`).join(' ')
      : parent.students?.name || '';

    return (
      (parent.name || '').toLowerCase().includes(keyword) ||
      (parent.phone || '').toLowerCase().includes(keyword) ||
      (parent.nis || '').toLowerCase().includes(keyword) ||
      (parent.address || '').toLowerCase().includes(keyword) ||
      (parent.users?.email || '').toLowerCase().includes(keyword) ||
      studentInfo.toLowerCase().includes(keyword)
    );
  });

  const parentTotalPages = Math.ceil(filteredParents.length / parentItemsPerPage);
  const parentStartIndex = (parentCurrentPage - 1) * parentItemsPerPage;
  const parentEndIndex = parentStartIndex + parentItemsPerPage;
  const paginatedParents = filteredParents.slice(parentStartIndex, parentEndIndex);

  // Parent Table Columns
  const parentColumns = [
    {
      header: 'NAMA WALI',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/80 text-xs font-bold text-amber-800">
            {row.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="font-bold text-slate-800">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'NO. TELEPON',
      render: (row) => row.phone || '-',
    },
    {
      header: 'SISWA ASUH / NIS',
      render: (row) => {
        if (Array.isArray(row.students) && row.students.length > 0) {
          return row.students.map((s) => `${s.name} (${s.classes?.name || s.nis || '-'})`).join(', ');
        }
        if (row.students && typeof row.students === 'object' && row.students.name) {
          return `${row.students.name} (${row.students.classes?.name || row.students.nis || '-'})`;
        }
        return row.nis ? `NIS: ${row.nis}` : '-';
      },
    },
    {
      header: 'EMAIL AKUN',
      render: (row) => row.users?.email || (row.nis ? `ortu.${row.nis}@sman3malang.sch.id` : '-'),
    },
    {
      header: 'STATUS',
      render: () => (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          Aktif
        </span>
      ),
    },
  ];

  // Parent Detail Fields
  const parentDetailFields = selectedParent
    ? [
        { label: 'Nama Lengkap Wali', value: selectedParent.name || '-' },
        { label: 'NIS Anak Asuh', value: selectedParent.nis || '-' },
        {
          label: 'Siswa Asuh',
          value: (() => {
            if (Array.isArray(selectedParent.students) && selectedParent.students.length > 0) {
              return selectedParent.students.map((s) => `${s.name} (${s.classes?.name || s.nis || '-'})`).join(', ');
            }
            if (selectedParent.students && typeof selectedParent.students === 'object' && selectedParent.students.name) {
              return `${selectedParent.students.name} (${selectedParent.students.classes?.name || selectedParent.students.nis || '-'})`;
            }
            return selectedParent.nis ? `NIS: ${selectedParent.nis}` : '-';
          })(),
        },
        { label: 'No. Telepon / WhatsApp', value: selectedParent.phone || '-' },
        { label: 'Alamat Domisili', value: selectedParent.address || '-', fullWidth: true },
        {
          label: 'Email Akun',
          value: selectedParent.users?.email || (selectedParent.nis ? `ortu.${selectedParent.nis}@sman3malang.sch.id` : '-'),
          fullWidth: true,
        },
        { label: 'Peran Akun', value: 'Orang Tua / Wali Murid' },
        { label: 'Status Akun', value: 'Aktif', isBadge: true },
      ]
    : [];

  // ==========================================
  // INITIAL DATA FETCH
  // ==========================================
  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchParents();
    fetchTeachers();
  }, []);

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
          {activeTab === 'Siswa' && (
            <button
              onClick={handleOpenStudentAdd}
              className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Siswa</span>
            </button>
          )}

          {activeTab === 'Guru' && (
            <button
              onClick={handleOpenTeacherAdd}
              className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Guru</span>
            </button>
          )}

          {activeTab === 'Orang Tua/Wali' && (
            <button
              onClick={handleOpenParentAdd}
              className="flex items-center gap-2 rounded-full bg-[#008994] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#007682] transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Tambah Wali</span>
            </button>
          )}
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

      {/* =========================
          3. TAB CONTENT
      ========================= */}

      {/* === TAB SISWA === */}
      {activeTab === 'Siswa' && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total data siswa</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {students.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Akun siswa aktif</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {students.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Perlu dilengkapi</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600">
                {students.filter((s) => !s.classes || !s.parents || !s.users?.email).length}
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            {/* Search + Filter */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS siswa..."
                  value={studentSearchQuery}
                  onChange={(e) => {
                    setStudentSearchQuery(e.target.value);
                    setStudentCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filter Kelas */}
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setStudentCurrentPage(1);
                    }}
                    className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#008994]"
                  >
                    {classOptions.map((kelas) => (
                      <option key={kelas} value={kelas}>
                        {kelas}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Impor</span>
                </button>

                <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Ekspor
                </button>
              </div>
            </div>

            {/* Reusable UserTable */}
            <UserTable
              columns={studentColumns}
              data={paginatedStudents}
              loading={loadingStudents}
              emptyMessage="Data siswa tidak ditemukan."
              onDetail={handleStudentDetail}
            />

            {/* Reusable UserPagination */}
            <UserPagination
              currentPage={studentCurrentPage}
              totalPages={studentTotalPages}
              totalItems={filteredStudents.length}
              startIndex={studentStartIndex}
              endIndex={studentEndIndex}
              itemsPerPage={studentItemsPerPage}
              onPageChange={(page) => setStudentCurrentPage(page)}
              onItemsPerPageChange={(limit) => {
                setStudentItemsPerPage(limit);
                setStudentCurrentPage(1);
              }}
            />
          </div>
        </>
      )}

      {/* === TAB GURU === */}
      {activeTab === 'Guru' && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total data guru</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {teachers.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Akun guru aktif</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {teachers.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Belum lengkap</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600">
                {teachers.filter((t) => !t.nip || !t.phone || !t.users?.email).length}
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            {/* Search */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIP, atau telepon guru..."
                  value={teacherSearchQuery}
                  onChange={(e) => {
                    setTeacherSearchQuery(e.target.value);
                    setTeacherCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Impor</span>
                </button>

                <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Ekspor
                </button>
              </div>
            </div>

            {/* Reusable UserTable */}
            <UserTable
              columns={teacherColumns}
              data={paginatedTeachers}
              loading={loadingTeachers}
              emptyMessage="Data guru tidak ditemukan."
              onDetail={handleTeacherDetail}
            />

            {/* Reusable UserPagination */}
            <UserPagination
              currentPage={teacherCurrentPage}
              totalPages={teacherTotalPages}
              totalItems={filteredTeachers.length}
              startIndex={teacherStartIndex}
              endIndex={teacherEndIndex}
              itemsPerPage={teacherItemsPerPage}
              onPageChange={(page) => setTeacherCurrentPage(page)}
              onItemsPerPageChange={(limit) => {
                setTeacherItemsPerPage(limit);
                setTeacherCurrentPage(1);
              }}
            />
          </div>
        </>
      )}

      {/* === TAB ORANG TUA/WALI === */}
      {activeTab === 'Orang Tua/Wali' && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total data wali</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {parents.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Akun wali aktif</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                {parents.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Perlu dilengkapi</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600">
                {parents.filter((p) => !p.phone || !p.address).length}
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            {/* Search */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama wali, telepon, alamat, atau nama/NIS siswa asuh..."
                  value={parentSearchQuery}
                  onChange={(e) => {
                    setParentSearchQuery(e.target.value);
                    setParentCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:bg-cyan-100/70 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Impor</span>
                </button>

                <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Ekspor
                </button>
              </div>
            </div>

            {/* Reusable UserTable */}
            <UserTable
              columns={parentColumns}
              data={paginatedParents}
              loading={loadingParents}
              emptyMessage="Data orang tua / wali tidak ditemukan."
              onDetail={handleParentDetail}
            />

            {/* Reusable UserPagination */}
            <UserPagination
              currentPage={parentCurrentPage}
              totalPages={parentTotalPages}
              totalItems={filteredParents.length}
              startIndex={parentStartIndex}
              endIndex={parentEndIndex}
              itemsPerPage={parentItemsPerPage}
              onPageChange={(page) => setParentCurrentPage(page)}
              onItemsPerPageChange={(limit) => {
                setParentItemsPerPage(limit);
                setParentCurrentPage(1);
              }}
            />
          </div>
        </>
      )}

      {/* === TAB AKUN PENGGUNA (PLACEHOLDER) === */}
      {activeTab === 'Akun Pengguna' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4">
            <span className="text-2xl font-bold">A</span>
          </div>
          <h3 className="text-base font-bold text-slate-800">Manajemen Akun Pengguna</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Ringkasan status akun, hak akses role (admin, teacher, student, parent), dan kontrol kredensial terpusat.
          </p>
        </div>
      )}

      {/* ========================================================
          MODALS — REUSABLE UserDetailModal & UserFormModal
      ======================================================== */}

      {/* SISWA: DETAIL MODAL */}
      <UserDetailModal
        isOpen={showStudentDetailModal}
        title="Detail Siswa"
        subtitle="Informasi lengkap data siswa"
        user={selectedStudent}
        avatarSubtitle={`NIS: ${selectedStudent?.nis || '-'}`}
        fields={studentDetailFields}
        onClose={handleCloseStudentDetail}
        onEdit={handleOpenStudentEdit}
        onDelete={handleDeleteStudent}
        deleting={deletingStudent}
        deleteLabel="Hapus Siswa"
      />

      {/* SISWA: EDIT MODAL */}
      <UserFormModal
        isOpen={showStudentEditModal}
        title="Edit Data Siswa"
        subtitle="Perbarui data siswa, kelas, dan orang tua/wali"
        onClose={handleCloseStudentEdit}
        onSubmit={handleSaveStudentEdit}
        saving={savingStudentEdit}
        submitLabel="Simpan Perubahan"
      >
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={studentEditForm.name}
            onChange={(e) =>
              setStudentEditForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Masukkan nama lengkap siswa"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Maksimal 100 karakter.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              NIS (Nomor Induk Siswa) <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              {studentEditForm.nis.length}/10 digit
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={10}
            value={studentEditForm.nis}
            onChange={(e) =>
              setStudentEditForm((prev) => ({
                ...prev,
                nis: e.target.value.replace(/\D/g, '').slice(0, 10),
              }))
            }
            placeholder="Masukkan NIS siswa (contoh: 2026101)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Hanya angka, antara 5 - 10 digit.</p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Kelas
          </label>
          <div className="relative">
            <select
              value={studentEditForm.class_id}
              onChange={(e) =>
                setStudentEditForm((prev) => ({ ...prev, class_id: e.target.value }))
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            >
              <option value="">-- Pilih Kelas (Opsional) --</option>
              {classDropdownList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.major ? `(${cls.major})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Orang Tua / Wali
          </label>
          <div className="relative">
            <select
              value={studentEditForm.parent_id}
              onChange={(e) =>
                setStudentEditForm((prev) => ({ ...prev, parent_id: e.target.value }))
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            >
              <option value="">-- Pilih Orang Tua / Wali (Opsional) --</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} {parent.phone ? `(${parent.phone})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </UserFormModal>

      {/* SISWA: TAMBAH MODAL */}
      <UserFormModal
        isOpen={showStudentAddModal}
        title="Tambah Siswa Baru"
        subtitle="Daftarkan akun dan data siswa baru ke sistem"
        onClose={handleCloseStudentAdd}
        onSubmit={handleSaveStudentAdd}
        saving={savingStudentAdd}
        submitLabel="Simpan Siswa"
      >
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={studentAddForm.name}
            onChange={(e) =>
              setStudentAddForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Masukkan nama lengkap siswa"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Nama lengkap siswa sesuai dokumen resmi (maks. 100 karakter).
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              NIS (Nomor Induk Siswa) <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              {studentAddForm.nis.length}/10 digit
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={10}
            value={studentAddForm.nis}
            onChange={(e) =>
              setStudentAddForm((prev) => ({
                ...prev,
                nis: e.target.value.replace(/\D/g, '').slice(0, 10),
              }))
            }
            placeholder="Contoh: 2026101"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Hanya angka, antara 5 - 10 digit (contoh: 2026101).
          </p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Email Akun <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            maxLength={100}
            value={studentAddForm.email}
            onChange={(e) =>
              setStudentAddForm((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="contoh: siswa.nama@sman3malang.sch.id"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Gunakan alamat email aktif siswa (maks. 100 karakter).
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              Password Akun <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Min. 6 - Maks. 50 karakter
            </span>
          </div>
          <input
            type="password"
            required
            minLength={6}
            maxLength={50}
            value={studentAddForm.password}
            onChange={(e) =>
              setStudentAddForm((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Minimal 6 karakter"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Minimal 6 karakter dan maksimal 50 karakter untuk keamanan akun.
          </p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Kelas <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              required
              value={studentAddForm.class_id}
              onChange={(e) =>
                setStudentAddForm((prev) => ({ ...prev, class_id: e.target.value }))
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-700 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            >
              <option value="">-- Pilih Kelas --</option>
              {classDropdownList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.major ? `(${cls.major})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {classDropdownList.length === 0 ? (
            <p className="mt-1 text-[11px] text-amber-600 font-medium">
              Belum ada data kelas yang dapat dipilih.
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">
              Wajib memilih kelas tempat siswa terdaftar.
            </p>
          )}
        </div>
      </UserFormModal>

      {/* GURU: DETAIL MODAL */}
      <UserDetailModal
        isOpen={showTeacherDetailModal}
        title="Detail Guru"
        subtitle="Informasi lengkap data tenaga pendidik"
        user={selectedTeacher}
        avatarSubtitle={`NIP: ${selectedTeacher?.nip || '-'}`}
        fields={teacherDetailFields}
        onClose={handleCloseTeacherDetail}
        onEdit={handleOpenTeacherEdit}
        onDelete={handleDeleteTeacher}
        deleting={deletingTeacher}
        deleteLabel="Hapus Guru"
      />

      {/* GURU: EDIT MODAL */}
      <UserFormModal
        isOpen={showTeacherEditModal}
        title="Edit Data Guru"
        subtitle="Perbarui data profil dan kontak guru"
        onClose={handleCloseTeacherEdit}
        onSubmit={handleSaveTeacherEdit}
        saving={savingTeacherEdit}
        submitLabel="Simpan Perubahan"
      >
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={teacherEditForm.name}
            onChange={(e) =>
              setTeacherEditForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Masukkan nama lengkap guru beserta gelar"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Maksimal 100 karakter.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              NIP (Nomor Induk Pegawai) <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              {teacherEditForm.nip.length}/20 digit
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={20}
            value={teacherEditForm.nip}
            onChange={(e) =>
              setTeacherEditForm((prev) => ({
                ...prev,
                nip: e.target.value.replace(/\D/g, '').slice(0, 20),
              }))
            }
            placeholder="Masukkan NIP guru (contoh: 198001012005011001)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Hanya angka, antara 5 - 20 digit.</p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nomor Telepon / WhatsApp
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={16}
            value={teacherEditForm.phone}
            onChange={(e) =>
              setTeacherEditForm((prev) => ({
                ...prev,
                phone: e.target.value.replace(/\D/g, '').slice(0, 16),
              }))
            }
            placeholder="Contoh: 081234567890"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Nomor kontak aktif guru (opsional).</p>
        </div>
      </UserFormModal>

      {/* GURU: TAMBAH MODAL */}
      <UserFormModal
        isOpen={showTeacherAddModal}
        title="Tambah Guru Baru"
        subtitle="Daftarkan akun dan profil tenaga pendidik baru ke sistem"
        onClose={handleCloseTeacherAdd}
        onSubmit={handleSaveTeacherAdd}
        saving={savingTeacherAdd}
        submitLabel="Simpan Guru"
      >
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={teacherAddForm.name}
            onChange={(e) =>
              setTeacherAddForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Contoh: Budi Santoso, M.Pd"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Nama lengkap beserta gelar akademik guru (maks. 100 karakter).
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              NIP (Nomor Induk Pegawai) <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              {teacherAddForm.nip.length}/20 digit
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={20}
            value={teacherAddForm.nip}
            onChange={(e) =>
              setTeacherAddForm((prev) => ({
                ...prev,
                nip: e.target.value.replace(/\D/g, '').slice(0, 20),
              }))
            }
            placeholder="Contoh: 198503152010011002"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Hanya angka, antara 5 - 20 digit.
          </p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Email Akun <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            maxLength={100}
            value={teacherAddForm.email}
            onChange={(e) =>
              setTeacherAddForm((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="contoh: budi.santoso@sman3malang.sch.id"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Email resmi aktif guru untuk login ke sistem SMANTI Connect.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              Password Akun <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Min. 6 - Maks. 50 karakter
            </span>
          </div>
          <input
            type="password"
            required
            minLength={6}
            maxLength={50}
            value={teacherAddForm.password}
            onChange={(e) =>
              setTeacherAddForm((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Minimal 6 karakter"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Password awal untuk login pertama guru.
          </p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nomor Telepon / WhatsApp
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={16}
            value={teacherAddForm.phone}
            onChange={(e) =>
              setTeacherAddForm((prev) => ({
                ...prev,
                phone: e.target.value.replace(/\D/g, '').slice(0, 16),
              }))
            }
            placeholder="Contoh: 081234567890 (opsional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Nomor WhatsApp/telepon guru untuk keperluan koordinasi sekolah (opsional).
          </p>
        </div>
      </UserFormModal>

      {/* ORANG TUA/WALI: DETAIL MODAL */}
      <UserDetailModal
        isOpen={showParentDetailModal}
        title="Detail Orang Tua / Wali"
        subtitle="Informasi lengkap data orang tua/wali murid"
        user={selectedParent}
        avatarSubtitle={`NIS Anak: ${selectedParent?.nis || '-'}`}
        fields={parentDetailFields}
        onClose={handleCloseParentDetail}
        onEdit={handleOpenParentEdit}
        onDelete={handleDeleteParent}
        deleting={deletingParent}
        deleteLabel="Hapus Wali"
      />

      {/* ORANG TUA/WALI: EDIT MODAL */}
      <UserFormModal
        isOpen={showParentEditModal}
        title="Edit Data Orang Tua / Wali"
        subtitle="Perbarui data kontak dan domisili wali murid"
        onClose={handleCloseParentEdit}
        onSubmit={handleSaveParentEdit}
        saving={savingParentEdit}
        submitLabel="Simpan Perubahan"
      >
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nama Lengkap Wali <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={parentEditForm.name}
            onChange={(e) =>
              setParentEditForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Masukkan nama lengkap orang tua/wali"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Maksimal 100 karakter.</p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nomor Telepon / WhatsApp
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={16}
            value={parentEditForm.phone}
            onChange={(e) =>
              setParentEditForm((prev) => ({
                ...prev,
                phone: e.target.value.replace(/\D/g, '').slice(0, 16),
              }))
            }
            placeholder="Contoh: 081234567890"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Nomor kontak aktif wali murid.</p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Alamat Domisili
          </label>
          <textarea
            rows={3}
            maxLength={200}
            value={parentEditForm.address}
            onChange={(e) =>
              setParentEditForm((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Masukkan alamat domisili orang tua/wali..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">Maksimal 200 karakter.</p>
        </div>
      </UserFormModal>

      {/* ORANG TUA/WALI: TAMBAH MODAL */}
      <UserFormModal
        isOpen={showParentAddModal}
        title="Tambah Orang Tua / Wali Baru"
        subtitle="Daftarkan akun dan data wali murid ke sistem"
        onClose={handleCloseParentAdd}
        onSubmit={handleSaveParentAdd}
        saving={savingParentAdd}
        submitLabel="Simpan Wali"
      >
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nama Lengkap Wali <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={parentAddForm.name}
            onChange={(e) =>
              setParentAddForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Contoh: Bpk. Bambang Wahyudi"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Nama lengkap orang tua/wali murid (maks. 100 karakter).
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              NIS Siswa / Anak Asuh <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              {parentAddForm.nis.length}/10 digit
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={10}
            value={parentAddForm.nis}
            onChange={(e) =>
              setParentAddForm((prev) => ({
                ...prev,
                nis: e.target.value.replace(/\D/g, '').slice(0, 10),
              }))
            }
            placeholder="Masukkan NIS siswa yang diasuh (contoh: 2026101)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Akun login wali otomatis menggunakan email: <span className="text-[#008994] font-semibold">{parentAddForm.nis ? `ortu.${parentAddForm.nis}@sman3malang.sch.id` : 'ortu.[NIS]@sman3malang.sch.id'}</span>
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 block">
              Password Akun <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Min. 6 - Maks. 50 karakter
            </span>
          </div>
          <input
            type="password"
            required
            minLength={6}
            maxLength={50}
            value={parentAddForm.password}
            onChange={(e) =>
              setParentAddForm((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Minimal 6 karakter"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Password awal untuk login orang tua/wali ke sistem SMANTI Connect.
          </p>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
            Nomor Telepon / WhatsApp
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={16}
            value={parentAddForm.phone}
            onChange={(e) =>
              setParentAddForm((prev) => ({
                ...prev,
                phone: e.target.value.replace(/\D/g, '').slice(0, 16),
              }))
            }
            placeholder="Contoh: 081234567890 (opsional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Nomor kontak aktif untuk informasi presensi & nilai anak (opsional).
          </p>
        </div>
      </UserFormModal>
    </div>
  );
}
