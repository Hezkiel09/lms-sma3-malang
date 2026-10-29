import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import * as c from './dashboard.controller.js';

const router = Router();

router.get('/dashboard/teacher', requireRole('teacher'), c.teacherDashboard); // UC-10
router.get('/dashboard/parent', requireRole('parent'), c.parentDashboard); // UC-20

export default router;
