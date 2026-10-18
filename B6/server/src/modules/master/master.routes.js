import { Router } from 'express';
import * as masterController from './master.controller.js';
//import { authenticateUser, requireAdmin } from '../../middleware/authMiddleware.js';

const router = Router();

// Proteksi middleware khusus Admin
//router.use(authenticateUser, requireAdmin);

// Rute Kelas
router.get('/classes', masterController.getAllClasses);
router.post('/classes', masterController.createClass);
router.delete('/classes/:id', masterController.deleteClass);

// Rute Mata Pelajaran
router.get('/subjects', masterController.getAllSubjects);
router.post('/subjects', masterController.createSubject);

// Rute Tambah Guru
router.post('/users/teacher', masterController.createTeacher);

export default router;