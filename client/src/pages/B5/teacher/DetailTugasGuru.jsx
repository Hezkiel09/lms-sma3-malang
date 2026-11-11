import React, { useState, useEffect } from "react";
import {
  Download,
  ArrowLeft,
  FileText,
  Users,
  Check,
  Clock,
  Star,
  Paperclip
} from "lucide-react";

import DetailNilaiGuru from "./DetailNilaiGuru"; 
import TinjauNilaiGuru from "./TinjauNilaiGuru";
import EditNilaiGuru from "./EditNilaiGuru";
import SidebarGuru from "./SidebarGuru"; 
import TopbarGuru from "./TopbarGuru"; // <--- TAMBAHAN IMPORT TOPBAR

// ==========================================
// DATA DUMMY TUGAS
// ==========================================

const dummyAssignment = {
  id: 1,
  title: "Latihan Mandiri: Grafik Parabola",
  publishedAt: "12 Jan 2026",
  instruction:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  subject: "Matematika",
  className: "X - A",
  deadline: "27 Jan 2026, 23:59",
  attachment: "latihan_grafik_parabola.pdf",
  attachmentSize: "2.4 MB",
  attachmentUrl: "",
};

// ==========================================
// DATA DUMMY PENGUMPULAN SISWA
// ==========================================

const dummyStudents = [
  {
    id: 1,
    name: "Budi Santoso",
    nis: "0012345",
    submittedAt: "21 Jan 2026",
    time: "09:15 AM",
    status: "Sudah dinilai",
    score: 92,
    file: "jawaban_budi.pdf",
    fileUrl: "",
  },
  {
    id: 2,
    name: "Citra Kirana",
    nis: "0012346",
    submittedAt: "",
    time: "",
    status: "Terlambat",
    score: null,
    file: "",
    fileUrl: "",
  },
  {
    id: 3,
    name: "Dedi Kurniawan",
    nis: "0012347",
    submittedAt: "22 Jan 2026",
    time: "11:05 AM",
    status: "Diserahkan",
    score: null,
    file: "jawaban_dedi.pdf",
    fileUrl: "",
  },
  {
    id: 4,
    name: "Eko Susilo",
    nis: "0012348",
    submittedAt: "22 Jan 2026",
    time: "01:00 PM",
    status: "Sudah dinilai",
    score: 88,
    file: "jawaban_eko.pdf",
    fileUrl: "",
  },
  {
    id: 5,
    name: "Fani Rahmawati",
    nis: "0012349",
    submittedAt: "22 Jan 2026",
    time: "02:15 PM",
    status: "Diserahkan",
    score: null,
    file: "jawaban_fani.pdf",
    fileUrl: "",
  },
  {
    id: 6,
    name: "Guntur Wibowo",
    nis: "0012350",
    submittedAt: "",
    time: "",
    status: "Terlambat",
    score: null,
    file: "",
    fileUrl: "",
  },
  {
    id: 7,
    name: "Hana Pertiwi",
    nis: "0012351",
    submittedAt: "23 Jan 2026",
    time: "08:30 AM",
    status: "Sudah dinilai",
    score: 95,
    file: "jawaban_hana.pdf",
    fileUrl: "",
  },
  {
    id: 8,
    name: "Indra Lesmana",
    nis: "0012352",
    submittedAt: "23 Jan 2026",
    time: "09:45 AM",
    status: "Diserahkan",
    score: null,
    file: "jawaban_indra.pdf",
    fileUrl: "",
  },
  {
    id: 9,
    name: "Jihan Nurul",
    nis: "0012353",
    submittedAt: "23 Jan 2026",
    time: "10:00 AM",
    status: "Sudah dinilai",
    score: 90,
    file: "jawaban_jihan.pdf",
    fileUrl: "",
  },
  {
    id: 10,
    name: "Kevin Pratama",
    nis: "0012354",
    submittedAt: "",
    time: "",
    status: "Terlambat",
    score: null,
    file: "",
    fileUrl: "",
  },
];

