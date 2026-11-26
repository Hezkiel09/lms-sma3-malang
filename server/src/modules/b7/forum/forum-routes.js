import { Router } from 'express';
import { authenticateUser, requireRole } from '../../../middleware/authMiddleware.js';
import * as forumController from './forum-controller.js';

export const createForumRouter = (io) => {
  const router = Router();
  router.use(authenticateUser, requireRole(['admin', 'teacher', 'student']));
  router.use((req, _res, next) => { req.forumIo = io; next(); });

  router.get('/subjects', forumController.getSubjects);
  router.get('/', forumController.getForums);
  router.post('/', forumController.createForum);
  router.get('/:forumId', forumController.getForum);
  router.get('/:forumId/posts', forumController.getPosts);
  router.post('/:forumId/posts', forumController.createPost);
  return router;
};
