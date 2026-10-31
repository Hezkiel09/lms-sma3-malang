import { Router } from 'express';
import * as sectionsController from './sections.controller.js';

const router = Router({ mergeParams: true });

/**
 * Rute Section Modul B5
 * Mounted at: /api/v1/b5/courses
 *
 * Endpoint:
 * GET /api/v1/b5/courses/:courseId/sections
 */
router.get('/:courseId/sections', sectionsController.getSectionsByCourseId);

// Mendukung mounting langsung di /courses/:courseId/sections jika diperlukan
router.get('/', sectionsController.getSectionsByCourseId);

export default router;

