import { supabase, supabaseAdmin, createAuthClient } from '../../config/supabase.js';

/**
 * Resolves login identifier into a Supabase Auth email.
 * If user supplies NIS (digits / non-email), map to virtual email for parent:
 * ortu.<NIS>@sman3malang.sch.id
 */
export const resolveLoginEmail = (identifier) => {
  const clean = (identifier || '').trim();
  if (!clean) return '';
  if (clean.includes('@')) {
    return clean.toLowerCase();
  }
  // Format NIS untuk orang tua
  return `ortu.${clean}@sman3malang.sch.id`.toLowerCase();
};

/**
 * Mengambil detail profil spesifik berdasarkan role
 */
export const getRoleProfile = async (role, userId) => {
  if (!userId) return null;

  try {
    if (role === 'teacher') {
      const { data, error } = await supabase
        .schema('master')
        .from('teachers')
        .select('id, name, nip, phone')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data;
    } else if (role === 'student') {
      const { data, error } = await supabase
        .schema('master')
        .from('students')
        .select(`
          id,
          name,
          nis,
          class_id,
          classes:classes!students_class_id_fkey(id, name, level, major)
        `)
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data;
    } else if (role === 'parent') {
      const { data, error } = await supabase
        .schema('master')
        .from('parents')
        .select(`
          id,
          name,
          nis,
          phone,
          address,
          students:students!students_parent_id_fkey(id, name, nis)
        `)
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) return data;
    }
  } catch (err) {
    console.warn(`[getRoleProfile] Gagal mengambil profil role ${role}:`, err.message);
  }

  return null;
};

/**
 * Layanan login tunggal untuk SEMUA role:
 * - admin
 * - teacher
 * - student
 * - parent (via NIS / virtual email)
 */
export const loginService = async ({ identifier, email, password }) => {
  const rawIdentifier = identifier || email;

  if (!rawIdentifier || !password) {
    throw new Error('Email atau NIS dan kata sandi wajib diisi');
  }

  const resolvedEmail = resolveLoginEmail(rawIdentifier);

  // 1. Autentikasi menggunakan client ephemeral Supabase Auth
  const authClient = createAuthClient();
  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
    email: resolvedEmail,
    password,
  });

  if (authError || !authData.user || !authData.session) {
    throw new Error('Email/NIS atau kata sandi tidak valid');
  }

  const userId = authData.user.id;

  // 2. Ambil profil pengguna dari master.users
  const { data: userData, error: userError } = await supabase
    .schema('master')
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new Error('Data profil pengguna tidak ditemukan di sistem');
  }

  const validRoles = ['admin', 'teacher', 'student', 'parent'];
  if (!validRoles.includes(userData.role)) {
    throw new Error(`Akses ditolak. Peran "${userData.role}" tidak valid.`);
  }

  // 3. Ambil data profil spesifik sesuai role
  const roleProfile = await getRoleProfile(userData.role, userId);

  return {
    token: authData.session.access_token,
    user: {
      ...userData,
      profile: roleProfile,
    },
  };
};

// Alias untuk kompatibilitas ke belakang
export const loginAdminService = loginService;

/**
 * Mengambil informasi user yang sedang aktif
 */
export const getMeService = async (userId) => {
  const { data: userData, error } = await supabase
    .schema('master')
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    throw new Error('Profil pengguna tidak ditemukan');
  }

  const roleProfile = await getRoleProfile(userData.role, userId);

  return {
    ...userData,
    profile: roleProfile,
  };
};

/**
 * Memperbarui profil dasar pengguna
 */
export const updateProfileService = async (userId, { name }) => {
  const cleanName = (name || '').trim();
  if (!cleanName) {
    throw new Error('Nama lengkap tidak boleh kosong');
  }

  const { data: updatedUser, error } = await supabase
    .schema('master')
    .from('users')
    .update({ name: cleanName })
    .eq('id', userId)
    .select('id, name, email, role, created_at')
    .single();

  if (error || !updatedUser) {
    throw new Error('Gagal memperbarui profil pengguna');
  }

  // Sinkronkan nama di tabel role masing-masing
  try {
    if (updatedUser.role === 'teacher') {
      await supabase.schema('master').from('teachers').update({ name: cleanName }).eq('user_id', userId);
    } else if (updatedUser.role === 'student') {
      await supabase.schema('master').from('students').update({ name: cleanName }).eq('user_id', userId);
    } else if (updatedUser.role === 'parent') {
      await supabase.schema('master').from('parents').update({ name: cleanName }).eq('user_id', userId);
    }
  } catch (syncErr) {
    console.warn('Gagal sinkron nama ke tabel profile role:', syncErr.message);
  }

  // Sinkronkan metadata Supabase Auth
  try {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { name: cleanName },
    });
  } catch (err) {
    console.warn('Gagal sync user_metadata Supabase:', err.message);
  }

  const roleProfile = await getRoleProfile(updatedUser.role, userId);

  return {
    ...updatedUser,
    profile: roleProfile,
  };
};

/**
 * Memperbarui kata sandi pengguna via Supabase Auth Admin
 */
export const updatePasswordService = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Kata sandi baru minimal 6 karakter');
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(`Gagal mengubah kata sandi: ${error.message}`);
  }

  return { message: 'Kata sandi berhasil diperbarui' };
};
