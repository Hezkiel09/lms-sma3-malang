import {
  getSubmissionsByAssignmentIdService,
  getSubmissionByIdService,
  gradeSubmissionService,
  deleteCorrectionFileService,
  submitAssignmentService,
} from './submissions.service.js';
import { isValidUUID } from '../../../utils/validation.js';

/**
 * POST /api/v1/b5/assignments/:assignmentId/submissions atau /api/v1/b5/submissions
 * Mengunggah pengumpulan tugas oleh siswa langsung ke bucket 'submissions'.
 */
export const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId || req.body.assignmentId;
    const studentId = req.body.studentId || req.headers['x-student-id'];
    const files = req.files || [];

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: 'assignmentId wajib disertakan.',
      });
    }

    if (!isValidUUID(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: 'assignmentId tidak valid. Format harus UUID.',
      });
    }

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId wajib disertakan pada body atau header "x-student-id".',
      });
    }

    if (!isValidUUID(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'studentId tidak valid. Format harus UUID.',
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Minimal satu berkas tugas harus diunggah pada field "files".',
      });
    }

    const data = await submitAssignmentService({
      assignmentId,
      studentId,
      files,
    });

    return res.status(201).json({
      success: true,
      message: 'Tugas berhasil dikumpulkan ke bucket "submissions".',
      data,
    });
  } catch (error) {
    console.error('[submitAssignment] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server saat mengumpulkan tugas.',
    });
  }
};

/**
 * GET /api/v1/b5/assignments/:assignmentId/submissions
 * Mengambil daftar pengumpulan tugas beserta status, nilai, dan lampirannya.
 */
export const getSubmissionsByAssignmentId = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!isValidUUID(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: 'assignmentId tidak valid. Format harus UUID.',
      });
    }

    const data = await getSubmissionsByAssignmentIdService(assignmentId);

    return res.status(200).json({
      success: true,
      message: 'Daftar pengumpulan tugas berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getSubmissionsByAssignmentId] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

/**
 * GET /api/v1/b5/submissions/:submissionId
 * Mengambil detail pengumpulan siswa, tugas, file pekerjaan, dan file koreksi guru.
 */
export const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!isValidUUID(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'submissionId tidak valid. Format harus UUID.',
      });
    }

    const data = await getSubmissionByIdService(submissionId);

    return res.status(200).json({
      success: true,
      message: 'Detail pengumpulan berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getSubmissionById] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

/**
 * PUT /api/v1/b5/submissions/:submissionId/grade
 * Memberi atau memperbarui nilai, umpan balik, serta file koreksi tugas siswa.
 */
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!isValidUUID(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'submissionId tidak valid. Format harus UUID.',
      });
    }

    const { score, feedback, removeCorrectionFileId } = req.body;

    if (score === undefined || score === null || score === '') {
      return res.status(400).json({
        success: false,
        message: 'Field "score" (nilai) wajib diisi.',
      });
    }

    // Ambil file koreksi jika ada
    const file = req.files && req.files.length > 0 ? req.files[0] : null;

    const data = await gradeSubmissionService(submissionId, {
      score,
      feedback,
      file,
      removeCorrectionFileId,
    });

    return res.status(200).json({
      success: true,
      message: 'Penilaian tugas berhasil disimpan.',
      data,
    });
  } catch (error) {
    console.error('[gradeSubmission] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};

/**
 * DELETE /api/v1/b5/submissions/:submissionId/correction-files/:fileId
 * Menghapus satu file koreksi guru.
 */
export const deleteCorrectionFile = async (req, res) => {
  try {
    const { submissionId, fileId } = req.params;

    if (!isValidUUID(submissionId)) {
      return res.status(400).json({
        success: false,
        message: 'submissionId tidak valid. Format harus UUID.',
      });
    }

    if (!isValidUUID(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'fileId tidak valid. Format harus UUID.',
      });
    }

    const data = await deleteCorrectionFileService(submissionId, fileId);

    return res.status(200).json({
      success: true,
      message: 'File koreksi berhasil dihapus.',
      data,
    });
  } catch (error) {
    console.error('[deleteCorrectionFile] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};
