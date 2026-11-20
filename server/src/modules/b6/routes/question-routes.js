import { Router } from 'express';
import multer from 'multer';
import * as QuestionController from '../controllers/question-controller.js';

const router = Router({ mergeParams: true });

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', QuestionController.getQuestionsByBankId);
router.post('/manual', QuestionController.createQuestion);
router.post('/import', upload.single('excel_file'), QuestionController.importExcel);
router.put('/:questionId', QuestionController.updateQuestion);
router.patch('/:questionId', QuestionController.patchQuestion);
router.delete('/:questionId', QuestionController.deleteQuestion);

export default router;