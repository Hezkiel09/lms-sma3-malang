import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardGuru from './pages/B5/teacher/DashboardGuru';
import DaftarKelas from './pages/B5/teacher/DaftarKelas';
import DetailCourseGuru from './pages/B5/teacher/DetailCourseGuru';
import KelolaCourseGuru from './pages/B5/teacher/KelolaCourseGuru';
import DetailFileGuru from './pages/B5/teacher/DetailFileGuru';

const COURSE_ID = 'bf720e90-1886-4c01-9868-249181f900dc';

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Kalau buka localhost:5173, otomatis diarahkan ke /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Halaman Dashboard Guru */}
      <Route path="/dashboard" element={<DashboardGuru />} />
      
      {/* Halaman Daftar Kelas */}
      <Route path="/kelas" element={<DaftarKelas />} />
      
      {/* Halaman Detail Kelas / Course (View) */}
      <Route 
        path="/kelas/detail" 
        element={
          <DetailCourseGuru 
            onKembali={() => navigate('/dashboard')}
            onKeModeEdit={() => navigate('/kelas/kelola')}
            onPilihMateri={(materialId) => {
              // Pindah halaman dengan membawa ID materi menggunakan state router
              navigate(`/kelas/detail/file/${materialId}`);
            }}
          />
        } 
      />

      {/* Halaman Detail File / Materi Spesifik */}
      <Route 
        path="/kelas/detail/file/:materialId" 
        element={
          <DetailFileGuruWrapper 
            onKembali={() => navigate('/kelas/detail')}
          />
        } 
      />
      
      {/* Halaman Kelola Materi Course (Edit) */}
      <Route 
        path="/kelas/kelola" 
        element={
          <KelolaCourseGuru 
            onKembali={() => navigate('/kelas/detail')}
          />
        } 
      />
    </Routes>
  );
}

// Komponen pembantu untuk mengambil parameter ID dari URL secara aman
import { useParams } from 'react-router-dom';
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

export default App;