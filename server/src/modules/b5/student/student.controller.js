import * as studentService from './student.service.js';

export const getStudentProfile = async (req, res) => {
  try {
    const data = await studentService.getStudentProfileService(req.user);
    return res.status(200).json({
      success: true,
      message: 'Profil siswa berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentProfile] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { phone } = req.body;
    const data = await studentService.updateStudentProfileService(req.user, { phone });
    return res.status(200).json({
      success: true,
      message: 'Profil siswa berhasil diperbarui.',
      data,
    });
  } catch (error) {
    console.error('[updateStudentProfile] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentNotifications = async (req, res) => {
  try {
    const data = await studentService.getStudentNotificationsService(req.user);
    return res.status(200).json({
      success: true,
      message: 'Notifikasi siswa berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentNotifications] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentCourses = async (req, res) => {
  try {
    const data = await studentService.getStudentCoursesService(req.user);
    return res.status(200).json({
      success: true,
      message: 'Daftar course siswa berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentCourses] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentCourseSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await studentService.getStudentCourseSectionsService(courseId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Daftar section course berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentCourseSections] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await studentService.getStudentCourseMaterialsService(courseId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Daftar materi (published) berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentCourseMaterials] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentMaterialDetail = async (req, res) => {
  try {
    const { materialId } = req.params;
    const data = await studentService.getStudentMaterialDetailService(materialId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Detail materi berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentMaterialDetail] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await studentService.getStudentCourseAssignmentsService(
      courseId,
      req.user,
      req.query
    );
    return res.status(200).json({
      success: true,
      message: 'Daftar tugas course berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentCourseAssignments] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentAssignmentDetail = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const data = await studentService.getStudentAssignmentDetailService(assignmentId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Detail tugas berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentAssignmentDetail] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentTimelineAssignments = async (req, res) => {
  try {
    const data = await studentService.getStudentTimelineAssignmentsService(req.user);
    return res.status(200).json({
      success: true,
      message: 'Timeline tugas aktif siswa berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentTimelineAssignments] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const data = await studentService.getStudentMySubmissionService(assignmentId, req.user);
    return res.status(200).json({
      success: true,
      message: data ? 'Data pengumpulan tugas berhasil diambil.' : 'Belum ada pengumpulan tugas.',
      data: data || null,
    });
  } catch (error) {
    console.error('[getStudentMySubmission] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const submitStudentAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    const data = await studentService.submitStudentAssignmentService(
      assignmentId,
      req.user,
      files,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: 'Tugas berhasil dikumpulkan.',
      data,
    });
  } catch (error) {
    console.error('[submitStudentAssignment] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await studentService.getStudentCourseGradesService(courseId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Rekap nilai course siswa berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentCourseGrades] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentSubmissionGrade = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const data = await studentService.getStudentGradeDetailService(submissionId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Detail penilaian siswa berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentSubmissionGrade] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

export const getStudentAssignmentGrade = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const data = await studentService.getStudentGradeDetailService(assignmentId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Detail penilaian siswa berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getStudentAssignmentGrade] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};
