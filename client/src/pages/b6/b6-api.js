const API_BASE_URL = import.meta.env.VITE_B6_API_BASE_URL
  || import.meta.env.VITE_API_BASE_URL
  || 'http://localhost:3030/api/v1';

export async function b6ApiFetch(path, options = {}) {
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
