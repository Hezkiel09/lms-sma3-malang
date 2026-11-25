import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import PenggunaPage from './pages/admin/Pengguna';
import AkademikPage from './pages/admin/Akademik';
import MonitoringPage from './pages/admin/Monitoring';
import PengumumanPage from './pages/admin/Pengumuman';
import LaporanPage from './pages/admin/Laporan';
import ProfilPage from './pages/admin/Profil';
import LoginPage from './pages/auth/Login';

import GuruLayout from './layouts/GuruLayout';
import BankSoalPage from './pages/b6/BankSoal';
import BuatKuisPage from './pages/b6/BuatKuis';
import ImportSoalExcelPage from './pages/b6/ImportSoalExcel';
import AmbilDariBankSoalPage from './pages/b6/AmbilDariBankSoal';
import TambahSoalKuisPage from './pages/b6/TambahSoalKuis';
import RekapHasilPage from './pages/b6/RekapHasil';
import EditSoalPage from './pages/b6/EditSoal';
import LihatSoalPage from './pages/b6/LihatSoal';
import BuatSoal from './pages/b6/BuatSoal';

import SiswaDashboard from './pages/siswa/SiswaDashboard';
import OrtuDashboard from './pages/ortu/OrtuDashboard';

import DashboardGuru from './pages/B5/teacher/DashboardGuru';
import ProfilGuru from './pages/B5/teacher/ProfilGuru';
import DaftarKelas from './pages/B5/teacher/DaftarKelas';
import DetailCourseGuru from './pages/B5/teacher/DetailCourseGuru';
import KelolaCourseGuru from './pages/B5/teacher/KelolaCourseGuru';
import DetailFileGuru from './pages/B5/teacher/DetailFileGuru';
import DetailTugasGuru from './pages/B5/teacher/DetailTugasGuru';
import EditAssignmentGuru from './pages/B5/teacher/EditAssignmentGuru';
import TinjauNilaiGuru from './pages/B5/teacher/TinjauNilaiGuru';
import DetailNilaiGuru from './pages/B5/teacher/DetailNilaiGuru';

import DashboardSiswa from './pages/B5/student/DashboardSiswa';
import ProfilSiswa from './pages/B5/student/ProfilSiswa';

const COURSE_ID = 'bf720e90-1886-4c01-9868-249181f900dc';

