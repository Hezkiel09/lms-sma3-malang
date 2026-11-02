
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Lock,
  X,
  AlertCircle,
} from "lucide-react";

import {
  presensiGuruApi,
  PRESENSI_SOURCE,
} from "../../services/presensiGuruApi";

// =====================================
// WARNA
// =====================================

const C = {
  navy: "#172338",
  teal: "#005b6d",
  cyan: "#0095b3",
  muted: "#718096",
  line: "#d5e9ef",
  red: "#ff0000",
};

const statusOptions = [
  {
    value: "hadir",
    label: "Hadir",
    description: "Hadir di kelas",
    color: "#0089a4",
    background: "#e2f6fa",
  },
  {
    value: "izin",
    label: "Izin",
    description: "Izin dengan pemberitahuan",
    color: "#dc4b12",
    background: "#fff0e5",
  },
  {
    value: "sakit",
    label: "Sakit",
    description: "Sakit, ada surat atau kabar",
    color: "#dc162b",
    background: "#ffedf0",
  },
  {
    value: "alpha",
    label: "Alfa",
    description: "Tanpa keterangan",
    color: "#536176",
    background: "#edf0f4",
  },
];

const statusLabels = {
  hadir: "Hadir",
  izin: "Izin",
  sakit: "Sakit",
  alpha: "Alfa",
  pending: "Belum mengisi",
};

const buttonStyle = {
  border: `1px solid ${C.line}`,
  borderRadius: 25,
  padding: "10px 16px",
  background: "#fff",
  color: C.teal,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const primaryButton = {
  ...buttonStyle,
  background: C.teal,
  color: "#fff",
  borderColor: C.teal,
};

function getToken() {
  return PRESENSI_SOURCE === "mock"
    ? null
    : sessionStorage.getItem("b8-teacher-token");
}

// =====================================
// STATUS BADGE
// =====================================

function StatusBadge({ status }) {
  const option = statusOptions.find(
    (item) => item.value === status
  );

  const bg = option?.background || "#eef0f3";
  const color = option?.color || "#536176";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "7px 12px",
        borderRadius: 25,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      ● {statusLabels[status] || status}
    </span>
  );
}

// =====================================
// AVATAR SISWA
// =====================================

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#d9f2f8",
        color: C.cyan,
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: 12,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// =====================================
// KARTU RINGKASAN
// =====================================

function StatCard({ title, value, color }) {
  return (
    <div className="sp-stat">
      <span
        style={{
          color: C.muted,
          fontSize: 12,
        }}
      >
        {title}
      </span>

      <strong
        style={{
          display: "block",
          marginTop: 7,
          fontSize: 27,
          color: color || C.navy,
        }}
      >
        {value ?? 0}
      </strong>
    </div>
  );
}

// =====================================
// POPUP UBAH STATUS
// CATATAN SELALU OPSIONAL
// =====================================

