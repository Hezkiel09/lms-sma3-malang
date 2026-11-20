import { useState } from 'react';
import {
  Mail,
  Shield,
  User,
  KeyRound,
  Clock,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  const { user, updateProfile, updatePassword } = useAuth();

  // Edit Profil State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [nameForm, setNameForm] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit Password State
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState(null);

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleOpenEditProfile = () => {
    setNameForm(user?.name || '');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const cleanName = nameForm.trim();
    if (!cleanName) {
      showNotification('error', 'Nama lengkap tidak boleh kosong');
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({ name: cleanName });
      setShowEditProfileModal(false);
      showNotification('success', 'Nama profil berhasil diperbarui');
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
      showNotification('error', err.message || 'Gagal memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenEditPassword = () => {
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowEditPasswordModal(true);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showNotification('error', 'Kata sandi minimal 6 karakter');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'Konfirmasi kata sandi tidak cocok');
      return;
    }

    try {
      setSavingPassword(true);
      await updatePassword(passwordForm.newPassword);
      setShowEditPasswordModal(false);
      showNotification('success', 'Kata sandi berhasil diperbarui');
    } catch (err) {
      console.error('Gagal memperbarui kata sandi:', err);
      showNotification('error', err.message || 'Gagal memperbarui kata sandi');
    } finally {
      setSavingPassword(false);
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Aktif';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Profil Administrator
        </h1>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Kelola informasi akun dan pengaturan profil administrator SMANTI Connect.
        </p>
      </div>

      {/* Floating Notification */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs sm:text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN — Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              {/* Avatar Icon */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-50 border-4 border-white shadow-md text-[#008994]">
                <User size={44} strokeWidth={2.2} />
              </div>

              {/* Name & Role */}
              <h2 className="mt-4 text-lg font-bold text-slate-800">
                {user?.name || 'Administrator'}
              </h2>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#008994]/10 px-3 py-1 text-xs font-semibold text-[#008994]">
                <Shield size={12} />
                Administrator Sistem
              </span>

              {/* Contact details */}
              <div className="mt-5 w-full space-y-3 border-t border-slate-100 pt-5 text-left">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Mail size={14} className="shrink-0 text-slate-400" />
                  <span className="truncate">{user?.email || 'admin@sman3malang.sch.id'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Calendar size={14} className="shrink-0 text-slate-400" />
                  <span className="text-xs text-slate-500">Terdaftar sejak: {formattedDate}</span>
                </div>
              </div>

              {/* Ubah Nama button */}
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#008994] px-5 py-2.5 text-sm font-semibold text-[#008994] transition hover:bg-[#008994]/5"
              >
                <Edit2 size={15} />
                Edit Nama Profil
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Details & Security Cards */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1 — Informasi Akun */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <User size={18} className="text-[#008994]" />
              Informasi Akun Administrator
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-x-8 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
              <InfoRow icon={User} label="Nama Lengkap" value={user?.name || '-'} />
              <InfoRow icon={Mail} label="Email Akun" value={user?.email || '-'} />
              <InfoRow icon={Shield} label="Hak Akses" value="Super Administrator (Full Access)" />
              <InfoRow icon={Calendar} label="Tanggal Pendaftaran" value={formattedDate} />
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="rounded-xl bg-[#008994] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007682]"
              >
                Ubah Nama Profil
              </button>
            </div>
          </div>

          {/* Card 2 — Keamanan Akun */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Shield size={18} className="text-[#008994]" />
              Keamanan Akun & Kata Sandi
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-x-8 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
              <InfoRow icon={KeyRound} label="Kata Sandi" value="••••••••••••" />
              <InfoRow icon={Clock} label="Status Autentikasi" value="Supabase Auth Terproteksi" />
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleOpenEditPassword}
                className="flex items-center gap-2 rounded-xl border border-[#008994] px-5 py-2.5 text-sm font-semibold text-[#008994] transition hover:bg-[#008994]/5"
              >
                <KeyRound size={15} />
                Ubah Kata Sandi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Edit Nama Profil */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Edit Nama Profil</h3>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                  Nama Lengkap Administrator <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameForm}
                  onChange={(e) => setNameForm(e.target.value)}
                  placeholder="Administrator SMANTI"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                  Email Akun
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Email akun administrator dikelola melalui setup sistem.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 rounded-xl bg-[#008994] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00707a] disabled:opacity-60"
                >
                  {savingProfile && <Loader2 size={14} className="animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ubah Kata Sandi */}
      {showEditPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Ubah Kata Sandi</h3>
              <button
                type="button"
                onClick={() => setShowEditPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5 block">
                  Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  placeholder="Ulangi kata sandi baru"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#008994] focus:outline-none focus:ring-2 focus:ring-[#008994]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditPasswordModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-1.5 rounded-xl bg-[#008994] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00707a] disabled:opacity-60"
                >
                  {savingPassword && <Loader2 size={14} className="animate-spin" />}
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
