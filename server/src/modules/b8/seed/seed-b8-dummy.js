// Seeder data dummy untuk tes B8.
//   npm run seed:b8          -> isi data dummy
//   npm run seed:b8:clean    -> hapus semua data dummy
// Jalankan dari folder server/. Semua data dummy berawalan "dummy"/"DUMMY".
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const PASSWORD = 'Dummy123!';
const EMAIL_PATTERN = 'dummy.%@example.com';

async function ensureAuthUser(email) {
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (!error) return data.user.id;

  // Sudah ada -> cari id-nya
  for (let page = 1; ; page++) {
    const { data: list, error: e2 } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (e2) throw e2;
    const found = list.users.find((u) => u.email === email);
    if (found) return found.id;
    if (list.users.length < 200) break;
  }
  throw error;
}

// Cari baris dengan kolom `match`; kalau belum ada, insert match + row.
async function findOrCreate(schema, table, match, row = {}) {
  let q = sb.schema(schema).from(table).select('id');
  for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
  const { data: found, error: e1 } = await q.limit(1);
  if (e1) throw new Error(`${schema}.${table} select: ${e1.message}`);
  if (found.length) return found[0].id;

  const { data, error } = await sb
    .schema(schema)
    .from(table)
    .insert({ ...match, ...row })
    .select('id')
    .single();
  if (error) throw new Error(`${schema}.${table} insert: ${error.message}`);
  return data.id;
}

async function makeUser(key, role, name) {
  const email = `dummy.${key}@example.com`;
  const id = await ensureAuthUser(email);
  await findOrCreate('master', 'users', { id }, { name, email, role });
  return id;
}

async function seed() {
  // --- akun ---
  const u = {
    guru1: await makeUser('guru1', 'teacher', 'Guru Dummy 1'),
    guru2: await makeUser('guru2', 'teacher', 'Guru Dummy 2'),
    ortu1: await makeUser('ortu1', 'parent', 'Ortu Dummy 1'),
    ortu2: await makeUser('ortu2', 'parent', 'Ortu Dummy 2'),
    siswa1: await makeUser('siswa1', 'student', 'Siswa Dummy 1'),
    siswa2: await makeUser('siswa2', 'student', 'Siswa Dummy 2'),
    siswa3: await makeUser('siswa3', 'student', 'Siswa Dummy 3'),
    siswa4: await makeUser('siswa4', 'student', 'Siswa Dummy 4'),
  };

  // --- profil ---
  const teacher1 = await findOrCreate('master', 'teachers', { nip: 'DUMMY-NIP-1' }, { user_id: u.guru1, name: 'Guru Dummy 1' });
  const teacher2 = await findOrCreate('master', 'teachers', { nip: 'DUMMY-NIP-2' }, { user_id: u.guru2, name: 'Guru Dummy 2' });
  const parent1 = await findOrCreate('master', 'parents', { user_id: u.ortu1 }, { name: 'Ortu Dummy 1' });
  const parent2 = await findOrCreate('master', 'parents', { user_id: u.ortu2 }, { name: 'Ortu Dummy 2' });

  const classId = await findOrCreate('master', 'classes', { name: 'DUMMY X-1' }, { level: 'X', major: 'IPA', homeroom_teacher_id: teacher1 });
  const mat = await findOrCreate('master', 'subjects', { name: 'Dummy Matematika' });
  const bind = await findOrCreate('master', 'subjects', { name: 'Dummy Bahasa Indonesia' });

  const students = {};
  const studentDefs = [
    ['siswa1', 'DUMMY-NIS-1', 'Siswa Dummy 1', parent1],
    ['siswa2', 'DUMMY-NIS-2', 'Siswa Dummy 2', parent1], // ortu1 punya 2 anak
    ['siswa3', 'DUMMY-NIS-3', 'Siswa Dummy 3', parent2],
    ['siswa4', 'DUMMY-NIS-4', 'Siswa Dummy 4', parent2],
  ];
  for (const [key, nis, name, parentId] of studentDefs) {
    students[key] = await findOrCreate('master', 'students', { nis }, { user_id: u[key], name, class_id: classId, parent_id: parentId });
  }

  const schedules = {
    senin_mat: await findOrCreate('master', 'schedules', { class_id: classId, subject_id: mat, teacher_id: teacher1, day: 'Senin' }, { start_time: '07:00', end_time: '08:30' }),
    senin_bind: await findOrCreate('master', 'schedules', { class_id: classId, subject_id: bind, teacher_id: teacher2, day: 'Senin' }, { start_time: '08:30', end_time: '10:00' }),
    selasa_mat: await findOrCreate('master', 'schedules', { class_id: classId, subject_id: mat, teacher_id: teacher1, day: 'Selasa' }, { start_time: '07:00', end_time: '08:30' }),
  };

  console.log('\n=== SEED SELESAI ===');
  console.log(`Password semua akun: ${PASSWORD}`);
  console.table({
    'guru1 (Mat)': { user_id: u.guru1, profile_id: teacher1 },
    'guru2 (B.Ind)': { user_id: u.guru2, profile_id: teacher2 },
    ortu1: { user_id: u.ortu1, profile_id: parent1 },
    ortu2: { user_id: u.ortu2, profile_id: parent2 },
    siswa1: { user_id: u.siswa1, profile_id: students.siswa1 },
    siswa2: { user_id: u.siswa2, profile_id: students.siswa2 },
    siswa3: { user_id: u.siswa3, profile_id: students.siswa3 },
    siswa4: { user_id: u.siswa4, profile_id: students.siswa4 },
  });
  console.log('class_id :', classId);
  console.log('schedules:', schedules);
}

