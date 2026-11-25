import { Router } from 'express';
import * as bankController from '../controllers/question-bank-controller.js';
import questionRouter from './question-routes.js';

const router = Router();

// Sub-route ke soal berdasarkan bankId
router.use('/:bankId/questions', questionRouter);

// Endpoint Bank Soal
router.get('/', bankController.getAllQuestionBanks);
router.get('/:id', bankController.getQuestionBankById);
router.post('/', bankController.createQuestionBank);
router.put('/:id', bankController.updateQuestionBank);
router.patch('/:id', bankController.patchQuestionBank);
router.delete('/:id', bankController.deleteQuestionBank);

export default router;