
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  LockKeyhole,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  X,
  Copy,
} from "lucide-react";

import {
  presensiGuruApi,
  PRESENSI_SOURCE,
} from "../../services/presensiGuruApi";

// ========================================
// KONFIGURASI
// ========================================

const ALPHA_WARNING_LIMIT = 80;

const C = {
  navy: "#172338",
  teal: "#005b6d",
  cyan: "#0089a4",
  muted: "#718096",
  line: "#d5e9ef",
  orange: "#c2410c",
};

const STATUS = {
  hadir: {
    short: "H",
    label: "Hadir",
    color: "#0089a4",
    bg: "#dff4f9",
  },
  izin: {
    short: "I",
    label: "Izin",
    color: "#ed631e",
    bg: "#fff0e3",
  },
  sakit: {
    short: "S",
    label: "Sakit",
    color: "#e11d48",
    bg: "#ffedf1",
  },
  alpha: {
    short: "A",
    label: "Alfa",
    color: "#475569",
    bg: "#e5e7eb",
  },
  pending: {
    short: "–",
    label: "Belum dicatat",
    color: "#94a3b8",
    bg: "#f1f5f9",
  },
};

function getToken() {
  return PRESENSI_SOURCE === "mock"
    ? null
    : sessionStorage.getItem("b8-teacher-token");
}

// ========================================
// HELPER
// ========================================

function getSemester(dateValue) {
  if (!dateValue) return null;

  const [year, month] = String(dateValue)
    .split("-")
    .map(Number);

  if (!year || !month) return null;

  if (month >= 7) {
    return {
      key: `${year}-ganjil`,
      label: `Semester ganjil ${year}/${year + 1}`,
    };
  }

  return {
    key: `${year - 1}-genap`,
    label: `Semester genap ${year - 1}/${year}`,
  };
}

function studentKey(student) {
  if (
    student?.nis !== undefined &&
    student?.nis !== null &&
    student?.nis !== ""
  ) {
    return `nis-${student.nis}`;
  }

  return `id-${student?.id}`;
}

