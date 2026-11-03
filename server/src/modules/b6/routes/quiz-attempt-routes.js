import { Router } from 'express';
import * as attemptController from '../controllers/quiz-attempt-controller.js';

const router = Router();

router.get('/', attemptController.getAllAttempts);
router.get('/:id', attemptController.getAttemptById);
router.post('/', attemptController.createAttempt);
router.put('/:id', attemptController.updateAttempt);
router.patch('/:id', attemptController.updateAttempt);
router.delete('/:id', attemptController.deleteAttempt);

export default router;