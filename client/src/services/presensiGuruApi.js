
import {
  mockJadwalHariIni,
  mockRiwayatPresensi,
} from "../mocks/presensiGuruMock";

import {
  createMockAttendances,
} from "../mocks/presensiSiswaMock";

// ==========================================
// KONFIGURASI API / MOCK
// ==========================================

export const PRESENSI_SOURCE =
  import.meta.env.VITE_PRESENSI_SOURCE || "mock";

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1/b8"
).replace(/\/$/, "");

const STORAGE_KEY = "smanti-presensi-sessions-v1";
const OVERRIDE_KEY = "smanti-presensi-history-overrides-v1";

const clone = (data) => structuredClone(data);

// ==========================================
// LOCAL STORAGE
// ==========================================

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "null"
    );

    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getSavedSessions() {
  return readStorage(STORAGE_KEY, []);
}

function saveSessions(sessions) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(sessions)
  );
}

function getOverrides() {
  return readStorage(OVERRIDE_KEY, {});
}

function saveOverrides(data) {
  localStorage.setItem(
    OVERRIDE_KEY,
    JSON.stringify(data)
  );
}

// ==========================================
// REQUEST BACKEND
// ==========================================

async function request(path, token, options = {}) {
  if (!token) {
    throw new Error("Token login guru belum tersedia.");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success !== true) {
    const error = new Error(
      result?.message ||
      `Gagal mengakses Backend (${response.status})`
    );

    error.status = response.status;
    throw error;
  }

  return result.data;
}

// ==========================================
// HELPER MOCK
// ==========================================

function getMockSchedule(id) {
  return mockJadwalHariIni.schedules.find(
    (item) =>
      String(item.schedule_id) === String(id)
  );
}

function getSummary(session) {
  const summary = {
    total: session.attendances?.length || 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    pending: 0,
  };

  for (const item of session.attendances || []) {
    if (!item.recorded_at) {
      if (session.state === "open") {
        summary.pending++;
      } else {
        summary.alpha++;
      }
    } else if (item.status in summary) {
      summary[item.status]++;
    }
  }

  return summary;
}

function formatSession(session) {
  const summary = getSummary(session);

  const filled = (session.attendances || []).filter(
    (item) => item.recorded_at != null
  ).length;

  return {
    ...clone(session),

    summary,

    progress: {
      filled,
      total: summary.total,
      percent: summary.total
        ? Math.round(
            (filled / summary.total) * 100
          )
        : 0,
    },

    attendances: (session.attendances || []).map(
      (item) => {
        const pending =
          session.state === "open" &&
          !item.recorded_at;

        return {
          ...clone(item),

          display_status: pending
            ? "pending"
            : item.status,

          display_label: pending
            ? session.method === "manual"
              ? "Belum dicatat"
              : "Belum mengisi"
            : {
                hadir: "Hadir",
                izin: "Izin",
                sakit: "Sakit",
                alpha: "Alfa",
              }[item.status] || item.status,
        };
      }
    ),
  };
}

function formatDate(date, options) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    ...options,
  }).format(
    new Date(`${date}T12:00:00+07:00`)
  );
}

function validateMateri(topic, learningOutcome) {
  if (
    !topic?.trim() ||
    !learningOutcome?.trim()
  ) {
    throw new Error(
      "Materi dan sub capaian wajib diisi."
    );
  }

  if (
    topic.length > 200 ||
    learningOutcome.length > 1000
  ) {
    throw new Error(
      "Materi maksimal 200 karakter dan sub capaian 1000 karakter."
    );
  }
}

const ALLOWED_STATUS = [
  "hadir",
  "izin",
  "sakit",
  "alpha",
];

function validateStatus(status) {
  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error("Status presensi tidak valid.");
  }
}

// Catatan opsional untuk semua status.
function normalizeNotes(notes) {
  return typeof notes === "string"
    ? notes.trim()
    : "";
}

// ==========================================
// SERVICE PRESENSI GURU
// ==========================================