async function del(schema, table, col, ids) {
  if (!ids.length) return;
  const { error } = await sb.schema(schema).from(table).delete().in(col, ids);
  if (error) console.warn(`  ! ${schema}.${table}: ${error.message}`);
}
const ids = (res) => (res.data ?? []).map((r) => r.id);

async function clean() {
  const users = ids(await sb.schema('master').from('users').select('id').like('email', EMAIL_PATTERN));
  const students = ids(await sb.schema('master').from('students').select('id').like('nis', 'DUMMY-%'));
  const teachers = ids(await sb.schema('master').from('teachers').select('id').like('nip', 'DUMMY-%'));
  const classes = ids(await sb.schema('master').from('classes').select('id').eq('name', 'DUMMY X-1'));
  const schedules = classes.length
    ? ids(await sb.schema('master').from('schedules').select('id').in('class_id', classes))
    : [];
  const parents = users.length
    ? ids(await sb.schema('master').from('parents').select('id').in('user_id', users))
    : [];

  // data B8 dulu (FK), baru master
  await del('b8', 'attendances', 'student_id', students);
  await del('b8', 'attendance_sessions', 'schedule_id', schedules);
  await del('b8', 'general_grades', 'student_id', students);
  await del('b8', 'parent_teacher_chats', 'teacher_id', teachers);
  await del('b8', 'notifications', 'user_id', users);
  await del('b8', 'push_subscriptions', 'user_id', users);
  await del('b8', 'reports', 'user_id', users);

  await del('master', 'schedules', 'id', schedules);
  await del('master', 'students', 'id', students);
  await del('master', 'classes', 'id', classes);
  await del('master', 'parents', 'id', parents);
  await del('master', 'teachers', 'id', teachers);
  const subj = ids(await sb.schema('master').from('subjects').select('id').ilike('name', 'Dummy %'));
  await del('master', 'subjects', 'id', subj);
  await del('master', 'users', 'id', users);

  for (const id of users) await sb.auth.admin.deleteUser(id);
  console.log(`Data dummy dihapus (${users.length} akun).`);
}

(process.argv.includes('--clean') ? clean() : seed()).catch((e) => {
  console.error('GAGAL:', e.message ?? e);
  process.exit(1);
});