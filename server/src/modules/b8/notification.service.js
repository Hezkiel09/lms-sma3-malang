import { b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';
import { wib, addDays, shortDate } from './b8.time.js';

// UC-19: notifikasi (belum dibaca) per penerima; tiap item boleh punya pesan sendiri.
// items: [{ userId, title, message, type, data? }]
// Tidak pernah melempar error: gagal membuat notifikasi tidak boleh membatalkan proses utama.
export async function notifyEach(items) {
  try {
    const seen = new Set();
    const rows = [];
    let skipped = 0;
    for (const it of items) {
      if (!it?.userId) { skipped += 1; continue; }
      if (seen.has(it.userId)) continue;
      seen.add(it.userId);
      rows.push({
        user_id: it.userId,
        title: it.title,
        message: it.message,
        type: it.type,
        data: it.data ?? null,
        is_read: false,
      });
    }
    if (skipped > 0) console.error(`[notif] ${skipped} penerima tidak punya akun, dilewati`);
    if (!rows.length) return 0;
    const { error } = await b8().from('notifications').insert(rows);
    if (error) throw new Error(error.message);
    return rows.length;
  } catch (e) {
    console.error('[notif] gagal membuat notifikasi:', e.message);
    return 0;
  }
}

// Pesan yang sama untuk banyak penerima.
export const notifyMany = (userIds, { title, message, type, data }) =>
  notifyEach(userIds.map((userId) => ({ userId, title, message, type, data })));

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
  const today = wib().date;
  const notifications = unwrap(await q).map((n) => {
    const w = wib(new Date(n.created_at));
    const group = w.date === today ? 'today' : 'earlier';
    const time_label =
      w.date === today ? w.time : w.date === addDays(today, -1) ? `Kemarin ${w.time}` : `${shortDate(w.date)} ${w.time}`;
    return { ...n, group, time_label };
  });

  const { count, error } = await b8()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw httpError(500, error.message);
  const total = await b8().from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if (total.error) throw httpError(500, total.error.message);
  return { unreadCount: count ?? 0, totalCount: total.count ?? 0, notifications };
}

// Tandai satu notifikasi sudah dibaca (hanya milik sendiri).
export async function markRead(userId, id) {
  const rows = unwrap(
    await b8().from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId).select()
  );
  if (!rows.length) throw httpError(404, 'Notifikasi tidak ditemukan');
  return rows[0];
}

// Tandai semua notifikasi milik user sudah dibaca.
export async function markAllRead(userId) {
  const rows = unwrap(
    await b8().from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false).select('id')
  );
  return { updated: rows.length };
}