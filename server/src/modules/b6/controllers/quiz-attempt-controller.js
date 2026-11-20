import * as attemptService from '../services/quiz-attempt-service.js';

const respondError = (res, error, fallback) => res.status(error.statusCode || 500).json({
  success: false,
  message: error.message || fallback,
});

const studentId = (req) => attemptService.getStudentIdForUser(req.user.id);

export const getAllAttempts = async (req, res) => {
  try {
    const id = await studentId(req);
    const data = await attemptService.getAllAttempts({ studentId: id, quizId: req.query.quiz_id });
    return res.status(200).json({ success: true, message: 'Berhasil mengambil daftar percobaan kuis', data });
  } catch (error) { return respondError(res, error, 'Gagal mengambil daftar percobaan kuis'); }
};

export const getAttemptById = async (req, res) => {
  try {
    const data = await attemptService.getAttemptById(req.params.id, await studentId(req));
    return res.status(200).json({ success: true, message: 'Berhasil mengambil detail percobaan kuis', data });
  } catch (error) { return respondError(res, error, 'Gagal mengambil detail percobaan kuis'); }
};

export const createAttempt = async (req, res) => {
  try {
    if (!req.body.quiz_id) return res.status(400).json({ success: false, message: 'quiz_id wajib diisi' });
    const data = await attemptService.createAttempt({ quizId: req.body.quiz_id, studentId: await studentId(req) });
    return res.status(201).json({ success: true, message: 'Berhasil memulai kuis', data });
  } catch (error) { return respondError(res, error, 'Gagal memulai kuis'); }
};

// PUT and PATCH are kept for compatibility; both are an explicit submit action.
export const updateAttempt = async (req, res) => {
  try {
    if (req.body.status !== 'SELESAI' || Object.keys(req.body).some((key) => key !== 'status')) {
      return res.status(400).json({ success: false, message: 'Request hanya boleh mengirim status: SELESAI untuk submit attempt.' });
    }
    const data = await attemptService.submitAttempt(req.params.id, await studentId(req));
    return res.status(200).json({ success: true, message: 'Attempt berhasil disubmit', data });
  } catch (error) { return respondError(res, error, 'Gagal submit attempt'); }
};

export const deleteAttempt = async (req, res) => res.status(405).json({
  success: false,
  message: 'Attempt tidak dapat dihapus melalui API Student.',
});
