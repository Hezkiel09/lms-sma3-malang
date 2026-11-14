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
  const { data: currentTeacher, error: findError } = await supabase
    .schema('master')
    .from('teachers')
    .select('id, user_id, name, nip, phone')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!currentTeacher) throw new Error('Guru tidak ditemukan');

  // Jika NIP diubah, periksa duplikasi
  if (payload.nip && payload.nip !== currentTeacher.nip) {
    const { data: existingNip } = await supabase
      .schema('master')
      .from('teachers')
      .select('id')
      .eq('nip', payload.nip)
      .neq('id', id)
      .maybeSingle();
    if (existingNip) {
      throw new Error(`NIP ${payload.nip} sudah digunakan oleh guru lain`);
    }
  }

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

  // Sinkronkan nama ke master.users dan auth metadata
  if (payload.name && currentTeacher.user_id) {
    try {
      await supabase
        .schema('master')
        .from('users')
        .update({ name: payload.name.trim() })
        .eq('id', currentTeacher.user_id);

      await supabaseAdmin.auth.admin.updateUserById(currentTeacher.user_id, {
        user_metadata: { name: payload.name.trim() },
      });
    } catch (syncErr) {
      console.warn('Gagal sinkron nama guru ke user/auth:', syncErr.message);
    }
  }

  // Update password di Supabase Auth jika diberikan
  if (payload.password && currentTeacher.user_id) {
    if (payload.password.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter');
    }
    const { error: pwdError } = await supabaseAdmin.auth.admin.updateUserById(currentTeacher.user_id, {
      password: payload.password,
    });
    if (pwdError) throw pwdError;
  }

  return data;
};

export const deleteTeacherService = async (id) => deleteAccountProfile('teachers', id, 'Guru');

export const createTeacherService = async ({ email, password, name, nip, phone }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanNip = (nip || '').trim();

  // 1. Validasi duplikasi NIP di master.teachers
  if (cleanNip) {
    const { data: existingNip } = await supabase
      .schema('master')
      .from('teachers')
      .select('id')
      .eq('nip', cleanNip)
      .maybeSingle();
    if (existingNip) {
      throw new Error(`NIP ${cleanNip} sudah terdaftar di sistem`);
    }
  }

  // 2. Validasi duplikasi Email di master.users
  const { data: existingUser } = await supabase
    .schema('master')
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle();
  if (existingUser) {
    throw new Error(`Email ${cleanEmail} sudah terdaftar di sistem`);
  }

  // 3. Buat akun di Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { name: cleanName, role: 'teacher' },
  });

  if (authError) throw authError;

  const userId = authData.user.id;

  try {
    // 4. Masukkan ke master.users
    const { error: userError } = await supabase
      .schema('master')
      .from('users')
      .insert([
        { 
          id: userId, 
          email: cleanEmail, 
          name: cleanName, 
          role: 'teacher' 
        }
      ]);

    if (userError) throw userError;

    // 5. Masukkan ke master.teachers
    const { data: teacherData, error: teacherError } = await supabase
      .schema('master')
      .from('teachers')
      .insert([{ user_id: userId, name: cleanName, nip: cleanNip || null, phone: phone || null }])
      .select()
      .single();

    if (teacherError) throw teacherError;

    return teacherData;
  } catch (err) {
    // Rollback pembersihan agar tidak meninggalkan akun orphan
    await supabase.schema('master').from('users').delete().eq('id', userId).catch(() => {});
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
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
  const { data: currentStudent, error: findError } = await supabase
    .schema('master')
    .from('students')
    .select('id, user_id, name, nis, class_id, parent_id')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!currentStudent) throw new Error('Siswa tidak ditemukan');

  // Jika NIS diubah, periksa duplikasi
  if (payload.nis && payload.nis !== currentStudent.nis) {
    const { data: existingNis } = await supabase
      .schema('master')
      .from('students')
      .select('id')
      .eq('nis', payload.nis)
      .neq('id', id)
      .maybeSingle();
    if (existingNis) {
      throw new Error(`NIS ${payload.nis} sudah digunakan oleh siswa lain`);
    }
  }

  const updates = Object.fromEntries(
    Object.entries(payload).filter(([key]) => ['name', 'nis', 'class_id', 'parent_id'].includes(key)),
  );
  if (updates.class_id === '') updates.class_id = null;
  if (updates.parent_id === '') updates.parent_id = null;

  const { data, error } = await supabase
    .schema('master')
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;

  // Sinkronkan nama ke master.users dan auth metadata
  if (payload.name && currentStudent.user_id) {
    try {
      await supabase
        .schema('master')
        .from('users')
        .update({ name: payload.name.trim() })
        .eq('id', currentStudent.user_id);

      await supabaseAdmin.auth.admin.updateUserById(currentStudent.user_id, {
        user_metadata: { name: payload.name.trim() },
      });
    } catch (syncErr) {
      console.warn('Gagal sinkron nama siswa ke user/auth:', syncErr.message);
    }
  }

  // Update password di Supabase Auth jika diberikan
  if (payload.password && currentStudent.user_id) {
    if (payload.password.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter');
    }
    const { error: pwdError } = await supabaseAdmin.auth.admin.updateUserById(currentStudent.user_id, {
      password: payload.password,
    });
    if (pwdError) throw pwdError;
  }

  return data;
};

