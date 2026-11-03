import { Router } from 'express';
import * as studentAnswerController from '../controllers/student-answer-controller.js';

const router = Router();

router.post('/answers/save', studentAnswerController.saveStudentAnswer);
router.get('/answers/attempt/:attemptId', studentAnswerController.getAnswersByAttemptId);

export default router;