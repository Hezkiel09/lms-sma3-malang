/**
 * Helper untuk mengunduh file secara langsung tanpa berpindah halaman di tab yang sama.
 * Menggunakan fetch -> blob -> object URL, dengan fallback Supabase Storage ?download=...
 */
export const downloadFileDirect = async (url, fileName = 'download') => {
  if (!url) return;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);
  } catch (err) {
    console.warn('[downloadFileDirect] Fetch blob gagal/CORS, menggunakan fallback URL download:', err);
    // Fallback: tambahkan parameter download untuk Supabase Storage agar mengembalikan Content-Disposition: attachment
    const separator = url.includes('?') ? '&' : '?';
    const fallbackUrl = `${url}${separator}download=${encodeURIComponent(fileName)}`;

    const link = document.createElement('a');
    link.href = fallbackUrl;
    link.setAttribute('download', fileName);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
