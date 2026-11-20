const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('admin_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Server mengirim respons yang tidak valid (HTTP ${response.status}).`);
  }

  if (response.status === 401 && !path.includes('/auth/login')) {
    // Sesi berakhir / token kadaluwarsa
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/login';
    }
  }

  if (!response.ok || result.success === false) {
    const errorMsg = result.error
      ? `${result.message || 'Permintaan gagal'}: ${result.error}`
      : (result.message || `Permintaan gagal (HTTP ${response.status}).`);
    throw new Error(errorMsg);
  }

  return result.data;
}
