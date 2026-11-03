import { supabaseAdmin } from '../config/supabase.js';

/**
 * Memastikan pengguna yang sudah diautentikasi memiliki role teacher
 * dan mempunyai record pada master.teachers.
 * authenticateUser harus dipasang sebelum middleware ini.
 */
export const requireTeacher = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
      });
    }

    const { data: userProfile, error: userError } = await supabaseAdmin
      .schema('master')
      .from('users')
      .select('id, role')
      .eq('id', req.user.id)
      .maybeSingle();

    if (userError) throw userError;

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Data profil pengguna tidak ditemukan.',
      });
    }

    if (userProfile.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Fitur ini khusus untuk Guru.',
      });
    }

    const { data: teacher, error: teacherError } = await supabaseAdmin
      .schema('master')
      .from('teachers')
      .select('id, user_id, name')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (teacherError) throw teacherError;

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Data Guru tidak ditemukan untuk akun ini.',
      });
    }

    // ID pada master.teachers inilah yang direferensikan oleh b5.materials.teacher_id.
    req.teacher = teacher;
    next();
  } catch (error) {
    console.error('Error verifying teacher access:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memverifikasi hak akses Guru.',
    });
  }
};
