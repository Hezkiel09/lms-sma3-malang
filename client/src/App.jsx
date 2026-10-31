import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import PenggunaPage from './pages/admin/Pengguna';
import AkademikPage from './pages/admin/Akademik';
import MonitoringPage from './pages/admin/Monitoring';
import PengumumanPage from './pages/admin/Pengumuman';
import SiswaPage from './pages/admin/Siswa';
import GuruPage from './pages/admin/Guru';
import LoginPage from './pages/auth/Login';

// Generic placeholder component for submenus that will be sliced later
function PagePlaceholder({ title }) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">Halaman ini siap untuk di-slice berikutnya.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-slate-700">Area Slicing Halaman {title}</h3>
        <p className="mt-1 text-sm text-slate-400">Silakan letakkan komponen untuk menu ini di sini.</p>
      </div>
    </div>
  );
}

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
          <Route path="laporan" element={<PagePlaceholder title="Laporan" />} />
          <Route path="profil" element={<PagePlaceholder title="Profil Admin" />} />
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
