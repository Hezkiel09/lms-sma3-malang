import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getUser, homeFor } from '../services/auth';
import { PRESENSI_SOURCE } from '../services/presensiGuruApi';

// Penjaga halaman: belum login -> /login, peran salah -> ke halaman perannya sendiri.
// Mode mock (VITE_PRESENSI_SOURCE=mock) tidak butuh login supaya UI tetap bisa dikembangkan.
export default function RequireRole({ role }) {
  const location = useLocation();
  if (PRESENSI_SOURCE === 'mock') return <Outlet />;

  const user = getUser();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homeFor(user.role) ?? '/login'} replace />;
  return <Outlet />;
}
