import { API_BASE_URL, getToken, handleUnauthorized } from './auth';

async function request(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error('Kamu belum login.');

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const json = await res.json().catch(() => null);
  if (res.status === 401) handleUnauthorized();
  if (!res.ok || json?.success !== true) {
    const err = new Error(json?.message || `Gagal mengakses backend (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json.data;
}

const qs = (o) => {
  const s = new URLSearchParams(Object.entries(o).filter(([, v]) => v)).toString();
  return s ? `?${s}` : '';
};

export const presensiSiswaApi = {
  // GET /attendances/me/today  -> sesi hari ini untuk kelas siswa (bentuknya sama dengan todayMock)
  getToday: () => request('/attendances/me/today'),
  // POST /attendance-sessions/:id/checkin
  checkin: (sessionId, { status, notes }) =>
    request(`/attendance-sessions/${sessionId}/checkin`, { method: 'POST', body: JSON.stringify({ status, notes }) }),
    getOverview: ({ month, from, to, studentId } = {}) =>
    request(`/attendances/student/me/overview${qs({ month, from, to, studentId })}`),
  getSubject: (subjectId, { studentId } = {}) =>
    request(`/attendances/student/me/subjects/${subjectId}${qs({ studentId })}`),
  getWeek: ({ studentId } = {}) => request(`/attendances/student/me/week${qs({ studentId })}`),
  listNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  getParentDashboard: ({ studentId, month } = {}) =>
    request(`/dashboard/parent${qs({ studentId, month })}`),
};

async function call(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
  });
  if (res.status === 401) { handleUnauthorized(); throw new Error('Sesi habis'); }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.message || 'Terjadi kesalahan');
  return json.data;
}

export const getOverview = ({ month, from, to, studentId } = {}) =>
  USE_API ? call(`/attendances/student/me/overview${qs({ month, from, to, studentId })}`) : getOverviewMock({ month });
export const getSubject = (subjectId, { studentId } = {}) =>
  USE_API ? call(`/attendances/student/me/subjects/${subjectId}${qs({ studentId })}`) : getSubjectDetailMock(subjectId);
export const getWeek = ({ studentId } = {}) => call(`/attendances/student/me/week${qs({ studentId })}`);
export const listNotifications = () => call('/notifications');
export const markNotificationRead = (id) => call(`/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () => call('/notifications/read-all', { method: 'PATCH' });
export const getParentDashboard = ({ studentId, month } = {}) => call(`/dashboard/parent${qs({ studentId, month })}`);