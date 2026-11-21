import { supabase } from '../../../config/supabase.js';

export class AttemptError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const getStudentIdForUser = async (userId) => {
  const { data: profile, error } = await supabase.schema('master')
    .from('students').select('id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!profile) throw new AttemptError(403, 'Profil siswa tidak ditemukan.');
  return profile.id;
};

export const getAllAttempts = async ({ studentId, quizId }) => {
  let query = supabase.schema('b6').from('quiz_attempts').select('*')
    .eq('student_id', studentId).order('started_at', { ascending: false });
  if (quizId) query = query.eq('quiz_id', quizId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getAttemptById = async (id, studentId) => {
  const { data, error } = await supabase.schema('b6').from('quiz_attempts')
    .select('*').eq('id', id).eq('student_id', studentId).maybeSingle();
  if (error) throw error;
  if (!data) throw new AttemptError(404, 'Percobaan kuis tidak ditemukan.');
  return data;
};

export const createAttempt = async ({ quizId, studentId }) => {
  const { data, error } = await supabase.schema('b6').from('quiz_attempts')
    .insert({ quiz_id: quizId, student_id: studentId, status: 'SEDANG_MENGERJAKAN', grading_status: 'BELUM_MULAI' })
    .select().single();
  if (error) throw error;
  return data;
};

export const submitAttempt = async (id, studentId) => {
  const { data, error } = await supabase.schema('b6').from('quiz_attempts')
    .update({ status: 'SELESAI', submitted_at: new Date().toISOString() })
    .eq('id', id).eq('student_id', studentId).eq('status', 'SEDANG_MENGERJAKAN')
    .select().maybeSingle();
  if (error) throw error;
  if (!data) {
    const current = await getAttemptById(id, studentId);
    throw new AttemptError(409, current.status === 'SELESAI' ? 'Attempt sudah disubmit.' : 'Attempt tidak dapat disubmit.');
  }
  return data;
};

const getRecapActor = async (userId) => {
  const { data: user, error } = await supabase.schema('master').from('users')
    .select('role').eq('id', userId).maybeSingle();
  if (error) throw error;
  if (!user || !['admin', 'teacher'].includes(user.role)) {
    throw new AttemptError(403, 'Hanya guru atau admin yang dapat melihat rekap hasil.');
  }
  if (user.role === 'admin') return { role: 'admin', teacherId: null };

  const { data: teacher, error: teacherError } = await supabase.schema('master').from('teachers')
    .select('id').eq('user_id', userId).maybeSingle();
  if (teacherError) throw teacherError;
  if (!teacher) throw new AttemptError(403, 'Profil guru tidak ditemukan.');
  return { role: 'teacher', teacherId: teacher.id };
};

const getRecapQuiz = async (quizId, actor) => {
  const { data: quiz, error } = await supabase.schema('b6').from('quizzes')
    .select('id, title, description, status, teacher_id, class_id, duration_minutes, passing_grade, start_at, end_at')
    .eq('id', quizId).maybeSingle();
  if (error) throw error;
  if (!quiz) throw new AttemptError(404, 'Kuis tidak ditemukan.');
  if (actor.role === 'teacher' && String(quiz.teacher_id) !== String(actor.teacherId)) {
    throw new AttemptError(403, 'Guru hanya dapat melihat rekap kuis miliknya.');
  }
  return quiz;
};

export const getRecapQuizzes = async (userId) => {
  const actor = await getRecapActor(userId);
  let query = supabase.schema('b6').from('quizzes')
    .select('id, title, status, duration_minutes, passing_grade, start_at, end_at')
    .order('created_at', { ascending: false });
  if (actor.role === 'teacher') query = query.eq('teacher_id', actor.teacherId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getQuizAttemptRecap = async (quizId, userId) => {
  if (!quizId) throw new AttemptError(400, 'quiz_id wajib diisi.');
  const actor = await getRecapActor(userId);
  const quiz = await getRecapQuiz(quizId, actor);
  const { data: attempts, error } = await supabase.schema('b6').from('quiz_attempts')
    .select('id, quiz_id, student_id, status, total_score, correct_count, incorrect_count, started_at, submitted_at, grading_status')
    .eq('quiz_id', quizId).order('started_at', { ascending: false });
  if (error) throw error;

  const studentIds = [...new Set((attempts || []).map((attempt) => attempt.student_id).filter(Boolean))];
  const profileQueries = [];
  if (studentIds.length) {
    profileQueries.push(
      supabase.schema('master').from('students')
        .select('id, name, nis, class_id').in('id', studentIds),
    );
  }
  if (quiz.class_id) {
    profileQueries.push(
      supabase.schema('master').from('students')
        .select('id, name, nis, class_id').eq('class_id', quiz.class_id),
    );
  }
  const profileResults = await Promise.all(profileQueries);
  const profiles = profileResults.flatMap(({ data, error }) => {
    if (error) throw error;
    return data || [];
  });
  const profileById = new Map(profiles.map((profile) => [String(profile.id), profile]));
  return {
    quiz,
    students: [...profileById.values()],
    attempts: (attempts || []).map((attempt) => ({
      ...attempt,
      student: profileById.get(String(attempt.student_id)) || null,
    })),
  };
};

export const getAttemptRecapDetail = async (attemptId, userId) => {
  const actor = await getRecapActor(userId);
  const { data: attempt, error: attemptError } = await supabase.schema('b6').from('quiz_attempts')
    .select('id, quiz_id, student_id, status, total_score, correct_count, incorrect_count, started_at, submitted_at, grading_status')
    .eq('id', attemptId).maybeSingle();
  if (attemptError) throw attemptError;
  if (!attempt) throw new AttemptError(404, 'Attempt tidak ditemukan.');
  const quiz = await getRecapQuiz(attempt.quiz_id, actor);

  const [{ data: quizQuestions, error: questionError }, { data: answers, error: answerError }, { data: student, error: studentError }] = await Promise.all([
    supabase.schema('b6').from('quiz_questions')
      .select('id, question_id, points, question_order, questions(id, question_text, question_type, type, question_options(id, option_label, option_text, is_correct))')
      .eq('quiz_id', attempt.quiz_id).order('question_order', { ascending: true }),
    supabase.schema('b6').from('student_answers')
      .select('*, student_answer_options(option_id)').eq('attempt_id', attemptId),
    supabase.schema('master').from('students').select('id, name, nis').eq('id', attempt.student_id).maybeSingle(),
  ]);
  if (questionError) throw questionError;
  if (answerError) throw answerError;
  if (studentError) throw studentError;

  const answerByQuestion = new Map((answers || []).map((answer) => [String(answer.question_id), answer]));
  const questions = (quizQuestions || []).map((quizQuestion) => {
    const question = quizQuestion.questions || {};
    const options = question.question_options || [];
    const answer = answerByQuestion.get(String(quizQuestion.question_id));
    const selectedOptionIds = (answer?.student_answer_options || []).map((row) => String(row.option_id));
    const optionById = new Map(options.map((option) => [String(option.id), option]));
    const selectedOptions = selectedOptionIds.map((id) => optionById.get(id)).filter(Boolean)
      .map(({ id, option_label, option_text }) => ({ id, option_label, option_text }));
    const correctOptions = options.filter((option) => option.is_correct)
      .map(({ id, option_label, option_text }) => ({ id, option_label, option_text }));
    return {
      question_id: quizQuestion.question_id,
      question_order: quizQuestion.question_order,
      question_text: question.question_text,
      question_type: question.question_type || question.type || null,
      points: quizQuestion.points,
      answer: answer ? {
        text_answer: answer.text_answer ?? answer.answer_text ?? null,
        option_ids: selectedOptionIds,
        options: selectedOptions,
        score: answer.score ?? null,
        is_correct: answer.is_correct ?? null,
      } : null,
      correct_answer: correctOptions.length ? { option_ids: correctOptions.map((option) => option.id), options: correctOptions } : null,
    };
  });

  return { quiz, attempt: { ...attempt, student: student || null }, questions };
};
