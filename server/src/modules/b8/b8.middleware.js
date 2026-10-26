import { supabaseAdmin } from '../../config/supabase.js';
import { fail } from './b8.http.js';

// Dipasang setelah authenticateUser: ambil role dari master.users -> req.role
export const loadRole = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('master')
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return fail(res, 'Data profil user tidak ditemukan.', 404);
    req.role = data.role;
    next();
  } catch (e) {
    fail(res, `Gagal memuat role user: ${e.message}`, 500);
  }
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      return fail(res, `Akses dilarang. Butuh role: ${roles.join(', ')}.`, 403);
    }
    next();
  };