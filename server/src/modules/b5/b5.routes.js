import { Router } from 'express';
import materialsRoutes from './materials/materials.routes.js';
import sectionsRoutes from './sections/sections.routes.js';
import assignmentsRoutes from './assignments/assignments.routes.js';
import submissionsRoutes from './submissions/submissions.routes.js';
import teacherRoutes from './teacher/teacher.routes.js';
import notificationsRoutes from './notifications/notifications.routes.js';
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

// Sub-router fitur Tugas (UC-04, UC-05, UC-06, UC-07)
// Base Path: /api/v1/b5/assignments
// (termasuk GET /:assignmentId/submissions untuk UC-07)
router.use('/assignments', assignmentsRoutes);

// Sub-router fitur Submissions (UC-07)
// Base Path: /api/v1/b5/submissions
router.use('/submissions', submissionsRoutes);

// Sub-router Profil Guru
// Base Path: /api/v1/b5/teacher
router.use('/teacher', teacherRoutes);

// Sub-router Notifikasi
// Base Path: /api/v1/b5/notifications
router.use('/notifications', notificationsRoutes);

export default router;