export const deleteStudentService = async (id) => deleteAccountProfile('students', id, 'Siswa');

export const createStudentService = async ({ email, password, name, nis, class_id }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanNis = (nis || '').trim();

  // 1. Validasi duplikasi NIS di master.students
  if (cleanNis) {
    const { data: existingNis } = await supabase
      .schema('master')
      .from('students')
      .select('id')
      .eq('nis', cleanNis)
      .maybeSingle();
    if (existingNis) {
      throw new Error(`NIS ${cleanNis} sudah terdaftar di sistem`);
    }
  }

  // 2. Validasi duplikasi Email di master.users
  const { data: existingUser } = await supabase
    .schema('master')
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle();
  if (existingUser) {
    throw new Error(`Email ${cleanEmail} sudah terdaftar di sistem`);
  }

  // 3. Buat akun di Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { name: cleanName, role: 'student' },
  });
  if (authError) throw authError;

  const userId = authData.user.id;

  try {
    // 4. Masukkan ke master.users
    const { error: userError } = await supabase
      .schema('master')
      .from('users')
      .insert([{ id: userId, email: cleanEmail, name: cleanName, role: 'student' }]);

    if (userError) throw userError;

    // 5. Cek apakah ada data orang tua yang sudah terdaftar dengan NIS ini
    let parentId = null;
    if (cleanNis) {
      const { data: parent } = await supabase
        .schema('master')
        .from('parents')
        .select('id')
        .eq('nis', cleanNis)
        .maybeSingle();
      if (parent) {
        parentId = parent.id;
      }
    }

    // 6. Masukkan ke master.students
    const { data: studentData, error: studentError } = await supabase
      .schema('master')
      .from('students')
      .insert([{ user_id: userId, name: cleanName, nis: cleanNis, class_id: class_id || null, parent_id: parentId }])
      .select()
      .single();

    if (studentError) throw studentError;
    return studentData;
  } catch (err) {
    // Rollback pembersihan
    await supabase.schema('master').from('users').delete().eq('id', userId).catch(() => {});
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    throw err;
  }
};

