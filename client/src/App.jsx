import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardGuru from './pages/B5/teacher/DashboardGuru';
import DaftarKelas from './pages/B5/teacher/DaftarKelas';
import DetailCourseGuru from './pages/B5/teacher/DetailCourseGuru';
import KelolaCourseGuru from './pages/B5/teacher/KelolaCourseGuru';

function App() {
  return (
    <Routes>
      {/* Kalau buka localhost:5173, otomatis diarahkan ke /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Halaman Dashboard Guru */}
      <Route path="/dashboard" element={<DashboardGuru />} />
      
      {/* Halaman Daftar Kelas */}
      <Route path="/kelas" element={<DaftarKelas />} />
      
      {/* Halaman Detail Kelas / Course */}
      <Route path="/kelas/detail" element={<DetailCourseGuru />} />
      
      {/* Halaman Kelola Materi Course */}
      <Route path="/kelas/kelola" element={<KelolaCourseGuru />} />
    </Routes>
  );
}

export default App;