// ==========================================
// KOMPONEN RINGKASAN
// ==========================================

const SummaryRow = ({ icon: Icon, label, value }) => (
  <div className="grid min-h-[39px] grid-cols-[28px_1fr_auto] items-center gap-2.5">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e5f6fa] text-[#005969]">
      <Icon size={14} />
    </span>

    <span className="text-xs text-slate-600">{label}</span>

    <strong className="text-base text-[#00677b]">{value}</strong>
  </div>
);

// ==========================================
// BADGE STATUS
// ==========================================

const StatusBadge = ({ status }) => {
  const styles = {
    "Sudah dinilai": "bg-[#e4f5f8] text-slate-600",
    Diserahkan: "bg-[#00a3c7] text-white",
    Terlambat: "bg-red-200 text-red-600",
  };

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-bold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
};

const formatDeadlineIndo = (dateStr) => {
  if (!dateStr) return "-";
  if (typeof dateStr === "string" && dateStr.includes("WIB")) {
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const dateFormatted = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });

    const timeFormatted = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).replace(":", ".");

    return `${dateFormatted}, ${timeFormatted} WIB`;
  } catch (err) {
    return dateStr;
  }
};

// ==========================================
// HALAMAN DETAIL TUGAS GURU
// ==========================================

const DetailTugasGuru = ({
  assignmentId,
  onKembali,
  onLogout,
  onEdit,
  onDelete,
  onViewSubmission,
  onGrade,
  onKeProfil,      // <--- TAMBAHAN PROPS PROFIL
  onPilihNotif     // <--- TAMBAHAN PROPS NOTIFIKASI
}) => {
  const [assignment, setAssignment] = useState(null);
  const [halamanAktif, setHalamanAktif] = useState('tabel'); // 'tabel', 'detailNilai', 'tinjauNilai'
  const [siswaTerpilih, setSiswaTerpilih] = useState(null);
  const [students] = useState(dummyStudents);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!assignmentId) {
      setAssignment(dummyAssignment);
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`http://localhost:5000/api/v1/b5/assignments/${assignmentId}`);
        if (!res.ok) {
          setAssignment(dummyAssignment);
          setLoading(false);
          return;
        }
        const result = await res.json();
        setAssignment(result.data);
      } catch (err) {
        console.warn("Menggunakan data dummy karena backend:", err);
        setAssignment(dummyAssignment);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [assignmentId]);

  // ========================================
  // TOMBOL KEMBALI
  // ========================================

  const handleBack = () => {
    if (onKembali) {
      onKembali();
    } else {
      window.history.back();
    }
  };

  // ========================================
  // DATA RINGKASAN
  // ========================================

  const totalSiswa = 32;
  const jumlahDiserahkan = 28;
  const jumlahBelum = 4;
  const jumlahDinilai = 12;
  const participationRate = 87.5;

  // ========================================
  // FILTER SISWA
  // ========================================

  const siswaTampil = students.filter((siswa) => {
    const cocokFilter =
      filter === "Semua" ||
      (filter === "Tertunda" &&
        siswa.status === "Terlambat") ||
      (filter === "Sudah dinilai" &&
        siswa.status === "Sudah dinilai");

    const cocokSearch =
      siswa.name.toLowerCase().includes(search.toLowerCase()) ||
      siswa.nis.includes(search);

    return cocokFilter && cocokSearch;
  });

  // ========================================
  // DOWNLOAD FILE
  // ========================================

  const handleDownload = (url, fileName) => {
    if (!url) {
      alert("File belum terhubung. Silakan hubungkan alamat file melalui sistem.");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "file";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ========================================
  // TAMPILAN UTAMA
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans text-xs text-gray-500">
        Memuat detail tugas...
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-white p-8 font-sans">
        <button
          onClick={handleBack}
          className="mb-4 flex cursor-pointer items-center gap-2 rounded-xl p-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
          {error || 'Data tugas tidak ditemukan.'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full">
      {/* SIDEBAR TERPISAH */}
      <SidebarGuru 
        menuAktif="beranda" 
        onPilihMenu={(menu) => {
          if (menu === 'beranda') handleBack();
        }} 
      />

      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">

        {/* KONDISI HALAMAN AKTIF */}
        {halamanAktif === 'detailNilai' ? (
          <DetailNilaiGuru 
            studentData={siswaTerpilih}
            onKembali={() => setHalamanAktif('tabel')}
            onEditNilai={() => setHalamanAktif('editNilai')} // <--- Ini akan memicu state ke 'editNilai'
          />
        ) : halamanAktif === 'editNilai' ? (
          <EditNilaiGuru 
            studentData={siswaTerpilih}
            onBatal={() => setHalamanAktif('detailNilai')} // Kembali ke detail nilai jika dibatalkan
            onSimpanPerubahan={(updatedData) => {
              setSiswaTerpilih(updatedData);
              setHalamanAktif('detailNilai'); // Kembali ke detail nilai setelah disimpan
            }}
          />
        ) : halamanAktif === 'tinjauNilai' ? (
          <TinjauNilaiGuru 
            studentData={siswaTerpilih}
            onKembali={() => setHalamanAktif('tabel')}
            onSimpanSukses={(updatedData) => {
              setSiswaTerpilih(updatedData);
              setHalamanAktif('detailNilai');
            }}
          />
        ) : (
          <>
            {/* ================================= */}
            {/* TOPBAR GURU */}
            {/* ================================= */}

            <TopbarGuru 
              searchTerm={search}
              onSearchChange={(val) => setSearch(val)}
              placeholder="Cari informasi..."
              onKeProfil={onKeProfil}
              onPilihNotif={onPilihNotif}
            />

            {/* ================================= */}
            {/* BREADCRUMB & TOMBOL KEMBALI */}
            {/* ================================= */}

            <div className="mb-4 flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={18} />
              </button>
              <p className="text-[11px] text-[#71808D]">
                BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">DETAIL TUGAS</span>
              </p>
            </div>

            {/* ================================= */}
            {/* HEADER JUDUL HALAMAN */}
            {/* ================================= */}

            <div className="flex justify-between items-start mb-6 w-full">
              <div>
                <h1 className="text-2xl font-bold text-[#17242E]">Detail Tugas</h1>
                <p className="text-xs text-[#71808D] mt-1">Kelola dan tinjau pengumpulan tugas siswa.</p>
              </div>
            </div>

            {/* ================================= */}
            {/* DETAIL TUGAS DAN RINGKASAN */}
            {/* ================================= */}

            <section className="mb-7 grid grid-cols-[minmax(0,1.8fr)_minmax(270px,1fr)] gap-5 max-xl:grid-cols-1">

              {/* DETAIL TUGAS */}
              <article className="flex min-h-[385px] flex-col rounded-[15px] border border-[#eceaf3] bg-white p-6 shadow-[0_2px_15px_rgba(45,38,93,0.10)]">
                <h2 className="text-xl font-bold tracking-tight max-sm:text-lg text-[#17242E]">
                  {assignment.title}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Published on {assignment.publishedAt}
                </p>

                <h3 className="mb-3 mt-9 text-[11px] font-bold text-[#005969]">
                  INSTRUKSI
                </h3>

                <p className="whitespace-pre-line text-xs leading-[1.8] text-slate-600">
                  {assignment.instruction}
                </p>

                {/* INFORMASI TUGAS */}
                <div className="mt-auto flex flex-wrap gap-3 pt-8">
                  <div className="flex min-w-[105px] flex-col gap-1 rounded-xl border border-[#b5e6f0] bg-[#e5f6fa] px-3.5 py-3">
                    <span className="text-[9px] font-bold text-[#005969]">
                      MATA PELAJARAN
                    </span>
                    <strong className="text-xs">
                      {assignment.subject}
                    </strong>
                  </div>

                  <div className="flex min-w-[105px] flex-col gap-1 rounded-xl border border-[#b5e6f0] bg-[#e5f6fa] px-3.5 py-3">
                    <span className="text-[9px] font-bold text-[#005969]">
                      KELAS
                    </span>
                    <strong className="text-xs">
                      {assignment.className}
                    </strong>
                  </div>

                  <div className="flex min-w-[130px] flex-col gap-1 rounded-xl border border-[#b5e6f0] bg-[#e5f6fa] px-3.5 py-3">
                    <span className="text-[9px] font-bold text-[#005969]">
                      TENGGAT
                    </span>
                    <strong className="text-xs">
                      {formatDeadlineIndo(assignment.deadline_formatted || assignment.deadline)}
                    </strong>
                  </div>
                </div>
              </article>

              {/* KOLOM KANAN */}
              <div className="flex flex-col gap-5">

                {/* LAMPIRAN */}
                <article className="rounded-[15px] border border-[#eceaf3] bg-white p-5 shadow-[0_2px_15px_rgba(45,38,93,0.10)]">
                  <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-[#005969]">
                    <Paperclip size={14} />
                    LAMPIRAN
                  </h3>

                  <div className="flex items-center gap-3 rounded-xl border border-[#b5e6f0] bg-[#e5f6fa] p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#005969]">
                      <FileText size={21} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[11px] font-semibold">
                        {assignment.attachment}
                      </p>

                      <p className="mt-1 text-[10px] text-[#005969]">
                        {assignment.attachmentSize} • File PDF
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          assignment.attachmentUrl,
                          assignment.attachment
                        )
                      }
                      className="px-1 text-lg text-[#005969] hover:text-[#009fc5] cursor-pointer"
                      title="Unduh lampiran"
                    >
                      <Download size={17} />
                    </button>
                  </div>
                </article>

                {/* RINGKASAN PENGUMPULAN */}
                <article className="flex-1 rounded-[15px] border border-[#eceaf3] bg-white p-5 shadow-[0_2px_15px_rgba(45,38,93,0.10)]">
                  <h3 className="mb-2 text-xs font-bold text-[#005969]">
                    Ringkasan Pengumpulan
                  </h3>

                  <div className="flex flex-col">
                    <SummaryRow
                      icon={Users}
                      label="Total Siswa"
                      value={totalSiswa}
                    />

                    <SummaryRow
                      icon={Check}
                      label="Diserahkan"
                      value={jumlahDiserahkan}
                    />

                    <SummaryRow
                      icon={Clock}
                      label="Belum diserahkan"
                      value={jumlahBelum}
                    />

                    <SummaryRow
                      icon={Star}
                      label="Sudah dinilai"
                      value={jumlahDinilai}
                    />
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e5f6fa]">
                    <div
                      className="h-full bg-[#0097b5]"
                      style={{ width: `${participationRate}%` }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-[#005969]">
                    {participationRate}% tingkat partisipasi
                  </p>
                </article>
              </div>
            </section>

            {/* ================================= */}
            {/* TABEL PENGUMPULAN SISWA */}
            {/* ================================= */}

            <section className="overflow-hidden rounded-[15px] border border-[#eceaf3] bg-white shadow-[0_2px_15px_rgba(45,38,93,0.10)]">

              {/* JUDUL DAN FILTER */}
              <div className="flex items-center justify-between gap-4 p-5 max-md:flex-col max-md:items-start">
                <h2 className="text-[15px] font-bold">
                  Pengumpulan Siswa
                </h2>

                <div className="flex flex-wrap gap-2">
                  {["Semua", "Tertunda", "Sudah dinilai"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`rounded-lg border px-3 py-1.5 text-[10px] transition cursor-pointer ${
                        filter === item
                          ? "border-[#005969] bg-[#005969] text-white"
                          : "border-[#b5e6f0] bg-white text-[#005969] hover:bg-[#e5f6fa]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* TABEL */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                  <thead className="bg-[#e5f6fa] text-[#005969]">
                    <tr>
                      <th className="px-4 py-4 text-[9px] font-bold">
                        SISWA
                      </th>

                      <th className="px-4 py-4 text-[9px] font-bold">
                        DIKUMPULKAN
                      </th>

                      <th className="px-4 py-4 text-[9px] font-bold">
                        STATUS
                      </th>

                      <th className="px-4 py-4 text-[9px] font-bold">
                        FILE
                      </th>

                      <th className="px-4 py-4 text-[9px] font-bold">
                        NILAI
                      </th>

                      <th className="px-4 py-4 text-right text-[9px] font-bold">
                        AKSI
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {siswaTampil.map((siswa) => (
                      <tr
                        key={siswa.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        {/* NAMA SISWA */}
                        <td className="px-4 py-4">
                          <p className="font-semibold">
                            {siswa.name}
                          </p>

                          <p className="mt-1 text-[9px] text-gray-400">
                            NIS: {siswa.nis}
                          </p>
                        </td>

                        {/* TANGGAL PENGUMPULAN */}
                        <td className="px-4 py-4">
                          {siswa.submittedAt ? (
                            <>
                              <p>{siswa.submittedAt}</p>
                              <p className="mt-1 text-[9px] text-gray-400">
                                {siswa.time}
                              </p>
                            </>
                          ) : (
                            <span className="italic text-red-500">
                              Tertunda
                            </span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-4">
                          <StatusBadge status={siswa.status} />
                        </td>

                        {/* FILE */}
                        <td className="px-4 py-4">
                          {siswa.file ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(siswa.fileUrl, siswa.file)
                              }
                              title="Unduh file siswa"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e5f6fa] text-[#005969] hover:bg-[#cceff5] cursor-pointer"
                            >
                              <FileText size={17} />
                            </button>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* NILAI */}
                        <td className="px-4 py-4">
                          {siswa.score !== null ? (
                            <strong>{siswa.score}/100</strong>
                          ) : (
                            <span className="text-slate-400">
                              --/100
                            </span>
                          )}
                        </td>

                        {/* AKSI */}
                        <td className="px-4 py-4 text-right">
                          {siswa.status === "Sudah dinilai" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSiswaTerpilih({
                                  nama: siswa.name,
                                  nis: siswa.nis,
                                  asesmen: assignment?.title || "Latihan Mandiri: Grafik Parabola",
                                  score: siswa.score,
                                  status: "SUDAH DINILAI",
                                  dikumpulkan: siswa.submittedAt ? `${siswa.submittedAt}, ${siswa.time}` : '22 Jan 2026, 11:05 AM',
                                  fileName: siswa.file || "Tugas_Grafikparabola_dedi_kurniawan.pdf",
                                  fileSize: "2.4 MB"
                                });
                                setHalamanAktif('detailNilai');
                              }}
                              className="whitespace-nowrap rounded-lg border border-[#b5e6f0] px-3 py-2 text-[10px] text-slate-500 hover:bg-[#e5f6fa] cursor-pointer"
                            >
                              Lihat Pengumpulan
                            </button>
                          ) : siswa.file ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSiswaTerpilih({
                                  nama: siswa.name,
                                  nis: siswa.nis,
                                  asesmen: assignment?.title || "Latihan Mandiri: Grafik Parabola",
                                  status: siswa.status === "Terlambat" ? "TERLAMBAT" : "DISERAHKAN",
                                  dikumpulkan: siswa.submittedAt ? `${siswa.submittedAt}, ${siswa.time}` : '--',
                                  fileName: siswa.file || "Tugas_Grafikparabola_dedi_kurniawan.pdf",
                                  fileSize: "2.4 MB"
                                });
                                setHalamanAktif('tinjauNilai');
                              }}
                              className="whitespace-nowrap rounded-lg bg-[#00a0c4] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#007e99] cursor-pointer"
                            >
                              Tinjau &amp; Nilai
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}

                    {siswaTampil.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center text-sm text-slate-400"
                        >
                          Tidak ada siswa yang sesuai dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER TABEL */}
              <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
                Menampilkan {siswaTampil.length} dari {students.length} siswa
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
};

export default DetailTugasGuru;