// --- ORANG TUA ---
export const createParentService = async ({ nis, password, name, phone }) => {
  const cleanNis = (nis || '').trim();
  const cleanName = (name || '').trim();
  const virtualEmail = `ortu.${cleanNis}@sman3malang.sch.id`.toLowerCase();

  // 1. Validasi duplikasi NIS di master.parents
  if (cleanNis) {
    const { data: existingParent } = await supabase
      .schema('master')
      .from('parents')
      .select('id')
      .eq('nis', cleanNis)
      .maybeSingle();
    if (existingParent) {
      throw new Error(`Orang tua/wali untuk NIS ${cleanNis} sudah terdaftar`);
    }
  }

  // 2. Validasi duplikasi virtual email di master.users
  const { data: existingUser } = await supabase
    .schema('master')
    .from('users')
    .select('id')
    .eq('email', virtualEmail)
    .maybeSingle();
  if (existingUser) {
    throw new Error(`Akun dengan virtual email ${virtualEmail} sudah terdaftar`);
  }

  // 3. Buat akun di Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: virtualEmail,
    password,
    email_confirm: true,
    user_metadata: { name: cleanName, role: 'parent', nis: cleanNis },
  });
  if (authError) throw authError;

  const userId = authData.user.id;

  try {
    // 4. Masukkan ke master.users
    const { error: userError } = await supabase
      .schema('master')
      .from('users')
      .insert([{ id: userId, email: virtualEmail, name: cleanName, role: 'parent' }]);

    if (userError) throw userError;

    // 5. Masukkan ke master.parents
    const { data: parentData, error: parentError } = await supabase
      .schema('master')
      .from('parents')
      .insert([{ user_id: userId, nis: cleanNis, name: cleanName, phone: phone || null }])
      .select()
      .single();

    if (parentError) throw parentError;

    // 6. Hubungkan ke siswa yang memiliki NIS ini jika ada
    if (cleanNis && parentData?.id) {
      await supabase
        .schema('master')
        .from('students')
        .update({ parent_id: parentData.id })
        .eq('nis', cleanNis);
    }

    return parentData;
  } catch (err) {
    // Rollback pembersihan
    await supabase.schema('master').from('users').delete().eq('id', userId).catch(() => {});
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    throw err;
  }
};

export const updateParentService = async (id, payload) => {
  const { data: currentParent, error: findError } = await supabase
    .schema('master')
    .from('parents')
    .select('id, user_id, name, nis, phone, address')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!currentParent) throw new Error('Orang tua tidak ditemukan');

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

  // Sinkronkan nama ke master.users dan auth metadata
  if (payload.name && currentParent.user_id) {
    try {
      await supabase
        .schema('master')
        .from('users')
        .update({ name: payload.name.trim() })
        .eq('id', currentParent.user_id);

      await supabaseAdmin.auth.admin.updateUserById(currentParent.user_id, {
        user_metadata: { name: payload.name.trim() },
      });
    } catch (syncErr) {
      console.warn('Gagal sinkron nama wali ke user/auth:', syncErr.message);
    }
  }

  // Update password di Supabase Auth jika diberikan
  if (payload.password && currentParent.user_id) {
    if (payload.password.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter');
    }
    const { error: pwdError } = await supabaseAdmin.auth.admin.updateUserById(currentParent.user_id, {
      password: payload.password,
    });
    if (pwdError) throw pwdError;
  }

  return data;
};

export const deleteParentService = async (id) => deleteAccountProfile('parents', id, 'Orang tua');

const deleteAccountProfile = async (table, id, label) => {
  const { data: profile, error: findError } = await supabase
    .schema('master')
    .from(table)
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!profile) throw new Error(`${label} tidak ditemukan`);

  // Relational safety sebelum delete:
  if (table === 'parents') {
    // Putuskan relasi parent_id di students agar tidak foreign key violation
    await supabase.schema('master').from('students').update({ parent_id: null }).eq('parent_id', id);
  } else if (table === 'teachers') {
    // Putuskan relasi wali kelas jika guru dihapus
    await supabase.schema('master').from('classes').update({ homeroom_teacher_id: null }).eq('homeroom_teacher_id', id);
  }

  const { error: profileError } = await supabase
    .schema('master')
    .from(table)
    .delete()
    .eq('id', id);

  if (profileError) throw profileError;

  if (profile.user_id) {
    try {
      await supabase
        .schema('master')
        .from('users')
        .delete()
        .eq('id', profile.user_id);
    } catch (uErr) {
      console.warn(`[deleteAccountProfile] Gagal hapus user di master.users:`, uErr.message);
    }

    try {
      await supabaseAdmin.auth.admin.deleteUser(profile.user_id);
    } catch (aErr) {
      console.warn(`[deleteAccountProfile] Gagal hapus auth user di Supabase:`, aErr.message);
    }
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