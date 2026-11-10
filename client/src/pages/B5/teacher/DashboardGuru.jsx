import React, { useState, useEffect } from 'react';
import {
  ChevronRight
} from 'lucide-react';
import bannerGuruImg from '../../../assets/banner.png';
import DaftarKelas from './DaftarKelas';
import DetailCourseGuru from './DetailCourseGuru';
import KelolaCourseGuru from './KelolaCourseGuru';
import EditAssignmentGuru from './EditAssignmentGuru';
import DetailFileGuru from './DetailFileGuru';
import DetailTugasGuru from './DetailTugasGuru';
import SidebarGuru from './SidebarGuru';
import TopbarGuru from './TopbarGuru';
import ProfilGuru from './ProfilGuru';

const DashboardGuru = () => {
  const [halamanAktif, setHalamanAktif] = useState('beranda');
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [kelasTerpilih, setKelasTerpilih] = useState(null);

  // State untuk pencarian di Beranda
  const [keywordPencarian, setKeywordPencarian] = useState('');

  // Data dummy Riwayat Tugas
  const [riwayatTugas] = useState([
    { id: 1, tugas: 'Lorem ipsum dolor', kelas: 'X A', mapel: 'Matematika', deadline: '12/05/2026', status: 'ACTIVE' },
    { id: 2, tugas: 'Tugas Harian 3', kelas: 'XI B', mapel: 'Matematika', deadline: '15/05/2026', status: 'DRAFT' },
  ]);

  // Data dummy Riwayat Pengumpulan
  const [riwayatPengumpulan] = useState([
    { id: 1, nama: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII IPS 2', tugas: 'Tugas 1', submitted: '10:45 WIB', status: 'DONE' },
  ]);

  // Logika Filter berdasarkan ketikan di search bar beranda
  const filteredRiwayatTugas = riwayatTugas.filter(item =>
    item.tugas.toLowerCase().includes(keywordPencarian.toLowerCase()) ||
    item.mapel.toLowerCase().includes(keywordPencarian.toLowerCase()) ||
    item.kelas.toLowerCase().includes(keywordPencarian.toLowerCase())
  );

  const filteredRiwayatPengumpulan = riwayatPengumpulan.filter(item =>
    item.nama.toLowerCase().includes(keywordPencarian.toLowerCase()) ||
    item.kelas.toLowerCase().includes(keywordPencarian.toLowerCase()) ||
    item.tugas.toLowerCase().includes(keywordPencarian.toLowerCase())
  );

  // Sinkronisasi URL browser secara aman tanpa merusak fungsi state
  const ubahHalaman = (halaman, urlPath) => {
    window.history.pushState({}, '', urlPath);
    setHalamanAktif(halaman);
  };

  // --- FUNGSI GLOBAL TERPUSAT UNTUK PROFIL & NOTIFIKASI ---
  const handleKeProfil = () => {
    ubahHalaman('profil', '/profil');
  };

  const handlePilihNotif = (idTugas) => {
    setSelectedAssignmentId(idTugas);
    ubahHalaman('detailAssignment', `/kelas/detail/tugas/${idTugas}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/kelas') setHalamanAktif('kelas10');
      else if (window.location.pathname === '/kelas/11') setHalamanAktif('kelas11');
      else if (window.location.pathname === '/kelas/12') setHalamanAktif('kelas12');
      else if (window.location.pathname === '/kelas/detail') setHalamanAktif('detailCourse');
      else if (window.location.pathname === '/kelas/kelola') setHalamanAktif('kelolaCourse');
      else if (window.location.pathname.startsWith('/kelas/edit-assignment/')) {
        const id = window.location.pathname.replace('/kelas/edit-assignment/', '');
        setSelectedAssignmentId(id);
        setHalamanAktif('editAssignment');
      }
      else if (window.location.pathname === '/kelas/edit-assignment') setHalamanAktif('editAssignment');
      else if (window.location.pathname.startsWith('/kelas/detail/tugas/')) {
        const id = window.location.pathname.replace('/kelas/detail/tugas/', '');
        setSelectedAssignmentId(id);
        setHalamanAktif('detailAssignment');
      }
      else if (window.location.pathname.startsWith('/kelas/detail/file/')) {
        const id = window.location.pathname.replace('/kelas/detail/file/', '');
        setSelectedMaterialId(id);
        setHalamanAktif('detailFile');
      }
      else if (window.location.pathname === '/profil') setHalamanAktif('profil');
      else setHalamanAktif('beranda');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render Halaman Profil Guru
  if (halamanAktif === 'profil') {
    return (
      <ProfilGuru
        onKembali={() => ubahHalaman('beranda', '/dashboard')}
        onLogout={() => alert("Berhasil keluar akun")}
      />
    );
  }

  // Render Halaman Daftar Kelas 10
  if (halamanAktif === 'kelas10') {
    return (
      <DaftarKelas
        tingkat="10"
        onKembali={() => ubahHalaman('beranda', '/dashboard')}
        onPilihKelas={(dataKelas) => {
          setKelasTerpilih(dataKelas);
          ubahHalaman('detailCourse', '/kelas/detail');
        }}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  // Render Halaman Daftar Kelas 11
  if (halamanAktif === 'kelas11') {
    return (
      <DaftarKelas
        tingkat="11"
        onKembali={() => ubahHalaman('beranda', '/dashboard')}
        onPilihKelas={(dataKelas) => {
          setKelasTerpilih(dataKelas);
          ubahHalaman('detailCourse', '/kelas/detail');
        }}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  // Render Halaman Daftar Kelas 12
  if (halamanAktif === 'kelas12') {
    return (
      <DaftarKelas
        tingkat="12"
        onKembali={() => ubahHalaman('beranda', '/dashboard')}
        onPilihKelas={(dataKelas) => {
          setKelasTerpilih(dataKelas);
          ubahHalaman('detailCourse', '/kelas/detail');
        }}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  // Render Halaman Detail Course
  if (halamanAktif === 'detailCourse') {
    const tingkatValue = kelasTerpilih
      ? (kelasTerpilih.id.includes('XII') || kelasTerpilih.nama.includes('XII') ? '12'
        : kelasTerpilih.id.includes('XI') || kelasTerpilih.nama.includes('XI') ? '11'
          : '10')
      : '10';

    return (
      <DetailCourseGuru
        kelasData={kelasTerpilih}
        tingkatKelas={tingkatValue}
        onKembali={() => {
          if (tingkatValue === '12') ubahHalaman('kelas12', '/kelas/12');
          else if (tingkatValue === '11') ubahHalaman('kelas11', '/kelas/11');
          else ubahHalaman('kelas10', '/kelas');
        }}
        onKeModeEdit={() => ubahHalaman('kelolaCourse', '/kelas/kelola')}
        onKeEditTugas={(idTugas) => {
          setSelectedAssignmentId(idTugas);
          ubahHalaman('editAssignment', `/kelas/edit-assignment/${idTugas}`);
        }}
        onPilihMateri={(id) => {
          setSelectedMaterialId(id);
          ubahHalaman('detailFile', `/kelas/detail/file/${id}`);
        }}
        onPilihTugas={(id) => {
          setSelectedAssignmentId(id);
          ubahHalaman('detailAssignment', `/kelas/detail/tugas/${id}`);
        }}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  // Render Halaman Detail File / Materi
  if (halamanAktif === 'detailFile') {
    return (
      <DetailFileGuru
        materialId={selectedMaterialId}
        courseId="bf720e90-1886-4c01-9868-249181f900dc"
        onKembali={() => ubahHalaman('detailCourse', '/kelas/detail')}
        onDelete={() => ubahHalaman('detailCourse', '/kelas/detail')}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  // Render Halaman Detail Assignment / Tugas
  if (halamanAktif === 'detailAssignment') {
    return (
      <DetailTugasGuru
        assignmentId={selectedAssignmentId}
        courseId="bf720e90-1886-4c01-9868-249181f900dc"
        onKembali={() => ubahHalaman('detailCourse', '/kelas/detail')}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  // Render Kelola Course
  if (halamanAktif === 'kelolaCourse') {
    return (
      <KelolaCourseGuru
        onKembali={() => ubahHalaman('detailCourse', '/kelas/detail')}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  // Render Edit Assignment Guru
  if (halamanAktif === 'editAssignment') {
    return (
      <EditAssignmentGuru
        assignmentId={selectedAssignmentId}
        onKembali={() => ubahHalaman('detailCourse', '/kelas/detail')}
        onSaveSuccess={(id) => {
          setSelectedAssignmentId(id);
          ubahHalaman('detailAssignment', `/kelas/detail/tugas/${id}`);
        }}
        onKeProfil={handleKeProfil}
        onPilihNotif={handlePilihNotif}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">

      {/* --- SIDEBAR TERPISAH --- */}
      <SidebarGuru
        menuAktif="beranda"
        onPilihMenu={(menu) => {
          if (menu === 'beranda') ubahHalaman('beranda', '/dashboard');
        }}
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">

        {/* --- TOPBAR GURU (TERHUBUNG KE HALAMAN PROFIL) --- */}
        <TopbarGuru
          searchTerm={keywordPencarian}
          onSearchChange={(val) => setKeywordPencarian(val)}
          placeholder="Cari informasi..."
          onKeProfil={handleKeProfil}
          onPilihNotif={handlePilihNotif}
        />

        {/* BREADCRUMB & TITLE */}
        <div className="mb-6">
          <p className="text-[11px] text-[#71808D] mb-1">Beranda /</p>
          <h2 className="text-2xl font-bold text-[#17242E]">Beranda</h2>
        </div>

        {/* WELCOME BANNER GURU */}
        <section className="bg-[#DDF6F9] px-6 sm:px-8 py-6 rounded-3xl mb-8 flex justify-between items-center relative overflow-hidden shadow-xs w-full min-h-[150px]">
          <div className="w-full lg:max-w-[65%] z-10 pr-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#007088] mb-2 leading-tight">
              Selamat Datang,<br />Karina
            </h3>
            <p className="text-xs sm:text-sm text-[#005B66] font-medium leading-relaxed">
              Mari kelola materi dan evaluasi tugas siswa dengan lebih mudah dan cepat.
            </p>
          </div>

          <div className="hidden lg:flex absolute right-4 bottom-0 h-full items-end justify-end pointer-events-none z-10">
            <img
              src={bannerGuruImg}
              alt="Teacher 3D"
              className="h-[110%] w-auto object-contain object-bottom max-w-[220px]"
            />
          </div>
        </section>

        {/* SECTION: PILIHAN KELAS (10, 11, 12) */}
        <section className="mb-8 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">PILIHAN KELAS</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">

            <div
              onClick={() => ubahHalaman('kelas10', '/kelas')}
              className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex items-center justify-between hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition cursor-pointer group"
            >
              <div>
                <h4 className="font-bold text-base text-[#17242E] group-hover:text-[#0088A8] transition">Kelas 10</h4>
                <p className="text-[11px] text-[#71808D] mt-1">Buka halaman course untuk kelas 10</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>

            <div
              onClick={() => ubahHalaman('kelas11', '/kelas/11')}
              className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex items-center justify-between hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition cursor-pointer group"
            >
              <div>
                <h4 className="font-bold text-base text-[#17242E] group-hover:text-[#0088A8] transition">Kelas 11</h4>
                <p className="text-[11px] text-[#71808D] mt-1">Buka halaman course untuk kelas 11</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>

            <div
              onClick={() => ubahHalaman('kelas12', '/kelas/12')}
              className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 flex items-center justify-between hover:shadow-[0_12px_25px_rgba(0,136,168,0.2)] transition cursor-pointer group"
            >
              <div>
                <h4 className="font-bold text-base text-[#17242E] group-hover:text-[#0088A8] transition">Kelas 12</h4>
                <p className="text-[11px] text-[#71808D] mt-1">Buka halaman course untuk kelas 12</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#0088A8] flex items-center justify-center shrink-0">
                <ChevronRight size={18} />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: COURSE SUMMARY (4 STATS) */}
        <section className="mb-8 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">COURSE SUMMARY</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">

            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL MATA PELAJARAN</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">12</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-2/3 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL MATERI</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">48</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-4/5 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL ASSIGNMENT</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">24</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-1/2 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80">
              <p className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">TOTAL PENGUMPULAN</p>
              <p className="text-2xl font-bold text-[#17242E] mt-2">864</p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#0088A8] h-full w-11/12 rounded-full"></div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: RIWAYAT TUGAS */}
        <section className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 mb-6 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
            RIWAYAT TUGAS
          </p>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse">
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '18%' }} />
              </colgroup>

              <thead>
                <tr className="bg-[#E0F7FA]/50 text-[11px] font-bold text-[#006064] uppercase border-b border-cyan-100">
                  <th className="py-3 px-4">TUGAS</th>
                  <th className="py-3 px-4">KELAS</th>
                  <th className="py-3 px-4">MATA PELAJARAN</th>
                  <th className="py-3 px-4">DEADLINE</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRiwayatTugas.length > 0 ? (
                  filteredRiwayatTugas.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3.5 px-4 font-semibold text-[#17242E]">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#0088A8] flex items-center justify-center font-bold text-[10px] shrink-0">
                            {item.tugas
                              .split(' ')
                              .slice(0, 2)
                              .map(kata => kata.charAt(0))
                              .join('')
                              .toUpperCase()}
                          </span>
                          {item.tugas}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#71808D]">
                        {item.kelas}
                      </td>

                      <td className="py-3.5 px-4 text-[#71808D]">
                        {item.mapel}
                      </td>

                      <td className="py-3.5 px-4 text-[#71808D]">
                        {item.deadline}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${item.status === 'ACTIVE'
                              ? 'bg-[#B2EBF2] text-[#006064]'
                              : 'bg-[#FFF3C4] text-[#8C6D00]'
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-400">
                      Tugas tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION: RIWAYAT PENGUMPULAN */}
        <section className="bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,136,168,0.12)] border border-cyan-100/80 w-full">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">RIWAYAT PENGUMPULAN</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E0F7FA]/50 text-[11px] font-bold text-[#006064] uppercase border-b border-cyan-100">
                  <th className="py-3 px-4">NAMA SISWA</th>
                  <th className="py-3 px-4">KELAS</th>
                  <th className="py-3 px-4">TUGAS</th>
                  <th className="py-3 px-4">SUBMITTED</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRiwayatPengumpulan.length > 0 ? (
                  filteredRiwayatPengumpulan.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3.5 px-4 font-semibold text-[#17242E] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-100 text-[#0088A8] flex items-center justify-center font-bold text-[10px]">{item.inisial}</span>
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-4 text-[#71808D]">{item.kelas}</td>
                      <td className="py-3.5 px-4 text-[#71808D]">{item.tugas}</td>
                      <td className="py-3.5 px-4 text-[#71808D]">{item.submitted}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#B2EBF2] text-[#006064] text-[10px] font-bold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-400">Riwayat pengumpulan tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default DashboardGuru;