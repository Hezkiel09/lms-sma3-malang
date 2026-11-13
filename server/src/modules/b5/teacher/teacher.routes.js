import { Router } from 'express';
import {
  getTeacherProfile,
  updateTeacherProfile,
} from './teacher.controller.js';

const router = Router();

/**
 * Router Profil Guru
 * Base Path: /api/v1/b5/teacher
 */

// GET /api/v1/b5/teacher/profile
router.get('/profile', getTeacherProfile);

// PUT /api/v1/b5/teacher/profile
router.put('/profile', updateTeacherProfile);

export default router;
