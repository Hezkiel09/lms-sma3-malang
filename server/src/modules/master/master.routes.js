import { Router } from 'express';
import * as masterController from './master.controller.js';

const router = Router();

// Rute Kelas
router.get('/classes', masterController.getAllClasses);
router.post('/classes', masterController.createClass);
router.delete('/classes/:id', masterController.deleteClass);
router.patch('/classes/:id/homeroom', masterController.updateHomeroom);

// Rute Mata Pelajaran
router.get('/subjects', masterController.getAllSubjects);
router.post('/subjects', masterController.createSubject);

// Rute User (Guru, Siswa, Ortu)
router.get('/users/teachers', masterController.getAllTeachers);
router.post('/users/teacher', masterController.createTeacher);

router.get('/users/students', masterController.getAllStudents);
router.post('/users/student', masterController.createStudent);

router.get('/users/parents', masterController.getAllParents);
router.post('/users/parent', masterController.createParent);

// Rute Course
router.get('/courses', masterController.getAllCourses);
router.post('/courses', masterController.createCourse);

export default router;