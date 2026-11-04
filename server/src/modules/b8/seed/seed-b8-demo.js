// Seeder DEMO (nama, kelas, mapel, dan jam yang bervariasi).
//   npm run seed:b8:demo          -> isi data demo + jadwal "live" untuk hari ini
//   npm run seed:b8:demo:live     -> hanya geser jadwal "live" ke jam sekarang (jalankan sebelum demo)
//   npm run seed:b8:demo:clean    -> hapus semua data demo
// Jalankan dari folder server/. Tidak menyentuh data dummy lama (seed-b8-dummy.js).
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di .env');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const PASSWORD = 'Demo1234!';
const email = (key) => `${key}@example.com`;

// ---------------------------------------------------------------- data
const SUBJECTS = ['Matematika', 'Bahasa Indonesia', 'Fisika', 'Bahasa Inggris', 'Informatika'];
const LIVE_SUBJECT = 'Bimbingan Wali Kelas'; // dipakai untuk slot "live" (jam bergeser ke waktu sekarang)

const TEACHERS = [
  { key: 'guru.budi', name: 'Budi Santoso, S.Pd.', nip: '198503122010011001', subject: 'Matematika', phone: '081234560001' },
  { key: 'guru.siti', name: 'Siti Rahmawati, S.Pd.', nip: '198807202012012003', subject: 'Bahasa Indonesia', phone: '081234560002' },
  { key: 'guru.agus', name: 'Agus Prasetyo, M.Pd.', nip: '197911052006041002', subject: 'Fisika', phone: '081234560003' },
  { key: 'guru.dewi', name: 'Dewi Lestari, S.Pd.', nip: '199002142015022001', subject: 'Bahasa Inggris', phone: '081234560004' },
  { key: 'guru.hendra', name: 'Hendra Wijaya, S.Kom.', nip: '199205182019031004', subject: 'Informatika', phone: '081234560005' },
];

const CLASSES = [
  { name: 'X IPA 1', level: 'X', major: 'IPA', homeroom: 'guru.budi' },
  { name: 'X IPA 2', level: 'X', major: 'IPA', homeroom: 'guru.siti' },
  { name: 'XI IPS 1', level: 'XI', major: 'IPS', homeroom: 'guru.dewi' },
];

// [key, nama, nis, kelas, key orang tua, nama orang tua]
const STUDENTS = [
  ['siswa.rafi', 'Rafi Aditya Pratama', '2026101', 'X IPA 1', 'ortu.rafi', 'Hartono Pratama'],
  ['siswa.nadia', 'Nadia Putri Maharani', '2026102', 'X IPA 1', 'ortu.nadia', 'Sri Wahyuni'],
  ['siswa.bima', 'Bima Satria Nugroho', '2026103', 'X IPA 1', 'ortu.nugroho', 'Bambang Nugroho'],
  ['siswa.alya', 'Alya Zahra Ramadhani', '2026104', 'X IPA 1', 'ortu.alya', 'Rini Ramadhani'],
  ['siswa.farhan', 'Farhan Maulana Yusuf', '2026201', 'X IPA 2', 'ortu.farhan', 'Yusuf Hidayat'],
  ['siswa.keisha', 'Keisha Anindita Sari', '2026202', 'X IPA 2', 'ortu.keisha', 'Wulan Sari'],
  ['siswa.dimas', 'Dimas Arya Nugroho', '2026203', 'X IPA 2', 'ortu.nugroho', 'Bambang Nugroho'], // kakak-adik dengan Bima
  ['siswa.salsabila', 'Salsabila Nur Aini', '2026204', 'X IPA 2', 'ortu.salsabila', 'Nur Hasanah'],
  ['siswa.raka', 'Raka Putra Kurniawan', '2025301', 'XI IPS 1', 'ortu.raka', 'Eko Kurniawan'],
  ['siswa.aurel', 'Aurel Safira Hidayat', '2025302', 'XI IPS 1', 'ortu.aurel', 'Ratna Hidayat'],
  ['siswa.galih', 'Galih Pramudya Wardana', '2025303', 'XI IPS 1', 'ortu.galih', 'Slamet Wardana'],
  ['siswa.zahra', 'Zahra Amelia Putri', '2025304', 'XI IPS 1', 'ortu.zahra', 'Maya Puspita'],
];

// Jam pelajaran bervariasi. Jumat lebih pendek.
const SLOTS = [['07:00', '08:30'], ['08:30', '10:00'], ['10:15', '11:45'], ['12:30', '14:00'], ['14:00', '15:30']];
const SLOTS_JUMAT = [['07:00', '08:15'], ['08:15', '09:30'], ['09:45', '11:00']];
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ---------------------------------------------------------------- helper
const unwrap = ({ data, error }, label) => {
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
};

async function ensureAuthUser(addr) {
  const { data, error } = await sb.auth.admin.createUser({ email: addr, password: PASSWORD, email_confirm: true });
  if (!error) return data.user.id;
  for (let page = 1; ; page++) {
    const { data: list, error: e2 } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (e2) throw e2;
    const found = list.users.find((u) => u.email === addr);
    if (found) {
      await sb.auth.admin.updateUserById(found.id, { password: PASSWORD }); // samakan password
      return found.id;
    }
    if (list.users.length < 200) break;
  }
  throw error;
}

