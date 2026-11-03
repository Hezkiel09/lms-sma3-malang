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

  if (error) throw error;
  return data.map(({ students, ...classData }) => ({
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

export const createSubjectService = async (subject) => {
  const payload = typeof subject === 'string' ? { name: subject } : subject;
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSubjectService = async (id, payload) => {
  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => ['name', 'code', 'credit_hours'].includes(key)),
  );
  const { data, error } = await supabase
    .schema('master')
    .from('subjects')
    .update(updates)
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
  room,
  classes(id, name, level, major),
  subjects(id, name, code, credit_hours),
  teachers(id, name, nip)
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
  const fields = ['class_id', 'subject_id', 'teacher_id', 'day', 'start_time', 'end_time', 'room'];
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
      'class_id', 'subject_id', 'teacher_id', 'day', 'start_time', 'end_time', 'room',
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
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
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

// endpoint dashboard admin

export const getDashboardSummaryService = async () => {
  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalParents },
    { count: totalClasses }
  ] = await Promise.all([
    supabase.schema('master').from('students').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('teachers').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('parents').select('*', { count: 'exact', head: true }),
    supabase.schema('master').from('classes').select('*', { count: 'exact', head: true }),
  ]);

  return {
    total_students: totalStudents || 0,
    total_teachers: totalTeachers || 0,
    total_parents: totalParents || 0,
    total_classes: totalClasses || 0,
    // Data pendukung visual yang di-hardcode dari BE biar FE tinggal pake
    attendance_rate: "94.8%",
    active_activities: 328
  };
};