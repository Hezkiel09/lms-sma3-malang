import { supabase, supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@sman3malang.sch.id';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminSMANTI2026!';
  const adminName = process.env.ADMIN_DEFAULT_NAME || 'Administrator SMANTI';

  console.log(`[Seed Admin] Memeriksa akun admin: ${adminEmail}...`);

  // 1. Cek di master.users
  const { data: existingUser, error: findError } = await supabase
    .schema('master')
    .from('users')
    .select('*')
    .eq('email', adminEmail)
    .maybeSingle();

  if (findError) {
    console.error('[Seed Admin] Error memeriksa database:', findError.message);
    return;
  }

  if (existingUser) {
    console.log('[Seed Admin] Akun admin sudah terdaftar di master.users:', existingUser.id);
    return existingUser;
  }

  // 2. Cek apakah sudah ada di auth.users Supabase
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('[Seed Admin] Error listing auth users:', listError.message);
  }

  let authUser = users?.find((u) => u.email === adminEmail);

  if (!authUser) {
    console.log('[Seed Admin] Membuat user baru di Supabase Auth...');
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName, role: 'admin' },
    });

    if (createError) {
      console.error('[Seed Admin] Gagal membuat auth user:', createError.message);
      return;
    }
    authUser = authData.user;
  }

  // 3. Insert ke master.users
  const { data: newDbUser, error: insertError } = await supabase
    .schema('master')
    .from('users')
    .insert([
      {
        id: authUser.id,
        email: adminEmail,
        name: adminName,
        role: 'admin',
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error('[Seed Admin] Gagal insert ke master.users:', insertError.message);
    return;
  }

  console.log('[Seed Admin] Akun admin resmi berhasil dibuat:', newDbUser);
  return newDbUser;
}

// Jalankan jika dieksekusi langsung
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
