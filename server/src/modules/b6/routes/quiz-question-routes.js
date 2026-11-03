import { Router } from 'express';
import * as quizQuestionController from '../controllers/quiz-question-controller.js';

const router = Router();

router.get('/quizzes/:quizId/questions', quizQuestionController.getQuestionsByQuizId);
router.post('/quizzes/questions', quizQuestionController.attachQuestionToQuiz);
router.delete('/quizzes/questions/:id', quizQuestionController.removeQuestionFromQuiz);

export default router;