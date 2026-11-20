import * as quizQuestionService from '../services/quiz-question-service.js';

export const getQuestionsByQuizId = async (req, res) => {
  try {
    const { quizId } = req.params;
    const data = await quizQuestionService.getQuestionsByQuizId(quizId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar soal kuis',
      error: error.message,
    });
  }
};

export const attachQuestionToQuiz = async (req, res) => {
  try {
    const { quiz_id, question_id, question_order, points } = req.body;
    if (!quiz_id || !question_id || question_order == null || points == null) {
      return res.status(400).json({
        success: false,
        message: 'quiz_id, question_id, question_order, dan points wajib diisi',
      });
    }

    const data = await quizQuestionService.attachQuestionToQuiz({
      quiz_id,
      question_id,
      question_order,
      points,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan soal ke kuis',
      error: error.message,
    });
  }
};

export const removeQuestionFromQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await quizQuestionService.removeQuestionFromQuiz(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Soal kuis tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal melepas soal dari kuis',
      error: error.message,
    });
  }
};