import { Router } from 'express';
import {
  getSubmissionById,
  gradeSubmission,
  deleteCorrectionFile,
  submitAssignment,
} from './submissions.controller.js';
import { parseSubmissionUpload } from '../../../middleware/submissionUploadMiddleware.js';

const router = Router();

/**
 * Router Pengumpulan & Penilaian Tugas (UC-07 & UC-10)
 * Base Path: /api/v1/b5/submissions
 */

// POST /api/v1/b5/submissions
// Siswa mengumpulkan tugas langsung ke bucket 'submissions'
router.post('/', parseSubmissionUpload, submitAssignment);

// GET /api/v1/b5/submissions/:submissionId
// Ambil detail pengumpulan siswa, tugas, file pekerjaan, dan file koreksi
router.get('/:submissionId', getSubmissionById);

// PUT /api/v1/b5/submissions/:submissionId/grade
// Beri nilai atau perbarui nilai tugas (mendukung form-data dan JSON)
router.put('/:submissionId/grade', parseSubmissionUpload, gradeSubmission);

// DELETE /api/v1/b5/submissions/:submissionId/correction-files/:fileId
// Hapus satu file koreksi guru
router.delete('/:submissionId/correction-files/:fileId', deleteCorrectionFile);

export default router;
