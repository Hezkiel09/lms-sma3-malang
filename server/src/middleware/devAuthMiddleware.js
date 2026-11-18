import { supabaseAdmin } from '../config/supabase.js';
import { isValidUUID } from '../utils/validation.js';

const FALLBACK_STUDENT_ID =
  process.env.DEFAULT_TEST_STUDENT_ID || 'bf975a8d-8230-483c-aa88-01ee4c46c918';
const FALLBACK_CLASS_ID =
  process.env.DEFAULT_TEST_STUDENT_CLASS_ID || '536f8ac3-95ad-412f-8d77-bdbb44e47f69';
const FALLBACK_TEACHER_ID =
  process.env.DEFAULT_TEST_TEACHER_ID || 'd6ccb24b-e097-469d-bd8c-b0dedc66794d';

/**
 * Middleware: Dev-Auth & Context Provider untuk Rute Siswa
 * Menetapkan konteks identitas siswa pada req.user.
 * Siap disambungkan ke JWT Auth asli tanpa perlu merombak controller/service.
 */
export const studentAuthMiddleware = async (req, res, next) => {
  try {
    // 1. Cek header JWT Authorization di masa depan jika ada
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Struktur placeholder untuk token JWT jika tim auth sudah selesai
      // const token = authHeader.split(' ')[1];
    }

    // 2. Baca x-student-id dari headers atau fallback default
    const headerStudentId = req.headers['x-student-id'];
    const studentId =
      headerStudentId && isValidUUID(headerStudentId)
        ? headerStudentId
        : FALLBACK_STUDENT_ID;

    // 3. Ambil data siswa dari master.students
    const { data: student, error: studentError } = await supabaseAdmin
      .schema('master')
      .from('students')
      .select('id, user_id, nis, name, class_id')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) {
      console.warn('[studentAuthMiddleware] Gagal mengambil data siswa:', studentError.message);
    }

    // 4. Ambil data kelas
    const effectiveClassId =
      req.headers['x-student-class-id'] ||
      process.env.DEFAULT_TEST_STUDENT_CLASS_ID ||
      student?.class_id ||
      FALLBACK_CLASS_ID;

    let classData = null;
    if (effectiveClassId) {
      const { data: cls } = await supabaseAdmin
        .schema('master')
        .from('classes')
        .select('id, name, level, major')
        .eq('id', effectiveClassId)
        .maybeSingle();
      classData = cls;
    }

    // 5. Ambil data user institusi
    let userData = null;
    if (student?.user_id) {
      const { data: usr } = await supabaseAdmin
        .schema('master')
        .from('users')
        .select('id, email, role')
        .eq('id', student.user_id)
        .maybeSingle();
      userData = usr;
    }

    req.user = {
      role: 'student',
      id: student?.id || studentId,
      studentId: student?.id || studentId,
      name: student?.name || 'Rafi Aditya Pratama',
      nis: student?.nis || '2026101',
      classId: effectiveClassId,
      className: classData?.name || 'X-A',
      email: userData?.email || 'student@smanti.sch.id',
      phone: '081234567890',
    };

    next();
  } catch (err) {
    console.error('[studentAuthMiddleware] Error:', err);
    next(err);
  }
};
