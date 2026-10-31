import { supabase } from '../../../config/supabase.js';

/**
 * Service untuk mengambil daftar Section dalam sebuah Course
 * @param {string} courseId - UUID dari Course
 * @returns {Promise<Array>} Daftar Section diurutkan berdasarkan position ascending
 */
export const getSectionsByCourseIdService = async (courseId) => {
  // 1. Periksa keberadaan Course melalui view master.course_details
  const { data: course, error: courseError } = await supabase
    .schema('master')
    .from('course_details')
    .select('id')
    .eq('id', courseId)
    .maybeSingle();

  if (courseError) {
    throw courseError;
  }

  if (!course) {
    const notFoundError = new Error('Course tidak ditemukan');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  // 2. Ambil Section dari master.course_sections berdasarkan course_id
  const { data: sections, error: sectionsError } = await supabase
    .schema('master')
    .from('course_sections')
    .select('id, course_id, title, description, position, created_at')
    .eq('course_id', courseId)
    .order('position', { ascending: true });

  if (sectionsError) {
    throw sectionsError;
  }

  return sections || [];
};

