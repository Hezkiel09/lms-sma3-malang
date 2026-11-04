import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  LogOut, 
  Search, 
  Bell, 
  BookOpen, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Download, 
  ExternalLink, 
  ArrowLeft,
  ClipboardList,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';
import TabTugasGuru from './TabTugasGuru'; // Import komponen tab tugas
import TabNilaiGuru from './TabNilaiGuru';

const COURSE_ID = 'bf720e90-1886-4c01-9868-249181f900dc';

const DetailCourseGuru = ({ onKembali, onKeModeEdit, onKeEditTugas, onPilihMateri, onPilihTugas }) => {
  const [daftarBab, setDaftarBab] = useState([]);
  const [daftarMateri, setDaftarMateri] = useState([]);
  const [daftarTugas, setDaftarTugas] = useState([]);
  const [loadingAPI, setLoadingAPI] = useState(true);
  const [errorAPI, setErrorAPI] = useState('');

  const [tabAktif, setTabAktif] = useState('materi');

 const [openBab, setOpenBab] = useState({});

const toggleBab = (id) => {
  setOpenBab((prev) => ({
    ...prev,
    [id]: !prev[id]
  }));
};

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoadingAPI(true);
      setErrorAPI('');

      const [responseSection, responseMateri, responseTugas] = await Promise.all([
        fetch(`http://localhost:5000/api/v1/b5/courses/${COURSE_ID}/sections`),
        fetch(`http://localhost:5000/api/v1/b5/courses/${COURSE_ID}/materials`),
        fetch(`http://localhost:5000/api/v1/b5/courses/${COURSE_ID}/assignments`)
      ]);

      if (!responseSection.ok || !responseMateri.ok) {
        throw new Error('Gagal mengambil data dari backend.');
      }

      const hasilSection = await responseSection.json();
      const hasilMateri = await responseMateri.json();

      if (!Array.isArray(hasilSection.data)) {
        throw new Error('Format data Section tidak sesuai.');
      }

      if (!Array.isArray(hasilMateri.data)) {
        throw new Error('Format data Materi tidak sesuai.');
      }

      setDaftarBab(hasilSection.data);
      setOpenBab(
        Object.fromEntries(
            hasilSection.data.map((bab) => [bab.id, true])
        )
    );
      setDaftarMateri(hasilMateri.data);

      if (responseTugas && responseTugas.ok) {
        const hasilTugas = await responseTugas.json();
        if (Array.isArray(hasilTugas.data)) {
          setDaftarTugas(hasilTugas.data);
        }
      }
    } catch (error) {
      console.error('Error mengambil data:', error);
      setErrorAPI(error.message);
    } finally {
      setLoadingAPI(false);
    }
  };

  fetchData();
}, []);

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
        <div>
          <div className="mt-4 mb-8 pl-2">
            <img src={logoSmanti} alt="SMANTI Connect" className="h-10 object-contain" />
          </div>

          <nav className="space-y-0">
            <button 
              onClick={onKembali}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E0F7FA] text-[#007A99] font-bold text-sm w-full text-left cursor-pointer"
            >
              <Home size={24} className="text-[#0088A8]" />
              <span>Beranda</span>
            </button>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <BookOpen size={24} />
              <span>Bank Soal</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <FileText size={24} />
              <span>Rekap Nilai</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <CalendarIcon size={24} />
              <span>Presensi</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <MessageSquare size={24} />
              <span>Pesan</span>
            </a>
          </nav>
        </div>

        <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#FFF0F0] text-[#E53935] font-semibold text-sm hover:bg-red-100 transition cursor-pointer">
          <span>Keluar</span>
          <LogOut size={22} />
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        
        {/* TOPBAR */}
        <header className="flex justify-between items-center mb-6 w-full">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" size={20} />
            <input 
              type="text" 
              placeholder="Cari informasi..." 
              className="w-full pl-11 pr-4 py-2 bg-white rounded-full text-sm border border-cyan-100 shadow-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 bg-[#E0F7FA] rounded-full text-[#0088A8] relative shadow-xs hover:bg-cyan-100 transition cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00A8CC] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" 
                alt="Karina" 
                className="w-9 h-9 rounded-full object-cover border border-cyan-200"
              />
              <div className="text-xs">
                <p className="font-bold text-[#17242E] leading-tight">Karina</p>
                <p className="text-[#71808D] text-[11px]">Guru</p>
              </div>
            </div>
          </div>
        </header>

        {/* BREADCRUMB */}
        <div className="mb-4 flex items-center gap-3">
          <button 
            onClick={onKembali}
            className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">MATERI</span>
          </p>
        </div>

        {/* HEADER COURSE & TOMBOL EDIT (Hanya muncul di tab Materi) */}
        <div className="flex justify-between items-start mb-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-[#17242E]">Matematika X A</h2>
            <p className="text-xs text-[#71808D] mt-1">Kelola dan atur materi pelajaran untuk siswa.</p>
          </div>

          {tabAktif === 'materi' && (
            <button 
              onClick={onKeModeEdit}
              className="px-5 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Edit3 size={15} />
              EDIT
            </button>
          )}
        </div>

        {/* TAB NAVIGASI (MATERI / TUGAS / NILAI) */}
        <div className="flex gap-8 border-b border-gray-200 mb-6 text-sm font-bold">
          <button 
            onClick={() => setTabAktif('materi')}
            className={`pb-3 transition cursor-pointer ${
              tabAktif === 'materi' 
                ? 'text-[#0088A8] border-b-2 border-[#0088A8]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Materi
          </button>
          <button 
            onClick={() => setTabAktif('tugas')}
            className={`pb-3 transition cursor-pointer ${
              tabAktif === 'tugas' 
                ? 'text-[#0088A8] border-b-2 border-[#0088A8]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Tugas
          </button>
          <button 
            onClick={() => setTabAktif('nilai')}
            className={`pb-3 transition cursor-pointer ${
              tabAktif === 'nilai' 
                ? 'text-[#0088A8] border-b-2 border-[#0088A8]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Nilai
          </button>
        </div>

{/* ISI TAB: MATERI */}
{tabAktif === 'materi' && (
  <div className="space-y-6 w-full">

    {loadingAPI ? (
      <p className="text-sm text-gray-500">
        Memuat data materi...
      </p>
    ) : errorAPI ? (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200">
        <p className="text-sm text-red-600">{errorAPI}</p>
      </div>
    ) : daftarBab.length === 0 ? (
      <p className="text-sm text-gray-500">
        Belum ada bagian materi.
      </p>
    ) : (
      daftarBab.map((bab) => {
        const materiPerSection = daftarMateri.filter(
          (materi) => materi.section_id === bab.id
        );
        const tugasPerSection = daftarTugas.filter(
          (tugas) => tugas.section_id === bab.id
        );

        return (
          <div
            key={bab.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,136,168,0.08)] overflow-hidden"
          >
            <div
              onClick={() => toggleBab(bab.id)}
              className="p-5 flex justify-between items-center bg-[#F8FAFC]/60 border-b border-gray-100 cursor-pointer hover:bg-cyan-50/20 transition"
            >
              <div className="flex items-center gap-3">
                {openBab[bab.id] ? (
                  <ChevronUp size={18} className="text-[#0088A8]" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}

                <h3 className="font-bold text-base text-[#17242E]">
                  {bab.title}
                </h3>
              </div>

              <span className="text-[11px] text-[#71808D]">
                {materiPerSection.length} materi • {tugasPerSection.length} tugas
              </span>
            </div>

            {openBab[bab.id] && (
              <div className="p-6 space-y-4">

                {materiPerSection.length === 0 && tugasPerSection.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Belum ada materi atau tugas pada bagian ini.
                  </p>
                ) : null}

                {materiPerSection.map((materi) => (
                    <div
                      key={materi.id}
                      onClick={() => {
                        if (onPilihMateri) {
                          onPilihMateri(materi.id);
                        } else {
                          window.location.href = `/kelas/detail/file/${materi.id}`;
                        }
                      }}
                      className="bg-[#E0F7FA]/40 border border-cyan-100 p-3.5 rounded-2xl hover:border-[#0088A8] hover:bg-cyan-50/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0088A8] text-white flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>

                        <div>
                          <p className="font-bold text-xs text-[#17242E]">
                            {materi.title || 'Materi tanpa judul'}
                          </p>

                          {materi.description && (
                            <p className="text-[10px] text-[#71808D] mt-1">
                              {materi.description}
                            </p>
                          )}

                          <p className="text-[10px] text-[#71808D] mt-1">
                            Status: {materi.status || 'Belum tersedia'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Daftar Tugas per Section */}
                {tugasPerSection.map((tugas) => (
                  <div
                    key={tugas.id}
                    onClick={() => {
                      if (onPilihTugas) {
                        onPilihTugas(tugas.id);
                      } else {
                        window.location.href = `/kelas/detail/tugas/${tugas.id}`;
                      }
                    }}
                    className="bg-[#E0F7FA]/40 border border-cyan-100 p-3.5 rounded-2xl hover:border-[#0088A8] hover:bg-cyan-50/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#054C5A] text-white flex items-center justify-center shrink-0">
                        <ClipboardList size={20} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-cyan-100 text-[#006064] px-1.5 py-0.5 rounded">
                            TUGAS
                          </span>
                          <p className="font-bold text-xs text-[#17242E]">
                            {tugas.title || 'Tugas tanpa judul'}
                          </p>
                        </div>

                        {tugas.instructions && (
                          <p className="text-[10px] text-[#71808D] mt-1 line-clamp-1">
                            {tugas.instructions}
                          </p>
                        )}

                        <p className="text-[10px] text-[#71808D] mt-1">
                          Tenggat: <span className="font-semibold text-cyan-800">{tugas.deadline_formatted || tugas.deadline}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        );
      })
    )}

  </div>
)}

        {/* ISI TAB: TUGAS */}
        {tabAktif === 'tugas' && (
          <TabTugasGuru onKeEditTugas={onKeEditTugas} />
        )}

        {/* ISI TAB: NILAI */}
        {tabAktif === 'nilai' && (
          <TabNilaiGuru 
            onKeDetailNilai={() => setSubHalaman('detailNilai')} 
            onKeInputNilai={() => setSubHalaman('inputNilai')} 
          />
        )}

      </main>
    </div>
  );
};

export default DetailCourseGuru;