function EditStatusModal({
  item,
  session,
  onClose,
  onSave,
  saving,
  error,
}) {
  const [status, setStatus] = useState(
    item.display_status === "pending"
      ? "hadir"
      : item.status
  );

  const [notes, setNotes] = useState(
    item.notes || ""
  );

  function handleSubmit(event) {
    event.preventDefault();

    // Catatan boleh kosong untuk semua status.
    onSave(status, notes);
  }

  return (
    <div className="sp-overlay">
      <form
        className="sp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sp-edit-heading"
        onSubmit={handleSubmit}
      >
        <div className="sp-modal-header">
          <h2 id="sp-edit-heading">
            Ubah Status Presensi
          </h2>

          <button
            type="button"
            className="sp-close-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup popup"
          >
            <X size={20} />
          </button>
        </div>

        <p className="sp-modal-subtitle">
          {item.student?.name} · NIS{" "}
          {item.student?.nis} ·{" "}
          {session.schedule?.subject?.name} ·{" "}
          Pertemuan #{session.meeting_number}
        </p>

        <div className="sp-status-grid">
          {statusOptions.map((option) => {
            const selected =
              status === option.value;

            return (
              <button
                type="button"
                key={option.value}
                disabled={saving}
                className="sp-status-option"
                onClick={() =>
                  setStatus(option.value)
                }
                style={{
                  borderColor: selected
                    ? option.color
                    : C.line,
                  background: selected
                    ? option.background
                    : "#fff",
                }}
              >
                <strong
                  style={{
                    color: option.color,
                    fontSize: 14,
                  }}
                >
                  ● {option.label}
                </strong>

                <span>
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        <label
          htmlFor="sp-edit-notes"
          className="sp-notes-label"
        >
          Catatan (opsional)
        </label>

        <textarea
          id="sp-edit-notes"
          className="sp-notes-input"
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder="Tambahkan catatan jika diperlukan..."
          rows={3}
          disabled={saving}
        />

        <p className="sp-help-text">
          Perubahan akan tercatat sebagai koreksi guru
          dan langsung terlihat pada detail presensi siswa.
        </p>

        {error && (
          <div className="sp-modal-error" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="sp-modal-actions">
          <button
            type="button"
            style={buttonStyle}
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </button>

          <button
            type="submit"
            style={{
              ...primaryButton,
              minWidth: 165,
              opacity: saving ? 0.5 : 1,
            }}
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

// =====================================
// POPUP TUTUP PRESENSI
// =====================================

function CloseSessionModal({
  session,
  onClose,
  onConfirm,
  closing,
}) {
  const summary = session.summary || {};
  const filled =
    session.progress?.filled ??
    (summary.hadir || 0) +
      (summary.izin || 0) +
      (summary.sakit || 0);

  const total =
    summary.total || 0;

  const pending =
    summary.pending || 0;

  return (
    <div className="sp-overlay">
      <div
        className="sp-modal sp-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sp-close-heading"
      >
        <div className="sp-lock-icon">
          <Lock size={29} />
        </div>

        <h2 id="sp-close-heading">
          Tutup presensi sekarang?
        </h2>

        <p className="sp-confirm-description">
          Siswa tidak bisa mengisi lagi.
          Anda masih bisa mengubah status siswa
          setelah presensi ditutup.
        </p>

        <div className="sp-confirm-details">
          <div>
            <span>Kelas</span>
            <b>
              Kelas {session.schedule?.class?.name}
              {" · "}
              {session.schedule?.subject?.name}
            </b>
          </div>

          <div>
            <span>Jadwal</span>
            <b>
              Sesi {session.session_number}
              {" · "}
              {session.time?.start} -{" "}
              {session.time?.end}
            </b>
          </div>

          <div>
            <span>Sudah mengisi</span>
            <b>{filled} dari {total} siswa</b>
          </div>

          <div>
            <span>Belum mengisi</span>
            <b>{pending} dari {total} siswa</b>
          </div>
        </div>

        {pending > 0 && (
          <p className="sp-close-warning">
            {pending} siswa yang belum mengisi akan
            tercatat sebagai Alfa.
          </p>
        )}

        <div className="sp-modal-actions">
          <button
            type="button"
            style={buttonStyle}
            onClick={onClose}
            disabled={closing}
          >
            Batal
          </button>

          <button
            type="button"
            className="sp-danger-button"
            disabled={closing}
            onClick={onConfirm}
          >
            {closing
              ? "Menutup..."
              : "Ya, Tutup Presensi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================
// HALAMAN SESI PRESENSI
// =====================================

export default function SesiPresensi() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");

  const [filter, setFilter] = useState("semua");
  const [editing, setEditing] = useState(null);
  const [showCloseModal, setShowCloseModal] =
    useState(false);

  // =====================================
  // AMBIL DATA
  // =====================================

  const loadSession = useCallback(async (
    showLoading = true
  ) => {
    if (showLoading) setLoading(true);

    try {
      const data = await presensiGuruApi.getSesi(
        getToken(),
        sessionId
      );

      setSession(data);
      setError("");
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // =====================================
  // SIMPAN PERUBAHAN STATUS
  // =====================================

  async function handleSaveStatus(status, notes) {
    if (!editing || busy) return;

    setBusy(true);
    setModalError("");
    setNotice("");

    try {
      await presensiGuruApi.ubahStatus(
        getToken(),
        sessionId,
        editing.id,
        status,
        notes
      );

      const result = await loadSession(false);

      if (!result) {
        throw new Error(
          "Perubahan tersimpan, tetapi detail gagal dimuat ulang."
        );
      }

      setEditing(null);

      setNotice(
        `Status ${editing.student.name} berhasil diperbarui.`
      );
    } catch (err) {
      setModalError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // =====================================
  // TUTUP PRESENSI
  // =====================================

  async function handleCloseSession() {
    if (busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await presensiGuruApi.tutupSesi(
        getToken(),
        sessionId
      );

      const result = await loadSession(false);

      if (!result) {
        throw new Error(
          "Presensi ditutup, tetapi detail gagal dimuat ulang."
        );
      }

      setFilter("semua");
      setShowCloseModal(false);
      setNotice("Presensi berhasil ditutup.");
    } catch (err) {
      setError(err.message);
      setShowCloseModal(false);
    } finally {
      setBusy(false);
    }
  }

  // =====================================
  // PENGINGAT SISWA
  // =====================================

  async function handleRemind() {
    if (busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result =
        await presensiGuruApi.ingatkanSiswa(
          getToken(),
          sessionId
        );

      setNotice(
        result.message ||
        "Pengingat berhasil diproses."
      );

      await loadSession(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // =====================================
  // LOADING
  // =====================================

  if (loading && !session) {
    return (
      <p style={{ color: C.muted }}>
        Memuat detail presensi...
      </p>
    );
  }

  if (!session) {
    return (
      <div>
        <p style={{ color: "#dc2626" }}>
          {error || "Sesi presensi tidak ditemukan."}
        </p>

        <button
          type="button"
          style={buttonStyle}
          onClick={() =>
            navigate("/guru/presensi")
          }
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const summary = session.summary || {};
  const progress = session.progress || {
    filled: 0,
    total: 0,
    percent: 0,
  };

  const closed = session.state !== "open";
  const manual = session.method === "manual";

  const rows = session.attendances || [];

  const filteredRows = rows.filter(
    (item) =>
      filter === "semua" ||
      item.display_status === filter
  );

  const filterOptions = [
    ["semua", "Semua", summary.total],
    ["hadir", "Hadir", summary.hadir],
    ["izin", "Izin", summary.izin],
    ["sakit", "Sakit", summary.sakit],
    ["alpha", "Alfa", summary.alpha],
  ];

  if (!closed) {
    filterOptions.push([
      "pending",
      manual ? "Belum dicatat" : "Belum mengisi",
      summary.pending,
    ]);
  }

  return (
    <div className="sp-page">
      <style>{`
        .sp-page {
          color: #172338;
          padding-bottom: 45px;
        }

        .sp-page * {
          box-sizing: border-box;
        }

        .sp-panel {
          border: 1px solid #d5e9ef;
          border-radius: 18px;
          background: #fff;
          overflow: hidden;
          margin-bottom: 17px;
        }

        .sp-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .sp-stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .sp-stats.six {
          grid-template-columns:
            repeat(6, minmax(0, 1fr));
        }

        .sp-stat {
          background: #fff;
          border: 1px solid #d5e9ef;
          border-radius: 15px;
          padding: 17px;
        }

        .sp-info-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr 1fr;
          gap: 24px;
          margin: 26px 0;
        }

        .sp-info-grid p {
          margin: 0 0 9px;
          color: #718096;
          font-size: 12px;
        }

        .sp-info-grid b {
          font-size: 13px;
          line-height: 1.5;
        }

        .sp-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
          text-align: left;
        }

        .sp-table th {
          padding: 14px 18px;
          background: #eef7f9;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
        }

        .sp-table td {
          padding: 11px 18px;
          border-bottom: 1px solid #edf2f5;
          font-size: 12px;
          vertical-align: middle;
        }

        .sp-filter {
          background: #fff;
          border: 1px solid #d5e9ef;
          border-radius: 25px;
          padding: 9px 13px;
          font-size: 12px;
          color: #42536a;
          cursor: pointer;
          font-family: inherit;
        }

        .sp-filter.active {
          background: #005b6d;
          color: #fff;
          border-color: #005b6d;
          font-weight: 700;
        }

        /* POPUP */

        .sp-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(17, 37, 52, .58);
        }

        .sp-modal {
          background: #fff;
          border-radius: 23px;
          padding: 35px;
          width: min(100%, 570px);
          max-height: 90vh;
          overflow-y: auto;
          box-shadow:
            0 22px 70px rgba(0, 0, 0, .2);
        }

        .sp-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .sp-modal-header h2 {
          font-size: 25px;
          margin: 0;
          color: #172338;
        }

        .sp-close-button {
          width: 39px;
          height: 39px;
          border: 1px solid #d5e9ef;
          background: #fff;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #005b6d;
          cursor: pointer;
        }

        .sp-modal-subtitle {
          color: #718096;
          font-size: 13px;
          margin: 14px 0 27px;
          line-height: 1.6;
        }

        .sp-status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .sp-status-option {
          border: 1px solid #d5e9ef;
          background: #fff;
          border-radius: 12px;
          padding: 15px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          font-family: inherit;
        }

        .sp-status-option span {
          font-size: 11px;
          color: #718096;
          line-height: 1.4;
        }

        .sp-notes-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin: 23px 0 10px;
        }

        .sp-notes-input {
          width: 100%;
          min-height: 100px;
          padding: 13px;
          border: 1px solid #d5e9ef;
          border-radius: 12px;
          background: #fff;
          font: inherit;
          font-size: 13px;
          color: #172338;
          resize: vertical;
        }

        .sp-notes-input:focus {
          border-color: #0095b3;
          outline: 2px solid #e2f6fa;
        }

        .sp-help-text {
          color: #718096;
          font-size: 12px;
          line-height: 1.6;
          margin-top: 14px;
        }

        .sp-modal-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 11px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .sp-modal-error {
          background: #fff1f2;
          color: #be123c;
          padding: 12px;
          border-radius: 10px;
          display: flex;
          gap: 8px;
          font-size: 12px;
          margin-top: 12px;
        }

        /* POPUP TUTUP */

        .sp-confirm-modal {
          text-align: center;
        }

        .sp-lock-icon {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          background: #fff0f0;
          color: #ff0000;
          display: grid;
          place-items: center;
          margin: 0 auto 23px;
        }

        .sp-confirm-modal h2 {
          font-size: 24px;
          margin: 0 0 13px;
        }

        .sp-confirm-description {
          color: #718096;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 auto 22px;
          max-width: 420px;
        }

        .sp-confirm-details {
          border: 1px solid #d5e9ef;
          border-radius: 19px;
          padding: 13px 22px;
          text-align: left;
        }

        .sp-confirm-details div {
          display: grid;
          grid-template-columns: 125px 1fr;
          gap: 14px;
          padding: 9px 0;
          font-size: 13px;
        }

        .sp-confirm-details span {
          color: #81909f;
        }

        .sp-confirm-details b {
          color: #172338;
        }

        .sp-close-warning {
          color: #b91c1c;
          font-size: 12px;
          margin: 17px 0 0;
        }

        .sp-danger-button {
          padding: 12px 20px;
          border: 0;
          border-radius: 25px;
          background: #ff0000;
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          font-family: inherit;
        }

        @media (max-width: 1000px) {
          .sp-stats,
          .sp-stats.six {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .sp-info-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .sp-stats,
          .sp-stats.six {
            grid-template-columns: 1fr 1fr;
          }

          .sp-info-grid {
            grid-template-columns: 1fr;
          }

          .sp-modal {
            padding: 23px;
          }

          .sp-modal-header h2 {
            font-size: 21px;
          }

          .sp-confirm-details div {
            grid-template-columns: 100px 1fr;
          }

          .sp-modal-actions button {
            flex: 1;
          }
        }
      `}</style>

      {/* BREADCRUMB */}
      <button
        type="button"
        style={{
          ...buttonStyle,
          border: "none",
          paddingLeft: 0,
          marginBottom: 16,
        }}
        onClick={() =>
          navigate("/guru/presensi")
        }
      >
        <ArrowLeft size={16} />
        Presensi
      </button>

      {/* JUDUL */}
      <h1
        style={{
          fontSize: 27,
          margin: "0 0 8px",
        }}
      >
        {closed
          ? "Detail Presensi"
          : manual
            ? "Presensi Manual"
            : "Presensi"}
      </h1>

      <p
        style={{
          fontSize: 14,
          color: C.muted,
          marginBottom: 22,
        }}
      >
        {session.schedule?.subject?.name}
        {" · "}
        Kelas {session.schedule?.class?.name}
        {" · "}
        Pertemuan #{session.meeting_number}
      </p>

      {/* PESAN */}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fff1f2",
            padding: 14,
            borderRadius: 12,
            color: "#be123c",
            fontSize: 13,
            marginBottom: 15,
          }}
        >
          <AlertCircle
            size={16}
            style={{ verticalAlign: "middle" }}
          />
          {" "}{error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            background: "#eaf8ef",
            padding: 14,
            borderRadius: 12,
            color: "#15803d",
            fontSize: 13,
            marginBottom: 15,
          }}
        >
          <Check
            size={16}
            style={{ verticalAlign: "middle" }}
          />
          {" "}{notice}
        </div>
      )}

      {/* INFORMASI PRESENSI */}
      <section
        className="sp-panel"
        style={{ padding: 20 }}
      >
        <div className="sp-flex">
          <div className="sp-flex">
            <span
              style={{
                background: closed
                  ? "#eaf8ef"
                  : "#e5f6fa",
                color: closed
                  ? "#15803d"
                  : C.cyan,
                borderRadius: 25,
                padding: "8px 13px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {closed
                ? "Selesai"
                : manual
                  ? "Presensi Manual"
                  : "Sedang Berlangsung"}
            </span>

            <span
              style={{
                color: C.muted,
                fontSize: 12,
              }}
            >
              <Clock3
                size={14}
                style={{
                  verticalAlign: "middle",
                }}
              />
              {" "}
              {session.time?.start} -{" "}
              {session.time?.end} WIB
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {!closed &&
              !manual &&
              summary.pending > 0 && (
                <button
                  type="button"
                  style={buttonStyle}
                  disabled={busy}
                  onClick={handleRemind}
                >
                  <Bell size={15} />
                  Ingatkan {summary.pending} siswa
                </button>
              )}

            {!closed && (
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background: "#ff0000",
                  borderColor: "#ff0000",
                  color: "#fff",
                }}
                disabled={busy}
                onClick={() =>
                  setShowCloseModal(true)
                }
              >
                <Lock size={15} />
                Tutup Presensi
              </button>
            )}

            <button
              type="button"
              style={primaryButton}
              onClick={() =>
                navigate("/guru/presensi/rekap")
              }
            >
              Lihat Rekap
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="sp-info-grid">
          <div>
            <p>Materi</p>
            <b>{session.topic}</b>
          </div>

          <div>
            <p>Sub capaian pembelajaran</p>
            <b>{session.learning_outcome}</b>
          </div>

          <div>
            <p>Metode</p>
            <b>
              {manual
                ? "Manual oleh guru"
                : "Diisi siswa"}
            </b>
          </div>
        </div>

        <div className="sp-flex">
          <span style={{ fontSize: 12 }}>
            <b>
              {progress.filled} dari{" "}
              {progress.total} siswa
            </b>
            {" "}sudah tercatat
            {!closed && summary.pending > 0
              ? ` · ${summary.pending} belum mengisi`
              : ""}
          </span>

          <b style={{ fontSize: 12 }}>
            {progress.percent}%
          </b>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 20,
            background: "#d6edf2",
            marginTop: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress.percent}%`,
              height: "100%",
              background: C.cyan,
              borderRadius: 20,
            }}
          />
        </div>

        {closed && (
          <div
            style={{
              background: "#f1f3f5",
              color: "#64748b",
              padding: 14,
              borderRadius: 11,
              fontSize: 12,
              marginTop: 19,
            }}
          >
            <Lock
              size={14}
              style={{ verticalAlign: "middle" }}
            />
            {" "}
            Presensi telah ditutup.
            Guru masih dapat mengoreksi
            status siswa.
          </div>
        )}
      </section>

      {/* STATISTIK */}
      <div
        className={`sp-stats ${
          !closed ? "six" : ""
        }`}
      >
        <StatCard
          title="Total siswa"
          value={summary.total}
        />

        <StatCard
          title="Hadir"
          value={summary.hadir}
          color={C.cyan}
        />

        <StatCard
          title="Izin"
          value={summary.izin}
          color="#d95512"
        />

        <StatCard
          title="Sakit"
          value={summary.sakit}
          color="#dc162b"
        />

        <StatCard
          title="Alfa"
          value={summary.alpha}
        />

        {!closed && (
          <StatCard
            title={
              manual
                ? "Belum dicatat"
                : "Belum mengisi"
            }
            value={summary.pending}
            color="#b45309"
          />
        )}
      </div>

      {/* DAFTAR SISWA */}
      <section className="sp-panel">
        <div
          className="sp-flex"
          style={{ padding: 18 }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {filterOptions.map(
              ([key, label, count]) => (
                <button
                  type="button"
                  key={key}
                  className={`sp-filter ${
                    filter === key
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setFilter(key)
                  }
                >
                  {label} {count ?? 0}
                </button>
              )
            )}
          </div>

          <span
            style={{
              color: C.cyan,
              fontSize: 12,
            }}
          >
            <Check
              size={15}
              style={{ verticalAlign: "middle" }}
            />
            {" "}
            Perubahan tersimpan otomatis
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="sp-table">
            <thead>
              <tr>
                <th>SISWA</th>
                <th>STATUS</th>
                <th>WAKTU & SUMBER</th>
                <th>CATATAN</th>
                <th>AKSI</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    background:
                      item.display_status === "pending"
                        ? "#fff9f3"
                        : "#fff",
                  }}
                >
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar
                        name={item.student?.name}
                      />

                      <div>
                        <b>
                          {item.student?.name}
                        </b>

                        <small
                          style={{
                            display: "block",
                            color: C.muted,
                            marginTop: 4,
                          }}
                        >
                          NIS {item.student?.nis}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <StatusBadge
                      status={item.display_status}
                    />
                  </td>

                  <td style={{ color: C.muted }}>
                    {item.time
                      ? `${item.time} · `
                      : ""}
                    {item.source_text || "—"}
                  </td>

                  <td style={{ color: C.muted }}>
                    {item.notes || "—"}
                  </td>

                  <td>
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => {
                        setModalError("");
                        setEditing(item);
                      }}
                    >
                      Ubah
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRows.length === 0 && (
            <p
              style={{
                padding: 30,
                textAlign: "center",
                color: C.muted,
                fontSize: 13,
              }}
            >
              Tidak ada siswa dengan status ini.
            </p>
          )}
        </div>
      </section>

      {/* POPUP EDIT */}
      {editing && (
        <EditStatusModal
          key={editing.id}
          item={editing}
          session={session}
          saving={busy}
          error={modalError}
          onClose={() => {
            if (!busy) {
              setEditing(null);
            }
          }}
          onSave={handleSaveStatus}
        />
      )}

      {/* POPUP KONFIRMASI TUTUP */}
      {showCloseModal && (
        <CloseSessionModal
          session={session}
          closing={busy}
          onClose={() => {
            if (!busy) {
              setShowCloseModal(false);
            }
          }}
          onConfirm={handleCloseSession}
        />
      )}
    </div>
  );
}
