import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Pemetaan rute beranda default berdasarkan role
 */
const getHomeRouteForRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/guru';
    case 'student':
      return '/siswa';
    case 'parent':
      return '/ortu';
    default:
      return '/login';
  }
};

/**
 * Validasi apakah rute yang dituju diizinkan untuk role yang login
 */
const isPathAllowedForRole = (pathname, role) => {
  if (!pathname || pathname === '/login') return false;
  if (pathname.startsWith('/admin') && role !== 'admin') return false;
  if (pathname.startsWith('/guru') && role !== 'teacher' && role !== 'admin') return false;
  if (pathname.startsWith('/siswa') && role !== 'student' && role !== 'admin') return false;
  if (pathname.startsWith('/ortu') && role !== 'parent' && role !== 'admin') return false;
  return true;
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const fromPath = location.state?.from?.pathname;
      const target = isPathAllowedForRole(fromPath, user.role)
        ? fromPath
        : getHomeRouteForRole(user.role);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setError('Silakan masukkan Email / NIS dan kata sandi.');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login({ identifier: cleanIdentifier, password });

      const fromPath = location.state?.from?.pathname;
      const target = isPathAllowedForRole(fromPath, loggedUser.role)
        ? fromPath
        : getHomeRouteForRole(loggedUser.role);

      navigate(target, { replace: true });
    } catch (err) {
      console.error('Login gagal:', err);
      setError(err.message || 'Login gagal. Periksa kembali email/NIS dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        {/* Header Portal */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#008994] text-white shadow-lg shadow-[#008994]/30 mb-3">
            <School className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">SMANTI CONNECT</h1>
          <p className="text-xs text-slate-500 mt-1">Portal Akademik Terpadu SMA Negeri 3 Malang</p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            <span>Admin</span> • <span>Guru</span> • <span>Siswa</span> • <span>Orang Tua</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Form Login Universal */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email atau NIS
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="nama@sman3malang.sch.id atau NIS"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Orang tua/wali dapat masuk menggunakan NIS siswa terdaftar.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#008994] py-2.5 text-sm font-semibold text-white hover:bg-[#00707a] transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Satu pintu masuk untuk seluruh civitas akademika SMAN 3 Malang.
          </p>
        </div>
      </div>
    </div>
  );
}
