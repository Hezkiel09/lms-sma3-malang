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

// Guru Portal
import GuruLayout from './layouts/GuruLayout';
import BankSoalPage from './pages/guru/BankSoal';

// Placeholder for other guru pages
function GuruPlaceholder({ title }) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">Halaman {title} guru SMANTI Connect.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-slate-700">Area {title}</h3>
        <p className="mt-1 text-sm text-slate-400">Silakan gunakan menu Bank Soal untuk melihat alur slicing soal.</p>
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

        {/* Admin Portal with shared Layout */}
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
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Guru Portal (Bank Soal, Presensi, dll) */}
        <Route path="/guru" element={<GuruLayout />}>
          <Route index element={<Navigate to="/guru/bank-soal" replace />} />
          <Route path="beranda" element={<GuruPlaceholder title="Beranda Guru" />} />
          <Route path="bank-soal" element={<BankSoalPage />} />
          <Route path="rekap-nilai" element={<GuruPlaceholder title="Rekap Nilai" />} />
          <Route path="presensi" element={<GuruPlaceholder title="Presensi Guru" />} />
          <Route path="pesan" element={<GuruPlaceholder title="Pesan" />} />
          <Route path="*" element={<Navigate to="/guru/bank-soal" replace />} />
        </Route>

        {/* Direct shortcut to Bank Soal */}
        <Route path="/bank-soal" element={<Navigate to="/guru/bank-soal" replace />} />

        {/* Root redirect to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
