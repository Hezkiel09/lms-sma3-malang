import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import RequireRole from './components/RequireRole';
import { getUser, homeFor, resumeSession } from './services/auth';
import { PRESENSI_SOURCE } from './services/presensiGuruApi';

import SiswaLayout from './components/SiswaLayout';
import HariIni from './pages/siswa/HariIni';
import Riwayat from './pages/siswa/Riwayat';
import DetailMapel from './pages/siswa/DetailMapel';

import GuruLayout from './components/GuruLayout';
import PresensiGuru from './pages/guru/PresensiGuru';
import BuatPresensi from './pages/guru/BuatPresensi';
import SesiPresensi from './pages/guru/SesiPresensi';
import PresensiManual from './pages/guru/PresensiManual';
import RekapPresensi from './pages/guru/RekapPresensi';

import OrtuLayout from './components/OrtuLayout';
import Beranda from './pages/ortu/Beranda';
import PilihAnak from './pages/ortu/PilihAnak';
import PesanGuru from './pages/ortu/PesanGuru';

// Lanjutkan pembaruan token otomatis kalau halaman dimuat ulang saat sudah login.
resumeSession();

function RootRedirect() {
  if (PRESENSI_SOURCE === 'mock') return <Navigate to="/siswa/presensi" replace />;
  const user = getUser();
  return <Navigate to={(user && homeFor(user.role)) || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* ROUTE SISWA */}
        <Route element={<RequireRole role="student" />}>
          <Route path="/siswa" element={<SiswaLayout />}>
            <Route path="presensi" element={<HariIni />} />
            <Route path="presensi/riwayat" element={<Riwayat />} />
            <Route path="presensi/riwayat/:subjectId" element={<DetailMapel />} />
          </Route>
        </Route>

        {/* ROUTE GURU */}
        <Route element={<RequireRole role="teacher" />}>
          <Route path="/guru" element={<GuruLayout />}>
            <Route path="presensi" element={<PresensiGuru />} />
            <Route path="presensi/buat" element={<BuatPresensi />} />
            <Route path="presensi/manual/:sessionId" element={<PresensiManual />} />
            <Route path="presensi/sesi/:sessionId" element={<SesiPresensi />} />
            <Route path="presensi/rekap" element={<RekapPresensi />} />
          </Route>
        </Route>

        {/* ROUTE ORANG TUA */}
        <Route element={<RequireRole role="parent" />}>
          <Route path="/ortu" element={<OrtuLayout />}>
            <Route index element={<Beranda />} />
            <Route path="presensi" element={<Riwayat basePath="/ortu/presensi" />} />
            <Route path="presensi/riwayat/:subjectId" element={<DetailMapel basePath="/ortu/presensi" />} />
            <Route path="anak" element={<PilihAnak />} />
            <Route path="pesan" element={<PesanGuru />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}