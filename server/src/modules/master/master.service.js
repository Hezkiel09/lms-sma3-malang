import { supabase } from '../../config/supabase.js';

export const getAllClasses = async () => {
  return await supabase.schema('master').from('classes').select('*');
};

export const createClass = async (payload) => {
  return await supabase.schema('master').from('classes').insert([payload]).select();
};

export const updateClass = async (id, payload) => {
  return await supabase.schema('master').from('classes').update(payload).eq('id', id).select();
};

export const deleteClass = async (id) => {
  return await supabase.schema('master').from('classes').delete().eq('id', id);
};

export const getAllSubjects = async () => {
  return await supabase.schema('master').from('subjects').select('*');
};

export const createSubject = async (payload) => {
  return await supabase.schema('master').from('subjects').insert([payload]).select();
};

export const updateSubject = async (id, payload) => {
  return await supabase.schema('master').from('subjects').update(payload).eq('id', id).select();
};

export const deleteSubject = async (id) => {
  return await supabase.schema('master').from('subjects').delete().eq('id', id);
};

