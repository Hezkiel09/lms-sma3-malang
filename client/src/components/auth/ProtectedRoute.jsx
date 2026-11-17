import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#008994] border-t-transparent" />
    </div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'teacher' ? '/b6/buat-kuis' : '/login'} replace />;
  }
  return children;
}
