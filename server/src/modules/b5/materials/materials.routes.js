import { Router } from 'express';
import * as materialsController from './materials.controller.js';
import { parseMaterialUpload } from '../../../middleware/materialUploadMiddleware.js';

const router = Router();

/**
 * Rute Materi (UC-02 & UC-03)
 * Base Path: /api/v1/b5/materials
 */

// UC-03: Mengambil daftar materi
router.get('/', materialsController.getAllMaterials);

// UC-03: Mengambil detail materi berdasarkan ID
router.get('/:id', materialsController.getMaterialById);

// UC-02: Menambah materi baru (multipart/form-data)
router.post('/', parseMaterialUpload, materialsController.createMaterial);

// UC-03: Mengubah nama satu lampiran
router.patch('/:id/files/:fileId', materialsController.renameMaterialFile);

// UC-03: Menghapus satu lampiran
router.delete('/:id/files/:fileId', materialsController.deleteMaterialFile);

// UC-03: Memperbarui informasi materi dan/atau menambahkan file baru
router.put('/:id', parseMaterialUpload, materialsController.updateMaterial);

// UC-03: Menghapus seluruh materi beserta seluruh lampirannya
router.delete('/:id', materialsController.deleteMaterial);

export default router;
