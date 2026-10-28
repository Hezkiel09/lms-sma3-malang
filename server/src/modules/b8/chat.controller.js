import * as service from './chat.service.js';
import { ok, handle } from './b8.http.js';

export const listContacts = handle(async (req, res) =>
  ok(res, await service.listContacts(req.user.id, req.role))
);

export const getConversation = handle(async (req, res) =>
  ok(res, await service.getConversation(req.user.id, req.role, req.params.counterpartId))
);

export const sendMessage = handle(async (req, res) =>
  ok(res, await service.sendMessage(req.user.id, req.role, req.params.counterpartId, req.body), 'Pesan terkirim', 201)
);