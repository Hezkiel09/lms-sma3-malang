import { supabase } from '../../../config/supabase.js';

export const getQuestionsByQuizId = async (quizId) => {
  const { data, error } = await supabase
    .schema('b6')
    .from('quiz_questions')
    .select('id, quiz_id, question_id, points, question_order, questions(id, question_text, question_type, image_url, options:question_options(id, option_label, option_text))')
    .eq('quiz_id', quizId)
    .order('question_order', { ascending: true });

  if (error) throw error;
  return data;
};

export const attachQuestionToQuiz = async ({ quiz_id, question_id, question_order, points }) => {
  const { data, error } = await supabase
    .schema('b6')
    .from('quiz_questions')
    .insert([{ quiz_id, question_id, question_order, points }])
    .select('*, questions(*, options:question_options(*))')
    .single();

  if (error) throw error;
  return data;
};

export const removeQuestionFromQuiz = async (id) => {
  const { data, error } = await supabase
    .schema('b6')
    .from('quiz_questions')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};
