import { master, b8, unwrap } from './b8.db.js';
import { httpError } from './b8.http.js';
import { notifyMany } from './notification.service.js';

const MAX_LENGTH = 2000;

async function selectByIds(fromFn, columns, ids, col = 'id') {
  const uniq = [...new Set(ids.filter(Boolean))];
  const out = [];
  for (let i = 0; i < uniq.length; i += 100) {
    out.push(...unwrap(await fromFn().select(columns).in(col, uniq.slice(i, i + 100))));
  }
  return out;
}

// Profil pemanggil: guru (teachers) atau orang tua (parents).
async function getMe(userId, role) {
  if (role === 'teacher') {
    const t = unwrap(await master().from('teachers').select('id, name, user_id').eq('user_id', userId).maybeSingle());
    if (!t) throw httpError(404, 'Profil guru tidak ditemukan');
    return t;
  }
  const p = unwrap(await master().from('parents').select('id, name, user_id').eq('user_id', userId).maybeSingle());
  if (!p) throw httpError(404, 'Profil orang tua tidak ditemukan');
  return p;
}

// Kelas yang berhubungan dengan guru: mengajar (schedules) atau wali kelas.
async function teacherClassIds(teacherId) {
  const sch = unwrap(await master().from('schedules').select('class_id').eq('teacher_id', teacherId));
  const hr = unwrap(await master().from('classes').select('id').eq('homeroom_teacher_id', teacherId));
  return new Set([...sch.map((s) => s.class_id), ...hr.map((c) => c.id)].filter(Boolean));
}

// classId -> Set(teacherId) untuk kumpulan kelas.
async function teachersByClass(classIds) {
  const map = {};
  const add = (classId, teacherId) => {
    if (!classId || !teacherId) return;
    (map[classId] ??= new Set()).add(teacherId);
  };
  if (!classIds.length) return map;
  const sch = unwrap(await master().from('schedules').select('class_id, teacher_id').in('class_id', classIds));
  sch.forEach((s) => add(s.class_id, s.teacher_id));
  const hr = unwrap(await master().from('classes').select('id, homeroom_teacher_id').in('id', classIds));
  hr.forEach((c) => add(c.id, c.homeroom_teacher_id));
  return map;
}

// Hubungan sah: guru mengajar / wali kelas di kelas salah satu anak orang tua itu.
async function assertRelated(teacherId, parentId) {
  const children = unwrap(await master().from('students').select('class_id').eq('parent_id', parentId));
  const classIds = await teacherClassIds(teacherId);
  if (!children.some((c) => c.class_id && classIds.has(c.class_id))) {
    throw httpError(403, 'Tidak ada hubungan guru dan orang tua');
  }
}

// Resolve pasangan (teacherId, parentId) dari sisi pemanggil.
async function resolvePair(userId, role, counterpartId) {
  const me = await getMe(userId, role);
  if (role === 'teacher') {
    const other = unwrap(await master().from('parents').select('id, name, user_id').eq('id', counterpartId).maybeSingle());
    if (!other) throw httpError(404, 'Orang tua tidak ditemukan');
    await assertRelated(me.id, other.id);
    return { me, other, teacherId: me.id, parentId: other.id, otherSender: 'parent', mySender: 'teacher' };
  }
  const other = unwrap(await master().from('teachers').select('id, name, user_id').eq('id', counterpartId).maybeSingle());
  if (!other) throw httpError(404, 'Guru tidak ditemukan');
  await assertRelated(other.id, me.id);
  return { me, other, teacherId: other.id, parentId: me.id, otherSender: 'teacher', mySender: 'parent' };
}

