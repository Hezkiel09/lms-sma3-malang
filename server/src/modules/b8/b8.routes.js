import { Router } from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { loadRole } from './b8.middleware.js';
import attendanceRoutes from './attendance.routes.js';
import notificationRoutes from './notification.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

// Semua endpoint B8 wajib login; role dimuat ke req.role.
router.use(authenticateUser, loadRole);
router.use('/', attendanceRoutes);
router.use('/', notificationRoutes);
router.use('/', chatRoutes);

export default router;