
import {
  API_BASE_URL,
  getToken,
  getUser,
  handleUnauthorized
} from './auth';

// ==========================================
// REQUEST KE BACKEND
// ==========================================

async function request(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error('Kamu belum login.');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(options.headers || {})
    }
  });

  const json = await res.json().catch(() => null);

  if (res.status === 401) {
    handleUnauthorized();
  }

  if (!res.ok || json?.success !== true) {
    const err = new Error(
      json?.message ||
      `Gagal mengakses backend (${res.status})`
    );

    err.status = res.status;
    throw err;
  }

  return json.data;
}

// ==========================================
// QUERY PARAMETER
// ==========================================

const qs = (params) => {
  const entries = Object.entries(params).filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== ''
  );

  const query = new URLSearchParams(entries).toString();

  return query ? `?${query}` : '';
};

// ==========================================
// IDENTITAS SISWA
// ==========================================

// Siswa menggunakan "me".
// Orang tua menggunakan ID anak yang dipilih.
function getStudentPath(studentId) {
  const isParent = getUser()?.role === 'parent';

  if (isParent) {
    if (studentId === undefined ||
        studentId === null ||
        String(studentId).trim() === '') {
      throw new Error('ID anak belum ditemukan.');
    }

    return encodeURIComponent(String(studentId));
  }

  return 'me';
}

// ==========================================
// SERVICE API PRESENSI
// ==========================================

export const presensiSiswaApi = {

  // ========================================
  // PRESENSI HARI INI - SISWA
  // ========================================

  getToday: () =>
    request('/attendances/me/today'),

  // ========================================
  // KIRIM PRESENSI - SISWA
  // ========================================

  checkin: (sessionId, { status, notes }) =>
    request(
      `/attendance-sessions/${encodeURIComponent(sessionId)}/checkin`,
      {
        method: 'POST',
        body: JSON.stringify({ status, notes })
      }
    ),

  // ========================================
  // RIWAYAT / PRESENSI ANAK
  // ========================================

  getOverview: ({
    month,
    from,
    to,
    studentId
  } = {}) => {

    const target = getStudentPath(studentId);

    return request(
      `/attendances/student/${target}/overview${qs({
        month,
        from,
        to
      })}`
    );
  },

  // ========================================
  // DETAIL PRESENSI MATA PELAJARAN
  // ========================================

  getSubject: (
    subjectId,
    { studentId, from, to, limit } = {}
  ) => {

    const target = getStudentPath(studentId);

    return request(
      `/attendances/student/${target}/subjects/${encodeURIComponent(String(subjectId))}${qs({
        from,
        to,
        limit
      })}`
    );
  },

  // ========================================
  // PRESENSI MINGGU INI
  // ========================================

  getWeek: ({ studentId } = {}) => {

    const target = getStudentPath(studentId);

    return request(
      `/attendances/student/${target}/week`
    );
  },

  // ========================================
  // NOTIFIKASI
  // ========================================

  listNotifications: () =>
    request('/notifications'),

  markNotificationRead: (id) =>
    request(
      `/notifications/${encodeURIComponent(String(id))}/read`,
      { method: 'PATCH' }
    ),

  markAllNotificationsRead: () =>
    request(
      '/notifications/read-all',
      { method: 'PATCH' }
    ),

  // ========================================
  // DASHBOARD ORANG TUA
  // ========================================

  getParentDashboard: ({
    studentId,
    month
  } = {}) =>
    request(
      `/dashboard/parent${qs({
        studentId,
        month
      })}`
    )
};

// ==========================================
// NAMED EXPORTS
// Untuk kompatibilitas dengan komponen lain
// ==========================================

export const getOverview = presensiSiswaApi.getOverview;
export const getSubject = presensiSiswaApi.getSubject;
export const getWeek = presensiSiswaApi.getWeek;

export const listNotifications =
  presensiSiswaApi.listNotifications;

export const markNotificationRead =
  presensiSiswaApi.markNotificationRead;

export const markAllNotificationsRead =
  presensiSiswaApi.markAllNotificationsRead;

export const getParentDashboard =
  presensiSiswaApi.getParentDashboard;
