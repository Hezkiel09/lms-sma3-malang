import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = Router();

// Public: Login untuk semua role (admin, teacher, student, parent)
router.post('/login', authController.login);

// Protected: Pengguna yang sudah login (semua role)
router.get('/me', authenticateUser, authController.getMe);
router.put('/profile', authenticateUser, authController.updateProfile);
router.put('/password', authenticateUser, authController.updatePassword);

export default router;
