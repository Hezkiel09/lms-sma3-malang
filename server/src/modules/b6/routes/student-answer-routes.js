import { Router } from 'express';
import * as studentAnswerController from '../controllers/student-answer-controller.js';
import { optionalAuthenticateUser } from '../../../middleware/authMiddleware.js';

const router = Router();

router.post('/answers/save', optionalAuthenticateUser, studentAnswerController.saveStudentAnswer);
router.get('/answers/attempt/:attemptId', optionalAuthenticateUser, studentAnswerController.getAnswersByAttemptId);

export default router;