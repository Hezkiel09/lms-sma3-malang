import { Router } from 'express';
import { getNotifications } from './notifications.controller.js';

const router = Router();

/**
 * Router Notifikasi
 * Base Path: /api/v1/b5/notifications
 */

// GET /api/v1/b5/notifications
router.get('/', getNotifications);

export default router;
