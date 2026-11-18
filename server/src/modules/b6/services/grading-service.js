import { supabase } from '../../../config/supabase.js';

export class GradingError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const normalizeQuestionType = (question) =>
  String(question.question_type || question.type || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const isEssay = (question) => ['ESSAY', 'ESAI'].includes(normalizeQuestionType(question));

const isAutoGradableChoice = (question) =>
  ['PILIHANGANDA', 'MULTIPLECHOICE', 'MCQ', 'BENARSALAH', 'TRUEFALSE'].includes(normalizeQuestionType(question));

const roundScore = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const gradeAttempt = async (attemptId) => {
  const { data: attempt, error: attemptError } = await supabase
    .schema('b6')
    .from('quiz_attempts')
    .select('id, quiz_id, student_id, status, submitted_at, total_score, grading_status')
    .eq('id', attemptId)
    .maybeSingle();

  if (attemptError) throw attemptError;
  if (!attempt) throw new GradingError(404, 'Attempt tidak ditemukan.');
  if (attempt.status !== 'SELESAI' || !attempt.submitted_at) {
    throw new GradingError(409, 'Attempt harus disubmit sebelum grading dapat dijalankan.');
  }

  const { data: quizQuestions, error: questionError } = await supabase
    .schema('b6')
    .from('quiz_questions')
    .select('id, question_id, points, question_order, questions(id, question_type, type, question_options(id, is_correct))')
    .eq('quiz_id', attempt.quiz_id)
    .order('question_order', { ascending: true });

  if (questionError) throw questionError;
  if (!quizQuestions?.length) throw new GradingError(422, 'Quiz tidak memiliki soal untuk dinilai.');

  const { data: answers, error: answerError } = await supabase
    .schema('b6')
    .from('student_answers')
    .select('id, question_id, score, is_correct, student_answer_options(option_id)')
    .eq('attempt_id', attemptId);

  if (answerError) throw answerError;
  const answerByQuestion = new Map((answers || []).map((answer) => [String(answer.question_id), answer]));
  const gradableQuestions = [];
  const pendingManualQuestionIds = [];

  for (const quizQuestion of quizQuestions) {
    const question = quizQuestion.questions;
    if (!question) throw new GradingError(422, `Question ${quizQuestion.question_id} tidak ditemukan.`);
    if (isEssay(question)) {
      pendingManualQuestionIds.push(quizQuestion.question_id);
      continue;
    }
    if (!isAutoGradableChoice(question)) {
      pendingManualQuestionIds.push(quizQuestion.question_id);
      continue;
    }

    const points = Number(quizQuestion.points);
    if (!Number.isFinite(points) || points <= 0) {
      throw new GradingError(422, `Points untuk question ${quizQuestion.question_id} harus lebih besar dari 0.`);
    }
    const options = question.question_options || [];
    const correctOptionIds = options.filter((option) => option.is_correct).map((option) => String(option.id)).sort();
    if (!correctOptionIds.length) {
      throw new GradingError(422, `Question ${quizQuestion.question_id} belum memiliki option benar.`);
    }
    gradableQuestions.push({ ...quizQuestion, points, correctOptionIds });
  }

  if (!gradableQuestions.length) {
    throw new GradingError(422, 'Quiz tidak memiliki soal pilihan ganda yang dapat di-auto-grade.');
  }

  const results = [];
  let earnedPoints = 0;
  let maxPoints = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  for (const quizQuestion of gradableQuestions) {
    const answer = answerByQuestion.get(String(quizQuestion.question_id));
    const selectedOptionIds = (answer?.student_answer_options || []).map((option) => String(option.option_id)).sort();
    const isCorrect = selectedOptionIds.length > 0
      && selectedOptionIds.length === quizQuestion.correctOptionIds.length
      && selectedOptionIds.every((id, index) => id === quizQuestion.correctOptionIds[index]);
    const score = isCorrect ? quizQuestion.points : 0;
    earnedPoints += score;
    maxPoints += quizQuestion.points;
    if (isCorrect) correctCount += 1;
    else incorrectCount += 1;

    const { error: saveScoreError } = await supabase
      .schema('b6')
      .from('student_answers')
      .upsert(
        { attempt_id: attemptId, question_id: quizQuestion.question_id, score, is_correct: isCorrect },
        { onConflict: 'attempt_id, question_id' },
      );
    if (saveScoreError) throw saveScoreError;

    results.push({
      question_id: quizQuestion.question_id,
      question_order: quizQuestion.question_order,
      earned_points: score,
      max_points: quizQuestion.points,
      is_correct: isCorrect,
    });
  }

  if (!Number.isFinite(maxPoints) || maxPoints <= 0) {
    throw new GradingError(422, 'Total points quiz harus lebih besar dari 0.');
  }

  const score = roundScore((earnedPoints / maxPoints) * 100);
  const isFullyAutoGradable = pendingManualQuestionIds.length === 0;
  const gradingStatus = isFullyAutoGradable ? 'SELESAI_DINILAI' : attempt.grading_status;
  let updatedAttempt = attempt;

  if (isFullyAutoGradable) {
    const { data, error: updateError } = await supabase
      .schema('b6')
      .from('quiz_attempts')
      .update({ total_score: score, grading_status: gradingStatus, correct_count: correctCount, incorrect_count: incorrectCount })
      .eq('id', attemptId)
      .select('id, quiz_id, student_id, status, submitted_at, total_score, grading_status, correct_count, incorrect_count')
      .single();
    if (updateError) throw updateError;
    updatedAttempt = data;
  }

  return {
    attempt_id: attemptId,
    earned_points: roundScore(earnedPoints),
    max_points: roundScore(maxPoints),
    score,
    total_score: isFullyAutoGradable ? updatedAttempt.total_score : null,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    grading_status: gradingStatus,
    pending_manual_question_ids: pendingManualQuestionIds,
    questions: results,
  };
};
