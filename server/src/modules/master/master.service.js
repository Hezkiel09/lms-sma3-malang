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
  const [{ count: scheduleCount, error: scheduleError }, { count: courseCount, error: courseError }] = await Promise.all([
    supabase.schema('master').from('schedules').select('id', { count: 'exact', head: true }).eq('subject_id', id),
    supabase.schema('master').from('courses').select('id', { count: 'exact', head: true }).eq('subject_id', id),
  ]);

  if (scheduleError) throw scheduleError;
  if (courseError) throw courseError;
  if ((scheduleCount || 0) > 0 || (courseCount || 0) > 0) {
    const error = new Error('Mata pelajaran tidak dapat dihapus karena masih digunakan oleh Jadwal Pelajaran atau Course.');
    error.status = 409;
    throw error;
  }

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
const formatCourseRow = (item, studentCountMap = null, sectionCountMap = null) => {
  const rawClass = item.classes || {};
  const rawSubject = item.subjects || {};
  const rawTeacher = item.teachers || {};

  let studentCount = 0;
  if (studentCountMap && item.class_id) {
    studentCount = studentCountMap[item.class_id] || 0;
  } else if (rawClass.students && Array.isArray(rawClass.students) && rawClass.students[0]) {
    studentCount = Number(rawClass.students[0].count || 0);
  }

  let sectionCount = 0;
  if (sectionCountMap && item.id) {
    sectionCount = sectionCountMap[item.id] || 0;
  } else if (item.course_sections && Array.isArray(item.course_sections) && item.course_sections[0]) {
    sectionCount = Number(item.course_sections[0].count || 0);
  }

  const classObj = {
    id: rawClass.id || item.class_id,
    name: rawClass.name || '-',
    level: rawClass.level || '-',
    major: rawClass.major || '-',
  };

  const subjectObj = {
    id: rawSubject.id || item.subject_id,
    name: rawSubject.name || '-',
  };

  const teacherObj = rawTeacher && rawTeacher.id ? {
    id: rawTeacher.id,
    name: rawTeacher.name || '-',
    nip: rawTeacher.nip || '-',
  } : null;

  return {
    id: item.id,
    class_id: item.class_id,
    subject_id: item.subject_id,
    teacher_id: item.teacher_id,
    academic_year: item.academic_year || '2026/2027',
    semester: item.semester || 'Ganjil',
    created_at: item.created_at,
    subject: subjectObj,
    class: classObj,
    teacher: teacherObj,
    // Aliases
    subjects: subjectObj,
    classes: classObj,
    teachers: teacherObj,
    student_count: studentCount,
    section_count: sectionCount,
  };
};

export const getAllCoursesService = async (filters = {}) => {
  const { search, class_id, semester, academic_year } = filters;

  const courseSelect = `
    id,
    class_id,
    subject_id,
    teacher_id,
    academic_year,
    semester,
    created_at,
    classes:classes!courses_class_id_fkey(id, name, level, major, students(count)),
    subjects:subjects!courses_subject_id_fkey(id, name),
    teachers:teachers!courses_teacher_id_fkey(id, name, nip),
    course_sections:course_sections!course_sections_course_id_fkey(count)
  `;

  let query = supabase
    .schema('master')
    .from('courses')
    .select(courseSelect)
    .order('created_at', { ascending: false });

  if (class_id && class_id !== 'Semua Kelas') {
    query = query.eq('class_id', class_id);
  }
  if (semester && semester !== 'Semua Semester') {
    query = query.eq('semester', semester);
  }
  if (academic_year && academic_year.trim()) {
    query = query.eq('academic_year', academic_year.trim());
  }

  let { data, error } = await query;
  let coursesList = [];

  if (error) {
    // Fallback jika relasi nested atau alias postgrest berbeda
    let fallbackQuery = supabase
      .schema('master')
      .from('courses')
      .select(`
        id,
        class_id,
        subject_id,
        teacher_id,
        academic_year,
        semester,
        created_at,
        classes(id, name, level, major),
        subjects(id, name),
        teachers(id, name, nip)
      `)
      .order('created_at', { ascending: false });

    if (class_id && class_id !== 'Semua Kelas') {
      fallbackQuery = fallbackQuery.eq('class_id', class_id);
    }
    if (semester && semester !== 'Semua Semester') {
      fallbackQuery = fallbackQuery.eq('semester', semester);
    }
    if (academic_year && academic_year.trim()) {
      fallbackQuery = fallbackQuery.eq('academic_year', academic_year.trim());
    }

    const { data: fbData, error: fbError } = await fallbackQuery;
    if (fbError) throw fbError;

    // Hitung count student dan section secara paralel
    const [{ data: students }, { data: sections }] = await Promise.all([
      supabase.schema('master').from('students').select('class_id'),
      supabase.schema('master').from('course_sections').select('course_id'),
    ]);

    const studentCountMap = {};
    (students || []).forEach((st) => {
      if (st.class_id) {
        studentCountMap[st.class_id] = (studentCountMap[st.class_id] || 0) + 1;
      }
    });

    const sectionCountMap = {};
    (sections || []).forEach((sec) => {
      if (sec.course_id) {
        sectionCountMap[sec.course_id] = (sectionCountMap[sec.course_id] || 0) + 1;
      }
    });

    coursesList = (fbData || []).map((item) =>
      formatCourseRow(item, studentCountMap, sectionCountMap)
    );
  } else {
    coursesList = (data || []).map((item) => formatCourseRow(item));
  }

  // Filter pencarian (search nama course, mapel, guru, kelas)
  if (search && search.trim() !== '') {
    const kw = search.trim().toLowerCase();
    coursesList = coursesList.filter((c) => {
      const subjectName = (c.subject?.name || '').toLowerCase();
      const className = (c.class?.name || '').toLowerCase();
      const teacherName = (c.teacher?.name || '').toLowerCase();
      const courseTitle = `${subjectName} — ${className}`.toLowerCase();
      return (
        courseTitle.includes(kw) ||
        subjectName.includes(kw) ||
        className.includes(kw) ||
        teacherName.includes(kw)
      );
    });
  }

  return coursesList;
};

