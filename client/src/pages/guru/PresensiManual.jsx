
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Check,
  Save,
  Users,
  AlertCircle,
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
};

const statusOptions = [
  { value: "hadir", label: "Hadir", color: "#0089a4", bg: "#e2f6fa" },
  { value: "izin", label: "Izin", color: "#dc6a1c", bg: "#fff1e5" },
  { value: "sakit", label: "Sakit", color: "#dc2640", bg: "#ffedf0" },
  { value: "alpha", label: "Alfa", color: "#536176", bg: "#edf0f4" },
];

const primaryButton = {
  border: "none",
  borderRadius: 25,
  background: C.teal,
  color: "#fff",
  padding: "12px 18px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "inherit",
};

const outlineButton = {
  ...primaryButton,
  background: "#fff",
  color: C.teal,
  border: `1px solid ${C.line}`,
};

function getToken() {
  return PRESENSI_SOURCE === "mock"
    ? null
    : sessionStorage.getItem("b8-teacher-token");
}

function StatusBadge({ status }) {
  const option = statusOptions.find((item) => item.value === status);

  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 25,
        background: option?.bg || "#edf0f4",
        color: option?.color || C.muted,
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      ● {option?.label || "-"}
    </span>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="pm-summary-card">
      <span style={{ color: C.muted, fontSize: 12 }}>
        {title}
      </span>

      <strong
        style={{
          display: "block",
          fontSize: 28,
          marginTop: 8,
          color: color || C.navy,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

export default function PresensiManual() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [called, setCalled] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await presensiGuruApi.getSesi(
        getToken(),
        sessionId
      );

      if (data.method !== "manual") {
        navigate(`/guru/presensi/sesi/${sessionId}`, {
          replace: true,
        });
        return;
      }

      setSession(data);

      setStudents(
        (data.attendances || []).map((item) => ({
          ...item,
          status: item.recorded_at ? item.status : "hadir",
          notes: item.notes || "",
        }))
      );

      setActiveIndex(0);
      setCalled([]);
      setDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const active = students[activeIndex];

  const summary = {
    total: students.length,
    hadir: students.filter((s) => s.status === "hadir").length,
    izin: students.filter((s) => s.status === "izin").length,
    sakit: students.filter((s) => s.status === "sakit").length,
    alpha: students.filter((s) => s.status === "alpha").length,
  };

  const isClosed = session?.state !== "open";

  function updateStudent(id, field, value) {
    if (isClosed) return;

    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? { ...student, [field]: value }
          : student
      )
    );

    setDirty(true);
    setError("");
  }

  function callStudent(index) {
    if (index < 0 || index >= students.length) return;

    setActiveIndex(index);
    setCalled((current) =>
      current.includes(index)
        ? current
        : [...current, index]
    );
  }

  function nextStudent() {
    callStudent(activeIndex + 1);
  }

  function previousStudent() {
    callStudent(activeIndex - 1);
  }

  // =====================================
  // SIMPAN -> LANGSUNG KE PRESENSIGURU
  // =====================================

  async function handleSave() {
    if (isClosed || saving) return;

    setError("");

    if (students.length === 0) {
      setError("Daftar siswa masih kosong.");
      return;
    }

    setSaving(true);

    try {
      const changes = students.map((student) => ({
        attendanceId: student.id,
        status: student.status,
        notes: student.notes?.trim() || "",
      }));

      // Catatan boleh kosong untuk semua status.
      await presensiGuruApi.simpanPresensiManual(
        getToken(),
        sessionId,
        changes
      );

      setDirty(false);

      // Langsung kembali ke dashboard awal.
      navigate("/guru/presensi", {
        replace: true,
        state: {
          successMessage: "Presensi manual berhasil disimpan.",
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function backToDashboard() {
    if (
      dirty &&
      !window.confirm(
        "Ada perubahan yang belum disimpan. Yakin ingin kembali?"
      )
    ) {
      return;
    }

    navigate("/guru/presensi");
  }

  if (loading) {
    return (
      <p style={{ color: C.muted }}>
        Memuat daftar siswa...
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
          style={outlineButton}
          onClick={() => navigate("/guru/presensi")}
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="pm-page">
      <style>{`
        .pm-page {
          color: #172338;
          padding-bottom: 55px;
        }
        .pm-page * {
          box-sizing: border-box;
        }
        .pm-panel {
          background: #fff;
          border: 1px solid #d5e9ef;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 16px;
        }
        .pm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        .pm-summary {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        .pm-summary-card {
          background: #fff;
          border: 1px solid #d5e9ef;
          border-radius: 15px;
          padding: 17px;
        }
        .pm-layout {
          display: grid;
          grid-template-columns: minmax(0,1.3fr) minmax(270px,.7fr);
          gap: 16px;
          align-items: start;
        }
        .pm-student-row {
          display: grid;
          grid-template-columns: 32px minmax(120px,1fr) 110px 75px;
          gap: 12px;
          align-items: center;
          padding: 13px 15px;
          border-bottom: 1px solid #edf2f5;
          cursor: pointer;
          font-size: 12px;
        }
        .pm-student-row:hover {
          background: #f6fbfd;
        }
        .pm-student-row.active {
          background: #eef9fc;
          border-left: 3px solid #0095b3;
        }
        .pm-status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 17px;
        }
        .pm-status-button {
          border-radius: 12px;
          border: 1px solid #d5e9ef;
          background: #fff;
          padding: 15px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
        }
        .pm-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }
        .pm-form-input {
          width: 100%;
          border: 1px solid #d5e9ef;
          border-radius: 10px;
          padding: 12px;
          font: inherit;
          background: #fff;
          color: #172338;
          resize: vertical;
        }
        .pm-save-panel {
          background: #f4fbfd;
          border: 1px solid #d5e9ef;
          border-radius: 17px;
          padding: 20px;
          margin-top: 20px;
        }
        @media (max-width: 960px) {
          .pm-layout { grid-template-columns: 1fr; }
          .pm-summary { grid-template-columns: repeat(3,1fr); }
        }
        @media (max-width: 600px) {
          .pm-summary { grid-template-columns: repeat(2,1fr); }
          .pm-student-row {
            grid-template-columns: 28px 1fr 95px;
          }
          .pm-called-label { display: none; }
        }
      `}</style>

      {/* KEMBALI */}
      <button
        type="button"
        style={{
          ...outlineButton,
          border: "none",
          paddingLeft: 0,
          marginBottom: 16,
        }}
        onClick={backToDashboard}
      >
        <ArrowLeft size={16} />
        Presensi
      </button>

      {/* HEADER */}
      <div className="pm-header">
        <div>
          <h1 style={{ fontSize: 27, margin: "0 0 8px" }}>
            Presensi Manual
          </h1>

          <p style={{ color: C.muted, fontSize: 13 }}>
            Kelas {session.schedule?.class?.name} ·{" "}
            {session.schedule?.subject?.name} ·{" "}
            Pertemuan #{session.meeting_number}
          </p>
        </div>

        <span
          style={{
            padding: "9px 14px",
            borderRadius: 25,
            background: session.manual_saved_at
              ? "#e6f6ee"
              : "#e5f6fa",
            color: session.manual_saved_at
              ? "#15803d"
              : C.cyan,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {isClosed
            ? "Presensi Ditutup"
            : dirty
              ? "Belum Disimpan"
              : session.manual_saved_at
                ? "Tersimpan"
                : "Belum Disimpan"}
        </span>
      </div>

      {/* INFORMASI SESI */}
      <section
        className="pm-panel"
        style={{ marginTop: 22 }}
      >
        <div className="pm-header">
          <div>
            <b style={{ fontSize: 14 }}>
              {session.topic}
            </b>

            <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>
              {session.learning_outcome}
            </p>
          </div>

          <span style={{ color: C.muted, fontSize: 12 }}>
            {session.time?.start} - {session.time?.end} WIB
          </span>
        </div>

        <div
          style={{
            background: "#eff9fc",
            padding: 14,
            marginTop: 19,
            borderRadius: 11,
            color: C.teal,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <Users
            size={16}
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />
          Semua siswa memiliki pilihan awal <b>Hadir</b>.
          Panggil satu per satu dan ubah status jika diperlukan.
          Catatan bersifat <b>opsional</b> untuk semua status.
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          style={{
            background: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: 14,
            marginBottom: 15,
            fontSize: 13,
          }}
        >
          <AlertCircle
            size={16}
            style={{ verticalAlign: "middle" }}
          />
          {" "}{error}
        </div>
      )}

      {/* RINGKASAN */}
      <div className="pm-summary">
        <SummaryCard
          title="Total siswa"
          value={summary.total}
        />
        <SummaryCard
          title="Hadir"
          value={summary.hadir}
          color={C.cyan}
        />
        <SummaryCard
          title="Izin"
          value={summary.izin}
          color="#d95512"
        />
        <SummaryCard
          title="Sakit"
          value={summary.sakit}
          color="#dc2640"
        />
        <SummaryCard
          title="Alfa"
          value={summary.alpha}
        />
      </div>

      <div className="pm-layout">
        {/* DAFTAR SISWA */}
        <section className="pm-panel" style={{ padding: 0 }}>
          <div
            style={{
              padding: 19,
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 17 }}>
              Daftar Siswa
            </h2>

            <p
              style={{
                color: C.muted,
                fontSize: 12,
                margin: "7px 0 0",
              }}
            >
              Pilih nama siswa atau gunakan tombol Selanjutnya.
              {" "}{called.length} dari {students.length} sudah dipanggil.
            </p>
          </div>

          <div style={{ maxHeight: 570, overflowY: "auto" }}>
            {students.map((item, index) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                className={`pm-student-row ${
                  index === activeIndex ? "active" : ""
                }`}
                onClick={() => callStudent(index)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    callStudent(index);
                  }
                }}
              >
                <span style={{ color: C.muted }}>
                  {index + 1}.
                </span>

                <div>
                  <b style={{ fontSize: 12 }}>
                    {item.student.name}
                  </b>

                  <small
                    style={{
                      display: "block",
                      color: C.muted,
                      marginTop: 3,
                    }}
                  >
                    NIS {item.student.nis}
                  </small>
                </div>

                <StatusBadge status={item.status} />

                <span
                  className="pm-called-label"
                  style={{
                    fontSize: 11,
                    color: called.includes(index)
                      ? "#15803d"
                      : C.muted,
                  }}
                >
                  {called.includes(index)
                    ? "Dipanggil"
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ABSENSI SISWA AKTIF */}
        <aside className="pm-panel">
          {active ? (
            <>
              <span
                style={{
                  color: C.cyan,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ABSENSI SISWA
              </span>

              <p
                style={{
                  color: C.muted,
                  fontSize: 12,
                  margin: "14px 0 6px",
                }}
              >
                Siswa {activeIndex + 1} dari {students.length}
              </p>

              <h2 style={{ margin: "4px 0 7px", fontSize: 21 }}>
                {active.student.name}
              </h2>

              <p style={{ color: C.muted, fontSize: 12 }}>
                NIS {active.student.nis}
              </p>

              <div
                style={{
                  height: 1,
                  background: C.line,
                  margin: "20px 0",
                }}
              />

              <b style={{ fontSize: 13 }}>
                Status Kehadiran
              </b>

              <div className="pm-status-grid">
                {statusOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    disabled={isClosed}
                    className="pm-status-button"
                    onClick={() => {
                      updateStudent(
                        active.id,
                        "status",
                        option.value
                      );

                      setCalled((current) =>
                        current.includes(activeIndex)
                          ? current
                          : [...current, activeIndex]
                      );
                    }}
                    style={{
                      background:
                        active.status === option.value
                          ? option.bg
                          : "#fff",
                      borderColor:
                        active.status === option.value
                          ? option.color
                          : C.line,
                      color: option.color,
                      opacity: isClosed ? 0.5 : 1,
                    }}
                  >
                    {active.status === option.value && (
                      <Check
                        size={14}
                        style={{ verticalAlign: "middle" }}
                      />
                    )}
                    {" "}{option.label}
                  </button>
                ))}
              </div>

              {/* CATATAN SELALU OPSIONAL */}
              <label
                htmlFor="pm-note"
                style={{
                  display: "block",
                  margin: "22px 0 9px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Catatan (opsional)
              </label>

              <textarea
                id="pm-note"
                className="pm-form-input"
                rows={3}
                disabled={isClosed}
                placeholder="Tambahkan catatan jika diperlukan..."
                value={active.notes}
                onChange={(event) =>
                  updateStudent(
                    active.id,
                    "notes",
                    event.target.value
                  )
                }
              />

              <div className="pm-bottom">
                <button
                  type="button"
                  disabled={activeIndex === 0}
                  style={{
                    ...outlineButton,
                    opacity: activeIndex === 0 ? 0.4 : 1,
                  }}
                  onClick={previousStudent}
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                <button
                  type="button"
                  disabled={activeIndex === students.length - 1}
                  style={{
                    ...primaryButton,
                    opacity:
                      activeIndex === students.length - 1
                        ? 0.4
                        : 1,
                  }}
                  onClick={nextStudent}
                >
                  Selanjutnya
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: C.muted }}>
              Tidak ada siswa.
            </p>
          )}
        </aside>
      </div>

      {/* TOMBOL SIMPAN */}
      <section className="pm-save-panel">
        <div className="pm-header">
          <div>
            <b style={{ fontSize: 15 }}>
              Simpan hasil presensi
            </b>

            <p
              style={{
                color: C.muted,
                fontSize: 12,
                marginTop: 7,
              }}
            >
              Pastikan status kehadiran sudah benar.
              Setelah disimpan, langsung kembali ke Dashboard Presensi Guru.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <button
              type="button"
              style={outlineButton}
              onClick={backToDashboard}
            >
              Batal
            </button>

            <button
              type="button"
              disabled={saving || isClosed}
              onClick={handleSave}
              style={{
                ...primaryButton,
                opacity: saving || isClosed ? 0.5 : 1,
              }}
            >
              <Save size={16} />
              {saving ? "Menyimpan..." : "Simpan Presensi"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
