import * as studentAnswerService from '../services/student-answer-service.js';

export const saveStudentAnswer = async (req, res) => {
  try {
    const { student_id, attempt_id, question_id, text_answer, option_ids } = req.body;
    if (!student_id || !attempt_id || !question_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id, attempt_id, dan question_id wajib diisi',
      });
    }
    if (option_ids !== undefined && !Array.isArray(option_ids)) {
      return res.status(400).json({
        success: false,
        message: 'option_ids harus berupa array',
      });
    }

    const data = await studentAnswerService.saveStudentAnswer({
      student_id,
      attempt_id,
      question_id,
      text_answer,
      option_ids,
    });
    return res.status(200).json({ success: true, message: 'Jawaban berhasil disimpan', data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan jawaban siswa',
      error: error.message,
    });
  }
};

export const getAnswersByAttemptId = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const data = await studentAnswerService.getAnswersByAttemptId(attemptId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil jawaban percobaan kuis',
      error: error.message,
    });
  }
};