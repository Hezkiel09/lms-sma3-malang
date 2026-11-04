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
import BankSoalPage from './pages/b6/BankSoal';
import BuatKuisPage from './pages/b6/BuatKuis';
import ImportSoalExcelPage from './pages/b6/ImportSoalExcel';
import AmbilDariBankSoalPage from './pages/b6/AmbilDariBankSoal';
import TambahSoalKuisPage from './pages/b6/TambahSoalKuis';
import RekapHasilPage from './pages/b6/RekapHasil';
import EditSoalPage from './pages/b6/EditSoal';
import LihatSoalPage from './pages/b6/LihatSoal';

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Guru Portal (Default: Buat Kuis & Bank Soal Sesuai Desain Foto) */}
        <Route path="/b6" element={<GuruLayout />}>
          <Route index element={<Navigate to="/b6/buat-kuis" replace />} />
          <Route path="beranda" element={<GuruPlaceholder title="Beranda Guru" />} />
          <Route path="bank-soal" element={<BankSoalPage />} />
          <Route path="bank-soal/edit-soal" element={<EditSoalPage />} />
          <Route path="bank-soal/lihat-soal" element={<LihatSoalPage />} />
          <Route path="buat-kuis" element={<BuatKuisPage />} />
          <Route path="buat-kuis/import" element={<ImportSoalExcelPage />} />
          <Route path="buat-kuis/ambil-bank-soal" element={<AmbilDariBankSoalPage />} />
          <Route path="buat-kuis/tambah-soal" element={<TambahSoalKuisPage />} />
          <Route path="rekap-nilai" element={<RekapHasilPage />} />
          <Route path="asesmen/rekap-hasil" element={<RekapHasilPage />} />
          <Route path="presensi" element={<GuruPlaceholder title="Presensi Guru" />} />
          <Route path="pesan" element={<GuruPlaceholder title="Pesan" />} />
          <Route path="*" element={<Navigate to="/b6/buat-kuis" replace />} />
        </Route>

        {/* Admin Portal */}
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

        {/* Direct shortcuts */}
        <Route path="/buat-kuis" element={<Navigate to="/b6/buat-kuis" replace />} />
        <Route path="/bank-soal" element={<Navigate to="/b6/bank-soal" replace />} />
        <Route path="/rekap-nilai" element={<Navigate to="/b6/rekap-nilai" replace />} />
        <Route path="/rekap-hasil" element={<Navigate to="/b6/rekap-nilai" replace />} />

        {/* Root redirect directly to Buat Kuis */}
        <Route path="/" element={<Navigate to="/b6/buat-kuis" replace />} />
        {/* 404 fallback to Buat Kuis */}
        <Route path="*" element={<Navigate to="/b6/buat-kuis" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
