import { Router } from 'express';
import * as quizController from '../controllers/quiz-controller.js';

const router = Router();

// CRUD Kuis Utama
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);
router.post('/', quizController.createQuiz);
router.put('/:id', quizController.updateQuiz);
router.patch('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

// Manajemen Soal di dalam Kuis
router.post('/:id/questions', quizController.addQuestionsToQuiz);
router.delete('/:id/questions/:questionId', quizController.removeQuestionFromQuiz);

export default router;