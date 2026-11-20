import * as authService from './auth.service.js';

export const login = async (req, res) => {
  try {
    const { email, identifier, nis, password } = req.body;
    const loginIdentifier = identifier || nis || email;

    const result = await authService.loginService({
      identifier: loginIdentifier,
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  } catch (error) {
    const msg = error.message || '';
    const isForbidden = msg.includes('Akses ditolak');
    const isUnauthorized = msg.includes('tidak valid') || msg.includes('Invalid login credentials');
    const statusCode = isForbidden ? 403 : isUnauthorized ? 401 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getMeService(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil profil pengguna',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await authService.updateProfileService(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const result = await authService.updatePasswordService(req.user.id, newPassword);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
