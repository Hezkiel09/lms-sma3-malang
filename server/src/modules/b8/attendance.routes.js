import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import * as c from './attendance.controller.js';

const router = Router();

router.post('/attendance-sessions', requireRole('teacher'), c.openSession);
router.get('/attendance-sessions', requireRole('teacher'), c.listMySessions);
router.get('/attendance-sessions/active/me', requireRole('student'), c.activeForMe); // sebelum :id
router.get('/attendance-sessions/:id', requireRole('teacher', 'admin'), c.getSession);
router.patch('/attendance-sessions/:id/close', requireRole('teacher'), c.closeSession);
router.post('/attendance-sessions/:id/checkin', requireRole('student'), c.checkin);

router.patch('/attendances/:id', requireRole('teacher', 'admin'), c.updateAttendance);
router.get(
  '/attendances/student/:studentId',
  requireRole('teacher', 'admin', 'parent', 'student'),
  c.getStudentAttendances
);

export default router;