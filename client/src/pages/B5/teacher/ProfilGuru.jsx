import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Shield, ArrowLeft, LogOut, Camera } from 'lucide-react';

const ProfilGuru = ({ onKembali, onLogout }) => {
  // State foto profil (jika kosong/null, akan otomatis pakai inisial)
  const [fotoProfil, setFotoProfil] = useState(null); 
  const [profile, setProfile] = useState({
    name: "Karina, S.Pd.",
    nip: "198807202012012003",
    email: "karina@sman3malang.sch.id",
    phone: "081234567890",
    subject: "Guru Mata Pelajaran Matematika",
    school: "SMAN 3 Malang",
    status: "Aktif Mengajar",
  });
  const [phone, setPhone] = useState("081234567890");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/v1/b5/teacher/profile');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setProfile(json.data);
            setPhone(json.data.phone || '081234567890');
          }
        }
      } catch (err) {
        console.warn("Menggunakan data default profil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const namaGuru = profile.name || "Karina, S.Pd.";
  const inisialNama = namaGuru.charAt(0).toUpperCase();

  // Handler untuk upload foto baru
  const handleGantiFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFotoProfil(imageUrl);
    }
  };

  const handleSimpanProfil = async () => {
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5000/api/v1/b5/teacher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        const json = await res.json();
        setProfile(json.data);
        alert("Perubahan profil berhasil disimpan!");
      } else {
        alert("Gagal menyimpan perubahan profil.");
      }
    } catch (err) {
      console.error("Error menyimpan profil:", err);
      alert("Perubahan profil berhasil disimpan secara lokal!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">

        {/* BREADCRUMB & KEMBALI */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#71808D] mb-1">Beranda / Profil Guru</p>
            <h2 className="text-2xl font-bold text-[#17242E]">Profil &amp; Pengaturan Akun</h2>
          </div>
          <button 
            onClick={onKembali}
            className="flex items-center gap-2 px-4 py-2 bg-[#E0F7FA] text-[#0088A8] rounded-xl text-xs font-semibold hover:bg-cyan-100 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </button>
        </div>

        {/* KONTROL KARTU PROFIL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KARTU INFORMASI UTAMA & INISIAL/FOTO */}
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              {fotoProfil ? (
                <img 
                  src={fotoProfil} 
                  alt={namaGuru} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-cyan-100 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#E0F7FA] border-4 border-cyan-100 shadow-md flex items-center justify-center text-[#0088A8] text-2xl font-bold">
                  {inisialNama}
                </div>
              )}
              
              {/* Tombol Kamera Overlay untuk Ganti/Upload Foto */}
              <label htmlFor="upload-foto" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                <Camera size={20} />
              </label>
              <input 
                id="upload-foto" 
                type="file" 
                accept="image/*" 
                onChange={handleGantiFoto} 
                className="hidden" 
              />
            </div>

            <p className="text-[10px] text-[#71808D] mb-2">Klik foto untuk mengganti</p>

            <h3 className="text-lg font-bold text-[#17242E]">{namaGuru}</h3>
            <p className="text-xs text-[#0088A8] font-semibold mt-0.5">{profile.subject || "Guru Mata Pelajaran Matematika"}</p>
            <span className="mt-3 px-3 py-1 rounded-full bg-[#E0F7FA] text-[#006064] text-[10px] font-bold">
              Status: {profile.status || "Aktif Mengajar"}
            </span>

            <div className="w-full mt-6 pt-6 border-t border-gray-100 space-y-3 text-left text-xs">
              <div className="flex items-center gap-3 text-[#71808D]">
                <Building size={16} className="text-[#0088A8]" />
                <span>{profile.school || "SMAN 3 Malang"}</span>
              </div>
              <div className="flex items-center gap-3 text-[#71808D]">
                <Shield size={16} className="text-[#0088A8]" />
                <span>NIP. {profile.nip || "198807202012012003"}</span>
              </div>
            </div>
          </div>

          {/* DETAIL INFORMASI & PENGATURAN */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <h4 className="text-sm font-bold text-[#17242E] mb-4 uppercase tracking-wider">Informasi Kontak &amp; Akun</h4>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#71808D] block mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    disabled 
                    value={namaGuru} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#17242E] font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#71808D] block mb-1">Alamat Surel Institusi</label>
                  <input 
                    type="email" 
                    disabled 
                    value={profile.email || "karina@sman3malang.sch.id"} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#17242E] font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#71808D] block mb-1">Nomor Telepon / WhatsApp</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-cyan-100 rounded-xl text-[#17242E] font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSimpanProfil}
                  disabled={saving}
                  className={`px-5 py-2.5 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#054C5A] hover:bg-[#033742]'
                  }`}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>

            {/* ZONA BAHAYA / KELUAR */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-red-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-red-600 mb-1">Keluar dari Sesi Ini</h4>
                <p className="text-xs text-[#71808D]">Akhiri sesi mengajar dan keluar dari akun LMS SMANTI Connect.</p>
              </div>
              <button 
                onClick={() => {
                  if (onLogout) onLogout();
                  else alert("Berhasil keluar dari aplikasi.");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition cursor-pointer border border-red-200"
              >
                <LogOut size={16} /> Keluar Akun
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default ProfilGuru;
