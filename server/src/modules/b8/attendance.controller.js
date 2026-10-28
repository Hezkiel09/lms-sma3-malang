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

export const updateAttendance = handle(async (req, res) => {
  const { data, changed } = await service.updateAttendance(req.user.id, req.params.id, req.body);
  return ok(res, data, changed ? 'Presensi diperbarui' : 'Tidak ada perubahan');
});

export const updateSessionAttendances = handle(async (req, res) => {
  const result = await service.updateSessionAttendances(req.user.id, req.params.id, req.body?.changes);
  return ok(res, result, result.changed ? 'Presensi diperbarui' : 'Tidak ada perubahan');
});

export const listAttendances = handle(async (req, res) =>
  ok(res, await service.listAttendances(req.user.id, req.role, req.query))
);

export const exportAttendances = handle(async (req, res) => {
  const { filename, csv } = await service.exportAttendances(req.user.id, req.query);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

export const getStudentAttendances = handle(async (req, res) =>
  ok(res, await service.getStudentAttendances(req.user.id, req.role, req.params.studentId, req.query))
);