import * as service from './attendance.service.js';
import { ok, handle } from './b8.http.js';

export const openSession = handle(async (req, res) =>
  ok(res, await service.openSession(req.user.id, req.body), 'Sesi presensi dibuka', 201)
);

export const listMySessions = handle(async (req, res) =>
  ok(res, await service.listMySessions(req.user.id, req.query))
);

export const getSession = handle(async (req, res) =>
  ok(res, await service.getSession(req.user.id, req.role, req.params.id))
);

export const closeSession = handle(async (req, res) =>
  ok(res, await service.closeSession(req.user.id, req.params.id), 'Sesi presensi ditutup')
);

export const activeForMe = handle(async (req, res) =>
  ok(res, await service.activeForMe(req.user.id))
);

export const checkin = handle(async (req, res) =>
  ok(res, await service.checkin(req.user.id, req.params.id, req.body), 'Presensi tersimpan')
);

export const updateAttendance = handle(async (req, res) =>
  ok(res, await service.updateAttendance(req.user.id, req.role, req.params.id, req.body), 'Presensi diperbarui')
);

export const getStudentAttendances = handle(async (req, res) =>
  ok(res, await service.getStudentAttendances(req.user.id, req.role, req.params.studentId, req.query))
);