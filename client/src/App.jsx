import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SiswaLayout from './components/SiswaLayout';
import HariIni from './pages/siswa/HariIni';
import Riwayat from './pages/siswa/Riwayat';

import GuruLayout from './components/GuruLayout';
import PresensiGuru from './pages/guru/PresensiGuru';
import BuatPresensi from './pages/guru/BuatPresensi';
import SesiPresensi from './pages/guru/SesiPresensi';
import PresensiManual from './pages/guru/PresensiManual';
import RekapPresensi from './pages/guru/RekapPresensi';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/siswa/presensi" replace />} />

        {/* ROUTE SISWA */}
        <Route path="/siswa" element={<SiswaLayout />}>
          <Route path="presensi" element={<HariIni />} />
          <Route path="presensi/riwayat" element={<Riwayat />} />
        </Route>

        {/* ROUTE GURU */}
        <Route path="/guru" element={<GuruLayout />}>
          <Route path="presensi" element={<PresensiGuru />} />
          <Route path="presensi/buat" element={<BuatPresensi />} />
          <Route path="presensi/manual/:sessionId" element={<PresensiManual />} />
          <Route path="presensi/sesi/:sessionId" element={<SesiPresensi />} />
          <Route path="presensi/rekap" element={<RekapPresensi />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}