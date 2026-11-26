import * as forumService from './forum-service.js';

const sendError = (res, error, fallback) => res.status(error.statusCode || 500).json({
  success: false,
  message: error.statusCode ? error.message : fallback,
  ...(error.statusCode ? {} : { error: error.message }),
});

export const getSubjects = async (req, res) => {
  try {
    return res.json({ success: true, data: await forumService.getAccessibleSubjects(req.user) });
  } catch (error) { return sendError(res, error, 'Gagal mengambil mata pelajaran Forum.'); }
};

export const getForums = async (req, res) => {
  try {
    return res.json({ success: true, data: await forumService.listForums(req.user, req.query.subjectId) });
  } catch (error) { return sendError(res, error, 'Gagal mengambil daftar Forum.'); }
};

export const getForum = async (req, res) => {
  try {
    return res.json({ success: true, data: await forumService.getForum(req.params.forumId, req.user) });
  } catch (error) { return sendError(res, error, 'Gagal mengambil Forum.'); }
};

export const createForum = async (req, res) => {
  try {
    const data = await forumService.createForum(req.body, req.user);
    return res.status(201).json({ success: true, data });
  } catch (error) { return sendError(res, error, 'Gagal membuat Forum.'); }
};

export const getPosts = async (req, res) => {
  try {
    return res.json({ success: true, data: await forumService.listForumPosts(req.params.forumId, req.user) });
  } catch (error) { return sendError(res, error, 'Gagal mengambil posting Forum.'); }
};

export const createPost = async (req, res) => {
  try {
    const data = await forumService.createForumPost(req.params.forumId, req.body, req.user);
    req.forumIo.to(`forum:${req.params.forumId}`).emit('forum:post-created', data);
    return res.status(201).json({ success: true, data });
  } catch (error) { return sendError(res, error, 'Gagal mengirim posting Forum.'); }
};
