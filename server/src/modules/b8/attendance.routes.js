import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import * as c from './attendance.controller.js';

const router = Router();

// Sesi presensi
router.post('/attendance-sessions', requireRole('teacher'), c.openSession); // UC-12
router.get('/attendance-sessions', requireRole('teacher'), c.listMySessions);
router.get('/attendance-sessions/active/me', requireRole('student'), c.activeForMe); // sebelum :id
router.get('/attendance-sessions/:id', requireRole('teacher', 'admin'), c.getSession);
router.patch('/attendance-sessions/:id/close', requireRole('teacher'), c.closeSession); // UC-14
router.patch('/attendance-sessions/:id/attendances', requireRole('teacher'), c.updateSessionAttendances); // UC-13 (simpan banyak)
router.post('/attendance-sessions/:id/checkin', requireRole('student'), c.checkin); // UC-27

// Presensi
router.get('/attendances', requireRole('teacher', 'admin'), c.listAttendances); // UC-11, UC-06
router.get('/attendances/export', requireRole('teacher'), c.exportAttendances); // UC-15 (sebelum :id)
router.get(
  '/attendances/student/:studentId',
  requireRole('teacher', 'admin', 'parent', 'student'),
  c.getStudentAttendances
); // UC-21, UC-22, UC-28
router.patch('/attendances/:id', requireRole('teacher'), c.updateAttendance); // UC-13 (satu siswa)

export default router;