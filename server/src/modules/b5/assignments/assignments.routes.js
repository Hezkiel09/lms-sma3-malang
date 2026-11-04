import { Router } from 'express';
import * as assignmentsController from './assignments.controller.js';
import { parseAssignmentUpload } from '../../../middleware/assignmentUploadMiddleware.js';

const router = Router();

/**
 * Rute Tugas (UC-04 & UC-06)
 * Base Path: /api/v1/b5/assignments
 */

// UC-04: Mengambil detail tugas berdasarkan ID
router.get('/:id', assignmentsController.getAssignmentById);

// UC-04: Membuat tugas baru (mendukung multipart/form-data dan JSON)
router.post(
  '/',
  parseAssignmentUpload,
  assignmentsController.createAssignment
);

export default router;
