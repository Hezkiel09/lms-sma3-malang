const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL belum diatur. Salin client/.env.example ke client/.env.local.');
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Server mengirim respons yang tidak valid (HTTP ${response.status}).`);
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Permintaan gagal (HTTP ${response.status}).`);
  }

  return result.data;
}
