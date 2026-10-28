import * as service from './notification.service.js';
import { ok, handle } from './b8.http.js';

export const listNotifications = handle(async (req, res) =>
  ok(res, await service.listNotifications(req.user.id, req.query))
);

export const markRead = handle(async (req, res) =>
  ok(res, await service.markRead(req.user.id, req.params.id), 'Notifikasi ditandai sudah dibaca')
);