export const presensiGuruApi = {

  // ========================================
  // READ - JADWAL HARI INI
  // ========================================

  async getJadwalHariIni(token) {
    if (PRESENSI_SOURCE === "api") {
      return request(
        "/attendance-sessions/today",
        token
      );
    }

    const data = clone(mockJadwalHariIni);
    const saved = getSavedSessions();

    data.schedules = data.schedules.map(
      (jadwal) => {
        const session = saved.find(
          (item) =>
            String(item.schedule_id) ===
              String(jadwal.schedule_id) &&
            item.date === data.date
        );

        return {
          ...jadwal,

          session: session
            ? {
                id: session.id,
                state: session.state,
                method: session.method,
                topic: session.topic,
                manual_saved_at:
                  session.manual_saved_at || null,
                summary: getSummary(session),
              }
            : null,
        };
      }
    );

    return data;
  },

  // ========================================
  // READ - KELAS DAN JADWAL
  // ========================================

  async getTeaching(token) {
    if (PRESENSI_SOURCE === "api") {
      return request(
        "/attendance-sessions/teaching",
        token
      );
    }

    const schedules = clone(
      mockJadwalHariIni.schedules
    );

    const classMap = new Map();
    const subjectMap = new Map();

    for (const item of schedules) {
      if (!classMap.has(item.class.id)) {
        classMap.set(item.class.id, {
          ...item.class,
          subjects: [],
          schedules: [],
        });
      }

      const kelas = classMap.get(
        item.class.id
      );

      kelas.schedules.push(item);

      if (
        !kelas.subjects.some(
          (subject) =>
            subject.id === item.subject.id
        )
      ) {
        kelas.subjects.push(item.subject);
      }

      subjectMap.set(
        item.subject.id,
        item.subject
      );
    }

    return {
      classes: [...classMap.values()],
      subjects: [...subjectMap.values()],
    };
  },

  // ========================================
  // READ - PREVIEW BUAT PRESENSI
  // ========================================

  async getPreview(token, scheduleId, date) {
    if (PRESENSI_SOURCE === "api") {
      const params = new URLSearchParams({
        scheduleId,
        date,
      });

      return request(
        `/attendance-sessions/preview?${params}`,
        token
      );
    }

    const jadwal = getMockSchedule(
      scheduleId
    );

    if (!jadwal) {
      throw new Error("Jadwal tidak ditemukan.");
    }

    const saved = getSavedSessions();

    const existing = saved.find(
      (item) =>
        String(item.schedule_id) ===
          String(scheduleId) &&
        item.date === date
    );

    const count = saved.filter(
      (item) =>
        String(item.schedule_id) ===
          String(scheduleId) &&
        item.date < date
    ).length;

    return {
      meeting_number: 9 + count,
      session_number: jadwal.session_number,
      time: clone(jadwal.time),
      student_count: jadwal.student_count,

      existing_session_id:
        existing?.id || null,

      defaults: {
        method: "siswa",
        openMode: "now",
        notifyOnOpen: true,
        remindUnfilled: true,
        remindAfterMinutes: 15,
        notifyOnClose: true,
      },

      remind_options: [10, 15, 30],
    };
  },

  // ========================================
  // READ - RIWAYAT PRESENSI
  // ========================================

  async getRiwayatPresensi(token) {
    if (PRESENSI_SOURCE === "api") {
      return request(
        "/attendance-sessions?limit=50",
        token
      );
    }

    const saved = getSavedSessions()
      .map((session) => ({
        ...formatSession(session),

        date_label: formatDate(
          session.date,
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        ),

        day_name: formatDate(
          session.date,
          {
            weekday: "long",
          }
        ),

        state_label:
          session.state === "closed"
            ? "Selesai"
            : session.state === "ended"
              ? "Berakhir"
              : session.method === "manual" &&
                  !session.manual_saved_at
                ? "Belum Disimpan"
                : "Berlangsung",
      }))
      .reverse();

    const overrides = getOverrides();

    const sampleHistory = clone(
      mockRiwayatPresensi
    )
      .filter(
        (item) =>
          !overrides[item.id]?.deleted
      )
      .map((item) => ({
        ...item,
        ...(overrides[item.id] || {}),
      }));

    return [
      ...saved,
      ...sampleHistory,
    ];
  },

  // ========================================
  // CREATE - BUAT PRESENSI
  // ========================================

  async buatPresensi(token, payload) {
    if (PRESENSI_SOURCE === "api") {
      return request(
        "/attendance-sessions",
        token,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    }

    const jadwal = getMockSchedule(
      payload.scheduleId
    );

    if (!jadwal) {
      throw new Error("Jadwal tidak ditemukan.");
    }

    validateMateri(
      payload.topic,
      payload.learningOutcome
    );

    if (
      !["siswa", "manual"].includes(
        payload.method
      )
    ) {
      throw new Error(
        "Metode presensi tidak valid."
      );
    }

    if (payload.openMode !== "now") {
      throw new Error(
        "Pembukaan terjadwal belum tersedia."
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        payload.date || ""
      )
    ) {
      throw new Error(
        "Tanggal presensi tidak valid."
      );
    }

    const sessions = getSavedSessions();

    const duplicate = sessions.some(
      (item) =>
        String(item.schedule_id) ===
          String(payload.scheduleId) &&
        item.date === payload.date
    );

    if (duplicate) {
      const error = new Error(
        "Sesi untuk jadwal dan tanggal ini sudah dibuat."
      );

      error.status = 409;
      throw error;
    }

    const preview = await this.getPreview(
      token,
      payload.scheduleId,
      payload.date
    );

    const id = crypto.randomUUID();
    const method = payload.method;

    const attendances =
      createMockAttendances(
        id,
        method,
        jadwal.student_count
      );

    // MANUAL:
    // Default Hadir di form, belum disimpan.
    if (method === "manual") {
      attendances.forEach((item) => {
        item.status = "hadir";
        item.recorded_at = null;
        item.source_text = "";
        item.corrected_by_teacher = false;
        item.notes = "";
        item.time = null;
      });
    }

    const session = {
      id,
      date: payload.date,
      schedule_id: payload.scheduleId,
      meeting_number: preview.meeting_number,
      session_number: jadwal.session_number,

      schedule: {
        class: jadwal.class,
        subject: jadwal.subject,
      },

      time: jadwal.time,
      room: jadwal.room,

      topic: payload.topic.trim(),
      learning_outcome:
        payload.learningOutcome.trim(),

      method,
      state: "open",
      state_label: "Berlangsung",

      created_at: new Date().toISOString(),
      updated_at: null,
      closed_at: null,
      manual_saved_at: null,

      notifyOnOpen: payload.notifyOnOpen,
      notifyOnClose: payload.notifyOnClose,

      remindUnfilled:
        method === "manual"
          ? false
          : payload.remindUnfilled,

      remindAfterMinutes:
        payload.remindAfterMinutes,

      attendances,

      reminder: {
        pending_count: attendances.length,
        last_reminded_at: null,
        last_reminded_count: 0,
      },
    };

    saveSessions([
      ...sessions,
      session,
    ]);

    return {
      ...formatSession(session),
      notified: 0,
    };
  },

  // ========================================
  // READ - DETAIL SESI
  // ========================================

  async getDetail(token, sessionId) {
    if (PRESENSI_SOURCE === "api") {
      return request(
        `/attendance-sessions/${sessionId}`,
        token
      );
    }

    const session = getSavedSessions().find(
      (item) =>
        String(item.id) === String(sessionId)
    );

    if (!session) {
      throw new Error(
        "Sesi presensi tidak ditemukan."
      );
    }

    return formatSession(session);
  },

  async getSesi(token, sessionId) {
    return this.getDetail(
      token,
      sessionId
    );
  },

  // ========================================
  // UPDATE - STATUS SATU SISWA
  // ========================================

  async ubahStatus(
    token,
    sessionId,
    attendanceId,
    status,
    notes = ""
  ) {
    validateStatus(status);
    const cleanNotes = normalizeNotes(notes);

    if (PRESENSI_SOURCE === "api") {
      return request(
        `/attendances/${attendanceId}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            notes: cleanNotes,
          }),
        }
      );
    }

    const sessions = getSavedSessions();

    const session = sessions.find(
      (item) =>
        String(item.id) === String(sessionId)
    );

    if (!session) {
      throw new Error(
        "Sesi tidak ditemukan."
      );
    }

    const attendance =
      session.attendances?.find(
        (item) =>
          String(item.id) === String(attendanceId)
      );

    if (!attendance) {
      throw new Error(
        "Data siswa tidak ditemukan."
      );
    }

    attendance.status = status;
    attendance.notes = cleanNotes;

    attendance.recorded_at =
      new Date().toISOString();

    attendance.source_text =
      "Dicatat guru";

    attendance.corrected_by_teacher = true;

    session.updated_at =
      new Date().toISOString();

    saveSessions(sessions);

    return formatSession(session);
  },

  // ========================================
  // UPDATE - SIMPAN PRESENSI MANUAL
  // SEKALIGUS UBAH STATUS JADI SELESAI
  // ========================================

  async simpanPresensiManual(token, sessionId, changes) {
    if (
      !Array.isArray(changes) ||
      changes.length === 0
    ) {
      throw new Error(
        "Tidak ada data presensi untuk disimpan."
      );
    }

    // Catatan tidak wajib, hanya validasi status.
    for (const item of changes) {
      validateStatus(item.status);
    }

    const normalizedChanges = changes.map(
      (item) => ({
        attendanceId: item.attendanceId,
        status: item.status,
        notes: normalizeNotes(item.notes),
      })
    );

    if (PRESENSI_SOURCE === "api") {
      const saved = await request(
        `/attendance-sessions/${sessionId}/attendances`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({ changes: normalizedChanges }),
        }
      );
      const session = await request(
        `/attendance-sessions/${sessionId}/close`,
        token,
        { method: "PATCH" }
      );
      return { ...saved, session };
    }

    const sessions = getSavedSessions();

    const session = sessions.find(
      (item) =>
        String(item.id) === String(sessionId)
    );

    if (!session) {
      throw new Error(
        "Sesi presensi tidak ditemukan."
      );
    }

    if (session.method !== "manual") {
      throw new Error(
        "Sesi ini bukan presensi manual."
      );
    }

    if (session.state !== "open") {
      throw new Error(
        "Sesi presensi sudah selesai."
      );
    }

    const attendances =
      session.attendances || [];

    const attendanceIds = new Set(
      attendances.map(
        (item) => String(item.id)
      )
    );

    const changeIds = new Set(
      normalizedChanges.map(
        (item) => String(item.attendanceId)
      )
    );

    if (
      normalizedChanges.length !== attendances.length ||
      changeIds.size !== normalizedChanges.length ||
      normalizedChanges.some(
        (item) =>
          !attendanceIds.has(
            String(item.attendanceId)
          )
      )
    ) {
      throw new Error(
        "Daftar siswa tidak sesuai dengan sesi presensi."
      );
    }

    const changesMap = new Map(
      normalizedChanges.map((item) => [
        String(item.attendanceId),
        item,
      ])
    );

    const now = new Date().toISOString();

    const time = new Intl.DateTimeFormat(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }
    ).format(new Date(now));

    // SIMPAN SEMUA STATUS SISWA
    session.attendances = attendances.map(
      (attendance) => {
        const change = changesMap.get(
          String(attendance.id)
        );

        return {
          ...attendance,
          status: change.status,
          notes: change.notes,
          recorded_at: now,
          time,
          source_text: "Dicatat guru",
          corrected_by_teacher: true,
        };
      }
    );

    // SIMPAN HASIL MANUAL
    session.manual_saved_at = now;
    session.updated_at = now;

    // LANGSUNG SELESAI SETELAH DISIMPAN
    session.state = "closed";
    session.state_label = "Selesai";
    session.closed_at = now;

    // Seluruh siswa sudah dicatat, tidak ada pending.
    session.reminder = {
      ...(session.reminder || {}),
      pending_count: 0,
    };

    // SIMPAN SEMUA PERUBAHAN
    saveSessions(sessions);

    const formatted = formatSession(session);

    return {
      changed: normalizedChanges.length,
      updated: formatted.attendances,
      session: formatted,
    };
  },

  // ========================================
  // UPDATE - TUTUP PRESENSI
  // UNTUK METODE DIISI SISWA
  // ========================================

  async tutupSesi(token, sessionId) {
    if (PRESENSI_SOURCE === "api") {
      return request(
        `/attendance-sessions/${sessionId}/close`,
        token,
        {
          method: "PATCH",
        }
      );
    }

    const sessions = getSavedSessions();

    const session = sessions.find(
      (item) =>
        String(item.id) === String(sessionId)
    );

    if (!session) {
      throw new Error(
        "Sesi tidak ditemukan."
      );
    }

    if (session.state !== "open") {
      throw new Error(
        "Sesi sudah ditutup atau berakhir."
      );
    }

    if (
      session.method === "manual" &&
      !session.manual_saved_at
    ) {
      throw new Error(
        "Simpan hasil presensi manual terlebih dahulu."
      );
    }

    const now = new Date().toISOString();

    session.state = "closed";
    session.state_label = "Selesai";
    session.closed_at = now;
    session.updated_at = now;

    saveSessions(sessions);

    return formatSession(session);
  },

  // ========================================
  // PENGINGAT SISWA
  // ========================================

  async ingatkanSiswa(token, sessionId) {
    if (PRESENSI_SOURCE === "api") {
      return request(`/attendance-sessions/${sessionId}/remind`, token, { method: 'POST' });
    }

    const sessions = getSavedSessions();

    const session = sessions.find(
      (item) =>
        String(item.id) === String(sessionId)
    );

    if (
      !session ||
      session.state !== "open"
    ) {
      throw new Error(
        "Sesi tidak sedang berlangsung."
      );
    }

    const pending = session.attendances.filter(
      (item) => !item.recorded_at
    ).length;

    session.reminder = {
      pending_count: pending,
      last_reminded_at:
        new Date().toISOString(),
      last_reminded_count: pending,
    };

    saveSessions(sessions);

    return {
      reminded: pending,
      message:
        `Simulasi pengingat untuk ${pending} siswa.`,
    };
  },

  // ========================================
  // CRUD - EDIT MATERI SESI
  // ========================================

  async editSesi(
    token,
    sessionId,
    payload
  ) {
    if (PRESENSI_SOURCE === "api") {
      validateMateri(payload.topic, payload.learningOutcome);
      return request(`/attendance-sessions/${sessionId}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          topic: payload.topic.trim(),
          learningOutcome: payload.learningOutcome.trim(),
        }),
      });
    }
    validateMateri(
      payload.topic,
      payload.learningOutcome
    );

    const topic = payload.topic.trim();
    const learningOutcome =
      payload.learningOutcome.trim();

    const sessions = getSavedSessions();

    const session = sessions.find(
      (item) =>
        String(item.id) === String(sessionId)
    );

    if (session) {
      session.topic = topic;
      session.learning_outcome =
        learningOutcome;
      session.updated_at =
        new Date().toISOString();

      saveSessions(sessions);

      return formatSession(session);
    }

    // Riwayat dummy bawaan
    const sample =
      mockRiwayatPresensi.find(
        (item) =>
          String(item.id) === String(sessionId)
      );

    if (!sample) {
      throw new Error(
        "Riwayat presensi tidak ditemukan."
      );
    }

    const overrides = getOverrides();

    if (overrides[sessionId]?.deleted) {
      throw new Error(
        "Riwayat ini sudah dihapus."
      );
    }

    overrides[sessionId] = {
      ...overrides[sessionId],
      topic,
      learning_outcome: learningOutcome,
      updated_at: new Date().toISOString(),
    };

    saveOverrides(overrides);

    return {
      ...clone(sample),
      ...overrides[sessionId],
    };
  },

  // ========================================
  // CRUD - HAPUS SESI
  // ========================================

  async hapusSesi(token, sessionId) {
    if (PRESENSI_SOURCE === "api") {
      return request(`/attendance-sessions/${sessionId}`, token, {
        method: "DELETE",
      });
    }
    const sessions = getSavedSessions();

    const session = sessions.find(
      (item) =>
        String(item.id) === String(sessionId)
    );

    if (session) {
      saveSessions(
        sessions.filter(
          (item) =>
            String(item.id) !== String(sessionId)
        )
      );

      return {
        success: true,
        message: "Presensi berhasil dihapus.",
      };
    }

    // Riwayat contoh bawaan
    const sample =
      mockRiwayatPresensi.find(
        (item) =>
          String(item.id) === String(sessionId)
      );

    if (!sample) {
      throw new Error(
        "Riwayat presensi tidak ditemukan."
      );
    }

    const overrides = getOverrides();

    if (overrides[sessionId]?.deleted) {
      throw new Error(
        "Riwayat ini sudah dihapus."
      );
    }

    overrides[sessionId] = {
      ...overrides[sessionId],
      deleted: true,
      deleted_at:
        new Date().toISOString(),
    };

    saveOverrides(overrides);

    return {
      success: true,
      message:
        "Riwayat contoh berhasil dihapus.",
    };
  },
};
