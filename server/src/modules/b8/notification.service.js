import { supabaseAdmin } from '../../config/supabase.js';

// Simpan notifikasi in-app. Web push menyusul di tahap berikutnya.
export async function notifyUser({ userId, title, message, type }) {
  const { error } = await supabaseAdmin
    .schema('b8')
    .from('notifications')
    .insert({ user_id: userId, title, message, type });
  if (error) throw new Error(error.message);
}