function GuruPlaceholder({ title }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">Halaman {title} guru SMANTI Connect.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-slate-700">Area {title}</h3>
        <p className="mt-1 text-sm text-slate-400">Silakan gunakan menu Bank Soal, Buat Kuis, atau Rekap Nilai.</p>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#008994] border-t-transparent" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'teacher') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'student') return <Navigate to="/dashboard-siswa" replace />;
  if (user?.role === 'parent') return <Navigate to="/ortu" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/:audience" element={<LoginPage />} />
      <Route path="/lupa-kata-sandi/:audience" element={<LoginPage />} />

      {/* Rute B5: Guru & Siswa */}
      <Route
        path="/profil"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <ProfilGuru />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <DashboardGuru />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-siswa"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <DashboardSiswa />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil-siswa"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <ProfilSiswa onKembali={() => navigate('/dashboard-siswa')} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <DaftarKelas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/detail"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <DetailCourseGuru
              onKembali={() => navigate('/dashboard')}
              onKeModeEdit={() => navigate('/kelas/kelola')}
              onKeEditTugas={(assignmentId) => {
                navigate(`/kelas/tugas/edit/${assignmentId}`);
              }}
              onPilihMateri={(materialId) => {
                navigate(`/kelas/detail/file/${materialId}`);
              }}
              onPilihTugas={(assignmentId) => {
                navigate(`/kelas/detail/tugas/${assignmentId}`);
              }}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/detail/file/:materialId"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <DetailFileGuruWrapper onKembali={() => navigate('/kelas/detail')} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/detail/tugas/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <DetailTugasGuruWrapper
              onKembali={() => navigate('/kelas/detail')}
              onGrade={(studentData, assignmentId) => {
                navigate(
                  `/kelas/detail/tugas/${assignmentId}/tinjau`,
                  { state: { studentData } }
                );
              }}
              onViewSubmission={(studentData, assignmentId) => {
                navigate(
                  `/kelas/detail/tugas/${assignmentId}/nilai`,
                  { state: { studentData } }
                );
              }}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/detail/tugas/:assignmentId/tinjau"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TinjauNilaiGuruWrapper onKembali={() => navigate(-1)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/detail/tugas/:assignmentId/nilai"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <DetailNilaiGuruWrapper onKembali={() => navigate(-1)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/tugas/edit/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <EditAssignmentGuruWrapper onKembali={() => navigate('/kelas/detail')} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/kelola"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <KelolaCourseGuru onKembali={() => navigate('/kelas/detail')} />
          </ProtectedRoute>
        }
      />

      {/* Rute B6, Siswa, Ortu, dan Admin */}
      <Route path="/b6" element={<ProtectedRoute allowedRoles={['teacher']}><GuruLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/b6/buat-kuis" replace />} />
        <Route path="beranda" element={<GuruPlaceholder title="Beranda Guru" />} />
        <Route path="bank-soal" element={<BankSoalPage />} />
        <Route path="bank-soal/edit-soal" element={<EditSoalPage />} />
        <Route path="bank-soal/lihat-soal" element={<LihatSoalPage />} />
        <Route path="buat-soal" element={<BuatSoal />} />
        <Route path="buat-kuis" element={<BuatKuisPage />} />
        <Route path="buat-kuis/import" element={<ImportSoalExcelPage />} />
        <Route path="buat-kuis/ambil-bank-soal" element={<AmbilDariBankSoalPage />} />
        <Route path="buat-kuis/tambah-soal" element={<TambahSoalKuisPage />} />
        <Route path="rekap-nilai" element={<RekapHasilPage />} />
        <Route path="asesmen/rekap-hasil" element={<RekapHasilPage />} />
        <Route path="presensi" element={<GuruPlaceholder title="Presensi Guru" />} />
        <Route path="pesan" element={<GuruPlaceholder title="Pesan" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="/siswa" element={<ProtectedRoute allowedRoles={['student', 'admin']}><SiswaDashboard /></ProtectedRoute>} />
      <Route path="/ortu" element={<ProtectedRoute allowedRoles={['parent', 'admin']}><OrtuDashboard /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="pengguna" element={<PenggunaPage />} />
        <Route path="akademik" element={<AkademikPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="pengumuman" element={<PengumumanPage />} />
        <Route path="laporan" element={<LaporanPage />} />
        <Route path="profil" element={<ProfilPage />} />
        <Route path="siswa" element={<Navigate to="/admin/pengguna" replace />} />
        <Route path="guru" element={<Navigate to="/admin/pengguna" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route path="/buat-kuis" element={<Navigate to="/b6/buat-kuis" replace />} />
      <Route path="/bank-soal" element={<Navigate to="/b6/bank-soal" replace />} />
      <Route path="/buat-soal" element={<Navigate to="/b6/buat-soal" replace />} />
      <Route path="/rekap-nilai" element={<Navigate to="/b6/rekap-nilai" replace />} />
      <Route path="/rekap-hasil" element={<Navigate to="/b6/rekap-nilai" replace />} />
      <Route path="/guru/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function DetailFileGuruWrapper({ onKembali }) {
  const { materialId } = useParams();

  return (
    <DetailFileGuru
      materialId={materialId}
      courseId={COURSE_ID}
      onKembali={onKembali}
      onDelete={onKembali}
    />
  );
}

function DetailTugasGuruWrapper({
  onKembali,
  onGrade,
  onViewSubmission
}) {
  const { assignmentId } = useParams();

  return (
    <DetailTugasGuru
      assignmentId={assignmentId}
      courseId={COURSE_ID}
      onKembali={onKembali}
      onGrade={(studentData) => {
        onGrade(studentData, assignmentId);
      }}
      onViewSubmission={(studentData) => {
        onViewSubmission(studentData, assignmentId);
      }}
    />
  );
}

function EditAssignmentGuruWrapper({ onKembali }) {
  const { assignmentId } = useParams();

  return (
    <EditAssignmentGuru
      assignmentId={assignmentId}
      onKembali={onKembali}
    />
  );
}

function TinjauNilaiGuruWrapper({ onKembali }) {
  const { assignmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <TinjauNilaiGuru
      studentData={state?.studentData}
      onKembali={onKembali}
      onSimpanSukses={(studentData) => {
        navigate(
          `/kelas/detail/tugas/${assignmentId}/nilai`,
          { state: { studentData } }
        );
      }}
    />
  );
}

function DetailNilaiGuruWrapper({ onKembali }) {
  const { assignmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <DetailNilaiGuru
      studentData={state?.studentData}
      onKembali={onKembali}
      onEditNilai={() => {
        navigate(
          `/kelas/detail/tugas/${assignmentId}/tinjau`,
          { state: { studentData: state?.studentData } }
        );
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}