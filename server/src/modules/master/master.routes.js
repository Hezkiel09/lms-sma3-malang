import { Router } from 'express';
import * as masterController from './master.controller.js';
import { authenticateUser, requireAdmin } from '../../middleware/authMiddleware.js';

const router = Router();

// Dashboard Analytics Admin
router.get('/analytics/dashboard', authenticateUser, requireAdmin, masterController.getDashboardSummary);

// Data akademik dapat dibaca pengguna terautentikasi; mutasi khusus Admin.
router.get('/classes', authenticateUser, masterController.getAllClasses);
router.post('/classes', authenticateUser, requireAdmin, masterController.createClass);
router.put('/classes/:id', authenticateUser, requireAdmin, masterController.updateClass);
router.delete('/classes/:id', authenticateUser, requireAdmin, masterController.deleteClass);
router.patch('/classes/:id/homeroom', authenticateUser, requireAdmin, masterController.updateHomeroom);

// Legacy subject endpoints
router.get('/subjects', authenticateUser, masterController.getAllSubjects);
router.post('/subjects', authenticateUser, requireAdmin, masterController.createSubject);

// Rute Akademik (Mata Pelajaran & Jadwal)
router.get('/academic/subjects', authenticateUser, masterController.getAllSubjects);
router.post('/academic/subjects', authenticateUser, requireAdmin, masterController.createSubject);
router.put('/academic/subjects/:id', authenticateUser, requireAdmin, masterController.updateSubject);
router.delete('/academic/subjects/:id', authenticateUser, requireAdmin, masterController.deleteSubject);

router.get('/academic/schedules', authenticateUser, masterController.getAllSchedules);
router.post('/academic/schedules', authenticateUser, requireAdmin, masterController.createSchedule);
router.put('/academic/schedules/:id', authenticateUser, requireAdmin, masterController.updateSchedule);
router.delete('/academic/schedules/:id', authenticateUser, requireAdmin, masterController.deleteSchedule);

// Rute User (Guru, Siswa, Ortu)
// Data akun memuat informasi personal dan hanya dapat diakses Admin.
router.get('/users/teachers', authenticateUser, requireAdmin, masterController.getAllTeachers);
router.post('/users/teachers', authenticateUser, requireAdmin, masterController.createTeacher);
router.put('/users/teachers/:id', authenticateUser, requireAdmin, masterController.updateTeacher);
router.delete('/users/teachers/:id', authenticateUser, requireAdmin, masterController.deleteTeacher);

router.get('/users/students', authenticateUser, requireAdmin, masterController.getAllStudents);
router.post('/users/students', authenticateUser, requireAdmin, masterController.createStudent);
router.put('/users/students/:id', authenticateUser, requireAdmin, masterController.updateStudent);
router.delete('/users/students/:id', authenticateUser, requireAdmin, masterController.deleteStudent);

router.get('/users/parents', authenticateUser, requireAdmin, masterController.getAllParents);
router.post('/users/parents', authenticateUser, requireAdmin, masterController.createParent);
router.put('/users/parents/:id', authenticateUser, requireAdmin, masterController.updateParent);
router.delete('/users/parents/:id', authenticateUser, requireAdmin, masterController.deleteParent);

// Rute Course
router.get('/student/courses', authenticateUser, masterController.getStudentCourses);
router.get('/courses', authenticateUser, masterController.getAllCourses);
router.post('/courses', authenticateUser, requireAdmin, masterController.createCourse);
router.put('/courses/:id', authenticateUser, requireAdmin, masterController.updateCourse);
router.delete('/courses/:id', authenticateUser, requireAdmin, masterController.deleteCourse);

export default router;