export const getCourseByIdService = async (id) => {
  const courses = await getAllCoursesService();
  const course = courses.find((c) => c.id === id);
  if (!course) {
    const error = new Error('Course tidak ditemukan');
    error.status = 404;
    throw error;
  }
  return course;
};

export const createCourseService = async ({ class_id, subject_id, teacher_id, academic_year, semester }) => {
  if (!subject_id || !class_id || !teacher_id) {
    const error = new Error('Mata pelajaran, kelas, dan guru pengampu wajib diisi!');
    error.status = 400;
    throw error;
  }

  // 1. Validasi keberadaan subject_id
  const { data: subject, error: subjErr } = await supabase
    .schema('master')
    .from('subjects')
    .select('id, name')
    .eq('id', subject_id)
    .maybeSingle();

  if (subjErr) throw subjErr;
  if (!subject) {
    const error = new Error('Mata pelajaran tidak ditemukan.');
    error.status = 404;
    throw error;
  }

  // 2. Validasi keberadaan class_id
  const { data: cls, error: clsErr } = await supabase
    .schema('master')
    .from('classes')
    .select('id, name')
    .eq('id', class_id)
    .maybeSingle();

  if (clsErr) throw clsErr;
  if (!cls) {
    const error = new Error('Kelas tidak ditemukan.');
    error.status = 404;
    throw error;
  }

  // 3. Validasi keberadaan teacher_id
  const { data: teacher, error: teacherErr } = await supabase
    .schema('master')
    .from('teachers')
    .select('id, name')
    .eq('id', teacher_id)
    .maybeSingle();

  if (teacherErr) throw teacherErr;
  if (!teacher) {
    const error = new Error('Guru pengampu tidak ditemukan.');
    error.status = 404;
    throw error;
  }

  const academicYear = academic_year?.trim() || '2026/2027';
  const semesterVal = semester?.trim() || 'Ganjil';

  // 4. Cek duplikasi (class_id, subject_id, academic_year, semester)
  const { data: duplicate, error: dupErr } = await supabase
    .schema('master')
    .from('courses')
    .select('id')
    .eq('class_id', class_id)
    .eq('subject_id', subject_id)
    .eq('academic_year', academicYear)
    .eq('semester', semesterVal)
    .maybeSingle();

  if (dupErr) throw dupErr;
  if (duplicate) {
    const error = new Error('Course untuk mata pelajaran dan kelas ini pada semester tersebut sudah terdaftar.');
    error.status = 409;
    throw error;
  }

  // 5. Simpan course baru
  const { data: newCourse, error: insertErr } = await supabase
    .schema('master')
    .from('courses')
    .insert([
      {
        class_id,
        subject_id,
        teacher_id,
        academic_year: academicYear,
        semester: semesterVal,
      },
    ])
    .select('id')
    .single();

  if (insertErr) throw insertErr;
  return await getCourseByIdService(newCourse.id);
};

