import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SiswaLayout from './components/SiswaLayout';
import HariIni from './pages/siswa/HariIni';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/siswa/presensi" replace />} />
        <Route path="/siswa" element={<SiswaLayout />}>
          <Route path="presensi" element={<HariIni />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}