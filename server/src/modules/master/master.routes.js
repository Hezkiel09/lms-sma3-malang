import { Router } from 'express';
import * as masterController from './master.controller.js';

const router = Router();

// dashboard
router.get('/analytics/dashboard', masterController.getDashboardSummary);

// Rute Kelas
router.get('/classes', masterController.getAllClasses);
router.post('/classes', masterController.createClass);
router.delete('/classes/:id', masterController.deleteClass);
router.patch('/classes/:id/homeroom', masterController.updateHomeroom);

// Legacy subject endpoints
router.get('/subjects', masterController.getAllSubjects);
router.post('/subjects', masterController.createSubject);

// Rute Akademik
router.get('/academic/subjects', masterController.getAllSubjects);
router.post('/academic/subjects', masterController.createSubject);
router.put('/academic/subjects/:id', masterController.updateSubject);
router.delete('/academic/subjects/:id', masterController.deleteSubject);

router.get('/academic/schedules', masterController.getAllSchedules);
router.post('/academic/schedules', masterController.createSchedule);
router.put('/academic/schedules/:id', masterController.updateSchedule);
router.delete('/academic/schedules/:id', masterController.deleteSchedule);

// Rute User (Guru, Siswa, Ortu)
router.get('/users/teachers', masterController.getAllTeachers);
router.post('/users/teachers', masterController.createTeacher);
router.put('/users/teachers/:id', masterController.updateTeacher);
router.delete('/users/teachers/:id', masterController.deleteTeacher);

router.get('/users/students', masterController.getAllStudents);
router.post('/users/students', masterController.createStudent);
router.put('/users/students/:id', masterController.updateStudent);
router.delete('/users/students/:id', masterController.deleteStudent);

router.get('/users/parents', masterController.getAllParents);
router.post('/users/parents', masterController.createParent);
router.put('/users/parents/:id', masterController.updateParent);
router.delete('/users/parents/:id', masterController.deleteParent);

// Rute Course
router.get('/courses', masterController.getAllCourses);
router.post('/courses', masterController.createCourse);

export default router;