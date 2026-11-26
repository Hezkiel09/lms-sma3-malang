import { supabase } from '../../../config/supabase.js';
import { containsInappropriateLanguage } from './profanity-filter.js';

const forumTable = () => supabase.schema('public').from('forums');
const postTable = () => supabase.schema('public').from('forum_posts');
const forumError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const requireRole = (user, roles) => {
  if (!user || !roles.includes(user.role)) throw forumError(403, 'Role tidak memiliki akses ke Forum.');
};

const getAccessibleSubjectIds = async (user) => {
  requireRole(user, ['admin', 'teacher', 'student']);
  if (user.role === 'admin') return null;

  let courseQuery = supabase.schema('master').from('courses').select('subject_id');
  if (user.role === 'student') {
    const { data: student, error } = await supabase.schema('master').from('students')
      .select('class_id').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!student?.class_id) return [];
    courseQuery = courseQuery.eq('class_id', student.class_id);
  } else {
    const { data: teacher, error } = await supabase.schema('master').from('teachers')
      .select('id').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!teacher?.id) return [];
    courseQuery = courseQuery.eq('teacher_id', teacher.id);
  }

  const { data: courses, error } = await courseQuery;
  if (error) throw error;
  return [...new Set((courses || []).map(({ subject_id: subjectId }) => subjectId).filter(Boolean))];
};

