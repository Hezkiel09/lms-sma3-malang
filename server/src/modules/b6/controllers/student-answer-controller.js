import * as studentAnswerService from '../services/student-answer-service.js';
import * as attemptService from '../services/quiz-attempt-service.js';

const fail = (res, error, fallback) => res.status(error.statusCode || 500).json({
  success: false,
  message: error.message || fallback,
});

export const saveStudentAnswer = async (req, res) => {
  try {
    const { attempt_id, question_id, text_answer, option_ids } = req.body;
    if (!attempt_id || !question_id) {
      return res.status(400).json({
        success: false,
        message: 'attempt_id dan question_id wajib diisi',
      });
    }
    if (option_ids !== undefined && !Array.isArray(option_ids)) {
      return res.status(400).json({
        success: false,
        message: 'option_ids harus berupa array',
      });
    }

    const data = await studentAnswerService.saveStudentAnswer({
      student_id: await attemptService.getStudentIdForUser(req.user.id),
      attempt_id,
      question_id,
      text_answer,
      option_ids,
    });
    return res.status(200).json({ success: true, message: 'Jawaban berhasil disimpan', data });
  } catch (error) { return fail(res, error, 'Gagal menyimpan jawaban siswa'); }
};

export const getAnswersByAttemptId = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const id = await attemptService.getStudentIdForUser(req.user.id);
    const data = await studentAnswerService.getAnswersByAttemptId(attemptId, id);
    return res.status(200).json({ success: true, data });
  } catch (error) { return fail(res, error, 'Gagal mengambil jawaban percobaan kuis'); }
};
