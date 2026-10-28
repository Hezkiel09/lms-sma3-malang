import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import * as c from './attendance.controller.js';

const router = Router();

// Sesi presensi
router.post('/attendance-sessions', requireRole('teacher'), c.openSession);
router.get('/attendance-sessions', requireRole('teacher'), c.listMySessions);
router.get('/attendance-sessions/active/me', requireRole('student'), c.activeForMe);
router.get('/attendance-sessions/:id', requireRole('teacher', 'admin'), c.getSession);
router.patch('/attendance-sessions/:id/close', requireRole('teacher'), c.closeSession);
router.patch('/attendance-sessions/:id/attendances', requireRole('teacher'), c.updateSessionAttendances);
router.post('/attendance-sessions/:id/checkin', requireRole('student'), c.checkin);

// Presensi
router.get('/attendances', requireRole('teacher', 'admin'), c.listAttendances);
router.get('/attendances/export', requireRole('teacher'), c.exportAttendances);
router.get(
  '/attendances/student/:studentId',
  requireRole('teacher', 'admin', 'parent', 'student'),
  c.getStudentAttendances
);
router.patch('/attendances/:id', requireRole('teacher'), c.updateAttendance);

export default router;