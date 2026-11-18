import { Router } from 'express';
import { studentAuthMiddleware } from '../../../middleware/devAuthMiddleware.js';
import { studentSubmissionUploadMiddleware } from '../../../middleware/submissionUploadMiddleware.js';
import * as studentController from './student.controller.js';

const router = Router();

// Terapkan middleware auth siswa ke seluruh endpoint di bawah /student
router.use(studentAuthMiddleware);

// Profil & Notifikasi Siswa
router.get('/profile', studentController.getStudentProfile);
router.put('/profile', studentController.updateStudentProfile);
router.get('/notifications', studentController.getStudentNotifications);

// UC-08: Mengakses Course & Materi (Hanya Published)
router.get('/courses', studentController.getStudentCourses);
router.get('/courses/:courseId/sections', studentController.getStudentCourseSections);
router.get('/courses/:courseId/materials', studentController.getStudentCourseMaterials);
router.get('/materials/:materialId', studentController.getStudentMaterialDetail);

// UC-09: Melihat Tugas Siswa
router.get('/timeline-assignments', studentController.getStudentTimelineAssignments);
router.get('/courses/:courseId/assignments', studentController.getStudentCourseAssignments);
router.get('/assignments/:assignmentId', studentController.getStudentAssignmentDetail);

// UC-10: Mengumpulkan Tugas Siswa (Submit & My Submission)
router.get('/assignments/:assignmentId/my-submission', studentController.getStudentMySubmission);
router.post(
  '/assignments/:assignmentId/submissions',
  studentSubmissionUploadMiddleware,
  studentController.submitStudentAssignment
);

// UC-11: Melihat Nilai, Feedback, dan File Koreksi Guru
router.get('/courses/:courseId/grades', studentController.getStudentCourseGrades);
router.get('/submissions/:submissionId/grade', studentController.getStudentSubmissionGrade);
router.get('/assignments/:assignmentId/grade', studentController.getStudentAssignmentGrade);

export default router;
