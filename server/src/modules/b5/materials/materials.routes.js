import { Router } from 'express';
import * as materialsController from './materials.controller.js';

const router = Router();

/**
 * Rute Materi (UC-02 & UC-03)
 * Base Path: /api/v1/b5/materials
 */

// UC-03: Mengambil daftar materi
router.get('/', materialsController.getAllMaterials);

// UC-03: Mengambil detail materi berdasarkan ID
router.get('/:id', materialsController.getMaterialById);

// UC-02: Menambah materi baru
// TODO: Pasang middleware autentikasi (misal authenticateUser) dan otorisasi guru
// TODO: Pasang middleware upload file (misal Multer) ketika fitur lampiran file diintegrasikan
router.post('/', materialsController.createMaterial);

// UC-03: Memperbarui materi
// TODO: Pasang middleware autentikasi dan otorisasi guru
// TODO: Pasang middleware upload file jika mendukung pembaruan lampiran
router.put('/:id', materialsController.updateMaterial);

// UC-03: Menghapus materi
// TODO: Pasang middleware autentikasi dan otorisasi guru
router.delete('/:id', materialsController.deleteMaterial);

export default router;
