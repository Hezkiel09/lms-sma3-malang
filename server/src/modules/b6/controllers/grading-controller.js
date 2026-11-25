import { supabase } from '../../../config/supabase.js';
import { gradeAttempt, GradingError } from '../services/grading-service.js';

export const gradeAttemptController = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { data: attempt, error: attemptError } = await supabase
      .schema('b6')
      .from('quiz_attempts')
      .select('id, quiz_id')
      .eq('id', attemptId)
      .maybeSingle();

    if (attemptError) throw attemptError;
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt tidak ditemukan.' });

    const { data: user, error: userError } = await supabase
      .schema('master')
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle();
    if (userError) throw userError;
    if (!user || !['admin', 'teacher'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Hanya guru pemilik quiz atau admin yang dapat menjalankan grading.' });
    }

    if (user.role === 'teacher') {
      const { data: teacher, error: teacherError } = await supabase
        .schema('master')
        .from('teachers')
        .select('id')
        .eq('user_id', req.user.id)
        .maybeSingle();
      if (teacherError) throw teacherError;
      if (!teacher) return res.status(403).json({ success: false, message: 'Profil guru tidak ditemukan.' });

      const { data: quiz, error: quizError } = await supabase
        .schema('b6')
        .from('quizzes')
        .select('teacher_id')
        .eq('id', attempt.quiz_id)
        .maybeSingle();
      if (quizError) throw quizError;
      if (!quiz || String(quiz.teacher_id) !== String(teacher.id)) {
        return res.status(403).json({ success: false, message: 'Guru hanya dapat menilai quiz miliknya.' });
      }
    }

    const result = await gradeAttempt(attemptId);
    return res.status(200).json({ success: true, message: 'Grading berhasil dihitung.', data: result });
  } catch (error) {
    const status = error instanceof GradingError ? error.statusCode : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Gagal menjalankan grading.',
    });
  }
};
