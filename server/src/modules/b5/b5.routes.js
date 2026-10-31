import { Router } from 'express';
import materialsRoutes from './materials/materials.routes.js';
import sectionsRoutes from './sections/sections.routes.js';
import * as materialsController from './materials/materials.controller.js';

const router = Router();

/**
 * Router Utama Modul B5
 * Base Path: /api/v1/b5
 */

// Sub-router Fitur Section dalam Course
// Endpoint: GET /api/v1/b5/courses/:courseId/sections
router.use('/courses', sectionsRoutes);

// Endpoint Mengambil Daftar Materi dalam Course
// Endpoint: GET /api/v1/b5/courses/:courseId/materials
router.get('/courses/:courseId/materials', materialsController.getMaterialsByCourseId);

// Sub-router Fitur Materi (UC-02 & UC-03)
// Base Path: /api/v1/b5/materials
router.use('/materials', materialsRoutes);

// TODO: Sub-router Fitur Tugas (Assignments) di masa mendatang
// router.use('/assignments', assignmentsRoutes);

// TODO: Sub-router Fitur Pengumpulan Tugas (Submissions) di masa mendatang
// router.use('/submissions', submissionsRoutes);

export default router;
