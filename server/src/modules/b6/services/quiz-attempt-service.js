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
