import * as materialsService from './materials.service.js';
import { isValidUUID } from '../../../utils/validation.js';

/**
 * Controller untuk mengambil daftar materi
 * Endpoint: GET /api/v1/b5/materials
 */
export const getAllMaterials = async (req, res) => {
  try {
    const { subject_id, teacher_id } = req.query;
    const materials = await materialsService.getAllMaterialsService({ subject_id, teacher_id });

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar materi',
      data: materials,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar materi',
      error: error.message,
    });
  }
};

/**
 * Controller untuk mengambil daftar materi dalam sebuah Course (berdasarkan Section)
 * Endpoint: GET /api/v1/b5/courses/:courseId/materials
 *
 * Catatan Keamanan:
 * TODO: Pasang middleware autentikasi dan otorisasi sebelum deployment publik.
 */
export const getMaterialsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Validasi format UUID
    if (!isValidUUID(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Format Course ID tidak valid',
      });
    }

    // 2. Ambil data materi melalui service
    const materials = await materialsService.getMaterialsByCourseIdService(courseId);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar materi',
      data: materials,
    });
  } catch (error) {
    if (error.statusCode === 404 || error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error fetching course materials:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil daftar materi',
    });
  }
};

/**
 * Controller untuk mengambil detail materi berdasarkan ID
 * Endpoint: GET /api/v1/b5/materials/:id
 */
export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await materialsService.getMaterialByIdService(id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail materi',
      data: material,
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail materi',
      error: error.message,
    });
  }
};

/**
 * Controller untuk menambah materi baru (UC-02)
 * Endpoint: POST /api/v1/b5/materials
 */
export const createMaterial = async (req, res) => {
  try {
    const { teacher_id, title, description, subject_id, class_ids, files } = req.body;

    // Validasi input minimal
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Judul materi wajib diisi!',
      });
    }

    if (!subject_id) {
      return res.status(400).json({
        success: false,
        message: 'Mata pelajaran (subject_id) wajib dipilih!',
      });
    }

    // TODO: Autentikasi & Otorisasi
    // Saat ini teacher_id diambil dari body. Jika authMiddleware terintegrasi:
    // teacher_id harus diverifikasi dari profil guru pengguna yang sedang login (bukan sembarang ID dari body).
    if (!teacher_id) {
      return res.status(400).json({
        success: false,
        message: 'ID Guru (teacher_id) wajib diisi!',
      });
    }

    // TODO: Keputusan kolom 'status' (Publikasi Langsung vs Simpan Draf)
    // Kolom 'status' belum tersedia di schema b5.materials.

    const newMaterial = await materialsService.createMaterialService({
      teacher_id,
      title,
      description,
      subject_id,
      class_ids,
      files,
    });

    return res.status(201).json({
      success: true,
      message: 'Berhasil menambahkan materi baru',
      data: newMaterial,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan materi baru',
      error: error.message,
    });
  }
};

/**
 * Controller untuk memperbarui materi (UC-03)
 * Endpoint: PUT /api/v1/b5/materials/:id
 */
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject_id, class_ids } = req.body;

    const updatedMaterial = await materialsService.updateMaterialService(id, {
      title,
      description,
      subject_id,
      class_ids,
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil memperbarui materi',
      data: updatedMaterial,
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui materi',
      error: error.message,
    });
  }
};

/**
 * Controller untuk menghapus materi (UC-03)
 * Endpoint: DELETE /api/v1/b5/materials/:id
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMaterial = await materialsService.deleteMaterialService(id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil menghapus materi',
      data: deletedMaterial,
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus materi',
      error: error.message,
    });
  }
};
