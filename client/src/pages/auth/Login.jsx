import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import landingImage from '../../assets/landingpage.png';
import studentImage from '../../assets/siswaa.png';
import parentImage from '../../assets/ortu.png';
import teacherImage from '../../assets/guruu.png';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleHome = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'teacher') return '/dashboard';
  if (role === 'student') return '/dashboard-siswa';
  if (role === 'parent') return '/ortu';
  return '/login';
};

const isPathAllowedForRole = (pathname, role) => {
  if (!pathname || pathname === '/login') return false;
  if (pathname.startsWith('/admin')) return role === 'admin';
  if (
    pathname.startsWith('/b6') ||
    pathname.startsWith('/guru') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/kelas') ||
    pathname === '/profil'
  ) {
    return role === 'teacher' || role === 'admin';
  }
  if (
    pathname.startsWith('/siswa') ||
    pathname === '/dashboard-siswa' ||
    pathname === '/profil-siswa'
  ) {
    return role === 'student' || role === 'admin';
  }
  if (pathname.startsWith('/ortu')) return role === 'parent' || role === 'admin';
  return false;
};

const roleDetails = {
  admin: {
    role: 'admin',
    name: 'Admin',
    identifier: 'Email',
    placeholder: 'Masukkan email admin',
    forgotPath: '/lupa-kata-sandi/admin',
    image: landingImage,
  },
  siswa: {
    role: 'student',
    name: 'Siswa',
    identifier: 'Email / NIS',
    placeholder: 'Masukkan email atau Nomor Induk Siswa',
    forgotPath: '/lupa-kata-sandi/siswa',
    image: studentImage,
  },
  ortu: {
    role: 'parent',
    name: 'Orang Tua',
    identifier: 'Email',
    placeholder: 'Masukkan email orang tua',
    forgotPath: '/lupa-kata-sandi/ortu',
    image: parentImage,
  },
  guru: {
    role: 'teacher',
    name: 'Guru',
    identifier: 'Email / NIP',
    placeholder: 'Masukkan email atau Nomor Induk Pegawai',
    forgotPath: '/lupa-kata-sandi/guru',
    image: teacherImage,
  },
};

const logo = '/icon/smantilogo.png';

function Brand() {
  return <img src={logo} alt="SMANTI Connect" className="h-auto w-36 object-contain" />;
}

function SplitLayout({ image, children }) {
  return (
    <main className="min-h-screen bg-white font-sans lg:grid lg:grid-cols-[46%_54%]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-slate-100 lg:block">
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-sky-900/10" />
      </aside>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-xl">{children}</div>
      </section>
    </main>
  );
}

function HelpText() {
  return (
    <p className="mt-4 text-center text-xs leading-5 text-stone-500">
      Belum punya akun? Silakan hubungi{' '}
      <span className="font-medium text-cyan-700">Administrator IT Sekolah</span>
      {' '}untuk informasi pendaftaran dan bantuan teknis.
    </p>
  );
}

function LandingPage() {
  const [activeRole, setActiveRole] = useState('siswa');

  const roleButtonClass = (role) =>
    `flex min-h-14 w-full cursor-pointer items-center justify-center rounded-xl border-2 px-5 py-4 text-center font-semibold transition focus:outline-none focus:ring-4 focus:ring-cyan-600/20 ${
      activeRole === role
        ? 'border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-600'
        : 'border-cyan-600 bg-white text-cyan-600 hover:bg-cyan-50'
    }`;

  return (
    <SplitLayout image={landingImage}>
      <div className="mx-auto max-w-lg">
        <Brand />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Selamat Datang di SMANTI Connect!
        </h1>
        <p className="mt-3 text-base leading-6 text-stone-500">
          Platform digital terintegrasi untuk mendukung kegiatan belajar
          mengajar dan administrasi SMAN 3 Malang.
        </p>

        <div className="mt-7 space-y-3">
          <Link
            to="/login/siswa"
            onMouseEnter={() => setActiveRole('siswa')}
            onFocus={() => setActiveRole('siswa')}
            className={roleButtonClass('siswa')}
          >
            Masuk sebagai Siswa
          </Link>

          <Link
            to="/login/ortu"
            onMouseEnter={() => setActiveRole('ortu')}
            onFocus={() => setActiveRole('ortu')}
            className={roleButtonClass('ortu')}
          >
            Masuk sebagai Orang Tua
          </Link>

          <Link
            to="/login/guru"
            onMouseEnter={() => setActiveRole('guru')}
            onFocus={() => setActiveRole('guru')}
            className={roleButtonClass('guru')}
          >
            Masuk sebagai Guru
          </Link>
        </div>

        <HelpText />
      </div>
    </SplitLayout>
  );
}

