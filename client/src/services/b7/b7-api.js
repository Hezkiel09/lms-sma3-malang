import { apiFetch } from '../../lib/api';

const forumBase = '/b7/forum';

export const getForumSubjects = () => apiFetch(`${forumBase}/subjects`);
export const getForums = (subjectId) => apiFetch(
  `${forumBase}${subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : ''}`,
);
export const getForum = (forumId) => apiFetch(`${forumBase}/${encodeURIComponent(forumId)}`);
export const createForum = (payload) => apiFetch(forumBase, {
  method: 'POST',
  body: JSON.stringify(payload),
});
export const getForumPosts = (forumId) => apiFetch(`${forumBase}/${encodeURIComponent(forumId)}/posts`);
export const createForumPost = (forumId, payload) => apiFetch(`${forumBase}/${encodeURIComponent(forumId)}/posts`, {
  method: 'POST',
  body: JSON.stringify(payload),
});
