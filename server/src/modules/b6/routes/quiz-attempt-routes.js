import { Router } from 'express';
import * as attemptController from '../controllers/quiz-attempt-controller.js';
import { authenticateUser, optionalAuthenticateUser } from '../../../middleware/authMiddleware.js';
import { gradeAttemptController } from '../controllers/grading-controller.js';

const router = Router();

router.get('/', optionalAuthenticateUser, attemptController.getAllAttempts);
router.post('/:attemptId/grade', authenticateUser, gradeAttemptController);
router.get('/:id', optionalAuthenticateUser, attemptController.getAttemptById);
router.post('/', optionalAuthenticateUser, attemptController.createAttempt);
router.put('/:id', optionalAuthenticateUser, attemptController.updateAttempt);
router.patch('/:id', optionalAuthenticateUser, attemptController.updateAttempt);
router.delete('/:id', optionalAuthenticateUser, attemptController.deleteAttempt);

export default router;
