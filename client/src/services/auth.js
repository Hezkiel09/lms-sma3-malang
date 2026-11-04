// Login sederhana lewat Supabase Auth (REST), tanpa library tambahan.
// Token disimpan di sessionStorage. Key "b8-teacher-token" tetap diisi
// supaya halaman guru yang sudah ada langsung bisa memakainya.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/b8').replace(/\/$/, '');
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const KEY = 'b8-auth-v1';
let refreshTimer = null;

function read() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

function write(session) {
  sessionStorage.setItem(KEY, JSON.stringify(session));
  sessionStorage.setItem('b8-teacher-token', session.access_token);
  sessionStorage.setItem('b8-token', session.access_token);
}

export const getSession = () => read();
export const getToken = () => read()?.access_token ?? null;
export const getUser = () => read()?.user ?? null;

function clearSession() {
  clearTimeout(refreshTimer);
  [KEY, 'b8-teacher-token', 'b8-token'].forEach((k) => sessionStorage.removeItem(k));
}

async function supabaseAuth(path, body) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi di client/.env');
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error_description || json?.msg || json?.message || 'Gagal masuk');
  return json;
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  const s = read();
  if (!s?.refresh_token) return;
  const waitMs = Math.max(10_000, s.expires_at - Date.now() - 60_000);
  refreshTimer = setTimeout(async () => {
    try {
      const j = await supabaseAuth('token?grant_type=refresh_token', { refresh_token: s.refresh_token });
      write({ ...s, access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000 });
      scheduleRefresh();
    } catch {
      clearSession();
      window.location.assign('/login');
    }
  }, waitMs);
}

// Dipanggil sekali saat aplikasi dimuat supaya token tetap diperbarui setelah refresh halaman.
export function resumeSession() {
  if (read()) scheduleRefresh();
}

export async function login(emailAddr, password) {
  const j = await supabaseAuth('token?grant_type=password', { email: emailAddr.trim(), password });

  const res = await fetch(`${API_BASE_URL}/me`, { headers: { Authorization: `Bearer ${j.access_token}`, Accept: 'application/json' } });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(body?.message || 'Akun berhasil masuk, tapi data pengguna tidak ditemukan di master.users.');
  }

  write({
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: Date.now() + j.expires_in * 1000,
    user: body.data,
  });
  scheduleRefresh();
  return body.data;
}

export async function logout() {
  const token = getToken();
  clearSession();
  if (token && SUPABASE_URL && SUPABASE_ANON_KEY) {
    fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }).catch(() => {});
  }
}

export const homeFor = (role) => (role === 'teacher' ? '/guru/presensi' : role === 'student' ? '/siswa/presensi' : role === 'parent' ? '/ortu' : null);

// Dipakai service API: kalau server menolak token (401), paksa login ulang.
export function handleUnauthorized() {
  clearSession();
  window.location.assign('/login');
}
