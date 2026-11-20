import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { School, User, HeartHandshake, Phone, LogOut } from 'lucide-react';

export default function OrtuDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const parentProfile = user?.profile || {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#008994] text-white">
            <School className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">SMANTI CONNECT</h1>
            <p className="text-[11px] text-slate-400">Portal Orang Tua & Wali Siswa SMAN 3 Malang</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0b5566] to-[#008994] p-8 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                Orang Tua / Wali Siswa
              </span>
              <h2 className="mt-2 text-2xl font-bold">Selamat Datang, Bapak/Ibu {user?.name}!</h2>
              <p className="mt-1 text-sm text-cyan-100">
                Pantau perkembangan akademik, presensi, dan komunikasi guru putra/putri Anda.
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-2xl font-bold">
              {user?.name?.charAt(0) || 'W'}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <User className="h-5 w-5 text-[#008994]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identitas Wali</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-1">Status: Orang Tua/Wali Sah</p>
            <p className="text-xs text-slate-400">ID Akun: {user?.id?.substring(0, 8)}...</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <HeartHandshake className="h-5 w-5 text-[#008994]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NIS Anak Asuh</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{parentProfile.nis || '-'}</p>
            <p className="text-xs text-slate-400 mt-1">Siswa Terhubung</p>
            <p className="text-xs text-emerald-600 font-semibold">Status: Terverifikasi</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-2 text-slate-400">
              <Phone className="h-5 w-5 text-[#008994]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kontak Terdaftar</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{parentProfile.phone || '-'}</p>
            <p className="text-xs text-slate-400 mt-1">Alamat: {parentProfile.address || '-'}</p>
            <p className="text-xs text-slate-400">Login via NIS</p>
          </div>
        </div>

        {/* Info Integrasi */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-sm font-bold text-slate-700">Area Portal Orang Tua / Wali</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Akun ini terautentikasi melalui sistem Supabase Auth menggunakan NIS anak dan dipetakan langsung
            ke profil orang tua.
          </p>
        </div>
      </main>
    </div>
  );
}

