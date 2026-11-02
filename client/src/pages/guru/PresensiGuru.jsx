
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Users,
  Plus,
  Check,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  FilePenLine,
} from "lucide-react";

import {
  presensiGuruApi,
  PRESENSI_SOURCE,
} from "../../services/presensiGuruApi";

const C = {
  navy: "#172338",
  teal: "#005b6d",
  cyan: "#0095b3",
  muted: "#718096",
  line: "#d5e9ef",
  danger: "#ff0000",
};

const S = {
  panel: {
    background: "#fff",
    border: `1px solid ${C.line}`,
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  muted: {
    color: C.muted,
    fontSize: 12,
    margin: "6px 0 0",
    lineHeight: 1.5,
  },
  outline: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    border: `1px solid ${C.line}`,
    borderRadius: 25,
    padding: "10px 15px",
    background: "#fff",
    color: C.teal,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  primary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    borderRadius: 25,
    padding: "12px 18px",
    background: C.teal,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  th: {
    padding: "13px 15px",
    background: "#eef7f9",
    color: "#718096",
    fontSize: 10,
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 15,
    fontSize: 12,
    borderBottom: "1px solid #edf1f4",
    verticalAlign: "middle",
  },
};

function getToken() {
  if (PRESENSI_SOURCE === "mock") return null;
  return sessionStorage.getItem("b8-teacher-token");
}

function InfoRow({ label, value }) {
  return (
    <div className="pg-info-row">
      <span>{label}</span>
      <b>{value || "-"}</b>
    </div>
  );
}

// ======================================
// JADWAL CARD
// ======================================

function JadwalCard({ jadwal, selected, onSelect }) {
  const states = {
    open: "Sedang Berlangsung",
    ended: "Sesi Berakhir",
    closed: "Selesai",
  };

  return (
    <button
      type="button"
      className={`pg-jadwal ${selected ? "selected" : ""}`}
      onClick={() => onSelect(jadwal.schedule_id)}
    >
      <div style={{ ...S.row, width: "100%" }}>
        <b style={{ color: C.cyan, fontSize: 13 }}>
          SESI {jadwal.session_number}
        </b>

        {selected && (
          <span className="pg-check">
            <Check size={13} />
          </span>
        )}
      </div>

      <b style={{ color: C.navy, fontSize: 14 }}>
        Kelas {jadwal.class?.name || "-"}
      </b>

      <span style={{ color: C.muted, fontSize: 12 }}>
        {jadwal.subject?.name || "-"}
      </span>

      {jadwal.session?.state && (
        <span style={{ color: C.cyan, fontSize: 11 }}>
          {states[jadwal.session.state] ||
            jadwal.session.state}
        </span>
      )}

      <div className="pg-jadwal-bottom">
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Clock3 size={13} />
          {jadwal.time?.start || "-"} -{" "}
          {jadwal.time?.end || "-"}
        </span>
        <span>{jadwal.room || ""}</span>
      </div>
    </button>
  );
}

// ======================================
// KELAS TERPILIH
// ======================================

function KelasTerpilih({ jadwal, onCreate, onView }) {
  return (
    <section style={{
      ...S.panel,
      background: "#f4fbfd",
      padding: 20,
      display: "flex",
      gap: 16,
      alignItems: "center",
      flexWrap: "wrap",
    }}>
      <div className="pg-calendar-icon">
        <CalendarDays size={22} />
      </div>

      <div style={{ flex: 1, minWidth: 185 }}>
        <b style={{ color: C.cyan, fontSize: 12 }}>
          KELAS TERPILIH
        </b>

        <h3 style={{
          fontSize: 15,
          margin: "6px 0",
        }}>
          {jadwal
            ? `Kelas ${jadwal.class?.name} · ${jadwal.subject?.name}`
            : "Belum ada kelas dipilih"}
        </h3>

        <p style={S.muted}>
          {jadwal
            ? `Sesi ${jadwal.session_number} · ${jadwal.time?.start} - ${jadwal.time?.end} · ${jadwal.room || "-"}`
            : "Pilih jadwal mengajar terlebih dahulu."}
        </p>
      </div>

      <div style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        color: C.teal,
        paddingRight: 10,
      }}>
        <Users size={21} />

        <div>
          <b style={{ display: "block", fontSize: 18 }}>
            {jadwal?.student_count ?? "-"}
          </b>
          <small style={{ color: C.muted, fontSize: 11 }}>
            Total siswa
          </small>
        </div>
      </div>

      <button
        type="button"
        style={{
          ...S.primary,
          opacity: jadwal ? 1 : .5,
        }}
        disabled={!jadwal}
        onClick={() => {
          if (!jadwal) return;

          if (jadwal.session?.id) {
            onView(jadwal.session.id);
          } else {
            onCreate(jadwal.schedule_id);
          }
        }}
      >
        {jadwal?.session?.id ? (
          <>
            Lihat Presensi <ChevronRight size={16} />
          </>
        ) : (
          <>
            <Plus size={16} /> Buat Presensi
          </>
        )}
      </button>
    </section>
  );
}

