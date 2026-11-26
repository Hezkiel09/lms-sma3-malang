import { supabase } from '../../../config/supabase.js';
import { assertForumAccess } from './forum-service.js';

const allowedRoles = ['admin', 'teacher', 'student'];

export const registerForumSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Autentikasi Forum diperlukan.'));
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return next(new Error('Token Forum tidak valid.'));
      const { data: profile, error: profileError } = await supabase.schema('master').from('users')
        .select('id, name, role').eq('id', user.id).maybeSingle();
      if (profileError || !profile || !allowedRoles.includes(profile.role)) {
        return next(new Error('Role tidak memiliki akses ke Forum.'));
      }
      socket.data.forumUser = { id: user.id, name: profile.name, role: profile.role };
      return next();
    } catch (error) {
      return next(new Error(error.message || 'Autentikasi Forum gagal.'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('forum:join', async ({ forumId } = {}) => {
      try {
        if (!forumId) throw new Error('Forum wajib ditentukan.');
        await assertForumAccess(forumId, socket.data.forumUser);
        socket.join(`forum:${forumId}`);
        socket.emit('forum:joined', { forumId });
      } catch (error) {
        socket.emit('forum:error', { message: error.statusCode === 404 ? 'Forum tidak ditemukan.' : error.message });
      }
    });

    socket.on('forum:leave', ({ forumId } = {}) => {
      if (forumId) socket.leave(`forum:${forumId}`);
    });
  });
};
