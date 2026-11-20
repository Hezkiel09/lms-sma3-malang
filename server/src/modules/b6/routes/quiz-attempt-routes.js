import { Router } from 'express';
import * as attemptController from '../controllers/quiz-attempt-controller.js';
import { authenticateUser } from '../../../middleware/authMiddleware.js';
import { gradeAttemptController } from '../controllers/grading-controller.js';

const router = Router();

router.use(authenticateUser);
router.get('/', attemptController.getAllAttempts);
router.post('/:attemptId/grade', gradeAttemptController);
router.get('/:id', attemptController.getAttemptById);
router.post('/', attemptController.createAttempt);
router.put('/:id', attemptController.updateAttempt);
router.patch('/:id', attemptController.updateAttempt);
router.delete('/:id', attemptController.deleteAttempt);

export default router;
