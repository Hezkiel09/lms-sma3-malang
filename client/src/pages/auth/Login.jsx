import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { School, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const roleHome = (role) => role === 'admin' ? '/admin/dashboard' : role === 'teacher' ? '/b6/buat-kuis' : '/login';

  useEffect(() => {
   if (isAuthenticated && user?.role) {
    const target = location.state?.from?.pathname;
    navigate(target && ((target.startsWith('/admin') && user.role === 'admin') || (target.startsWith('/b6') && user.role === 'teacher')) ? target : roleHome(user.role), { replace: true });
   }
  }, [isAuthenticated, user, location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login({ identifier: identifier.trim(), password });
      navigate(roleHome(loggedUser.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email/NIS dan kata sandi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <School className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">LMS BHAWIKARSU</h1>
          <p className="text-xs text-slate-500 mt-1">Masuk ke Portal Akademik SMAN 3 Malang</p>
        </div>

        {error && <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Email atau NIS / NIP
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="nama@sma3malang.sch.id"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Masuk ke Dashboard</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
