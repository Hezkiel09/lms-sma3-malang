import * as service from './dashboard.service.js';
import { ok, handle } from './b8.http.js';

export const teacherDashboard = handle(async (req, res) =>
  ok(res, await service.teacherDashboard(req.user.id))
);

export const parentDashboard = handle(async (req, res) =>
  ok(res, await service.parentDashboard(req.user.id, req.query))
);