async function findOrCreate(schema, table, match, row = {}) {
  let q = sb.schema(schema).from(table).select('id');
  for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
  const found = unwrap(await q.limit(1), `${schema}.${table} select`);
  if (found.length) return found[0].id;
  const created = unwrap(await sb.schema(schema).from(table).insert({ ...match, ...row }).select('id').single(), `${schema}.${table} insert`);
  return created.id;
}

async function makeUser(key, role, name) {
  const addr = email(key);
  const id = await ensureAuthUser(addr);
  await findOrCreate('master', 'users', { id }, { name, email: addr, role });
  return id;
}

// Waktu sekarang di WIB (UTC+7), sama dengan yang dipakai backend.
function wibNow() {
  const w = new Date(Date.now() + 7 * 3600 * 1000);
  const hh = (n) => String(n).padStart(2, '0');
  return { weekday: w.getUTCDay(), minutes: w.getUTCHours() * 60 + w.getUTCMinutes(), hh };
}
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

// Satu jadwal "Bimbingan Wali Kelas" per kelas pada hari ini: mulai 15 menit lalu, selesai 3 jam lagi.
// Guru wali kelas bisa langsung membuka sesi, dan siswa langsung melihatnya sebagai "Sedang Berlangsung".
async function refreshLiveSlots(classIdByName, teacherIdByKey) {
  const subjectId = await findOrCreate('master', 'subjects', { name: LIVE_SUBJECT });
  const now = wibNow();
  const day = DAY_NAMES[now.weekday];
  const start = toHHMM(Math.max(0, now.minutes - 15));
  const end = toHHMM(Math.min(23 * 60 + 59, now.minutes + 165));
  for (const c of CLASSES) {
    const classId = classIdByName[c.name];
    const teacherId = teacherIdByKey[c.homeroom];
    const rows = unwrap(
      await sb.schema('master').from('schedules').select('id').eq('class_id', classId).eq('subject_id', subjectId).eq('day', day).limit(1),
      'live select'
    );
    if (rows.length) {
      unwrap(await sb.schema('master').from('schedules').update({ start_time: start, end_time: end, teacher_id: teacherId }).eq('id', rows[0].id).select('id'), 'live update');
    } else {
      unwrap(await sb.schema('master').from('schedules').insert({ class_id: classId, subject_id: subjectId, teacher_id: teacherId, day, start_time: start, end_time: end }).select('id'), 'live insert');
    }
  }
  console.log(`Jadwal live: ${day} ${start}-${end} untuk ${CLASSES.length} kelas (mapel "${LIVE_SUBJECT}", oleh wali kelas).`);
}

async function loadRefs() {
  const classes = unwrap(await sb.schema('master').from('classes').select('id, name').in('name', CLASSES.map((c) => c.name)), 'classes');
  const classIdByName = Object.fromEntries(classes.map((c) => [c.name, c.id]));
  const users = unwrap(await sb.schema('master').from('users').select('id, email').in('email', TEACHERS.map((t) => email(t.key))), 'users');
  const uid = Object.fromEntries(users.map((u) => [u.email, u.id]));
  const teachers = unwrap(await sb.schema('master').from('teachers').select('id, user_id').in('user_id', Object.values(uid)), 'teachers');
  const tByUser = Object.fromEntries(teachers.map((t) => [t.user_id, t.id]));
  const teacherIdByKey = Object.fromEntries(TEACHERS.map((t) => [t.key, tByUser[uid[email(t.key)]]]));
  return { classIdByName, teacherIdByKey };
}

