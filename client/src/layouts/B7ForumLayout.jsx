import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout';
import GuruLayout from './GuruLayout';

export default function B7ForumLayout() {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <GuruLayout />;
  if (user?.role === 'admin') return <AdminLayout />;
  return <div className="min-h-screen bg-slate-50"><Outlet /></div>;
}