function getStudentStatus(attendance, session) {
  if (!attendance) return null;

  if (!attendance.recorded_at) {
    return session.state === "closed"
      ? "alpha"
      : "pending";
  }

  return STATUS[attendance.status]
    ? attendance.status
    : null;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getPercent(value, total) {
  return total > 0
    ? Math.round((value / total) * 100)
    : null;
}

function csvEscape(value) {
  const text = String(value ?? "");

  // Menghindari formula injection saat dibuka di Excel.
  const safe = /^[=+\-@\t\r]/.test(text)
    ? `'${text}`
    : text;

  return `"${safe.replace(/"/g, '""')}"`;
}

// ========================================
// KOMPONEN STATUS
// ========================================

function StatusBox({ status }) {
  const option = STATUS[status];

  if (!option) {
    return (
      <span className="rp-status rp-empty">
        –
      </span>
    );
  }

  return (
    <span
      className="rp-status"
      title={option.label}
      style={{
        color: option.color,
        background: option.bg,
      }}
    >
      {option.short}
    </span>
  );
}

// ========================================
// AVATAR
// ========================================

function Avatar({ name, index }) {
  const colors = [
    ["#d8f0f7", "#0086a0"],
    ["#ffe5d1", "#b74214"],
    ["#ffdce1", "#ca1836"],
    ["#e8e2ff", "#5238f5"],
    ["#dcefe2", "#17763c"],
  ];

  const [bg, color] = colors[index % colors.length];

  return (
    <div
      className="rp-avatar"
      style={{ background: bg, color }}
    >
      {getInitials(name)}
    </div>
  );
}

// ========================================
// KARTU STATISTIK
// ========================================

function StatCard({
  title,
  value,
  subtitle,
  color = C.navy,
  warning = false,
}) {
  return (
    <div
      className={`rp-stat-card ${
        warning ? "rp-stat-warning" : ""
      }`}
    >
      <p>{title}</p>

      <div className="rp-stat-value">
        <strong style={{ color }}>
          {value}
        </strong>

        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rp-detail-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

// ========================================
// POPUP PESAN ORANG TUA
// ========================================

function MessageModal({
  students,
  className,
  subjectName,
  onClose,
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const message = students
    .map((student) => {
      return (
        `Yth. Orang Tua/Wali ${student.name},\n\n` +
        `Kami menginformasikan bahwa pada mata pelajaran ` +
        `${subjectName} kelas ${className}, ` +
        `${student.name} tercatat Alfa sebanyak ` +
        `${student.alpha} dari ${student.total} pertemuan ` +
        `(${student.alphaPercent}%).\n\n` +
        `Mohon kerja sama Bapak/Ibu untuk memperhatikan ` +
        `kehadiran siswa. Terima kasih.`
      );
    })
    .join("\n\n------------------------\n\n");

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError("Gagal menyalin pesan.");
    }
  }

  return (
    <div className="rp-overlay">
      <div
        className="rp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rp-message-title"
      >
        <div className="rp-modal-top">
          <div className="rp-modal-icon">
            <MessageSquare size={25} />
          </div>

          <button
            type="button"
            className="rp-icon-button"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="rp-message-title">
          Pesan untuk Orang Tua
        </h2>

        <p className="rp-modal-description">
          Berikut contoh pesan untuk siswa dengan
          persentase Alfa minimal 80%.
          Izin dan Sakit tidak termasuk Alfa.
        </p>

        <div className="rp-modal-details">
          <DetailRow
            label="Kelas"
            value={className}
          />

          <DetailRow
            label="Mata pelajaran"
            value={subjectName}
          />

          <DetailRow
            label="Jumlah siswa"
            value={`${students.length} siswa`}
          />
        </div>

        <label
          htmlFor="rp-message"
          className="rp-modal-label"
        >
          Isi pesan
        </label>

        <textarea
          id="rp-message"
          className="rp-message-textarea"
          readOnly
          rows={9}
          value={message}
        />

        <p className="rp-help">
          Mode dummy: pesan hanya disiapkan untuk
          disalin, belum dikirim secara otomatis.
        </p>

        {copyError && (
          <p
            role="alert"
            style={{ color: "#dc2626" }}
          >
            {copyError}
          </p>
        )}

        <div className="rp-modal-actions">
          <button
            type="button"
            className="rp-btn-outline"
            onClick={onClose}
          >
            Batal
          </button>

          <button
            type="button"
            className="rp-btn-primary"
            onClick={copyMessage}
          >
            {copied ? (
              <CheckCircle2 size={16} />
            ) : (
              <Copy size={16} />
            )}

            {copied
              ? "Tersalin"
              : "Salin Pesan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// HALAMAN UTAMA REKAP PRESENSI
// ========================================

export default function RekapPresensi() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [teaching, setTeaching] = useState(null);

  const [classId, setClassId] = useState("");
  const [semester, setSemester] = useState("semua");

  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showMessageModal, setShowMessageModal] =
    useState(false);

  // ======================================
  // LOAD DATA
  // ======================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const [historyResult, teachingResult] =
        await Promise.all([
          presensiGuruApi.getRiwayatPresensi(token),
          presensiGuruApi.getTeaching(token),
        ]);

      const records = Array.isArray(historyResult)
        ? historyResult
        : Array.isArray(historyResult?.sessions)
          ? historyResult.sessions
          : [];

      setHistory(records);
      setTeaching(teachingResult);

      const classes = teachingResult?.classes || [];

      setClassId((previous) => {
        const exists = classes.some(
          (item) =>
            String(item.id) === String(previous)
        );

        return exists
          ? previous
          : String(classes[0]?.id ?? "");
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ======================================
  // KELAS DAN MATA PELAJARAN
  // ======================================

  const classes = teaching?.classes || [];

  const selectedClass = classes.find(
    (item) => String(item.id) === String(classId)
  );

  const selectedSubject =
    selectedClass?.schedules?.[0]?.subject ||
    selectedClass?.subjects?.[0] ||
    null;

  const subjectName =
    selectedSubject?.name || "-";

  // ======================================
  // FILTER SESI SELESAI
  // ======================================

  const classSessions = useMemo(() => {
    if (!selectedClass || !selectedSubject) {
      return [];
    }

    return history.filter((session) => {
      const sameClass =
        String(session.schedule?.class?.id) ===
        String(selectedClass.id);

      const sameSubject =
        String(session.schedule?.subject?.id) ===
        String(selectedSubject.id);

      const hasDetails =
        Array.isArray(session.attendances) &&
        session.attendances.length > 0;

      const completed =
        session.state === "closed";

      return (
        sameClass &&
        sameSubject &&
        hasDetails &&
        completed
      );
    });
  }, [history, selectedClass, selectedSubject]);

  // ======================================
  // FILTER SEMESTER
  // ======================================

  const semesterOptions = useMemo(() => {
    const map = new Map();

    for (const session of classSessions) {
      const value = getSemester(session.date);

      if (value) {
        map.set(value.key, value);
      }
    }

    return [...map.values()].sort(
      (a, b) => b.key.localeCompare(a.key)
    );
  }, [classSessions]);

  const selectedSemester =
    semester === "semua" ||
    semesterOptions.some(
      (item) => item.key === semester
    )
      ? semester
      : "semua";

  const sessions = useMemo(() => {
    return classSessions
      .filter((session) => {
        return (
          selectedSemester === "semua" ||
          getSemester(session.date)?.key ===
            selectedSemester
        );
      })
      .sort((a, b) => {
        const dateCompare =
          String(a.date).localeCompare(
            String(b.date)
          );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (
          (a.meeting_number || 0) -
          (b.meeting_number || 0)
        );
      });
  }, [classSessions, selectedSemester]);

  // ======================================
  // MATRIKS KEHADIRAN
  // ======================================

  const students = useMemo(() => {
    const map = new Map();

    sessions.forEach((session, index) => {
      for (const attendance of session.attendances || []) {
        if (!attendance.student) continue;

        const key = studentKey(
          attendance.student
        );

        if (!map.has(key)) {
          map.set(key, {
            key,
            id: attendance.student.id,
            name: attendance.student.name,
            nis: attendance.student.nis,
            statuses: Array(
              sessions.length
            ).fill(null),
          });
        }

        const student = map.get(key);

        student.statuses[index] =
          getStudentStatus(attendance, session);
      }
    });

    return [...map.values()]
      .map((student) => {
        const hadir = student.statuses.filter(
          (status) => status === "hadir"
        ).length;

        const izin = student.statuses.filter(
          (status) => status === "izin"
        ).length;

        const sakit = student.statuses.filter(
          (status) => status === "sakit"
        ).length;

        const alpha = student.statuses.filter(
          (status) => status === "alpha"
        ).length;

        const total = student.statuses.filter(
          (status) =>
            status !== null &&
            status !== "pending"
        ).length;

        // Hadir, Izin, Sakit tidak termasuk Alfa.
        const approved = hadir + izin + sakit;

        const percent = getPercent(
          approved,
          total
        );

        const alphaPercent = getPercent(
          alpha,
          total
        );

        const needsAttention =
          alphaPercent !== null &&
          alphaPercent >= ALPHA_WARNING_LIMIT;

        return {
          ...student,
          hadir,
          izin,
          sakit,
          alpha,
          total,
          percent,
          alphaPercent,
          needsAttention,
        };
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, "id")
      );
  }, [sessions]);

  const attentionStudents = students.filter(
    (student) => student.needsAttention
  );

  const displayedStudents =
    filter === "perhatian"
      ? attentionStudents
      : students;

  // ======================================
  // STATISTIK
  // ======================================

  const statistics = useMemo(() => {
    const totalApproved = students.reduce(
      (sum, student) =>
        sum +
        student.hadir +
        student.izin +
        student.sakit,
      0
    );

    const totalRecords = students.reduce(
      (sum, student) => sum + student.total,
      0
    );

    const izinSakit = students.reduce(
      (sum, student) =>
        sum + student.izin + student.sakit,
      0
    );

    const totalAlpha = students.reduce(
      (sum, student) => sum + student.alpha,
      0
    );

    return {
      average: getPercent(
        totalApproved,
        totalRecords
      ),
      attention: attentionStudents.length,
      izinSakit,
      alpha: totalAlpha,
    };
  }, [students, attentionStudents.length]);

  // ======================================
  // EKSPOR CSV
  // ======================================

  function handleExport() {
    if (!sessions.length || !students.length) {
      setNotice("Belum ada data untuk diekspor.");
      return;
    }

    const headers = [
      "Nama Siswa",
      "NIS",
      ...sessions.map(
        (session, index) =>
          `Pertemuan ${
            session.meeting_number || index + 1
          } (${session.date})`
      ),
      "Hadir",
      "Izin",
      "Sakit",
      "Alfa",
      "Tanpa Alfa (%)",
      "Alfa (%)",
      "Keterangan",
    ];

    const rows = students.map((student) => [
      student.name,
      student.nis,
      ...student.statuses.map(
        (status) =>
          STATUS[status]?.label || "-"
      ),
      student.hadir,
      student.izin,
      student.sakit,
      student.alpha,
      student.percent ?? "-",
      student.alphaPercent ?? "-",
      student.needsAttention
        ? "Perlu perhatian"
        : "Baik",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map(csvEscape).join(";")
      )
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download =
      `Rekap_Presensi_${
        selectedClass?.name || "Kelas"
      }_${selectedSemester}.csv`
        .replace(/[^a-zA-Z0-9_.-]/g, "_");

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    setNotice(
      "Rekap CSV berhasil disiapkan."
    );
  }

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="rp-page">
      <style>{`
        .rp-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          color: #172338;
          padding-bottom: 50px;
          box-sizing: border-box;
        }

        .rp-page * {
          box-sizing: border-box;
        }

        /* =====================================
           HEADER
        ===================================== */

        .rp-breadcrumb {
          border: 0;
          background: transparent;
          color: #0089a4;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 17px;
          font-family: inherit;
        }

        .rp-heading {
          font-size: 27px;
          margin: 0 0 8px;
          font-weight: 800;
        }

        .rp-subtitle {
          color: #718096;
          font-size: 14px;
          margin: 0 0 22px;
          line-height: 1.5;
        }

        /* =====================================
           FILTER - GRID PROPORSIONAL
        ===================================== */

        .rp-toolbar {
          display: grid;
          grid-template-columns:
            180px 210px minmax(230px, 270px) minmax(0, 1fr) auto;
          align-items: end;
          column-gap: 24px;
          row-gap: 18px;
          width: 100%;
          max-width: 100%;
          margin-bottom: 24px;
        }

        .rp-field {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 12px;
          width: 100%;
          min-width: 0;
        }

        .rp-field label {
          display: block;
          margin: 0;
          padding: 0 4px;
          height: 16px;
          line-height: 16px;
          font-size: 11px;
          color: #536984;
          font-weight: 700;
          white-space: nowrap;
        }

        .rp-field-class,
        .rp-field-subject,
        .rp-field-period {
          width: 100%;
          min-width: 0;
        }

        /* =====================================
           DROPDOWN - PADDING DALAM LEBIH LEGA
        ===================================== */

        .rp-select,
        .rp-subject {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          height: 48px;
          min-height: 48px;
          margin: 0;
          border-radius: 26px;
          font-family: inherit;
          font-size: 13px;
          box-sizing: border-box;
        }

        .rp-select {
          appearance: none;
          -webkit-appearance: none;

          border: 1px solid #bfe3ed;
          background-color: #fff;

          /* Ruang dalam kotak */
          padding-left: 24px;
          padding-right: 52px;

          color: #172338;
          cursor: pointer;
          text-overflow: ellipsis;

          /* Ikon panah custom, tidak mepet outline */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23172338' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 22px center;
          background-size: 16px;
        }

        .rp-select:focus {
          outline: 2px solid #dff4f9;
          outline-offset: 2px;
          border-color: #0095b3;
        }

        /* MATA PELAJARAN */
        .rp-subject {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;

          padding-left: 24px;
          padding-right: 24px;

          background: #e9edef;
          color: #172338;
          font-weight: 600;
        }

        .rp-subject-name {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rp-subject svg {
          flex-shrink: 0;
        }

        .rp-toolbar-spacer {
          min-width: 0;
        }

        .rp-export {
          width: auto;
          height: 48px;
          min-height: 48px;
          align-self: end;
          justify-self: end;
          white-space: nowrap;
        }

        /* =====================================
           TOMBOL
        ===================================== */

        .rp-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 17px;
          border: 1px solid #bfe3ed;
          border-radius: 25px;
          background: #fff;
          color: #005b6d;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          min-height: 40px;
          white-space: nowrap;
        }

        .rp-btn-outline:hover {
          background: #f1fafc;
        }

        .rp-btn-outline:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rp-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 18px;
          background: #005b6d;
          border: 1px solid #005b6d;
          border-radius: 25px;
          color: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          min-height: 40px;
          white-space: nowrap;
        }

        /* =====================================
           INFORMASI AKSES
        ===================================== */

        .rp-access {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 17px 21px;
          background: #e5f7fa;
          border: 1px solid #a9e0ef;
          border-radius: 13px;
          color: #005b6d;
          font-size: 12px;
          line-height: 1.6;
          margin: 17px 0;
          width: 100%;
        }

        .rp-access svg {
          flex-shrink: 0;
          color: #0095b3;
        }

        /* =====================================
           STATISTIK
        ===================================== */

        .rp-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 17px 0;
          width: 100%;
        }

        .rp-stat-card {
          border: 1px solid #e0edf1;
          background: #fff;
          border-radius: 16px;
          padding: 18px;
          min-height: 93px;
          min-width: 0;
        }

        .rp-stat-warning {
          background: #fff8f1;
          border-color: #fed6b4;
        }

        .rp-stat-card p {
          margin: 0 0 7px;
          font-size: 12px;
          color: #718096;
          line-height: 1.4;
        }

        .rp-stat-value {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rp-stat-value strong {
          font-size: 29px;
          line-height: 1;
        }

        .rp-stat-value span {
          color: #718096;
          font-size: 12px;
        }

        /* =====================================
           PANEL TABEL
        ===================================== */

        .rp-panel {
          background: #fff;
          border: 1px solid #d5e9ef;
          border-radius: 18px;
          overflow: hidden;
          margin-top: 17px;
          width: 100%;
          min-width: 0;
        }

        .rp-panel-heading {
          padding: 23px 20px 19px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .rp-panel-heading h2 {
          font-size: 18px;
          margin: 0 0 7px;
        }

        .rp-panel-heading p {
          margin: 0;
          color: #718096;
          font-size: 12px;
        }

        .rp-filters {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .rp-filter {
          border: 1px solid #d5e9ef;
          background: #fff;
          border-radius: 24px;
          padding: 9px 13px;
          color: #42536a;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        .rp-filter.selected {
          background: #005b6d;
          color: #fff;
          border-color: #005b6d;
        }

        .rp-table-wrap {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
        }

        .rp-table {
          border-collapse: collapse;
          width: 100%;
          min-width: 800px;
          text-align: left;
        }

        .rp-table th {
          background: #eef7f9;
          color: #536984;
          font-size: 10px;
          font-weight: 700;
          padding: 13px 10px;
          white-space: nowrap;
        }

        .rp-table td {
          padding: 10px;
          border-bottom: 1px solid #edf2f5;
          font-size: 12px;
          vertical-align: middle;
        }

        .rp-table tr.attention {
          background: #fff8f1;
        }

        /* =====================================
           SISWA
        ===================================== */

        .rp-student {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 170px;
        }

        .rp-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .rp-student-name {
          font-weight: 700;
          font-size: 12px;
          color: #172338;
        }

        .rp-student-nis {
          color: #718096;
          font-size: 11px;
          margin-top: 4px;
        }

        .rp-status {
          width: 29px;
          height: 29px;
          display: inline-grid;
          place-items: center;
          font-size: 12px;
          font-weight: 800;
          border-radius: 9px;
        }

        .rp-empty {
          background: #f1f5f9;
          color: #94a3b8;
        }

        .rp-count {
          font-weight: 800;
          text-align: center;
        }

        .rp-percent {
          min-width: 125px;
        }

        .rp-percent-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
          margin-bottom: 7px;
          font-size: 12px;
        }

        .rp-percent-top small {
          color: #c2410c;
          font-size: 10px;
        }

        .rp-progress {
          height: 6px;
          border-radius: 8px;
          background: #d8f0f6;
          overflow: hidden;
        }

        .rp-progress span {
          display: block;
          height: 100%;
          border-radius: 8px;
        }

        /* =====================================
           FOOTER TABEL
        ===================================== */

        .rp-footer {
          padding: 15px 20px 17px;
        }

        .rp-legend {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          color: #718096;
          font-size: 11px;
        }

        .rp-legend-items {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rp-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .rp-legend .rp-status {
          width: 19px;
          height: 19px;
          font-size: 10px;
          border-radius: 5px;
        }

        .rp-warning-bar {
          margin-top: 13px;
          padding: 12px 15px;
          background: #fff8f1;
          border: 1px solid #fed6b4;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          color: #c2410c;
          font-size: 12px;
        }

        .rp-warning-text {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rp-empty-message {
          text-align: center;
          padding: 35px 20px;
          font-size: 13px;
          color: #718096;
        }

        /* =====================================
           POPUP PESAN ORANG TUA
        ===================================== */

        .rp-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(4,54,70,.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .rp-modal {
          background: #fff;
          border-radius: 23px;
          padding: 30px;
          width: min(100%,560px);
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 22px 70px rgba(0,0,0,.2);
        }

        .rp-modal-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .rp-modal-icon {
          width: 56px;
          height: 56px;
          background: #e5f7fa;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #0095b3;
        }

        .rp-icon-button {
          width: 36px;
          height: 36px;
          border: 1px solid #d5e9ef;
          border-radius: 50%;
          background: white;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #005b6d;
        }

        .rp-modal h2 {
          margin: 17px 0 9px;
          font-size: 23px;
        }

        .rp-modal-description {
          color: #718096;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 19px;
        }

        .rp-modal-details {
          border: 1px solid #d5e9ef;
          border-radius: 15px;
          padding: 10px 17px;
        }

        .rp-detail-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          padding: 9px 0;
          gap: 10px;
          font-size: 12px;
        }

        .rp-detail-row span {
          color: #718096;
        }

        .rp-modal-label {
          display: block;
          margin: 18px 0 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .rp-message-textarea {
          width: 100%;
          border: 1px solid #d5e9ef;
          border-radius: 12px;
          padding: 13px;
          background: #fff;
          font: inherit;
          font-size: 12px;
          color: #172338;
          resize: vertical;
          line-height: 1.6;
        }

        .rp-help {
          font-size: 12px;
          color: #718096;
        }

        .rp-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
          flex-wrap: wrap;
        }

        /* =====================================
           RESPONSIVE TABLET
        ===================================== */

        @media (max-width: 1150px) {
          .rp-toolbar {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            column-gap: 18px;
            row-gap: 18px;
          }

          .rp-toolbar-spacer {
            display: none;
          }

          .rp-export {
            justify-self: end;
          }

          .rp-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        /* =====================================
           RESPONSIVE MOBILE
        ===================================== */

        @media (max-width: 600px) {
          .rp-heading {
            font-size: 23px;
          }

          .rp-toolbar {
            grid-template-columns: minmax(0, 1fr);
            gap: 16px;
          }

          .rp-field {
            width: 100%;
          }

          .rp-export {
            justify-self: stretch;
            width: 100%;
          }

          .rp-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .rp-stat-card {
            padding: 13px;
          }

          .rp-stat-value strong {
            font-size: 24px;
          }

          .rp-access {
            padding: 14px;
            gap: 10px;
          }

          .rp-panel-heading {
            padding: 17px 14px;
          }

          .rp-footer {
            padding: 14px;
          }

          .rp-modal {
            padding: 22px;
          }

          .rp-warning-bar .rp-btn-primary {
            width: 100%;
          }
        }
      `}</style>

      {/* =====================================
          BREADCRUMB
      ===================================== */}

      <button
        type="button"
        className="rp-breadcrumb"
        onClick={() => navigate("/guru/presensi")}
      >
        <ArrowLeft size={15} />
        Presensi
        <span>›</span>
        <u>Rekap Presensi</u>
      </button>

      {/* =====================================
          HEADER
      ===================================== */}

      <h1 className="rp-heading">
        Rekap Presensi
      </h1>

      <p className="rp-subtitle">
        Pantau kehadiran, izin, sakit, dan alfa
        siswa pada setiap pertemuan.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            padding: 14,
            background: "#fff1f2",
            color: "#be123c",
            borderRadius: 11,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            padding: 12,
            background: "#edf9f5",
            color: "#15803d",
            borderRadius: 11,
            marginBottom: 15,
            fontSize: 12,
          }}
        >
          {notice}
        </div>
      )}

      {loading ? (
        <p style={{ color: C.muted }}>
          Memuat rekap presensi...
        </p>
      ) : (
        <>
          {/* =====================================
              FILTER
          ===================================== */}

          <div className="rp-toolbar">
            {/* KELAS */}

            <div className="rp-field rp-field-class">
              <label htmlFor="rp-class">
                KELAS
              </label>

              <select
                id="rp-class"
                className="rp-select"
                value={classId}
                onChange={(event) => {
                  setClassId(event.target.value);
                  setSemester("semua");
                  setFilter("semua");
                }}
              >
                {classes.map((kelas) => (
                  <option
                    key={kelas.id}
                    value={String(kelas.id)}
                  >
                    Kelas {kelas.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MATA PELAJARAN */}

            <div className="rp-field rp-field-subject">
              <label>
                MATA PELAJARAN
              </label>

              <div className="rp-subject">
                <span className="rp-subject-name">
                  {subjectName}
                </span>

                <LockKeyhole
                  size={15}
                  color="#64748b"
                />
              </div>
            </div>

            {/* PERIODE */}

            <div className="rp-field rp-field-period">
              <label htmlFor="rp-period">
                PERIODE
              </label>

              <select
                id="rp-period"
                className="rp-select"
                value={selectedSemester}
                onChange={(event) => {
                  setSemester(event.target.value);
                  setFilter("semua");
                }}
              >
                <option value="semua">
                  Semua Periode
                </option>

                {semesterOptions.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SPACER */}

            <div
              className="rp-toolbar-spacer"
              aria-hidden="true"
            />

            {/* EKSPOR */}

            <button
              type="button"
              className="rp-btn-outline rp-export"
              onClick={handleExport}
              disabled={!students.length}
            >
              <Download size={16} />
              Ekspor
            </button>
          </div>

          {/* =====================================
              INFORMASI AKSES
          ===================================== */}

          <div className="rp-access">
            <LockKeyhole size={19} />

            <div>
              <b>Akses dibatasi.</b>{" "}
              Rekap hanya menampilkan mata pelajaran
              berdasarkan jadwal mengajar guru.
              Mata pelajaran guru lain tidak ditampilkan.
            </div>
          </div>

          {/* =====================================
              STATISTIK
          ===================================== */}

          <div className="rp-stats">
            <StatCard
              title="Persentase tanpa Alfa"
              value={
                statistics.average === null
                  ? "–"
                  : `${statistics.average}%`
              }
              subtitle="Hadir + Izin + Sakit"
              color={C.cyan}
            />

            <StatCard
              title="Siswa perlu perhatian"
              value={statistics.attention}
              subtitle="Alfa minimal 80%"
              color="#b93813"
              warning
            />

            <StatCard
              title="Total Izin dan Sakit"
              value={statistics.izinSakit}
              subtitle="Kejadian"
            />

            <StatCard
              title="Total Alfa"
              value={statistics.alpha}
              subtitle="Kejadian"
            />
          </div>

          {/* =====================================
              TABEL REKAP
          ===================================== */}

          <section className="rp-panel">
            <div className="rp-panel-heading">
              <div>
                <h2>
                  Kehadiran per Siswa
                </h2>

                <p>
                  {subjectName} · Kelas{" "}
                  {selectedClass?.name || "-"} ·{" "}
                  {sessions.length} pertemuan selesai
                </p>
              </div>

              {/* FILTER SISWA */}

              <div className="rp-filters">
                <button
                  type="button"
                  className={`rp-filter ${
                    filter === "semua"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setFilter("semua")}
                >
                  Semua {students.length}
                </button>

                <button
                  type="button"
                  className={`rp-filter ${
                    filter === "perhatian"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setFilter("perhatian")}
                >
                  Perlu perhatian{" "}
                  {attentionStudents.length}
                </button>
              </div>
            </div>

            {/* TABEL */}

            <div className="rp-table-wrap">
              {students.length > 0 ? (
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th
                        style={{
                          minWidth: 180,
                          paddingLeft: 18,
                        }}
                      >
                        SISWA
                      </th>

                      {sessions.map((session, index) => (
                        <th
                          key={session.id}
                          title={`${session.date} · ${session.topic}`}
                          style={{ textAlign: "center" }}
                        >
                          #{session.meeting_number || index + 1}
                        </th>
                      ))}

                      <th>HADIR</th>
                      <th>IZIN</th>
                      <th>SAKIT</th>
                      <th>ALFA</th>
                      <th style={{ minWidth: 145 }}>
                        TANPA ALFA
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedStudents.map((student, index) => (
                      <tr
                        key={student.key}
                        className={
                          student.needsAttention
                            ? "attention"
                            : ""
                        }
                      >
                        {/* SISWA */}

                        <td style={{ paddingLeft: 18 }}>
                          <div className="rp-student">
                            <Avatar
                              name={student.name}
                              index={index}
                            />

                            <div>
                              <div className="rp-student-name">
                                {student.name}
                              </div>

                              <div className="rp-student-nis">
                                NIS {student.nis || "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* STATUS PERTEMUAN */}

                        {student.statuses.map((status, i) => (
                          <td
                            key={sessions[i].id}
                            style={{ textAlign: "center" }}
                          >
                            <StatusBox status={status} />
                          </td>
                        ))}

                        {/* HADIR */}

                        <td
                          className="rp-count"
                          style={{ color: C.cyan }}
                        >
                          {student.hadir}
                        </td>

                        {/* IZIN */}

                        <td
                          className="rp-count"
                          style={{ color: "#e35b1b" }}
                        >
                          {student.izin}
                        </td>

                        {/* SAKIT */}

                        <td
                          className="rp-count"
                          style={{ color: "#dc162b" }}
                        >
                          {student.sakit}
                        </td>

                        {/* ALFA */}

                        <td className="rp-count">
                          {student.alpha}
                        </td>

                        {/* PERSENTASE */}

                        <td>
                          <div className="rp-percent">
                            <div className="rp-percent-top">
                              <b>
                                {student.percent === null
                                  ? "–"
                                  : `${student.percent}%`}
                              </b>

                              {student.needsAttention && (
                                <small>
                                  Perlu perhatian
                                </small>
                              )}
                            </div>

                            <div className="rp-progress">
                              <span
                                style={{
                                  width: `${student.percent || 0}%`,
                                  background:
                                    student.needsAttention
                                      ? "#c2410c"
                                      : C.cyan,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="rp-empty-message">
                  {sessions.length === 0
                    ? "Belum ada pertemuan selesai dengan data siswa pada kelas dan periode ini."
                    : "Belum ada data siswa."}
                </div>
              )}

              {students.length > 0 &&
                displayedStudents.length === 0 && (
                  <div className="rp-empty-message">
                    Tidak ada siswa yang memenuhi
                    kriteria Perlu Perhatian.
                  </div>
                )}
            </div>

            {/* =====================================
                FOOTER
            ===================================== */}

            <div className="rp-footer">
              <div className="rp-legend">
                <div className="rp-legend-items">
                  {["hadir", "izin", "sakit", "alpha"].map(
                    (key) => (
                      <div
                        key={key}
                        className="rp-legend-item"
                      >
                        <StatusBox status={key} />
                        {STATUS[key].label}
                      </div>
                    )
                  )}
                </div>

                <span>
                  Perlu perhatian jika Alfa ≥{" "}
                  {ALPHA_WARNING_LIMIT}%
                  dari pertemuan yang tercatat.
                </span>
              </div>

              {/* PERINGATAN */}

              {attentionStudents.length > 0 && (
                <div className="rp-warning-bar">
                  <div className="rp-warning-text">
                    <AlertTriangle size={17} />

                    <span>
                      <b>{attentionStudents.length}</b>{" "}
                      siswa memiliki Alfa minimal{" "}
                      {ALPHA_WARNING_LIMIT}%.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="rp-btn-primary"
                    onClick={() => setShowMessageModal(true)}
                  >
                    <MessageSquare size={16} />
                    Kirim pesan ke orang tua
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* =====================================
          POPUP PESAN ORANG TUA
      ===================================== */}

      {showMessageModal && (
        <MessageModal
          students={attentionStudents}
          className={selectedClass?.name || "-"}
          subjectName={subjectName}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
}
