import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import PenggunaPage from './pages/admin/Pengguna';
import AkademikPage from './pages/admin/Akademik';
import MonitoringPage from './pages/admin/Monitoring';
import PengumumanPage from './pages/admin/Pengumuman';
import LaporanPage from './pages/admin/Laporan';
import SiswaPage from './pages/admin/Siswa';
import GuruPage from './pages/admin/Guru';
import ProfilPage from './pages/admin/Profil';
import LoginPage from './pages/auth/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Dashboard with shared Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pengguna" element={<PenggunaPage />} />
          <Route path="akademik" element={<AkademikPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="pengumuman" element={<PengumumanPage />} />
          <Route path="laporan" element={<LaporanPage />} />
          <Route path="profil" element={<ProfilPage />} />
          <Route path="siswa" element={<SiswaPage />} />
          <Route path="guru" element={<GuruPage />} />
          {/* Catch-all route inside admin */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Root redirect to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
