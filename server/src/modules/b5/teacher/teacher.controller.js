import {
  getTeacherProfileService,
  updateTeacherProfileService,
} from './teacher.service.js';

/**
 * GET /api/v1/b5/teacher/profile
 */
export const getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.query.teacherId || req.headers['x-teacher-id'];
    const data = await getTeacherProfileService(teacherId);

    return res.status(200).json({
      success: true,
      message: 'Profil guru berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getTeacherProfile] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

/**
 * PUT /api/v1/b5/teacher/profile
 */
export const updateTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.query.teacherId || req.headers['x-teacher-id'];
    const { phone, name } = req.body;

    const data = await updateTeacherProfileService(teacherId, { phone, name });

    return res.status(200).json({
      success: true,
      message: 'Profil guru berhasil diperbarui.',
      data,
    });
  } catch (error) {
    console.error('[updateTeacherProfile] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};
