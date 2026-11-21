import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleHome = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'teacher') return '/b6/bank-soal';
  if (role === 'student') return '/siswa';
  if (role === 'parent') return '/ortu';
  return '/login';
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#008994] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={roleHome(user?.role)} replace />;
  }

  return children;
}