function LoginForm({ audience }) {
  const config = roleDetails[audience];
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;
    const fromPath = location.state?.from?.pathname;
    navigate(
      isPathAllowedForRole(fromPath, user.role) ? fromPath : roleHome(user.role),
      { replace: true },
    );
  }, [isAuthenticated, user, location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const loggedUser = await login({
        identifier: identifier.trim(),
        password,
        expectedRole: config.role,
      });

      const fromPath = location.state?.from?.pathname;
      navigate(
        isPathAllowedForRole(fromPath, loggedUser.role)
          ? fromPath
          : roleHome(loggedUser.role),
        { replace: true },
      );
    } catch (loginError) {
      setError(loginError.message || 'Login gagal. Periksa kembali email/NIS dan kata sandi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SplitLayout image={config.image}>
      <div className="mx-auto max-w-xl">
        <Brand />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-900">
          Masuk ke Akun Anda
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Selamat datang! Masukkan kredensial akun {config.name.toLowerCase()} Anda untuk melanjutkan.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="identifier"
              className="mb-2 block text-[10px] font-semibold tracking-[0.2em] text-cyan-700"
            >
              {config.identifier.toUpperCase()}
            </label>
            <input
              id="identifier"
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={config.placeholder}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-600/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[10px] font-semibold tracking-[0.2em] text-cyan-700"
            >
              KATA SANDI
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 pr-12 text-sm text-stone-900 placeholder:text-stone-400 focus:border-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-600/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-cyan-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-cyan-600"
              />
              Ingat saya
            </label>
            <Link
              to={config.forgotPath}
              className="font-medium tracking-[0.12em] text-stone-500 underline underline-offset-4 hover:text-cyan-700"
            >
              LUPA KATA SANDI?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-4 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Masuk'}
          </button>
        </form>

        <HelpText />
      </div>
    </SplitLayout>
  );
}

function ForgotPasswordForm({ audience }) {
  const config = roleDetails[audience];
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <SplitLayout image={config.image}>
      <div className="mx-auto max-w-xl">
        <Brand />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-900">
          Lupa Kata Sandi
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Masukkan email akun {config.name.toLowerCase()} untuk meminta bantuan reset kata sandi SMANTI Connect.
        </p>

        {sent ? (
          <div
            role="status"
            className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"
          >
            Permintaan Anda sudah dicatat. Silakan hubungi Administrator IT Sekolah
            untuk menyelesaikan reset kata sandi.
          </div>
        ) : (
          <form
            className="mt-7 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-[10px] font-semibold tracking-[0.2em] text-cyan-700"
              >
                EMAIL
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Masukkan alamat email"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3.5 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-600/10"
                />
              </div>
            </div>
            <button
              type="submit"
              className="min-h-14 w-full cursor-pointer rounded-xl bg-cyan-600 px-5 py-4 font-semibold text-white transition hover:bg-cyan-700"
            >
              Kirim Permintaan
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-stone-500">
          Sudah ingat kata sandi Anda?{' '}
          <Link
            to={`/login/${audience}`}
            className="font-semibold text-cyan-600 hover:text-cyan-700"
          >
            Masuk
          </Link>
        </p>
      </div>
    </SplitLayout>
  );
}

export default function LoginPage() {
  const { pathname } = useLocation();

  if (pathname === '/login') return <LandingPage />;
  if (pathname === '/login/admin') return <LoginForm audience="admin" />;
  if (pathname === '/login/siswa') return <LoginForm audience="siswa" />;
  if (pathname === '/login/guru') return <LoginForm audience="guru" />;
  if (pathname === '/login/ortu') return <LoginForm audience="ortu" />;
  if (pathname === '/lupa-kata-sandi/admin') return <ForgotPasswordForm audience="admin" />;
  if (pathname === '/lupa-kata-sandi/siswa') return <ForgotPasswordForm audience="siswa" />;
  if (pathname === '/lupa-kata-sandi/guru') return <ForgotPasswordForm audience="guru" />;
  if (pathname === '/lupa-kata-sandi/ortu') return <ForgotPasswordForm audience="ortu" />;

  return <LandingPage />;
}