// UC-17 / UC-26 (langkah 1-2): daftar lawan bicara + jumlah pesan belum dibaca.
export async function listContacts(userId, role) {
  const me = await getMe(userId, role);
  let contacts = [];

  if (role === 'teacher') {
    const classIds = [...(await teacherClassIds(me.id))];
    if (!classIds.length) return [];
    const students = unwrap(
      await master().from('students').select('name, parent_id').in('class_id', classIds).not('parent_id', 'is', null)
    );
    const childrenByParent = {};
    students.forEach((s) => (childrenByParent[s.parent_id] ??= []).push(s.name));
    const parents = await selectByIds(() => master().from('parents'), 'id, name', Object.keys(childrenByParent));
    contacts = parents.map((p) => ({ id: p.id, name: p.name, children: childrenByParent[p.id] }));
  } else {
    const children = unwrap(await master().from('students').select('name, class_id').eq('parent_id', me.id));
    const classIds = [...new Set(children.map((c) => c.class_id).filter(Boolean))];
    const tByClass = await teachersByClass(classIds);
    const childrenByTeacher = {};
    children.forEach((c) => {
      (tByClass[c.class_id] ?? []).forEach((tid) => (childrenByTeacher[tid] ??= []).push(c.name));
    });
    const teachers = await selectByIds(() => master().from('teachers'), 'id, name', Object.keys(childrenByTeacher));
    contacts = teachers.map((t) => ({ id: t.id, name: t.name, children: childrenByTeacher[t.id] }));
  }

  // Pesan belum dibaca dari lawan bicara.
  const otherSender = role === 'teacher' ? 'parent' : 'teacher';
  const myCol = role === 'teacher' ? 'teacher_id' : 'parent_id';
  const otherCol = role === 'teacher' ? 'parent_id' : 'teacher_id';
  const unread = unwrap(
    await b8().from('parent_teacher_chats').select(otherCol).eq(myCol, me.id).eq('sender', otherSender).eq('is_read', false)
  );
  const unreadBy = {};
  unread.forEach((m) => (unreadBy[m[otherCol]] = (unreadBy[m[otherCol]] ?? 0) + 1));

  return contacts
    .map((c) => ({ ...c, children: [...new Set(c.children)], unreadCount: unreadBy[c.id] ?? 0 }))
    .sort((a, b) => b.unreadCount - a.unreadCount || a.name.localeCompare(b.name));
}

// UC-17 / UC-26 (langkah 3-5): riwayat percakapan, lalu tandai pesan lawan bicara sudah dibaca.
export async function getConversation(userId, role, counterpartId) {
  const { other, teacherId, parentId, otherSender } = await resolvePair(userId, role, counterpartId);

  const latest = unwrap(
    await b8()
      .from('parent_teacher_chats')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })
      .limit(200)
  );
  const messages = latest.reverse();

  const hasUnread = messages.some((m) => m.sender === otherSender && !m.is_read);
  if (hasUnread) {
    unwrap(
      await b8()
        .from('parent_teacher_chats')
        .update({ is_read: true })
        .eq('teacher_id', teacherId)
        .eq('parent_id', parentId)
        .eq('sender', otherSender)
        .eq('is_read', false)
        .select('id')
    );
  }
  return {
    with: { id: other.id, name: other.name },
    messages: messages.map((m) => (m.sender === otherSender ? { ...m, is_read: true } : m)),
  };
}

// UC-17 / UC-26 (langkah 6-10): kirim pesan + notifikasi ke lawan bicara (UC-19).
export async function sendMessage(userId, role, counterpartId, { message } = {}) {
  const text = typeof message === 'string' ? message.trim() : '';
  if (!text) throw httpError(422, 'Pesan tidak boleh kosong');
  if (text.length > MAX_LENGTH) throw httpError(422, `Pesan maksimal ${MAX_LENGTH} karakter`);

  const { me, other, teacherId, parentId, mySender } = await resolvePair(userId, role, counterpartId);

  const saved = unwrap(
    await b8()
      .from('parent_teacher_chats')
      .insert({ teacher_id: teacherId, parent_id: parentId, message: text, sender: mySender, is_read: false })
      .select()
      .single()
  );

  // Notifikasi tidak membatalkan pengiriman kalau gagal / penerima tidak punya akun.
  await notifyMany([other.user_id], {
    title: `Pesan baru dari ${me.name}`,
    message: text.length > 80 ? `${text.slice(0, 77)}...` : text,
    type: 'chat',
  });

  return saved;
}