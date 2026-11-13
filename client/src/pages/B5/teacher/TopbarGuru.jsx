import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';

const TopbarGuru = ({ searchTerm, onSearchChange, placeholder = "Cari informasi...", onKeProfil, onPilihNotif }) => {
  const [isOpenNotif, setIsOpenNotif] = useState(false);
  const [teacherName, setTeacherName] = useState('Karina');

  // Data notifikasi pengumpulan tugas siswa
  const [notifikasiList, setNotifikasiList] = useState([
    { id: 1, text: "Dedi Kurniawan mengumpulkan tugas Grafik Parabola", time: "10 menit lalu", assignmentId: "5b889cf4-a272-4095-b5b9-053b76e4d7e9" },
    { id: 2, text: "Siti Nurhaliza mengumpulkan tugas Trigonometri", time: "1 jam lalu", assignmentId: "01d765c1-eea2-44c9-95f2-64e703a63a39" },
  ]);

  useEffect(() => {
    // 1. Ambil notifikasi terbaru dari API
    const fetchNotif = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/b5/notifications');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setNotifikasiList(json.data);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat notifikasi dari API:', err);
      }
    };

    // 2. Ambil profil guru dari API
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/b5/teacher/profile');
        if (res.ok) {
          const json = await res.json();
          if (json.data?.name) {
            // Ambil nama depan untuk display ramah
            const firstName = json.data.name.split(',')[0].split(' ')[0];
            setTeacherName(firstName || 'Karina');
          }
        }
      } catch (err) {
        console.warn('Gagal memuat profil guru dari API:', err);
      }
    };

    fetchNotif();
    fetchProfile();
  }, []);

  const fotoProfil = null; 
  const inisial = teacherName.charAt(0).toUpperCase();

  return (
    <header className="flex justify-between items-center mb-6 w-full relative px-2 pl-12 lg:pl-2">
      {/* SEARCH BAR */}
      <div className="relative w-full max-w-md"> 
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder={placeholder} 
          className="w-full pl-11 pr-4 py-2.5 bg-white rounded-full text-sm border border-cyan-100 shadow-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-gray-400"
        />
      </div>

      {/* RIGHT SECTION: NOTIFIKASI & PROFIL */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* DROPDOWN NOTIFIKASI */}
        <div className="relative">
          <button 
            onClick={() => setIsOpenNotif(!isOpenNotif)}
            className="p-3 bg-[#E0F7FA] rounded-full text-[#0088A8] relative shadow-xs hover:bg-cyan-100 transition cursor-pointer flex items-center justify-center"
            title="Lihat notifikasi"
          >
            <Bell size={21} />
            {notifikasiList.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#00A8CC] rounded-full"></span>
            )}
          </button>

          {isOpenNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="font-bold text-[#17242E]">Notifikasi</p>
                <span className="text-[10px] bg-cyan-50 text-[#0088A8] px-2 py-0.5 rounded-full font-bold">
                  {notifikasiList.length} Baru
                </span>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {notifikasiList.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      setIsOpenNotif(false);
                      if (onPilihNotif && notif.assignmentId) {
                        onPilihNotif(notif.assignmentId);
                      }
                    }}
                    className="p-2.5 hover:bg-cyan-50/50 rounded-xl transition cursor-pointer border-b border-gray-50 last:border-0"
                  >
                    <p className="font-semibold text-[#17242E] leading-snug">{notif.text}</p>
                    <p className="text-[10px] text-[#71808D] mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PROFIL */}
        <div 
          onClick={() => {
            if (onKeProfil) {
              onKeProfil();
            } else {
              window.location.href = '/profil'; 
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none hover:opacity-80 transition"
          title="Buka profil guru"
        >
          {fotoProfil ? (
            <img 
              src={fotoProfil} 
              alt={teacherName} 
              className="w-12 h-12 rounded-full object-cover border border-cyan-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#E0F7FA] border border-cyan-200 flex items-center justify-center text-[#0088A8] font-bold text-sm pointer-events-none">
              {inisial}
            </div>
          )}
          <div className="text-xs pointer-events-none">
            <p className="font-bold text-[#17242E] leading-tight text-sm">{teacherName}</p>
            <p className="text-[#71808D] text-[11px]">Guru</p>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopbarGuru;
