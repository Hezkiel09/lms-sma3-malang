import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-8 shadow-xl shadow-slate-900/5 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/icon/smantilogo.png" alt="Smanti Connect" className="mb-6 h-auto w-40 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Selamat Datang</h1>
          <p className="mt-2 text-sm text-slate-500">Masuk ke Portal Akademik SMAN 3 Malang</p>
        </div>

        {error && <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email atau NIS / NIP
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="nama@sma3malang.sch.id"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Masuk ke Dashboard</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
