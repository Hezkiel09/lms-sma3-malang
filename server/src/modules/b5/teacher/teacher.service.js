import { supabaseAdmin } from '../../../config/supabase.js';
import { isValidUUID } from '../../../utils/validation.js';

// ID Guru default jika user belum login via session auth
const DEFAULT_TEACHER_ID = 'd6ccb24b-e097-469d-bd8c-b0dedc66794d'; // Siti Rahmawati, S.Pd. / NIP 198807202012012003

/**
 * Service: ambil profil guru beserta akun user institusinya.
 * GET /api/v1/b5/teacher/profile
 */
export const getTeacherProfileService = async (teacherId = DEFAULT_TEACHER_ID) => {
  // 1. Ambil data guru dari master.teachers
  let query = supabaseAdmin
    .schema('master')
    .from('teachers')
    .select('id, user_id, nip, name, phone');

  if (teacherId && isValidUUID(teacherId)) {
    query = query.eq('id', teacherId);
  } else {
    query = query.eq('id', DEFAULT_TEACHER_ID);
  }

  const { data: teacher, error } = await query.maybeSingle();

  if (error) throw error;

  let userData = null;
  if (teacher?.user_id) {
    const { data: user } = await supabaseAdmin
      .schema('master')
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', teacher.user_id)
      .maybeSingle();
    userData = user;
  }

  const profile = {
    id: teacher?.id || DEFAULT_TEACHER_ID,
    name: teacher?.name || 'Karina, S.Pd.',
    nip: teacher?.nip || '198807202012012003',
    phone: teacher?.phone || '081234567890',
    email: userData?.email || 'karina@sman3malang.sch.id',
    role: userData?.role || 'teacher',
    subject: 'Guru Mata Pelajaran Matematika',
    school: 'SMAN 3 Malang',
    status: 'Aktif Mengajar',
    avatar_url: null,
  };

  return profile;
};

/**
 * Service: perbarui profil guru (misal nomor telepon atau nama).
 * PUT /api/v1/b5/teacher/profile
 */
export const updateTeacherProfileService = async (teacherId = DEFAULT_TEACHER_ID, { phone, name }) => {
  const targetId = teacherId && isValidUUID(teacherId) ? teacherId : DEFAULT_TEACHER_ID;

  const updateData = {};
  if (phone !== undefined) updateData.phone = String(phone).trim();
  if (name !== undefined) updateData.name = String(name).trim();

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabaseAdmin
      .schema('master')
      .from('teachers')
      .update(updateData)
      .eq('id', targetId);

    if (error) throw error;
  }

  return await getTeacherProfileService(targetId);
};
