import { Mail, Phone, MapPin, Shield, Camera, User, KeyRound, Clock } from "lucide-react";

const profile = {
  name: "Karina Maharani",
  fullName: "Karina Maharani, S.Pd.",
  role: "Administrator",
  email: "karina@sma3malang.sch.id",
  nip: "198501152010011002",
  phone: "0812-3456-7890",
  address: "Jl. Sultan Agung No. 7, Malang",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  passwordLastChanged: "15 Oktober 2024",
};

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
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Profil Admin
        </h1>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Kelola informasi akun dan pengaturan profil Anda.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN — Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#008994] text-white shadow-sm">
                  <Camera size={14} />
                </div>
              </div>

              {/* Name & Role */}
              <h2 className="mt-4 text-lg font-bold text-slate-800">
                {profile.name}
              </h2>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#008994]/10 px-3 py-1 text-xs font-semibold text-[#008994]">
                <Shield size={12} />
                {profile.role}
              </span>

              {/* Contact details */}
              <div className="mt-5 w-full space-y-3 border-t border-slate-100 pt-5 text-left">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Mail size={14} className="shrink-0 text-slate-400" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <User size={14} className="shrink-0 text-slate-400" />
                  <span className="font-mono text-xs tracking-wide">
                    NIP: {profile.nip}
                  </span>
                </div>
              </div>

              {/* Ubah Foto button */}
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#008994] px-5 py-2.5 text-sm font-semibold text-[#008994] transition hover:bg-[#008994]/5">
                <Camera size={15} />
                Ubah Foto
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Form Cards */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1 — Informasi Pribadi */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <User size={18} className="text-[#008994]" />
              Informasi Pribadi
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-x-8 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
              <InfoRow
                icon={User}
                label="Nama Lengkap"
                value={profile.fullName}
              />
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow
                icon={Phone}
                label="Nomor Telepon"
                value={profile.phone}
              />
              <InfoRow
                icon={MapPin}
                label="Alamat"
                value={profile.address}
              />
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
              <button className="rounded-xl bg-[#008994] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007682]">
                Edit Profil
              </button>
            </div>
          </div>

          {/* Card 2 — Keamanan Akun */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Shield size={18} className="text-[#008994]" />
              Keamanan Akun
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-x-8 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
              <InfoRow
                icon={KeyRound}
                label="Kata Sandi"
                value="••••••••••"
              />
              <InfoRow
                icon={Clock}
                label="Terakhir diubah"
                value={profile.passwordLastChanged}
              />
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
              <button className="flex items-center gap-2 rounded-full border border-[#008994] px-5 py-2.5 text-sm font-semibold text-[#008994] transition hover:bg-[#008994]/5">
                <KeyRound size={15} />
                Ubah Kata Sandi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