// ---------------------------------------------------------------- seed
async function seed() {
  console.log('Membuat akun guru...');
  const teacherIdByKey = {};
  const subjectIdByName = {};
  for (const name of SUBJECTS) subjectIdByName[name] = await findOrCreate('master', 'subjects', { name });

  for (const t of TEACHERS) {
    const userId = await makeUser(t.key, 'teacher', t.name);
    teacherIdByKey[t.key] = await findOrCreate('master', 'teachers', { user_id: userId }, { nip: t.nip, name: t.name, phone: t.phone });
  }

  console.log('Membuat kelas...');
  const classIdByName = {};
  for (const c of CLASSES) {
    classIdByName[c.name] = await findOrCreate('master', 'classes', { name: c.name }, { level: c.level, major: c.major, homeroom_teacher_id: teacherIdByKey[c.homeroom] });
  }

  console.log('Membuat orang tua dan siswa...');
  const parentIdByKey = {};
  for (const [key, name, nis, className, parentKey, parentName] of STUDENTS) {
    if (!parentIdByKey[parentKey]) {
      const pUser = await makeUser(parentKey, 'parent', parentName);
      parentIdByKey[parentKey] = await findOrCreate('master', 'parents', { user_id: pUser }, { name: parentName, phone: '08123456' + String(Math.floor(1000 + Math.random() * 8999)) });
    }
    const sUser = await makeUser(key, 'student', name);
    await findOrCreate('master', 'students', { user_id: sUser }, { nis, name, class_id: classIdByName[className], parent_id: parentIdByKey[parentKey] });
  }

  console.log('Membuat jadwal...');
  const classNames = CLASSES.map((c) => c.name);
  const wanted = [];
  classNames.forEach((cn, c) => {
    DAYS.forEach((day, d) => {
      const slots = day === 'Jumat' ? SLOTS_JUMAT : SLOTS;
      slots.forEach(([start, end], k) => {
        // Rotasi mapel: pada satu jam, tiap kelas mendapat mapel berbeda, jadi tidak ada guru yang bentrok.
        const teacher = TEACHERS[(k + c + d) % TEACHERS.length];
        wanted.push({
          class_id: classIdByName[cn],
          subject_id: subjectIdByName[teacher.subject],
          teacher_id: teacherIdByKey[teacher.key],
          day,
          start_time: start,
          end_time: end,
        });
      });
    });
  });
  const existing = unwrap(
    await sb.schema('master').from('schedules').select('class_id, subject_id, teacher_id, day, start_time').in('class_id', Object.values(classIdByName)),
    'schedules'
  );
  const keyOf = (s) => [s.class_id, s.subject_id, s.teacher_id, s.day, String(s.start_time).slice(0, 5)].join('|');
  const have = new Set(existing.map(keyOf));
  const missing = wanted.filter((s) => !have.has(keyOf(s)));
  if (missing.length) unwrap(await sb.schema('master').from('schedules').insert(missing).select('id'), 'schedules insert');
  console.log(`Jadwal: ${missing.length} baru, ${wanted.length - missing.length} sudah ada.`);

  await refreshLiveSlots(classIdByName, teacherIdByKey);

  console.log(`\n=== SEED DEMO SELESAI ===\nPassword semua akun: ${PASSWORD}`);
  console.table([
    ...TEACHERS.map((t) => ({ peran: 'guru', nama: t.name, email: email(t.key), mapel: t.subject })),
    ...STUDENTS.map((s) => ({ peran: 'siswa', nama: s[1], email: email(s[0]), mapel: s[3] })),
  ]);
  console.log('Akun orang tua: ' + [...new Set(STUDENTS.map((s) => email(s[4])))].join(', '));
}

// ---------------------------------------------------------------- clean
async function del(schema, table, col, ids) {
  if (!ids.length) return;
  const { error } = await sb.schema(schema).from(table).delete().in(col, ids);
  if (error) console.warn(`  ! ${schema}.${table}: ${error.message}`);
}
const ids = (rows) => (rows ?? []).map((r) => r.id);

async function clean() {
  const allEmails = [
    ...TEACHERS.map((t) => email(t.key)),
    ...STUDENTS.map((s) => email(s[0])),
    ...new Set(STUDENTS.map((s) => email(s[4]))),
  ];
  const users = ids((await sb.schema('master').from('users').select('id').in('email', allEmails)).data);
  const byUser = async (table) => (users.length ? ids((await sb.schema('master').from(table).select('id').in('user_id', users)).data) : []);
  const students = await byUser('students');
  const teachers = await byUser('teachers');
  const parents = await byUser('parents');
  const classes = ids((await sb.schema('master').from('classes').select('id').in('name', CLASSES.map((c) => c.name))).data);
  const schedules = teachers.length ? ids((await sb.schema('master').from('schedules').select('id').in('teacher_id', teachers)).data) : [];

  await del('b8', 'attendances', 'student_id', students);
  await del('b8', 'attendance_sessions', 'schedule_id', schedules);
  await del('b8', 'general_grades', 'student_id', students);
  await del('b8', 'parent_teacher_chats', 'teacher_id', teachers);
  await del('b8', 'notifications', 'user_id', users);
  await del('b8', 'push_subscriptions', 'user_id', users);
  await del('b8', 'reports', 'user_id', users);

  await del('master', 'schedules', 'id', schedules);
  await del('master', 'students', 'id', students);
  await del('master', 'classes', 'id', classes); // gagal dengan peringatan kalau masih dipakai data lain
  await del('master', 'parents', 'id', parents);
  await del('master', 'teachers', 'id', teachers);
  const live = ids((await sb.schema('master').from('subjects').select('id').eq('name', LIVE_SUBJECT)).data);
  await del('master', 'subjects', 'id', live);
  await del('master', 'users', 'id', users);
  for (const id of users) await sb.auth.admin.deleteUser(id);
  console.log(`Data demo dihapus (${users.length} akun). Mapel umum (Matematika dst.) sengaja dibiarkan karena dipakai bersama.`);
}

async function live() {
  const { classIdByName, teacherIdByKey } = await loadRefs();
  if (!Object.keys(classIdByName).length || Object.values(teacherIdByKey).some((v) => !v)) {
    throw new Error('Data demo belum ada. Jalankan dulu: npm run seed:b8:demo');
  }
  await refreshLiveSlots(classIdByName, teacherIdByKey);
}

const mode = process.argv.includes('--clean') ? clean : process.argv.includes('--live') ? live : seed;
mode().catch((e) => {
  console.error('GAGAL:', e.message ?? e);
  process.exit(1);
});