// ======================================
// MODAL EDIT MATERI
// ======================================

function EditModal({ item, onClose, onSave, saving }) {
  const [topic, setTopic] = useState(item.topic || "");
  const [learningOutcome, setLearningOutcome] = useState(
    item.learning_outcome || ""
  );
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      await onSave(item.id, {
        topic: topic.trim(),
        learningOutcome: learningOutcome.trim(),
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="pg-overlay">
      <form
        className="pg-modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pg-edit-title"
      >
        <div className="pg-modal-icon pg-edit-icon">
          <FilePenLine size={29} />
        </div>

        <h2 id="pg-edit-title" className="pg-modal-title">
          Ubah materi presensi?
        </h2>

        <p className="pg-modal-description">
          Perbaiki materi atau sub capaian pembelajaran.
          Perubahan ini tidak akan menghapus data kehadiran siswa.
        </p>

        <div className="pg-modal-details">
          <InfoRow
            label="Kelas"
            value={`Kelas ${item.schedule?.class?.name} · ${item.schedule?.subject?.name}`}
          />
          <InfoRow label="Tanggal" value={item.date_label} />
          <InfoRow
            label="Materi lama"
            value={item.topic}
          />
        </div>

        <div style={{ textAlign: "left", marginTop: 22 }}>
          <label className="pg-label">
            Materi Pembelajaran *
          </label>
          <input
            className="pg-field"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            maxLength={200}
          />

          <label className="pg-label">
            Sub Capaian Pembelajaran *
          </label>
          <textarea
            className="pg-field"
            value={learningOutcome}
            onChange={(e) =>
              setLearningOutcome(e.target.value)
            }
            required
            rows={4}
            maxLength={1000}
          />
        </div>

        {error && (
          <p role="alert" style={{
            color: "#dc2626",
            fontSize: 12,
            textAlign: "left",
          }}>
            {error}
          </p>
        )}

        <div className="pg-modal-actions">
          <button
            type="button"
            style={S.outline}
            disabled={saving}
            onClick={onClose}
          >
            Batal
          </button>

          <button
            type="submit"
            style={{
              ...S.primary,
              minWidth: 170,
              opacity: saving ? .55 : 1,
            }}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ======================================
// MODAL HAPUS SESI
// ======================================

function DeleteModal({ item, onClose, onConfirm, deleting }) {
  return (
    <div className="pg-overlay">
      <div
        className="pg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pg-delete-title"
      >
        <div className="pg-modal-icon pg-delete-icon">
          <Trash2 size={29} />
        </div>

        <h2 id="pg-delete-title" className="pg-modal-title">
          Hapus presensi ini?
        </h2>

        <p className="pg-modal-description">
          Data presensi dan catatan kehadiran siswa pada sesi
          ini akan dihapus. Anda dapat membuat presensi ulang
          untuk jadwal dan tanggal yang sama.
        </p>

        <div className="pg-modal-details">
          <InfoRow
            label="Kelas"
            value={`Kelas ${item.schedule?.class?.name} · ${item.schedule?.subject?.name}`}
          />

          <InfoRow
            label="Jadwal"
            value={`${item.time?.start || "-"} - ${item.time?.end || "-"}`}
          />

          <InfoRow
            label="Tanggal"
            value={item.date_label}
          />

          <InfoRow
            label="Materi"
            value={item.topic}
          />

          <InfoRow
            label="Status"
            value={item.state_label || item.state}
          />
        </div>

        <p style={{
          fontSize: 12,
          color: "#d12a2a",
          lineHeight: 1.6,
          textAlign: "left",
          margin: "18px 0 0",
        }}>
          <AlertCircle
            size={16}
            style={{ verticalAlign: "middle", marginRight: 6 }}
          />
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="pg-modal-actions">
          <button
            type="button"
            style={S.outline}
            disabled={deleting}
            onClick={onClose}
          >
            Batal
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => onConfirm(item)}
            style={{
              ...S.primary,
              background: "#ff0000",
              minWidth: 180,
              opacity: deleting ? .55 : 1,
            }}
          >
            {deleting ? "Menghapus..." : "Ya, Hapus Presensi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================
// MENU TITIK TIGA
// ======================================

function AksiMenu({ item, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    function outside(e) {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    }

    function escape(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="pg-three-dots"
        aria-label="Opsi presensi"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div className="pg-dropdown" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit(item);
            }}
          >
            <Pencil size={15} />
            Edit Materi
          </button>

          <div className="pg-dropdown-divider" />

          <button
            type="button"
            role="menuitem"
            className="danger"
            onClick={() => {
              setOpen(false);
              onDelete(item);
            }}
          >
            <Trash2 size={15} />
            Hapus Presensi
          </button>
        </div>
      )}
    </div>
  );
}

// ======================================
// TABEL RIWAYAT
// ======================================

function RiwayatPresensi({
  history,
  onDetail,
  onEdit,
  onDelete,
  onRecap,
}) {
  const [filter, setFilter] = useState("semua");

  const classes = [
    ...new Map(
      history
        .filter((item) => item.schedule?.class?.id)
        .map((item) => [
          String(item.schedule.class.id),
          item.schedule.class,
        ])
    ).values(),
  ];

  const filtered = filter === "semua"
    ? history
    : history.filter(
        (item) =>
          String(item.schedule?.class?.id) === filter
      );

  return (
    <section style={{ ...S.panel, overflow: "visible" }}>
      <div style={{
        ...S.row,
        padding: "22px 20px 20px",
        flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            Riwayat presensi
          </h2>
          <p style={S.muted}>
            Rekap sesi presensi kelas yang pernah dibuat.
          </p>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 9,
        }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ ...S.outline, borderRadius: 10 }}
          >
            <option value="semua">Semua Kelas</option>
            {classes.map((kelas) => (
              <option
                value={String(kelas.id)}
                key={kelas.id}
              >
                Kelas {kelas.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            style={S.outline}
            onClick={onRecap}
          >
            Lihat Rekap
          </button>
        </div>
      </div>

      <div style={{
        overflowX: "auto",
        paddingBottom: 95,
      }}>
        <table style={{
          width: "100%",
          minWidth: 930,
          borderCollapse: "collapse",
          textAlign: "left",
        }}>
          <thead>
            <tr>
              {[
                "TANGGAL",
                "KELAS & JADWAL",
                "MATERI PEMBELAJARAN",
                "RINGKASAN KEHADIRAN",
                "STATUS",
                "AKSI",
              ].map((label) => (
                <th key={label} style={S.th}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td style={S.td}>
                  <b>{item.date_label || "-"}</b>
                  <small style={{
                    ...S.muted,
                    display: "block",
                  }}>
                    {item.day_name || ""}
                  </small>
                </td>

                <td style={S.td}>
                  <b>
                    Kelas {item.schedule?.class?.name || "-"}
                  </b>
                  <small style={{
                    ...S.muted,
                    display: "block",
                  }}>
                    {item.time?.start || "-"} -{" "}
                    {item.time?.end || "-"}
                  </small>
                </td>

                <td style={{ ...S.td, maxWidth: 260 }}>
                  <b>{item.topic || "-"}</b>
                  <small style={{
                    ...S.muted,
                    display: "block",
                  }}>
                    {item.learning_outcome || "-"}
                  </small>
                </td>

                <td style={{
                  ...S.td,
                  whiteSpace: "nowrap",
                }}>
                  <span style={{ color: C.cyan }}>
                    {item.summary?.hadir ?? 0}
                  </span>{" "}
                  Hadir{" "}
                  <span style={{ color: "#e59529" }}>
                    {item.summary?.izin ?? 0}
                  </span>{" "}
                  Izin{" "}
                  <span style={{ color: "#ec6876" }}>
                    {item.summary?.sakit ?? 0}
                  </span>{" "}
                  Sakit{" "}
                  {item.summary?.alpha ?? 0} Alfa
                </td>

                <td style={S.td}>
                  <span style={{
                    display: "inline-block",
                    background:
                      item.state === "closed"
                        ? "#eaf8ef"
                        : "#e6f5f9",
                    color:
                      item.state === "closed"
                        ? "#18855b"
                        : "#00819d",
                    borderRadius: 25,
                    padding: "7px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>
                    ● {item.state_label || item.state}
                  </span>
                </td>

                <td style={S.td}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap",
                  }}>
                    <button
                      type="button"
                      style={{
                        ...S.outline,
                        padding: "8px 12px",
                        fontSize: 11,
                      }}
                      onClick={() => onDetail(item.id)}
                    >
                      Detail
                      <ChevronRight size={14} />
                    </button>

                    <AksiMenu
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{
            textAlign: "center",
            padding: 24,
            color: C.muted,
            fontSize: 13,
          }}>
            Belum ada riwayat presensi.
          </p>
        )}
      </div>
    </section>
  );
}

// ======================================
// DASHBOARD UTAMA
// ======================================

export default function PresensiGuru() {
  const navigate = useNavigate();

  const [jadwal, setJadwal] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [dateLabel, setDateLabel] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const ambilData = useCallback(async () => {
    setLoading(true);

    try {
      const [today, historyResult] = await Promise.all([
        presensiGuruApi.getJadwalHariIni(getToken()),
        presensiGuruApi.getRiwayatPresensi(getToken()),
      ]);

      const schedules = Array.isArray(today?.schedules)
        ? today.schedules
        : [];

      const history = Array.isArray(historyResult)
        ? historyResult
        : Array.isArray(historyResult?.sessions)
          ? historyResult.sessions
          : [];

      setJadwal(schedules);
      setRiwayat(history);
      setDateLabel(today?.date_label || "");

      setSelectedId((old) => {
        const exists = schedules.some(
          (item) =>
            String(item.schedule_id) === String(old)
        );

        return exists
          ? old
          : schedules[0]?.schedule_id ?? null;
      });

      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    ambilData();
  }, [ambilData]);

  const selected = jadwal.find(
    (item) =>
      String(item.schedule_id) === String(selectedId)
  );

  function bukaBuatPresensi(scheduleId) {
    navigate("/guru/presensi/buat", {
      state: { scheduleId },
    });
  }

  function bukaDetail(sessionId) {
    const sesi = riwayat.find(
      (item) => String(item.id) === String(sessionId)
    );

    if (sesi?.method === "manual" && sesi?.state === "open") {
      navigate(`/guru/presensi/manual/${sessionId}`);
    } else {
      navigate(`/guru/presensi/sesi/${sessionId}`);
    }
  }

  async function handleEdit(id, payload) {
    setBusy(true);
    setMessage("");

    try {
      await presensiGuruApi.editSesi(
        getToken(),
        id,
        payload
      );

      await ambilData();
      setEditing(null);
      setMessage("Materi presensi berhasil diperbarui.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await presensiGuruApi.hapusSesi(
        getToken(),
        item.id
      );

      await ambilData();

      setDeleting(null);
      setMessage(
        "Presensi berhasil dihapus. Jadwal bisa digunakan kembali untuk membuat presensi."
      );
    } catch (err) {
      setError(err.message);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pg-page">
      <style>{`
        .pg-page { color:#172338; padding-bottom:40px; }
        .pg-page * { box-sizing:border-box; }

        .pg-jadwal {
          display:flex;
          flex-direction:column;
          align-items:stretch;
          gap:7px;
          padding:16px;
          min-height:150px;
          width:100%;
          text-align:left;
          border:1px solid #dce9ed;
          border-radius:12px;
          background:white;
          cursor:pointer;
          font-family:inherit;
        }
        .pg-jadwal.selected {
          background:#f3fbfd;
          border:1.5px solid #0095b3;
          box-shadow:0 0 0 2px #e6f5f9;
        }
        .pg-check {
          width:20px;
          height:20px;
          border-radius:50%;
          display:grid;
          place-items:center;
          background:#0095b3;
          color:white;
        }
        .pg-jadwal-bottom {
          display:flex;
          justify-content:space-between;
          gap:10px;
          width:100%;
          margin-top:auto;
          padding-top:12px;
          border-top:1px solid #edf1f4;
          color:#8391a4;
          font-size:11px;
        }
        .pg-calendar-icon {
          width:46px;
          height:46px;
          display:grid;
          place-items:center;
          background:white;
          border-radius:12px;
          color:#0095b3;
          flex-shrink:0;
        }

        .pg-three-dots {
          width:35px;
          height:35px;
          display:grid;
          place-items:center;
          border:1px solid #d5e9ef;
          border-radius:9px;
          background:#fff;
          color:#005b6d;
          cursor:pointer;
        }
        .pg-three-dots:hover {
          background:#eff9fc;
        }
        .pg-dropdown {
          position:absolute;
          right:0;
          top:calc(100% + 5px);
          min-width:185px;
          background:#fff;
          border:1px solid #d5e9ef;
          border-radius:11px;
          padding:5px;
          box-shadow:0 12px 28px rgba(15,23,42,.14);
          z-index:100;
        }
        .pg-dropdown button {
          display:flex;
          align-items:center;
          gap:10px;
          width:100%;
          padding:11px 12px;
          background:transparent;
          border:0;
          border-radius:7px;
          text-align:left;
          font:inherit;
          font-size:12px;
          color:#172338;
          cursor:pointer;
        }
        .pg-dropdown button:hover { background:#eff9fc; }
        .pg-dropdown button.danger { color:#dc2626; }
        .pg-dropdown button.danger:hover { background:#fff1f2; }
        .pg-dropdown-divider {
          height:1px;
          background:#edf1f4;
          margin:4px 0;
        }

        .pg-overlay {
          position:fixed;
          inset:0;
          background:rgba(4,54,70,.65);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          z-index:1000;
        }
        .pg-modal {
          width:min(100%,570px);
          max-height:90vh;
          overflow-y:auto;
          background:#fff;
          border-radius:23px;
          padding:36px;
          box-shadow:0 22px 70px rgba(0,0,0,.2);
          text-align:center;
        }
        .pg-modal-icon {
          width:66px;
          height:66px;
          border-radius:50%;
          display:grid;
          place-items:center;
          margin:0 auto 22px;
        }
        .pg-delete-icon {
          background:#fff0f0;
          color:#ff0000;
        }
        .pg-edit-icon {
          background:#e6f6fa;
          color:#0095b3;
        }
        .pg-modal-title {
          margin:0 0 12px;
          font-size:23px;
          font-weight:800;
          color:#172338;
        }
        .pg-modal-description {
          font-size:14px;
          color:#718096;
          line-height:1.6;
          max-width:430px;
          margin:0 auto 22px;
        }
        .pg-modal-details {
          border:1px solid #d5e9ef;
          border-radius:19px;
          padding:12px 20px;
          text-align:left;
        }
        .pg-info-row {
          display:grid;
          grid-template-columns:125px 1fr;
          gap:10px;
          padding:10px 0;
          font-size:13px;
          line-height:1.5;
        }
        .pg-info-row span { color:#81909f; }
        .pg-info-row b { color:#172338; }
        .pg-label {
          display:block;
          font-size:13px;
          font-weight:700;
          margin:16px 0 8px;
          text-align:left;
        }
        .pg-field {
          width:100%;
          border:1px solid #d5e9ef;
          border-radius:10px;
          padding:12px;
          background:white;
          color:#172338;
          font:inherit;
          resize:vertical;
        }
        .pg-modal-actions {
          display:flex;
          justify-content:flex-end;
          gap:10px;
          flex-wrap:wrap;
          margin-top:27px;
        }

        @media(max-width:540px) {
          .pg-modal { padding:24px; }
          .pg-info-row { grid-template-columns:90px 1fr; }
          .pg-modal-actions button { flex:1; }
        }
      `}</style>

      <h1 className="title">Presensi</h1>
      <p className="subtitle">
        Kelola kehadiran siswa berdasarkan kelas dan jadwal mengajar.
      </p>

      {error && (
        <div role="alert" style={{
          display: "flex",
          gap: 10,
          padding: 14,
          margin: "18px 0",
          background: "#fff1f2",
          border: "1px solid #fecaca",
          borderRadius: 12,
          color: "#be123c",
          fontSize: 13,
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && (
        <div role="status" style={{
          display: "flex",
          gap: 10,
          padding: 14,
          margin: "18px 0",
          background: "#eaf8ef",
          border: "1px solid #c6ecdc",
          borderRadius: 12,
          color: "#15803d",
          fontSize: 13,
        }}>
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {loading && !jadwal.length && (
        <p style={{ color: C.muted, marginTop: 20 }}>
          Memuat data presensi...
        </p>
      )}

      <section style={{
        ...S.panel,
        padding: "26px 28px",
        marginTop: 24,
      }}>
        <div style={{
          ...S.row,
          flexWrap: "wrap",
          marginBottom: 22,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>
              Jadwal Hari Ini
            </h2>
            <p style={S.muted}>
              {dateLabel || "Menunggu tanggal..."}
            </p>
          </div>

          <span style={{
            background: "#e6f5f9",
            color: C.cyan,
            borderRadius: 25,
            padding: "8px 13px",
            fontSize: 12,
            fontWeight: 700,
          }}>
            {jadwal.length} Kelas
          </span>
        </div>

        {jadwal.length ? (
          <div style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(195px,1fr))",
            gap: 13,
          }}>
            {jadwal.map((item) => (
              <JadwalCard
                key={item.schedule_id}
                jadwal={item}
                selected={
                  String(item.schedule_id) ===
                  String(selectedId)
                }
                onSelect={setSelectedId}
              />
            ))}
          </div>
        ) : (
          <p style={S.muted}>
            Tidak ada jadwal yang tersedia.
          </p>
        )}
      </section>

      <KelasTerpilih
        jadwal={selected}
        onCreate={bukaBuatPresensi}
        onView={bukaDetail}
      />

      <RiwayatPresensi
        history={riwayat}
        onDetail={bukaDetail}
        onEdit={setEditing}
        onDelete={setDeleting}
        onRecap={() => navigate("/guru/presensi/rekap")}
      />

      {editing && (
        <EditModal
          key={editing.id}
          item={editing}
          saving={busy}
          onClose={() => setEditing(null)}
          onSave={handleEdit}
        />
      )}

      {deleting && (
        <DeleteModal
          item={deleting}
          deleting={busy}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
