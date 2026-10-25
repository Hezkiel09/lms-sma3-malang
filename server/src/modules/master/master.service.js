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
      teachers!classes_homeroom_teacher_id_fkey(id, name, nip)
    `)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
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
    .update({ homeroom_teacher_id })
    .eq('id', classId)
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

export const createSubjectService = async (name) => {
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- GURU ---
export const getAllTeachersService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('teachers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

export const createTeacherService = async ({ email, password, name, nip }) => {
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
      .insert([{ user_id: userId, name, nip: nip || null }])
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
    classes:class_id (
      id,
      name,
      level,
      major
    ),
    parents:parent_id (
      id,
      name,
      phone
    ),
    users:user_id (
      email,
      role
    )
  `);
};

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
      .insert([{ id: userId, email, role: 'student' }]);

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
      .insert([{ id: userId, email: virtualEmail, role: 'parent' }]);

    if (userError) throw userError;

    const { data: parentData, error: parentError } = await supabase
      .schema('master')
      .from('parents')
      .insert([{ user_id: userId, nis, name, phone: phone || null }])
      .select()
      .single();

    if (parentError) throw parentError;
    return parentData;
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw err;
  }
};

export const getAllParentsService = async () => {
  const { data, error } = await supabase
    .schema('master')
    .from('parents')
    .select(`
      id,
      name,
      phone,
      address,
      users:user_id (
        email,
        role
      ),
      students (
        id,
        name,
        nis,
        classes:class_id (
          id,
          name,
          level,
          major
        )
      )
    `)
    .order('name', { ascending: true });

  if (error) throw error;
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