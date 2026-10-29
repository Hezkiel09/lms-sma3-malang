import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import { ok, handle } from './b8.http.js';
import { getRecap, remindStudents } from './attendance.extras.service.js';

const router = Router();

router.get(
  '/attendances/recap',
  requireRole('teacher', 'admin'),
  handle(async (req, res) => ok(res, await getRecap(req.user.id, req.role, req.query)))
);

router.post(
  '/attendance-sessions/:id/remind',
  requireRole('teacher'),
  handle(async (req, res) => ok(res, await remindStudents(req.user.id, req.params.id), 'Pengingat terkirim'))
);

export default router;