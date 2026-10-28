import { supabaseAdmin } from '../../config/supabase.js';
import { httpError } from './b8.http.js';

export const master = () => supabaseAdmin.schema('master');
export const b8 = () => supabaseAdmin.schema('b8');

// Ambil data dari hasil query; lempar error HTTP kalau gagal.
export const unwrap = ({ data, error }) => {
  if (error) {
    if (error.code === '23505') throw httpError(409, 'Data sudah ada (duplikat).');
    if (error.code === '22P02') throw httpError(422, 'Format id tidak valid.');
    throw httpError(500, error.message);
  }
  return data;
};