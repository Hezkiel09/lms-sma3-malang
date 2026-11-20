import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Guru Portal
import GuruLayout from './layouts/GuruLayout';
import BankSoalPage from './pages/guru/BankSoal';
import BuatKuisPage from './pages/guru/BuatKuis';
import ImportSoalExcelPage from './pages/guru/ImportSoalExcel';
import AmbilDariBankSoalPage from './pages/guru/AmbilDariBankSoal';
import TambahSoalKuisPage from './pages/guru/TambahSoalKuis';
import RekapHasilPage from './pages/guru/RekapHasil';

// Siswa & Ortu Portal
import SiswaDashboard from './pages/siswa/SiswaDashboard';
import OrtuDashboard from './pages/ortu/OrtuDashboard';

// Placeholder for remaining guru pages
function GuruPlaceholder({ title }) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">Halaman {title} guru SMANTI Connect.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-slate-700">Area {title}</h3>
        <p className="mt-1 text-sm text-slate-400">Silakan gunakan menu Bank Soal, Buat Kuis, atau Rekap Nilai.</p>
      </div>
    </div>
  );
}

// Redirect dinamis halaman root sesuai role pengguna yang login
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#008994] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/guru/buat-kuis" replace />;
    if (user.role === 'student') return <Navigate to="/siswa" replace />;
    if (user.role === 'parent') return <Navigate to="/ortu" replace />;
  }

  // Jika belum login, arahkan ke portal Login bersama B5
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Universal Login (Milik B5 - Single Login Entrypoint) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Guru Portal (Khusus Guru & Admin) */}
          <Route
            path="/guru"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <GuruLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/guru/buat-kuis" replace />} />
            <Route path="beranda" element={<GuruPlaceholder title="Beranda Guru" />} />
            <Route path="bank-soal" element={<BankSoalPage />} />
            <Route path="buat-kuis" element={<BuatKuisPage />} />
            <Route path="buat-kuis/import" element={<ImportSoalExcelPage />} />
            <Route path="buat-kuis/ambil-bank-soal" element={<AmbilDariBankSoalPage />} />
            <Route path="buat-kuis/tambah-soal" element={<TambahSoalKuisPage />} />
            <Route path="rekap-nilai" element={<RekapHasilPage />} />
            <Route path="asesmen/rekap-hasil" element={<RekapHasilPage />} />
            <Route path="presensi" element={<GuruPlaceholder title="Presensi Guru" />} />
            <Route path="pesan" element={<GuruPlaceholder title="Pesan" />} />
            <Route path="*" element={<Navigate to="/guru/buat-kuis" replace />} />
          </Route>

          {/* Siswa Portal (Khusus Siswa & Admin) */}
          <Route
            path="/siswa"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <SiswaDashboard />
              </ProtectedRoute>
            }
          />

          {/* Orang Tua Portal (Khusus Orang Tua & Admin) */}
          <Route
            path="/ortu"
            element={
              <ProtectedRoute allowedRoles={['parent', 'admin']}>
                <OrtuDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal (Protected: Khusus Admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
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

          {/* Direct shortcuts */}
          <Route path="/buat-kuis" element={<Navigate to="/guru/buat-kuis" replace />} />
          <Route path="/bank-soal" element={<Navigate to="/guru/bank-soal" replace />} />
          <Route path="/rekap-nilai" element={<Navigate to="/guru/rekap-nilai" replace />} />
          <Route path="/rekap-hasil" element={<Navigate to="/guru/rekap-nilai" replace />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* 404 fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
