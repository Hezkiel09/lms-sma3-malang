import { supabase } from '../config/supabase.js';

/**
 * Middleware verifikasi Token JWT Supabase Auth untuk SEMUA role
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token JWT ke Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluwarsa.',
      });
    }

    // Ambil data profil dari master.users untuk menyertakan role
    const { data: profile, error: profileError } = await supabase
      .schema('master')
      .from('users')
      .select('id, name, email, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        message: 'Akun terautentikasi tetapi data profil di sistem tidak ditemukan.',
      });
    }

    req.user = {
      ...user,
      role: profile.role,
      name: profile.name,
      email: profile.email,
    };
    req.userProfile = profile;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat verifikasi autentikasi.',
      error: error.message,
    });
  }
};

/**
 * Middleware proteksi khusus role Admin
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses dilarang. Fitur ini khusus untuk Administrator.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat verifikasi hak akses.',
      error: error.message,
    });
  }
};

/**
 * Middleware proteksi berbasis role (bisa multiple roles)
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Fitur ini membutuhkan peran: ${allowedRoles.join(', ')}.`,
      });
    }
    next();
  };
};
