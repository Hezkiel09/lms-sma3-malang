import { supabase, supabaseAdmin } from '../../config/supabase.js';

// --- KELAS ---
export const getAllClassesService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('classes')
    .select(`
      id,
      name,
      level,
      major,
      teachers!classes_homeroom_teacher_id_fkey(id, name, nip),
      students(count)
    `)
    .order('name', { ascending: true });

  if (error) {
    // Fallback jika relasi homeroom teacher atau count student mengalami kendala schema
    const { data: fallbackData, error: fallbackError } = await supabase
      .schema('master')
      .from('classes')
      .select('id, name, level, major, homeroom_teacher_id')
      .order('name', { ascending: true });

    if (fallbackError) throw fallbackError;
    return (fallbackData || []).map((cls) => ({ ...cls, total_students: 0 }));
  }

  return (data || []).map(({ students, ...classData }) => ({
    ...classData,
    total_students: Number(students?.[0]?.count ?? 0),
  }));
};

export const createClassService = async ({ name, level, major, homeroom_teacher_id }) => {
  const { data, error } = await supabase
    .schema('master')
    .from('classes')
    .insert([{ name, level, major, homeroom_teacher_id: homeroom_teacher_id || null }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteClassService = async (id) => {
  const { data, error } = await supabase
    .schema('master')
    .from('classes')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle(); 
  if (error) throw error;
  
  
  if (!data) {
    throw new Error('Kelas tidak ditemukan atau gagal dihapus');
  }

  return data;
};

export const updateHomeroomTeacherService = async (classId, homeroom_teacher_id) => {
  const { data, error } = await supabase
    .schema('master')
    .from('classes')
    .update({ homeroom_teacher_id: homeroom_teacher_id || null })
    .eq('id', classId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateClassService = async (id, payload) => {
  const allowed = ['name', 'level', 'major', 'homeroom_teacher_id'];
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([k]) => allowed.includes(k)),
  );
  if (updates.homeroom_teacher_id === '') updates.homeroom_teacher_id = null;
  const { data, error } = await supabase
    .schema('master')
    .from('classes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- MATA PELAJARAN ---
export const getAllSubjectsService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

export const createSubjectService = async (subject) => {
  const name = typeof subject === 'string' ? subject : subject?.name;
  if (!name || !String(name).trim()) {
    throw new Error('Nama mata pelajaran wajib diisi');
  }

  // Catatan: Skema tabel master.subjects pada database PostgreSQL hanya memiliki kolom `id` dan `name`
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .insert([{ name: String(name).trim() }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSubjectService = async (id, payload) => {
  const name = typeof payload === 'string' ? payload : payload?.name;
  if (!name || !String(name).trim()) {
    throw new Error('Nama mata pelajaran tidak boleh kosong');
  }

  // Catatan: Skema tabel master.subjects pada database PostgreSQL hanya memiliki kolom `id` dan `name`
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .update({ name: String(name).trim() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Mata pelajaran tidak ditemukan');
  return data;
};

export const deleteSubjectService = async (id) => {
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Mata pelajaran tidak ditemukan');
  return data;
};

// --- JADWAL PELAJARAN ---
const scheduleSelect = `
  id,
  class_id,
  subject_id,
  teacher_id,
  day,
  start_time,
  end_time,
  classes:classes!schedules_class_id_fkey(id, name, level, major),
  subjects:subjects!schedules_subject_id_fkey(id, name),
  teachers:teachers!schedules_teacher_id_fkey(id, name, nip)
`;

export const getAllSchedulesService = async (classId) => {
  let query = supabase
    .schema('master')
    .from('schedules')
    .select(scheduleSelect)
    .order('day', { ascending: true })
    .order('start_time', { ascending: true });

  if (classId) query = query.eq('class_id', classId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createScheduleService = async (payload) => {
  const fields = ['class_id', 'subject_id', 'teacher_id', 'day', 'start_time', 'end_time'];
  const schedule = Object.fromEntries(
    Object.entries(payload).filter(([key]) => fields.includes(key)),
  );
  const { data, error } = await supabase
    .schema('master')
    .from('schedules')
    .insert([schedule])
    .select(scheduleSelect)
    .single();

  if (error) throw error;
  return data;
};

export const updateScheduleService = async (id, payload) => {
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => [
      'class_id', 'subject_id', 'teacher_id', 'day', 'start_time', 'end_time',
    ].includes(key)),
  );
  const { data, error } = await supabase
    .schema('master')
    .from('schedules')
    .update(updates)
    .eq('id', id)
    .select(scheduleSelect)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Jadwal pelajaran tidak ditemukan');
  return data;
};

export const deleteScheduleService = async (id) => {
  const { data, error } = await supabase
    .schema('master')
    .from('schedules')
    .delete()
    .eq('id', id)
    .select(scheduleSelect)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Jadwal pelajaran tidak ditemukan');
  return data;
};

// --- GURU ---
export const getAllTeachersService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('teachers')
    .select(`
      id,
      user_id,
      name,
      nip,
      phone,
      users:user_id ( id, email )
    `)
    .order('name', { ascending: true });

  if (error) {
    const fallback = await supabase
      .schema('master')
      .from('teachers')
      .select('*')
      .order('name', { ascending: true });
    if (fallback.error) throw fallback.error;
    return fallback.data;
  }

  return data;
};

export const updateTeacherService = async (id, payload) => {
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => ['name', 'nip', 'phone'].includes(key)),
  );
  const { data, error } = await supabase
    .schema('master')
    .from('teachers')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Guru tidak ditemukan');
  return data;
};

export const deleteTeacherService = async (id) => deleteAccountProfile('teachers', id, 'Guru');

export const createTeacherService = async ({ email, password, name, nip, phone }) => {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) throw authError;

  const userId = authData.user.id;

  try {
    const { error: userError } = await supabase
      .schema('master')
      .from('users')
      .insert([
        { 
          id: userId, 
          email, 
          name, 
          role: 'teacher' 
        }
      ]);

    if (userError) throw userError;

    const { data: teacherData, error: teacherError } = await supabase
      .schema('master')
      .from('teachers')
      .insert([{ user_id: userId, name, nip: nip || null, phone: phone || null }])
      .select()
      .single();

    if (teacherError) throw teacherError;

    return teacherData;
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw err;
  }
};

// --- SISWA ---
export const getAllStudentsService = async () => {
  const { data, error } = await supabase
  .schema('master')
  .from('students')
  .select(`
    *,
    classes:classes!students_class_id_fkey (
      id,
      name,
      level,
      major
    ),
    parents:parents!students_parent_id_fkey (
      id,
      name,
      phone
    ),
    users:users!students_user_id_fkey (
      email,
      role
    )
  `)
  .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateStudentService = async (id, payload) => {
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => ['name', 'nis', 'class_id', 'parent_id'].includes(key)),
  );
  const { data, error } = await supabase
    .schema('master')
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Siswa tidak ditemukan');
  return data;
};

export const deleteStudentService = async (id) => deleteAccountProfile('students', id, 'Siswa');

export const createStudentService = async ({ email, password, name, nis, class_id }) => {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) throw authError;

  const userId = authData.user.id;

  try {
    const { error: userError } = await supabase
      .schema('master')
      .from('users')
      .insert([{ id: userId, email, name, role: 'student' }]);

    if (userError) throw userError;

    const { data: studentData, error: studentError } = await supabase
      .schema('master')
      .from('students')
      .insert([{ user_id: userId, name, nis, class_id: class_id || null }])
      .select()
      .single();

    if (studentError) throw studentError;
    return studentData;
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw err;
  }
};

// --- ORANG TUA ---
export const createParentService = async ({ nis, password, name, phone }) => {
  const virtualEmail = `ortu.${nis}@sman3malang.sch.id`;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: virtualEmail,
    password,
    email_confirm: true,
  });
  if (authError) throw authError;

  const userId = authData.user.id;

  try {
    const { error: userError } = await supabase
      .schema('master')
      .from('users')
      .insert([{ id: userId, email: virtualEmail, name, role: 'parent' }]);

    if (userError) throw userError;

    const { data: parentData, error: parentError } = await supabase
      .schema('master')
      .from('parents')
      .insert([{ user_id: userId, nis, name, phone: phone || null }])
      .select()
      .single();

    if (parentError) throw parentError;

    // Link parent to student with corresponding NIS if exists
    if (nis && parentData?.id) {
      await supabase
        .schema('master')
        .from('students')
        .update({ parent_id: parentData.id })
        .eq('nis', nis);
    }

    return parentData;
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw err;
  }
};

export const updateParentService = async (id, payload) => {
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => ['name', 'phone', 'address'].includes(key)),
  );
  const { data, error } = await supabase
    .schema('master')
    .from('parents')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Orang tua tidak ditemukan');
  return data;
};

