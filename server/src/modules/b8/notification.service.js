import { b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';

// UC-19: satu notifikasi (belum dibaca) untuk tiap penerima.
// Tidak pernah melempar error: gagal membuat notifikasi tidak boleh
// membatalkan proses utama yang memicunya.
export async function notifyMany(userIds, { title, message, type }) {
  try {
    const valid = userIds.filter(Boolean);
    const skipped = userIds.length - valid.length;
    if (skipped > 0) console.error(`[notif] ${skipped} penerima tidak punya akun, dilewati`);
    const unique = [...new Set(valid)];
    if (!unique.length) return 0;

    const { error } = await b8()
      .from('notifications')
      .insert(unique.map((user_id) => ({ user_id, title, message, type, is_read: false })));
    if (error) throw new Error(error.message);
    return unique.length;
  } catch (e) {
    console.error('[notif] gagal membuat notifikasi:', e.message);
    return 0;
  }
}

export const notifyUser = ({ userId, ...payload }) => notifyMany([userId], payload);

// UC-18 / UC-25 / UC-29: daftar notifikasi milik user + jumlah belum dibaca.
export async function listNotifications(userId, { unread, limit } = {}) {
  const max = Math.min(Math.max(Number(limit) || 50, 1), 100);
  let q = b8()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(max);
  if (unread === 'true') q = q.eq('is_read', false);
  const notifications = unwrap(await q);

  const { count, error } = await b8()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw httpError(500, error.message);
  return { unreadCount: count ?? 0, notifications };
}

// Tandai satu notifikasi sudah dibaca (hanya milik sendiri).
export async function markRead(userId, id) {
  const rows = unwrap(
    await b8().from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId).select()
  );
  if (!rows.length) throw httpError(404, 'Notifikasi tidak ditemukan');
  return rows[0];
}