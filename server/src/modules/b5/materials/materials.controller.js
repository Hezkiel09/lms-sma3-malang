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
    if (error.statusCode === 404 || error.message?.includes('tidak ditemukan')) {
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
 * Controller untuk memperbarui informasi materi dan/atau menambahkan file baru (UC-03)
 * Endpoint: PUT /api/v1/b5/materials/:id
 */
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format Material ID tidak valid.',
      });
    }

    const { title, description } = req.body;
    let status = req.body.status;
    if (status === 'publikasi') status = 'published';

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Judul materi tidak boleh kosong.',
        });
      }
      if (title.trim().length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Judul materi maksimal 255 karakter.',
        });
      }
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Deskripsi materi harus berupa teks.',
      });
    }

    if (status !== undefined && !['draft', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status materi hanya boleh bernilai 'draft' atau 'published'.",
      });
    }

    const updatedMaterial = await materialsService.updateMaterialService(id, {
      title,
      description,
      status,
      files: req.files || [],
    });

    return res.status(200).json({
      success: true,
      message: 'Materi berhasil diperbarui.',
      data: updatedMaterial,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message?.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error updating material:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat memperbarui materi.',
    });
  }
};

/**
 * Controller untuk mengubah nama satu lampiran (UC-03)
 * Endpoint: PATCH /api/v1/b5/materials/:id/files/:fileId
 */
export const renameMaterialFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format Material ID tidak valid.',
      });
    }

    if (!isValidUUID(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Format File ID tidak valid.',
      });
    }

    const rawFileName = req.body.file_name ?? req.body.fileName ?? req.body.name;

    if (typeof rawFileName !== 'string' || !rawFileName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama file baru wajib diisi.',
      });
    }

    const trimmedFileName = rawFileName.trim();
    if (trimmedFileName.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Nama file maksimal 255 karakter.',
      });
    }

    const updatedFile = await materialsService.renameMaterialFileService(id, fileId, trimmedFileName);

    return res.status(200).json({
      success: true,
      message: 'Nama lampiran berhasil diperbarui.',
      data: updatedFile,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message?.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error renaming material file:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengubah nama lampiran.',
    });
  }
};

/**
 * Controller untuk menghapus satu lampiran (UC-03)
 * Endpoint: DELETE /api/v1/b5/materials/:id/files/:fileId
 */
export const deleteMaterialFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format Material ID tidak valid.',
      });
    }

    if (!isValidUUID(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Format File ID tidak valid.',
      });
    }

    const result = await materialsService.deleteMaterialFileService(id, fileId);

    return res.status(200).json({
      success: true,
      message: 'Lampiran berhasil dihapus.',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message?.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error deleting material file:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat menghapus lampiran.',
    });
  }
};

/**
 * Controller untuk menghapus seluruh materi beserta seluruh lampirannya (UC-03)
 * Endpoint: DELETE /api/v1/b5/materials/:id
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format Material ID tidak valid.',
      });
    }

    const deletedMaterial = await materialsService.deleteMaterialService(id);

    return res.status(200).json({
      success: true,
      message: 'Materi beserta seluruh lampirannya berhasil dihapus.',
      data: deletedMaterial,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message?.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error deleting material:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat menghapus materi.',
    });
  }
};
