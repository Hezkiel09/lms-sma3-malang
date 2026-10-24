import { supabase } from '../config/supabase.js';

/**
 * Middleware verifikasi Token JWT Supabase Auth
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

    req.user = user;
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
 * Middleware proteksi role Admin
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: userData, error } = await supabase
      .schema('master')
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return res.status(404).json({
        success: false,
        message: 'Data profil user tidak ditemukan.',
      });
    }

    if (userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses dilarang. Fitur ini khusus untuk Admin.',
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