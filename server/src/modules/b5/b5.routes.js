
import { Router } from 'express';
import materialsRoutes from './materials/materials.routes.js';
import sectionsRoutes from './sections/sections.routes.js';
import assignmentsRoutes from './assignments/assignments.routes.js';
import * as materialsController from './materials/materials.controller.js';
import * as assignmentsController from './assignments/assignments.controller.js';

const router = Router();

/**
 * Router Utama Modul B5
 * Base Path: /api/v1/b5
 */

// Endpoint mengambil daftar tugas berdasarkan Course dan Section
// GET /api/v1/b5/courses/:courseId/sections/:sectionId/assignments
router.get(
  '/courses/:courseId/sections/:sectionId/assignments',
  assignmentsController.getAssignmentsBySectionId
);

// Sub-router fitur Section dalam Course
// GET /api/v1/b5/courses/:courseId/sections
router.use('/courses', sectionsRoutes);

// Endpoint mengambil daftar Materi dalam Course
// GET /api/v1/b5/courses/:courseId/materials
router.get(
  '/courses/:courseId/materials',
  materialsController.getMaterialsByCourseId
);

// Endpoint mengambil daftar Tugas dalam Course
// GET /api/v1/b5/courses/:courseId/assignments
// Tetap dipertahankan untuk kompatibilitas
router.get(
  '/courses/:courseId/assignments',
  assignmentsController.getAssignmentsByCourseId
);

// Sub-router fitur Materi (UC-02 & UC-03)
// Base Path: /api/v1/b5/materials
router.use('/materials', materialsRoutes);

// Sub-router fitur Tugas (UC-04 & UC-06)
// Base Path: /api/v1/b5/assignments
router.use('/assignments', assignmentsRoutes);

// TODO: Sub-router fitur Pengumpulan Tugas (Submissions)
// Akan dikembangkan pada UC pengumpulan tugas siswa.

export default router;