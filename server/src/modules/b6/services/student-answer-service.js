import { supabase } from '../../../config/supabase.js';
import { AttemptError } from './quiz-attempt-service.js';

export const saveStudentAnswer = async ({
  student_id,
  attempt_id,
  question_id,
  option_ids,
}) => {
  // The answer row is linked to its student through quiz_attempts; the
  // student_answers table itself has no student_id column.
  const { data: attempt, error: attemptError } = await supabase
    .schema('b6')
    .from('quiz_attempts')
    .select('student_id, status')
    .eq('id', attempt_id)
    .single();

  if (attemptError?.code === 'PGRST116') throw new AttemptError(404, 'Attempt tidak ditemukan.');
  if (attemptError) throw attemptError;
  if (attempt.student_id !== student_id) {
    throw new AttemptError(403, 'Attempt bukan milik siswa yang sedang login.');
  }
  if (attempt.status !== 'SEDANG_MENGERJAKAN') throw new AttemptError(409, 'Jawaban hanya dapat disimpan saat attempt sedang dikerjakan.');

  const { data: answer, error } = await supabase
    .schema('b6')
    .from('student_answers')
    .upsert(
      { attempt_id, question_id },
      { onConflict: 'attempt_id, question_id' },
    )
    .select()
    .single();

  if (error) throw error;

  if (option_ids !== undefined) {
    const { error: deleteError } = await supabase
      .schema('b6')
      .from('student_answer_options')
      .delete()
      .eq('student_answer_id', answer.id);

    if (deleteError) throw deleteError;

    if (option_ids.length > 0) {
      const optionRows = option_ids.map((option_id) => ({
        student_answer_id: answer.id,
        option_id,
      }));
      const { error: insertError } = await supabase
        .schema('b6')
        .from('student_answer_options')
        .insert(optionRows);

      if (insertError) throw insertError;
    }
  }

  return {
    ...answer,
    ...(option_ids !== undefined ? { option_ids } : {}),
  };
};

export const getAnswersByAttemptId = async (attemptId, studentId) => {
  const { data: attempt, error: attemptError } = await supabase.schema('b6')
    .from('quiz_attempts').select('student_id').eq('id', attemptId).maybeSingle();
  if (attemptError) throw attemptError;
  if (!attempt) throw new AttemptError(404, 'Attempt tidak ditemukan.');
  if (String(attempt.student_id) !== String(studentId)) throw new AttemptError(403, 'Attempt bukan milik siswa yang sedang login.');
  const { data, error } = await supabase
    .schema('b6')
    .from('student_answers')
    .select('*, student_answer_options(option_id)')
    .eq('attempt_id', attemptId);

  if (error) throw error;
  return data;
};
