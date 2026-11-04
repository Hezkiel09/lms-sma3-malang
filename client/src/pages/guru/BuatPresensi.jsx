
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Info,
  LockKeyhole,
  X,
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

const panel = {
  padding: 22,
  background: "#fff",
  border: `1px solid ${C.line}`,
  borderRadius: 17,
};

const inputStyle = {
  width: "100%",
  minHeight: 42,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: "11px 13px",
  fontFamily: "inherit",
  fontSize: 12,
  background: "#fff",
  color: C.navy,
};

const outlineButton = {
  border: `1px solid ${C.line}`,
  borderRadius: 25,
  background: "#fff",
  color: C.teal,
  padding: "11px 17px",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
};

const primaryButton = {
  ...outlineButton,
  borderColor: C.teal,
  background: C.teal,
  color: "#fff",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
};

function getToken() {
  if (PRESENSI_SOURCE === "mock") return null;
  return sessionStorage.getItem("b8-teacher-token");
}

function Label({ children, required = false }) {
  return (
    <label className="bp-label">
      {children}
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
  );
}

function Section({ number, title, children }) {
  return (
    <section style={panel}>
      <h2 style={{ fontSize: 19, margin: "0 0 18px" }}>
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

function Toggle({ value, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      style={{
        width: 38,
        height: 23,
        borderRadius: 25,
        border: 0,
        background: value ? C.cyan : "#cbd5e1",
        padding: 3,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        flexShrink: 0,
      }}
    >
      <span style={{
        display: "block",
        width: 17,
        height: 17,
        borderRadius: "50%",
        background: "#fff",
        marginLeft: value ? 15 : 0,
        transition: "margin .15s",
      }} />
    </button>
  );
}

function Setting({ title, description, value, onChange, disabled }) {
  return (
    <div className="bp-setting">
      <div>
        <b style={{ fontSize: 12 }}>{title}</b>
        <p className="bp-muted">{description}</p>
      </div>

      <Toggle
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="bp-summary-row">
      <span style={{ color: "#81909f" }}>{label}</span>
      <b>{value || "-"}</b>
    </div>
  );
}

function SuccessModal({ session, jadwal, onDashboard, onView }) {
  const manual = session.method === "manual";

  return (
    <div className="bp-overlay">
      <div
        className="bp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bp-success-title"
      >
        <div className="bp-modal-icon success">
          <Check size={31} strokeWidth={3} />
        </div>

        <h2 id="bp-success-title" className="bp-modal-title">
          Presensi berhasil dibuat dan dibuka
        </h2>

        <p className="bp-modal-description">
          {manual
            ? "Daftar siswa siap untuk diabsen secara manual oleh guru."
            : "Sesi presensi berhasil dibuka. Siswa dapat mulai mengisi melalui aplikasi saat sistem Backend terhubung."}
        </p>

        <div className="bp-modal-details">
          <SummaryRow
            label="Kelas"
            value={`Kelas ${jadwal?.class?.name} · ${jadwal?.subject?.name}`}
          />
          <SummaryRow
            label="Jadwal"
            value={`Sesi ${session.session_number} · ${jadwal?.time?.start} - ${jadwal?.time?.end}`}
          />
          <SummaryRow
            label="Tanggal"
            value={new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            }).format(new Date(`${session.date}T12:00:00+07:00`))}
          />
          <SummaryRow
            label="Pertemuan"
            value={`#${session.meeting_number}`}
          />
          <SummaryRow label="Materi" value={session.topic} />
          <SummaryRow
            label="Metode"
            value={manual ? "Manual oleh guru" : "Diisi siswa"}
          />
        </div>

        <div className="bp-modal-notes">
          <div>
            <Check size={15} />
            <span>
              {manual
                ? "Semua siswa memiliki pilihan awal Hadir."
                : "Siswa yang belum mengisi akan tampil sebagai Belum mengisi."}
            </span>
          </div>
          <div>
            <Clock3 size={15} />
            <span>
              {manual
                ? "Guru harus menekan Simpan Presensi setelah melakukan absensi."
                : "Guru bisa memantau status siswa melalui Sesi Berlangsung."}
            </span>
          </div>
          {PRESENSI_SOURCE === "mock" && (
            <div>
              <Info size={15} />
              <span>Mode demo: data tersimpan di browser.</span>
            </div>
          )}
        </div>

        <div className="bp-modal-actions">
          <button
            type="button"
            style={outlineButton}
            onClick={onDashboard}
          >
            Kembali ke Dashboard
          </button>

          <button
            type="button"
            style={primaryButton}
            onClick={onView}
          >
            {manual ? "Mulai Absensi Manual" : "Lihat Presensi"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuatPresensi() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingId = location.state?.scheduleId;

  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState(incomingId || "");
  const [date, setDate] = useState("");
  const [preview, setPreview] = useState(null);

  const [topic, setTopic] = useState("");
  const [learningOutcome, setLearningOutcome] = useState("");

  const [method, setMethod] = useState("siswa");
  const [notifyOnOpen, setNotifyOnOpen] = useState(true);
  const [remindUnfilled, setRemindUnfilled] = useState(true);
  const [notifyOnClose, setNotifyOnClose] = useState(true);
  const [remindAfterMinutes, setRemindAfterMinutes] = useState(15);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successSession, setSuccessSession] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const [teaching, today] = await Promise.all([
          presensiGuruApi.getTeaching(getToken()),
          presensiGuruApi.getJadwalHariIni(getToken()),
        ]);

        if (!active) return;

        const list = today.schedules || [];

        const unique = [
          ...new Map(
            list.map((item) => [String(item.schedule_id), item])
          ).values(),
        ];

        setSchedules(unique);

        setScheduleId(
          unique.some(
            (item) => String(item.schedule_id) === String(incomingId)
          )
            ? incomingId
            : unique[0]?.schedule_id || ""
        );

        setDate(
          today.date ||
          new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Jakarta",
          }).format(new Date())
        );
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [incomingId]);

  useEffect(() => {
    if (!scheduleId || !date) {
      setPreview(null);
      return;
    }

    let active = true;

    async function loadPreview() {
      setPreview(null);

      try {
        const result = await presensiGuruApi.getPreview(
          getToken(),
          scheduleId,
          date
        );

        if (active) {
          setPreview(result);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadPreview();
    return () => { active = false; };
  }, [scheduleId, date]);

  const selected = schedules.find(
    (item) => String(item.schedule_id) === String(scheduleId)
  );

  const classes = [
    ...new Map(
      schedules.map((item) => [
        String(item.class.id),
        item.class,
      ])
    ).values(),
  ];

  const formattedDate = date
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date(`${date}T12:00:00+07:00`))
    : "-";

  const canSubmit =
    !saving &&
    Boolean(selected) &&
    Boolean(preview) &&
    Boolean(date) &&
    !preview?.existing_session_id &&
    topic.trim().length > 0 &&
    topic.length <= 200 &&
    learningOutcome.trim().length > 0 &&
    learningOutcome.length <= 1000;

  function chooseClass(id) {
    const next = schedules.find(
      (item) => String(item.class.id) === String(id)
    );
    if (next) setScheduleId(next.schedule_id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError("");

    try {
      const result = await presensiGuruApi.buatPresensi(
        getToken(),
        {
          scheduleId,
          date,
          topic: topic.trim(),
          learningOutcome: learningOutcome.trim(),
          method,
          openMode: "now",
          notifyOnOpen,
          remindUnfilled: method === "siswa"
            ? remindUnfilled
            : false,
          remindAfterMinutes,
          notifyOnClose,
        }
      );

      setSuccessSession(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function viewSuccess() {
    if (!successSession) return;

    navigate(
      successSession.method === "manual"
        ? `/guru/presensi/manual/${successSession.id}`
        : `/guru/presensi/sesi/${successSession.id}`
    );
  }

  return (
    <div className="bp-page">
      <style>{`
        .bp-page { color:#172338; padding-bottom:40px; }
        .bp-page * { box-sizing:border-box; }
        .bp-muted { color:#718096; font-size:12px; line-height:1.6; margin:5px 0 0; }
        .bp-label { display:block; font-size:12px; font-weight:800; margin:16px 0 9px; }
        .bp-layout { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(270px,1fr); gap:14px; align-items:start; margin-top:24px; }
        .bp-main,.bp-side { display:flex; flex-direction:column; gap:15px; min-width:0; }
        .bp-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .bp-chips { display:flex; flex-wrap:wrap; gap:9px; }
        .bp-chip { border:1px solid #d5e9ef; background:#fff; border-radius:25px; padding:10px 16px; color:#42536a; font:inherit; font-size:12px; cursor:pointer; }
        .bp-chip.selected { background:#005b6d; color:#fff; border-color:#005b6d; font-weight:800; }
        .bp-methods { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
        .bp-method { border:1px solid #d5e9ef; border-radius:12px; padding:14px; background:#fff; cursor:pointer; text-align:left; font-family:inherit; }
        .bp-method.selected { border-color:#0095b3; background:#ebf8fb; }
        .bp-method b { font-size:12px; }
        .bp-method p { font-size:11px; color:#718096; line-height:1.5; }
        .bp-setting { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:15px 0; border-bottom:1px solid #edf2f5; }
        .bp-summary-row { display:grid; grid-template-columns:95px 1fr; gap:12px; font-size:12px; padding:10px 0; line-height:1.5; }
        .bp-summary-row b { color:#172338; }
        .bp-overlay { position:fixed; inset:0; z-index:1000; background:rgba(4,54,70,.65); padding:20px; display:flex; justify-content:center; align-items:center; }
        .bp-modal { background:#fff; width:min(100%,570px); max-height:90vh; overflow-y:auto; border-radius:23px; padding:36px; text-align:center; box-shadow:0 22px 70px rgba(0,0,0,.2); }
        .bp-modal-icon { width:66px; height:66px; border-radius:50%; display:grid; place-items:center; margin:0 auto 22px; }
        .bp-modal-icon.success { background:#0095b3; color:white; }
        .bp-modal-title { font-size:23px; margin:0 0 12px; }
        .bp-modal-description { font-size:14px; color:#718096; line-height:1.6; margin:0 auto 22px; max-width:420px; }
        .bp-modal-details { border:1px solid #d5e9ef; border-radius:19px; padding:12px 20px; text-align:left; }
        .bp-modal-notes { text-align:left; display:flex; flex-direction:column; gap:12px; margin:20px 0 28px; }
        .bp-modal-notes div { display:flex; align-items:flex-start; gap:10px; color:#42536a; font-size:12px; line-height:1.5; }
        .bp-modal-notes svg { flex-shrink:0; color:#0095b3; }
        .bp-modal-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:10px; }
        @media(max-width:900px) { .bp-layout { grid-template-columns:1fr; } }
        @media(max-width:520px) { .bp-grid,.bp-methods { grid-template-columns:1fr; } .bp-modal { padding:24px; } .bp-modal-actions button { flex:1; } }
      `}</style>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: C.cyan,
        fontSize: 12,
        marginBottom: 17,
      }}>
        <button
          type="button"
          onClick={() => navigate("/guru/presensi")}
          style={{
            border: 0,
            background: "none",
            color: C.cyan,
            cursor: "pointer",
            padding: 0,
            font: "inherit",
          }}
        >
          Presensi
        </button>
        <ChevronRight size={14} />
        <u>Buat Presensi</u>
      </div>

      <h1 style={{ margin: "0 0 7px", fontSize: 28 }}>
        Buat Presensi
      </h1>
      <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
        Atur sesi presensi sesuai jadwal mengajarmu. Siswa diberi
        tahu saat presensi dibuka.
      </p>

      {error && (
        <div role="alert" style={{
          padding: 14,
          background: "#fff1f2",
          border: "1px solid #fecaca",
          color: "#be123c",
          borderRadius: 12,
          marginTop: 16,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: C.muted, marginTop: 24 }}>
          Memuat kelas dan jadwal...
        </p>
      ) : (
        <form className="bp-layout" onSubmit={handleSubmit}>
          <div className="bp-main">
            <Section number="1" title="Kelas dan jadwal">
              <p className="bp-muted">
                Hanya kelas dan jadwal yang Anda ajar yang tersedia.
              </p>

              <Label>Kelas</Label>
              <div className="bp-chips">
                {classes.map((kelas) => (
                  <button
                    key={kelas.id}
                    type="button"
                    className={`bp-chip ${
                      String(kelas.id) === String(selected?.class?.id)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => chooseClass(kelas.id)}
                  >
                    Kelas {kelas.name}
                  </button>
                ))}
              </div>

              <div className="bp-grid">
                <div>
                  <Label>Mata pelajaran</Label>
                  <div style={{
                    ...inputStyle,
                    background: "#edf2f4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <b>{selected?.subject?.name || "-"}</b>
                    <LockKeyhole size={15} color="#64748b" />
                  </div>
                </div>

                <div>
                  <Label>Jadwal</Label>
                  <select
                    style={inputStyle}
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                  >
                    {schedules
                      .filter((item) =>
                        String(item.class.id) ===
                        String(selected?.class?.id)
                      )
                      .map((item) => (
                        <option
                          key={item.schedule_id}
                          value={item.schedule_id}
                        >
                          Sesi {item.session_number} ·{" "}
                          {item.time.start} - {item.time.end}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <Label>Tanggal</Label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Pertemuan ke</Label>
                  <div style={{
                    ...inputStyle,
                    background: "#edf2f4",
                    fontWeight: 700,
                  }}>
                    {preview
                      ? `#${preview.meeting_number} otomatis`
                      : "Memuat..."}
                  </div>
                </div>
              </div>

              {preview?.existing_session_id && (
                <p style={{
                  color: "#b45309",
                  fontSize: 12,
                  marginTop: 12,
                }}>
                  Presensi untuk jadwal dan tanggal ini sudah ada.
                  Kamu bisa membukanya dari Dashboard.
                </p>
              )}
            </Section>

            <Section number="2" title="Materi pembelajaran">
              <Label required>Materi</Label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Contoh: Persamaan Linear Dua Variabel"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={200}
                required
              />

              <Label required>Sub capaian pembelajaran</Label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 95,
                  resize: "vertical",
                }}
                placeholder="Tuliskan sub capaian pembelajaran..."
                value={learningOutcome}
                onChange={(e) => setLearningOutcome(e.target.value)}
                maxLength={1000}
                required
              />
            </Section>

            <Section number="3" title="Metode presensi">
              <div className="bp-methods">
                {[
                  {
                    value: "siswa",
                    title: "Diisi siswa",
                    detail:
                      "Siswa mengisi Hadir, Izin, atau Sakit melalui aplikasi. Guru dapat mengoreksi.",
                  },
                  {
                    value: "manual",
                    title: "Manual oleh guru",
                    detail:
                      "Guru memanggil siswa satu per satu. Semua siswa default Hadir, lalu guru menyimpan hasil absensi.",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`bp-method ${
                      method === option.value ? "selected" : ""
                    }`}
                    onClick={() => setMethod(option.value)}
                  >
                    <b>
                      {method === option.value ? "◉" : "◯"}{" "}
                      {option.title}
                    </b>
                    <p>{option.detail}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section
              number="4"
              title="Pembukaan dan pengingat otomatis"
            >
              <Label>Waktu pembukaan</Label>
              <div className="bp-chips">
                <button type="button" className="bp-chip selected">
                  Buka sekarang
                </button>
                <button
                  type="button"
                  disabled
                  className="bp-chip"
                  style={{ opacity: .45, cursor: "not-allowed" }}
                  title="Belum didukung Backend"
                >
                  Buka otomatis pukul {selected?.time?.start || "-"}
                </button>
              </div>

              <p className="bp-muted" style={{ marginTop: 12 }}>
                Pembukaan terjadwal belum tersedia pada Backend.
              </p>

              <Setting
                title="Beri tahu siswa saat presensi dibuka"
                description='Notifikasi "Presensi dibuka" ke siswa.'
                value={notifyOnOpen}
                onChange={setNotifyOnOpen}
              />

              <Setting
                title="Ingatkan siswa yang belum mengisi"
                description={
                  method === "manual"
                    ? "Tidak digunakan pada metode Manual."
                    : "Pengaturan disimpan, pengiriman otomatis belum tersedia."
                }
                value={method === "siswa" && remindUnfilled}
                onChange={setRemindUnfilled}
                disabled={method === "manual"}
              />

              <Setting
                title="Beri tahu siswa saat presensi ditutup"
                description="Notifikasi penutupan beserta status siswa."
                value={notifyOnClose}
                onChange={setNotifyOnClose}
              />

              <Label>Pengingat pertama setelah</Label>
              <div className="bp-chips">
                {[10, 15, 30].map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    disabled={
                      method === "manual" || !remindUnfilled
                    }
                    onClick={() => setRemindAfterMinutes(minute)}
                    className={`bp-chip ${
                      remindAfterMinutes === minute ? "selected" : ""
                    }`}
                    style={{
                      opacity:
                        method === "manual" || !remindUnfilled
                          ? .45
                          : 1,
                    }}
                  >
                    {minute} menit
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <aside className="bp-side">
            <section style={{
              ...panel,
              background: "#f7fbfc",
            }}>
              <h2 style={{ margin: "0 0 18px", fontSize: 19 }}>
                Ringkasan
              </h2>

              <SummaryRow
                label="Kelas"
                value={
                  selected
                    ? `Kelas ${selected.class.name} · ${selected.subject.name}`
                    : "-"
                }
              />
              <SummaryRow
                label="Jadwal"
                value={
                  selected
                    ? `Sesi ${selected.session_number} · ${selected.time.start} - ${selected.time.end}`
                    : "-"
                }
              />
              <SummaryRow label="Tanggal" value={formattedDate} />
              <SummaryRow
                label="Pertemuan"
                value={preview ? `#${preview.meeting_number}` : "-"}
              />
              <SummaryRow label="Materi" value={topic} />
              <SummaryRow
                label="Metode"
                value={method === "manual"
                  ? "Manual oleh guru"
                  : "Diisi siswa"}
              />
              <SummaryRow label="Pembukaan" value="Sekarang" />
              <SummaryRow
                label="Pengingat"
                value={
                  method === "manual" || !remindUnfilled
                    ? "Nonaktif"
                    : `Pengaturan ${remindAfterMinutes} menit`
                }
              />
            </section>

            <section style={panel}>
              <h3 style={{ fontSize: 16, margin: "0 0 15px" }}>
                Yang diterima siswa
              </h3>

              <div style={{
                display: "flex",
                gap: 10,
                background: "#edf9fc",
                padding: 14,
                borderRadius: 12,
                border: `1px solid ${C.line}`,
              }}>
                <Bell size={20} color={C.cyan} />

                <div>
                  <b style={{ fontSize: 12 }}>
                    Presensi {selected?.subject?.name || "-"} dibuka
                  </b>
                  <p className="bp-muted">
                    Kelas {selected?.class?.name || "-"} ·
                    Sesi {selected?.session_number || "-"}.
                  </p>
                </div>
              </div>

              {PRESENSI_SOURCE === "mock" && (
                <p className="bp-muted" style={{ marginTop: 12 }}>
                  Simulasi tampilan notifikasi. Belum dikirim ke akun siswa.
                </p>
              )}
            </section>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...primaryButton,
                width: "100%",
                padding: 15,
                opacity: canSubmit ? 1 : .5,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {saving ? "Menyimpan..." : "Buat dan Buka Presensi"}
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              style={{ ...outlineButton, padding: 14 }}
              onClick={() => navigate("/guru/presensi")}
            >
              Batal
            </button>
          </aside>
        </form>
      )}

      {successSession && (
        <SuccessModal
          session={successSession}
          jadwal={selected}
          onDashboard={() => navigate("/guru/presensi")}
          onView={viewSuccess}
        />
      )}
    </div>
  );
}