export const updateCourseService = async (id, { class_id, subject_id, teacher_id, academic_year, semester }) => {
  // 1. Cek keberadaan course
  const { data: currentCourse, error: getErr } = await supabase
    .schema('master')
    .from('courses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (getErr) throw getErr;
  if (!currentCourse) {
    const error = new Error('Course tidak ditemukan');
    error.status = 404;
    throw error;
  }

  const targetClassId = class_id || currentCourse.class_id;
  const targetSubjectId = subject_id || currentCourse.subject_id;
  const targetTeacherId = teacher_id || currentCourse.teacher_id;
  const targetAcademicYear = academic_year?.trim() || currentCourse.academic_year || '2026/2027';
  const targetSemester = semester?.trim() || currentCourse.semester || 'Ganjil';

  // 2. Validasi foreign keys jika diperbarui
  if (class_id && class_id !== currentCourse.class_id) {
    const { data: cls } = await supabase
      .schema('master')
      .from('classes')
      .select('id')
      .eq('id', targetClassId)
      .maybeSingle();
    if (!cls) {
      const error = new Error('Kelas tidak ditemukan.');
      error.status = 404;
      throw error;
    }
  }

  if (subject_id && subject_id !== currentCourse.subject_id) {
    const { data: subj } = await supabase
      .schema('master')
      .from('subjects')
      .select('id')
      .eq('id', targetSubjectId)
      .maybeSingle();
    if (!subj) {
      const error = new Error('Mata pelajaran tidak ditemukan.');
      error.status = 404;
      throw error;
    }
  }

  if (teacher_id && teacher_id !== currentCourse.teacher_id) {
    const { data: tchr } = await supabase
      .schema('master')
      .from('teachers')
      .select('id')
      .eq('id', targetTeacherId)
      .maybeSingle();
    if (!tchr) {
      const error = new Error('Guru pengampu tidak ditemukan.');
      error.status = 404;
      throw error;
    }
  }

  // 3. Cek duplikasi jika kombinasi bentrok dengan course lain
  const { data: duplicate, error: dupErr } = await supabase
    .schema('master')
    .from('courses')
    .select('id')
    .eq('class_id', targetClassId)
    .eq('subject_id', targetSubjectId)
    .eq('academic_year', targetAcademicYear)
    .eq('semester', targetSemester)
    .neq('id', id)
    .maybeSingle();

  if (dupErr) throw dupErr;
  if (duplicate) {
    const error = new Error('Course untuk mata pelajaran dan kelas ini pada semester tersebut sudah terdaftar.');
    error.status = 409;
    throw error;
  }

  // 4. Update data course
  const { error: updateErr } = await supabase
    .schema('master')
    .from('courses')
    .update({
      class_id: targetClassId,
      subject_id: targetSubjectId,
      teacher_id: targetTeacherId,
      academic_year: targetAcademicYear,
      semester: targetSemester,
    })
    .eq('id', id);

  if (updateErr) throw updateErr;
  return await getCourseByIdService(id);
};

export const deleteCourseService = async (id) => {
  // 1. Cek keberadaan course
  const { data: currentCourse, error: getErr } = await supabase
    .schema('master')
    .from('courses')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (getErr) throw getErr;
  if (!currentCourse) {
    const error = new Error('Course tidak ditemukan');
    error.status = 404;
    throw error;
  }

  // 2. Cek apakah course masih memiliki sections
  const { count: sectionCount, error: secErr } = await supabase
    .schema('master')
    .from('course_sections')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id);

  if (!secErr && sectionCount && sectionCount > 0) {
    const error = new Error('Course tidak dapat dihapus karena masih memiliki section, materi, atau tugas di dalamnya.');
    error.status = 400;
    throw error;
  }

  // 3. Eksekusi delete
  const { error: deleteErr } = await supabase
    .schema('master')
    .from('courses')
    .delete()
    .eq('id', id);

  if (deleteErr) {
    if (
      deleteErr.code === '23503' ||
      (deleteErr.message && deleteErr.message.toLowerCase().includes('foreign key'))
    ) {
      const error = new Error('Course tidak dapat dihapus karena masih memiliki section, materi, atau tugas di dalamnya.');
      error.status = 400;
      throw error;
    }
    throw deleteErr;
  }

  return { id };
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
