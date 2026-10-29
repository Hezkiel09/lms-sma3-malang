import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import { ok, handle } from './b8.http.js';
import * as c from './dashboard.controller.js';

const router = Router();

// Siapa yang sedang login (dipakai FE untuk menentukan tampilan).
router.get(
  '/me',
  requireRole('admin', 'teacher', 'parent', 'student'),
  handle(async (req, res) => ok(res, { id: req.user.id, email: req.user.email, role: req.role }))
);

router.get('/dashboard/teacher', requireRole('teacher'), c.teacherDashboard); // UC-10
router.get('/dashboard/parent', requireRole('parent'), c.parentDashboard); // UC-20

export default router;