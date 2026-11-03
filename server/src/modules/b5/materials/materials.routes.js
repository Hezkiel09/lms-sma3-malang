import { Router } from 'express';
import * as materialsController from './materials.controller.js';
import { parseMaterialUpload } from '../../../middleware/materialUploadMiddleware.js';

const router = Router();

/**
 * Rute Materi (UC-02 & UC-03)
 * Base Path: /api/v1/b5/materials
 */

// Endpoint GET yang sudah tersedia tetap dipertahankan.
router.get('/', materialsController.getAllMaterials);
router.get('/:id', materialsController.getMaterialById);

// UC-02 (sementara untuk pengembangan): belum memakai login/autentikasi.
// teacher_id diturunkan dari Course berdasarkan section_id di service.
router.post('/', parseMaterialUpload, materialsController.createMaterial);

// UC-03: Endpoint edit dan delete belum diberi middleware Guru pada tahap ini.
// Akan diamankan ketika implementasi UC-03 dikerjakan.
router.put('/:id', materialsController.updateMaterial);
router.delete('/:id', materialsController.deleteMaterial);

export default router;
