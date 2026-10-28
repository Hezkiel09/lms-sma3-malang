import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import * as c from './notification.controller.js';

const router = Router();
const everyone = requireRole('admin', 'teacher', 'parent', 'student');

router.get('/notifications', everyone, c.listNotifications);
router.patch('/notifications/:id/read', everyone, c.markRead);

export default router;