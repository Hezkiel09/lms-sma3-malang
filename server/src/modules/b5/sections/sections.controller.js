import * as sectionsService from './sections.service.js';
import { isValidUUID } from '../../../utils/validation.js';

/**
 * Controller untuk mengambil seluruh Section dalam sebuah Course
 * Endpoint: GET /api/v1/b5/courses/:courseId/sections
 *
 * Catatan Keamanan:
 * TODO: Pasang middleware autentikasi dan otorisasi sebelum deployment publik.
 */
export const getSectionsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Validasi format UUID
    if (!isValidUUID(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Format Course ID tidak valid',
      });
    }

    // 2. Ambil data Section melalui service
    const sections = await sectionsService.getSectionsByCourseIdService(courseId);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar Section',
      data: sections,
    });
  } catch (error) {
    if (error.statusCode === 404 || error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error fetching course sections:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil daftar Section',
    });
  }
};

