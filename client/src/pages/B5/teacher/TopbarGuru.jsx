import { useState } from 'react';
import { Bell, Search } from 'lucide-react';

const TopbarGuru = ({ searchTerm, onSearchChange, placeholder = "Cari informasi...", onKeProfil, onPilihNotif }) => {
  const [isOpenNotif, setIsOpenNotif] = useState(false);

  // Data dummy notifikasi pengumpulan tugas siswa
  const [notifikasiList] = useState([
    { id: 1, text: "Dedi Kurniawan mengumpulkan tugas Grafik Parabola", time: "10 menit lalu", assignmentId: 1 },
    { id: 2, text: "Siti Nurhaliza mengumpulkan tugas Trigonometri", time: "1 jam lalu", assignmentId: 1 },
  ]);

  const fotoProfil = null; 

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
        
        {/* DROPDOWN NOTIFIKASI (Disesuaikan proporsional dengan w-12/h-12) */}
        <div className="relative">
          <button 
            onClick={() => setIsOpenNotif(!isOpenNotif)}
            className="p-3 bg-[#E0F7FA] rounded-full text-[#0088A8] relative shadow-xs hover:bg-cyan-100 transition cursor-pointer flex items-center justify-center"
          >
            <Bell size={21} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#00A8CC] rounded-full"></span>
          </button>

          {isOpenNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg p-3 z-50 text-xs">
              <p className="font-bold text-[#17242E] mb-2 px-2">Notifikasi</p>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {notifikasiList.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      setIsOpenNotif(false);
                      if (onPilihNotif) onPilihNotif(notif.assignmentId);
                    }}
                    className="p-2 hover:bg-cyan-50/50 rounded-xl transition cursor-pointer"
                  >
                    <p className="font-semibold text-[#17242E]">{notif.text}</p>
                    <p className="text-[10px] text-[#71808D] mt-0.5">{notif.time}</p>
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
              // Jalur cadangan otomatis jika onKeProfil tidak dikirim dari induk
              window.location.href = '/profil'; 
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none hover:opacity-80 transition"
        >
          {fotoProfil ? (
            <img 
              src={fotoProfil} 
              alt="Karina" 
              className="w-12 h-12 rounded-full object-cover border border-cyan-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#E0F7FA] border border-cyan-200 flex items-center justify-center text-[#0088A8] font-bold text-sm pointer-events-none">
              K
            </div>
          )}
          <div className="text-xs pointer-events-none">
            <p className="font-bold text-[#17242E] leading-tight text-sm">Karina</p>
            <p className="text-[#71808D] text-[11px]">Guru</p>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopbarGuru;