import { Router } from 'express';
import * as questionImportController from '../controllers/question-import-controller.js';

const router = Router();

router.get('/', questionImportController.getAllImports);
router.get('/:id', questionImportController.getImportById);
router.post('/', questionImportController.createImportLog);
router.put('/:id', questionImportController.updateImportLog);
router.patch('/:id', questionImportController.updateImportLog);
router.delete('/:id', questionImportController.deleteImportLog);

export default router;