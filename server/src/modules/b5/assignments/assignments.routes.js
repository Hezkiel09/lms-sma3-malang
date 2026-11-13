import { Router } from 'express';
import * as assignmentsController from './assignments.controller.js';
import { parseAssignmentUpload } from '../../../middleware/assignmentUploadMiddleware.js';
import { parseSubmissionUpload } from '../../../middleware/submissionUploadMiddleware.js';
import * as submissionsController from '../submissions/submissions.controller.js';

const router = Router();

/**
 * Rute Tugas (UC-04, UC-05, UC-06 & UC-07)
 * Base Path: /api/v1/b5/assignments
 */

// UC-07: Mengambil daftar submissions untuk suatu tugas
// HARUS sebelum '/:id' agar tidak ter-intercept
router.get('/:assignmentId/submissions', submissionsController.getSubmissionsByAssignmentId);

// UC-10: Siswa mengumpulkan tugas untuk assignment tertentu
// Mengunggah langsung ke bucket 'submissions' di Supabase Storage
router.post(
  '/:assignmentId/submissions',
  parseSubmissionUpload,
  submissionsController.submitAssignment
);

// UC-04: Mengambil detail tugas berdasarkan ID
router.get('/:id', assignmentsController.getAssignmentById);

// UC-04: Membuat tugas baru (mendukung multipart/form-data dan JSON)
router.post(
  '/',
  parseAssignmentUpload,
  assignmentsController.createAssignment
);

// UC-05: Memperbarui tugas dan lampirannya
router.put(
  '/:id',
  parseAssignmentUpload,
  assignmentsController.updateAssignment
);

// UC-05: Menghapus satu lampiran tugas
router.delete('/:id/files/:fileId', assignmentsController.deleteAssignmentFile);

// UC-05: Menghapus seluruh tugas beserta seluruh lampirannya
router.delete('/:id', assignmentsController.deleteAssignment);

export default router;
