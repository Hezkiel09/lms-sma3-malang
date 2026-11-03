
import React, { useState } from "react";
import {
  FiGrid,
  FiBookOpen,
  FiBarChart2,
  FiCalendar,
  FiMessageSquare,
  FiLogOut,
  FiSearch,
  FiBell,
  FiPaperclip,
  FiDownload,
  FiUsers,
  FiCheck,
  FiClock,
  FiStar,
  FiFileText,
  FiChevronRight,
  FiArrowLeft,
} from "react-icons/fi";

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
// SIDEBAR
// ==========================================

const Sidebar = ({ onBack, onLogout }) => {
  const menuItems = [
    { icon: FiGrid, label: "Beranda" },
    { icon: FiBookOpen, label: "Bank Soal" },
    { icon: FiBarChart2, label: "Rekap Nilai" },
    { icon: FiCalendar, label: "Presensi" },
    { icon: FiMessageSquare, label: "Pesan" },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-[197px] shrink-0 flex-col rounded-r-[22px] border border-[#b5e6f0] bg-white max-md:w-[65px]">
      {/* LOGO */}
      <div className="flex items-center gap-2 px-5 pb-8 pt-10 max-md:justify-center max-md:px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#009fc5] text-xl font-extrabold text-[#075078]">
          S
        </div>

        <div className="leading-tight max-md:hidden">
          <p className="text-[15px] font-extrabold text-[#073e80]">
            SMANTI
          </p>
          <p className="text-[14px] text-[#00a0b3]">
            Connect
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-1 px-3 max-md:px-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={index === 0 ? onBack : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2 py-2 text-left text-[13px] transition ${
                index === 0
                  ? "font-semibold text-[#00899e]"
                  : "text-gray-500 hover:bg-[#e7f7fa] hover:text-[#005969]"
              } max-md:justify-center`}
            >
              <Icon size={18} />
              <span className="max-md:hidden">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* KELUAR */}
      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex items-center justify-between bg-[#fff0f0] px-5 py-2.5 text-left text-xs text-red-500 hover:bg-red-100 max-md:justify-center max-md:px-2"
      >
        <span className="max-md:hidden">Keluar</span>
        <FiLogOut size={17} />
      </button>
    </aside>
  );
};

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
}) => {
  const [assignment] = useState(dummyAssignment);
  const [students] = useState(dummyStudents);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");

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
      alert("File belum terhubung. Silakan hubungkan URL file dari backend.");
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

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#172033]">
      <Sidebar
        onBack={handleBack}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 px-[38px] py-[42px] max-lg:px-5 max-sm:px-3">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <header className="mb-5 flex items-center justify-between gap-5">
          <div className="flex h-[35px] max-w-[700px] flex-1 items-center gap-3 rounded-full border border-[#b5e6f0] px-4">
            <FiSearch
              size={18}
              className="shrink-0 text-[#0089a4]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari informasi"
              className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#b5e6f0] bg-[#e5f6fa] text-[#005969]"
            >
              <FiBell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#009fc5]" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f6fa] font-bold text-[#005969]">
              K
            </div>

            <div className="max-sm:hidden">
              <p className="text-sm font-medium">Karina</p>
              <p className="text-xs text-gray-400">Guru</p>
            </div>
          </div>
        </header>

        {/* ================================= */}
        {/* HEADER DETAIL + TOMBOL KEMBALI */}
        {/* ================================= */}

        <div className="mb-6 flex items-center gap-5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            title="Kembali"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-[#dce8ec] bg-[#eafafd] text-[#0099b5] shadow-sm transition hover:bg-[#d9f5fa]"
          >
            <FiArrowLeft size={24} strokeWidth={2} />
          </button>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>Beranda</span>
              <FiChevronRight size={13} />
              <span>Kelas 10</span>
              <FiChevronRight size={13} />
              <span>Detail Tugas</span>
            </div>

            <h1 className="text-2xl font-bold text-[#172033]">
              Detail Tugas
            </h1>
          </div>
        </div>

        {/* ================================= */}
        {/* DETAIL TUGAS DAN RINGKASAN */}
        {/* ================================= */}

        <section className="mb-7 grid grid-cols-[minmax(0,1.8fr)_minmax(270px,1fr)] gap-5 max-xl:grid-cols-1">

          {/* DETAIL TUGAS */}
          <article className="flex min-h-[385px] flex-col rounded-[15px] border border-[#eceaf3] bg-white p-6 shadow-[0_2px_15px_rgba(45,38,93,0.10)]">
            <h2 className="text-xl font-bold tracking-tight max-sm:text-lg">
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
                  {assignment.deadline}
                </strong>
              </div>
            </div>
          </article>

          {/* KOLOM KANAN */}
          <div className="flex flex-col gap-5">

            {/* LAMPIRAN */}
            <article className="rounded-[15px] border border-[#eceaf3] bg-white p-5 shadow-[0_2px_15px_rgba(45,38,93,0.10)]">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold text-[#005969]">
                <FiPaperclip size={14} />
                LAMPIRAN
              </h3>

              <div className="flex items-center gap-3 rounded-xl border border-[#b5e6f0] bg-[#e5f6fa] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#005969]">
                  <FiFileText size={21} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-[11px] font-semibold">
                    {assignment.attachment}
                  </p>

                  <p className="mt-1 text-[10px] text-[#005969]">
                    {assignment.attachmentSize} • PDF File
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
                  className="px-1 text-lg text-[#005969] hover:text-[#009fc5]"
                  title="Download lampiran"
                >
                  <FiDownload size={17} />
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
                  icon={FiUsers}
                  label="Total Siswa"
                  value={totalSiswa}
                />

                <SummaryRow
                  icon={FiCheck}
                  label="Diserahkan"
                  value={jumlahDiserahkan}
                />

                <SummaryRow
                  icon={FiClock}
                  label="Belum diserahkan"
                  value={jumlahBelum}
                />

                <SummaryRow
                  icon={FiStar}
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
                {participationRate}% Participation Rate
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
                  className={`rounded-lg border px-3 py-1.5 text-[10px] transition ${
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
                          title="Download file siswa"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e5f6fa] text-[#005969] hover:bg-[#cceff5]"
                        >
                          <FiFileText size={17} />
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
                          onClick={() => onViewSubmission?.(siswa)}
                          className="whitespace-nowrap rounded-lg border border-[#b5e6f0] px-3 py-2 text-[10px] text-slate-500 hover:bg-[#e5f6fa]"
                        >
                          Lihat Pengumpulan
                        </button>
                      ) : siswa.file ? (
                        <button
                          type="button"
                          onClick={() => onGrade?.(siswa)}
                          className="whitespace-nowrap rounded-lg bg-[#00a0c4] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#007e99]"
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
      </main>
    </div>
  );
};

export default DetailTugasGuru;
