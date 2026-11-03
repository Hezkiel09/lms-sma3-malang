import { Router } from 'express';
import * as optionController from '../controllers/question-options-controller.js';

const router = Router();

router.get('/question/:questionId', optionController.getOptionsByQuestionId);
router.get('/:id', optionController.getOptionById);
router.post('/', optionController.createOption);
router.put('/:id', optionController.updateOption);
router.patch('/:id', optionController.updateOption);
router.delete('/:id', optionController.deleteOption);

export default router;