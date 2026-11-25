import { Router } from 'express';
import * as quizController from '../controllers/quiz-controller.js';
import { authenticateUser, requireRole } from '../../../middleware/authMiddleware.js';

const router = Router();

// CRUD Kuis Utama
router.get('/', authenticateUser, quizController.getAllQuizzes);
router.get('/:id', authenticateUser, quizController.getQuizById);
router.post('/', authenticateUser, requireRole(['teacher']), quizController.createQuiz);
router.patch('/:id/publish', authenticateUser, requireRole(['teacher']), quizController.publishQuiz);
router.put('/:id', authenticateUser, requireRole(['teacher']), quizController.updateQuiz);
router.patch('/:id', authenticateUser, requireRole(['teacher']), quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

// Manajemen Soal di dalam Kuis
router.post('/:id/questions', quizController.addQuestionsToQuiz);
router.delete('/:id/questions/:questionId', quizController.removeQuestionFromQuiz);

export default router;