export const getAccessibleSubjects = async (user) => {
  const accessibleIds = await getAccessibleSubjectIds(user);
  let query = supabase.schema('master').from('subjects').select('id, name').order('name');
  if (accessibleIds) {
    if (!accessibleIds.length) return [];
    query = query.in('id', accessibleIds);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const requireAccessibleSubject = async (subjectId, user) => {
  if (!subjectId) throw forumError(400, 'Mata pelajaran wajib dipilih.');
  const accessibleIds = await getAccessibleSubjectIds(user);
  if (accessibleIds && !accessibleIds.some((id) => String(id) === String(subjectId))) {
    throw forumError(404, 'Mata pelajaran tidak ditemukan atau tidak dapat diakses akun ini.');
  }
  const { data: subject, error } = await supabase.schema('master').from('subjects')
    .select('id, name').eq('id', subjectId).maybeSingle();
  if (error) throw error;
  if (!subject) throw forumError(404, 'Mata pelajaran tidak ditemukan.');
  return subject;
};

const getForumRow = async (forumId) => {
  const { data, error } = await forumTable().select('id, subject_id, creator_id, title, created_at')
    .eq('id', forumId).maybeSingle();
  if (error) throw error;
  if (!data) throw forumError(404, 'Forum tidak ditemukan.');
  return data;
};

const getUserNames = async (ids) => {
  if (!ids.length) return new Map();
  const { data, error } = await supabase.schema('master').from('users')
    .select('id, name, role').in('id', [...new Set(ids)]);
  if (error) throw error;
  return new Map((data || []).map((user) => [String(user.id), user]));
};

const getSubjectsById = async (ids) => {
  if (!ids.length) return new Map();
  const { data, error } = await supabase.schema('master').from('subjects')
    .select('id, name').in('id', [...new Set(ids)]);
  if (error) throw error;
  return new Map((data || []).map((subject) => [String(subject.id), subject]));
};

const getPostCounts = async (forumIds) => {
  if (!forumIds.length) return new Map();
  const results = await Promise.all(forumIds.map(async (forumId) => {
    const { count, error } = await postTable().select('id', { count: 'exact', head: true })
      .eq('forum_id', forumId);
    if (error) throw error;
    return [String(forumId), count || 0];
  }));
  return new Map(results);
};

const formatForum = (forum, creator, subject, postCount = 0) => ({
  id: forum.id,
  subjectId: forum.subject_id,
  createdBy: forum.creator_id,
  title: forum.title,
  createdAt: forum.created_at,
  creatorName: creator?.name || 'Pengguna',
  creatorRole: creator?.role || '',
  subject,
  subjectName: subject?.name || 'Mata Pelajaran',
  postCount,
});

export const listForums = async (user, subjectId) => {
  const accessibleIds = await getAccessibleSubjectIds(user);
  if (subjectId && accessibleIds && !accessibleIds.some((id) => String(id) === String(subjectId))) {
    throw forumError(404, 'Mata pelajaran tidak ditemukan.');
  }
  if (accessibleIds && !accessibleIds.length) return [];

  let query = forumTable().select('id, subject_id, creator_id, title, created_at')
    .order('created_at', { ascending: false });
  if (subjectId) query = query.eq('subject_id', subjectId);
  else if (accessibleIds) query = query.in('subject_id', accessibleIds);

  const { data, error } = await query;
  if (error) throw error;
  const forums = data || [];
  const [users, subjects, counts] = await Promise.all([
    getUserNames(forums.map(({ creator_id: creatorId }) => creatorId)),
    getSubjectsById(forums.map(({ subject_id: id }) => id)),
    getPostCounts(forums.map(({ id }) => id)),
  ]);

  return forums.map((forum) => formatForum(
    forum,
    users.get(String(forum.creator_id)),
    subjects.get(String(forum.subject_id)),
    counts.get(String(forum.id)) || 0,
  ));
};

export const assertForumAccess = async (forumId, user) => {
  requireRole(user, ['admin', 'teacher', 'student']);
  const forum = await getForumRow(forumId);
  const subject = await requireAccessibleSubject(forum.subject_id, user);
  const creators = await getUserNames([forum.creator_id]);
  return formatForum(forum, creators.get(String(forum.creator_id)), subject);
};

export const getForum = async (forumId, user) => {
  const forum = await assertForumAccess(forumId, user);
  const postCounts = await getPostCounts([forumId]);
  return { ...forum, postCount: postCounts.get(String(forumId)) || 0 };
};

export const createForum = async (body, user) => {
  requireRole(user, ['admin', 'teacher']);
  const title = String(body.title || '').trim();
  if (!title) throw forumError(400, 'Judul forum wajib diisi.');
  if (title.length > 180) throw forumError(400, 'Judul forum maksimal 180 karakter.');
  if (containsInappropriateLanguage(title)) throw forumError(400, 'Judul forum mengandung kata yang tidak diperbolehkan.');
  const subject = await requireAccessibleSubject(body.subjectId, user);

  const { data, error } = await forumTable().insert({
    subject_id: subject.id,
    creator_id: user.id,
    title,
  }).select('id, subject_id, creator_id, title, created_at').single();
  if (error) throw error;
  const users = await getUserNames([user.id]);
  return formatForum(data, users.get(String(user.id)) || user, subject);
};

export const listForumPosts = async (forumId, user) => {
  await assertForumAccess(forumId, user);
  const { data, error } = await postTable().select('id, forum_id, user_id, parent_post_id, content, created_at')
    .eq('forum_id', forumId).order('created_at', { ascending: true });
  if (error) throw error;
  const posts = data || [];
  const users = await getUserNames(posts.map(({ user_id: userId }) => userId));
  return posts.map((post) => {
    const sender = users.get(String(post.user_id));
    return {
      id: post.id,
      forumId: post.forum_id,
      userId: post.user_id,
      parentPostId: post.parent_post_id,
      content: post.content,
      createdAt: post.created_at,
      senderName: sender?.name || 'Pengguna',
      senderRole: sender?.role || '',
    };
  });
};

export const createForumPost = async (forumId, body, user) => {
  requireRole(user, ['admin', 'teacher', 'student']);
  await assertForumAccess(forumId, user);
  const content = String(body.content || '').trim();
  if (!content || content.length > 2000) throw forumError(400, 'Pesan wajib diisi dan maksimal 2000 karakter.');
  if (containsInappropriateLanguage(content)) throw forumError(400, 'Pesan mengandung kata yang tidak diperbolehkan.');

  const parentPostId = body.parentPostId || null;
  if (parentPostId) {
    const { data: parent, error } = await postTable().select('id, forum_id')
      .eq('id', parentPostId).maybeSingle();
    if (error) throw error;
    if (!parent || String(parent.forum_id) !== String(forumId)) {
      throw forumError(400, 'Balasan harus merujuk ke post pada forum yang sama.');
    }
  }

  const { data, error } = await postTable().insert({
    forum_id: forumId,
    user_id: user.id,
    parent_post_id: parentPostId,
    content,
  }).select('id, forum_id, user_id, parent_post_id, content, created_at').single();
  if (error) throw error;
  return {
    id: data.id,
    forumId: data.forum_id,
    userId: data.user_id,
    parentPostId: data.parent_post_id,
    content: data.content,
    createdAt: data.created_at,
    senderName: user.name || 'Pengguna',
    senderRole: user.role,
  };
};
