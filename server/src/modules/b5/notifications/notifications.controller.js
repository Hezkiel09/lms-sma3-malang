import { getNotificationsService } from './notifications.service.js';

/**
 * GET /api/v1/b5/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const data = await getNotificationsService();

    return res.status(200).json({
      success: true,
      message: 'Daftar notifikasi berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error('[getNotifications] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
};
