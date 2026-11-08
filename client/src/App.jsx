
import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation
} from 'react-router-dom';

import DashboardGuru from './pages/B5/teacher/DashboardGuru';
import DaftarKelas from './pages/B5/teacher/DaftarKelas';
import DetailCourseGuru from './pages/B5/teacher/DetailCourseGuru';
import KelolaCourseGuru from './pages/B5/teacher/KelolaCourseGuru';
import DetailFileGuru from './pages/B5/teacher/DetailFileGuru';
import DetailTugasGuru from './pages/B5/teacher/DetailTugasGuru';
import EditAssignmentGuru from './pages/B5/teacher/EditAssignmentGuru';
import TinjauNilaiGuru from './pages/B5/teacher/TinjauNilaiGuru';
import DetailNilaiGuru from './pages/B5/teacher/DetailNilaiGuru';

const COURSE_ID = 'bf720e90-1886-4c01-9868-249181f900dc';

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Kalau buka localhost:5173, otomatis diarahkan ke /dashboard */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Halaman Dashboard Guru */}
      <Route
        path="/dashboard"
        element={<DashboardGuru />}
      />

      {/* Halaman Daftar Kelas */}
      <Route
        path="/kelas"
        element={<DaftarKelas />}
      />

      {/* Halaman Detail Kelas / Course (View) */}
      <Route
        path="/kelas/detail"
        element={
          <DetailCourseGuru
            onKembali={() => navigate('/dashboard')}
            onKeModeEdit={() => navigate('/kelas/kelola')}
            onKeEditTugas={(assignmentId) => {
              navigate(`/kelas/tugas/edit/${assignmentId}`);
            }}
            onPilihMateri={(materialId) => {
              navigate(`/kelas/detail/file/${materialId}`);
            }}
            onPilihTugas={(assignmentId) => {
              navigate(`/kelas/detail/tugas/${assignmentId}`);
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

      {/* Halaman Detail Tugas Spesifik */}
      <Route
        path="/kelas/detail/tugas/:assignmentId"
        element={
          <DetailTugasGuruWrapper
            onKembali={() => navigate('/kelas/detail')}
            onGrade={(studentData, assignmentId) => {
              navigate(
                `/kelas/detail/tugas/${assignmentId}/tinjau`,
                { state: { studentData } }
              );
            }}
            onViewSubmission={(studentData, assignmentId) => {
              navigate(
                `/kelas/detail/tugas/${assignmentId}/nilai`,
                { state: { studentData } }
              );
            }}
          />
        }
      />

      {/* Halaman Tinjau & Nilai */}
      <Route
        path="/kelas/detail/tugas/:assignmentId/tinjau"
        element={
          <TinjauNilaiGuruWrapper
            onKembali={() => navigate(-1)}
          />
        }
      />

      {/* Halaman Detail Nilai */}
      <Route
        path="/kelas/detail/tugas/:assignmentId/nilai"
        element={
          <DetailNilaiGuruWrapper
            onKembali={() => navigate(-1)}
          />
        }
      />

      {/* Halaman Edit Tugas Spesifik */}
      <Route
        path="/kelas/tugas/edit/:assignmentId"
        element={
          <EditAssignmentGuruWrapper
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

function DetailTugasGuruWrapper({
  onKembali,
  onGrade,
  onViewSubmission
}) {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  return (
    <DetailTugasGuru
      assignmentId={assignmentId}
      courseId={COURSE_ID}
      onKembali={onKembali}
      onGrade={(studentData) => {
        onGrade(studentData, assignmentId);
      }}
      onViewSubmission={(studentData) => {
        onViewSubmission(studentData, assignmentId);
      }}
    />
  );
}

// Wrapper untuk Edit Tugas
function EditAssignmentGuruWrapper({ onKembali }) {
  const { assignmentId } = useParams();

  return (
    <EditAssignmentGuru
      assignmentId={assignmentId}
      onKembali={onKembali}
    />
  );
}

// Wrapper untuk Tinjau Nilai
function TinjauNilaiGuruWrapper({ onKembali }) {
  const { assignmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <TinjauNilaiGuru
      studentData={state?.studentData}
      onKembali={onKembali}
      onSimpanSukses={(studentData) => {
        navigate(
          `/kelas/detail/tugas/${assignmentId}/nilai`,
          { state: { studentData } }
        );
      }}
    />
  );
}

// Wrapper untuk Detail Nilai
function DetailNilaiGuruWrapper({ onKembali }) {
  const { assignmentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <DetailNilaiGuru
      studentData={state?.studentData}
      onKembali={onKembali}
      onEditNilai={() => {
        navigate(
          `/kelas/detail/tugas/${assignmentId}/tinjau`,
          { state: { studentData: state?.studentData } }
        );
      }}
    />
  );
}

export default App;
