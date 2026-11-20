const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const clearStoredTokens = () => {
  ['token', 'admin_token', 'user', 'admin_user'].forEach((key) => localStorage.removeItem(key));
  ['b8-token', 'b8-teacher-token', 'b8-auth-v1'].forEach((key) => sessionStorage.removeItem(key));
};

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
    || localStorage.getItem('admin_token')
    || sessionStorage.getItem('b8-token')
    || sessionStorage.getItem('b8-teacher-token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
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
    clearStoredTokens();
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }

  if (!response.ok || result.success === false) {
    const message = result.error
      ? `${result.message || 'Permintaan gagal'}: ${result.error}`
      : (result.message || `Permintaan gagal (HTTP ${response.status}).`);
    throw new Error(message);
  }

  return result.data;
}
