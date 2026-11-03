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

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format Material ID tidak valid.',
      });
    }

    const material = await materialsService.getMaterialByIdService(id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail materi.',
      data: material,
    });
  } catch (error) {
    if (error.statusCode === 404 || error.message?.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error fetching material detail:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil detail materi.',
    });
  }
};

/**
 * Controller untuk menambah materi baru (UC-02)
 * Endpoint: POST /api/v1/b5/materials
 * Sementara belum memakai autentikasi karena fitur login belum dikerjakan.
 */
export const createMaterial = async (req, res) => {
  try {
    const { section_id, title, description } = req.body;
    // Kompatibel dengan nilai radio lama di frontend ('publikasi').
    const requestedStatus = req.body.status ?? 'draft';
    const status = requestedStatus === 'publikasi' ? 'published' : requestedStatus;

    if (!section_id || !isValidUUID(section_id)) {
      return res.status(400).json({
        success: false,
        message: 'Section ID wajib diisi dengan format UUID yang valid.',
      });
    }

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Judul materi wajib diisi.',
      });
    }

    if (title.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Judul materi maksimal 255 karakter.',
      });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Deskripsi materi harus berupa teks.',
      });
    }

    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status materi hanya boleh bernilai 'draft' atau 'published'.",
      });
    }

    const newMaterial = await materialsService.createMaterialService({
      sectionId: section_id,
      title,
      description,
      status,
      files: req.files || [],
    });

    return res.status(201).json({
      success: true,
      message: status === 'published'
        ? 'Materi berhasil dipublikasikan.'
        : 'Materi berhasil disimpan sebagai draf.',
      data: newMaterial,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error creating material:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat menambahkan materi.',
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