export const deleteParentService = async (id) => deleteAccountProfile('parents', id, 'Orang tua');

const deleteAccountProfile = async (table, id, label) => {
  const { data: profile, error: profileError } = await supabase
    .schema('master')
    .from(table)
    .delete()
    .eq('id', id)
    .select('id, user_id')
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) throw new Error(`${label} tidak ditemukan`);

  if (profile.user_id) {
    const { error: userError } = await supabase
      .schema('master')
      .from('users')
      .delete()
      .eq('id', profile.user_id);
    if (userError) throw userError;

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(profile.user_id);
    if (authError) throw authError;
  }

  return profile;
};

export const getAllParentsService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('parents')
    .select(`
      id,
      user_id,
      nis,
      name,
      phone,
      address,
      users:users!parents_user_id_fkey (
        email,
        role
      ),
      students:students!students_parent_id_fkey (
        id,
        name,
        nis,
        classes:classes!students_class_id_fkey (
          id,
          name,
          level,
          major
        )
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    const fallback = await supabase
      .schema('master')
      .from('parents')
      .select('*')
      .order('name', { ascending: true });
    if (fallback.error) throw fallback.error;
    return fallback.data;
  }

  return data;
};

// COURSES
export const getAllCoursesService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('courses')
    .select(`
      id,
      academic_year,
      semester,
      classes(id, name),
      subjects(id, name),
      teachers(id, name, nip)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createCourseService = async ({ class_id, subject_id, teacher_id, academic_year, semester }) => {
  const { data, error } = await supabase
    .schema('master')
    .from('courses')
    .insert([
      {
        class_id,
        subject_id,
        teacher_id: teacher_id || null,
        academic_year: academic_year || '2026/2027',
        semester: semester || 'Ganjil',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// endpoint dashboard admin

export const getDashboardSummaryService = async () => {
  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalParents },
    { count: totalClasses },
    { count: totalSubjects },
    { count: totalSchedules },
  ] = await Promise.all([
    supabase.schema('master').from('students').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('teachers').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('parents').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('classes').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('subjects').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('schedules').select('*', { count: 'exact', head: true }),
  ]);

  return {
    total_students: totalStudents || 0,
    total_teachers: totalTeachers || 0,
    total_parents: totalParents || 0,
    total_classes: totalClasses || 0,
    total_subjects: totalSubjects || 0,
    total_schedules: totalSchedules || 0,
    attendance_rate: '95.4%',
    active_activities: (totalClasses || 0) * 12 + (totalTeachers || 0) * 4,
    system_status: 'Optimal',
    server_uptime: '99.98%',
  };
};