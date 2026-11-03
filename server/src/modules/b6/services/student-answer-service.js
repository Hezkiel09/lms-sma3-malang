import { supabase } from '../../../config/supabase.js';

export const saveStudentAnswer = async ({
  student_id,
  attempt_id,
  question_id,
  text_answer,
  option_ids,
}) => {
  const { data: answer, error } = await supabase
    .schema('b6')
    .from('student_answers')
    .upsert(
      { student_id, attempt_id, question_id, text_answer: text_answer ?? null },
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

export const getAnswersByAttemptId = async (attemptId) => {
  const { data, error } = await supabase
    .schema('b6')
    .from('student_answers')
    .select('*, student_answer_options(option_id)')
    .eq('attempt_id', attemptId);

  if (error) throw error;
  return data;
};