import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import * as c from './attendance.controller.js';

const router = Router();

// Sesi presensi. Path tetap harus di atas "/:id".
router.get('/attendance-sessions/today', requireRole('teacher'), c.getToday);
router.get('/attendance-sessions/preview', requireRole('teacher'), c.previewSession);
router.get('/attendance-sessions/teaching', requireRole('teacher'), c.getTeaching);
router.get('/attendance-sessions/active/me', requireRole('student'), c.activeForMe);
router.post('/attendance-sessions', requireRole('teacher'), c.openSession);
router.get('/attendance-sessions', requireRole('teacher'), c.listMySessions);
router.get('/attendance-sessions/:id', requireRole('teacher', 'admin'), c.getSession);
router.patch('/attendance-sessions/:id/close', requireRole('teacher'), c.closeSession);
router.patch('/attendance-sessions/:id/attendances', requireRole('teacher'), c.updateSessionAttendances);
router.post('/attendance-sessions/:id/checkin', requireRole('student'), c.checkin);

// Presensi
router.get('/attendances', requireRole('teacher', 'admin'), c.listAttendances);
router.get('/attendances/export', requireRole('teacher'), c.exportAttendances);

// Sisi siswa dan orang tua. Untuk siswa, studentId boleh "me".
router.get('/attendances/me/today', requireRole('student'), c.todayForMe);
router.get('/attendances/student/:studentId/overview', requireRole('student', 'parent', 'admin'), c.studentOverview);
router.get('/attendances/student/:studentId/week', requireRole('student', 'parent', 'admin'), c.studentWeek);
router.get(
  '/attendances/student/:studentId/subjects/:subjectId',
  requireRole('student', 'parent', 'admin'),
  c.studentSubject
);
router.get(
  '/attendances/student/:studentId',
  requireRole('teacher', 'admin', 'parent', 'student'),
  c.getStudentAttendances
);
router.patch('/attendances/:id', requireRole('teacher'), c.updateAttendance);

export default router;