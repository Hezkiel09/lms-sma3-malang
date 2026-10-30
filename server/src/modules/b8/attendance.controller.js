import * as service from './attendance.service.js';
import * as guru from './attendance.guru.service.js';
import * as student from './attendance.student.service.js';
import { ok, handle } from './b8.http.js';

// Sisi guru (dibuat ulang sesuai UI)
export const openSession = handle(async (req, res) =>
  ok(res, await guru.openSession(req.user.id, req.body), 'Sesi presensi dibuka', 201)
);

export const listMySessions = handle(async (req, res) =>
  ok(res, await guru.listMySessions(req.user.id, req.query))
);

export const getSession = handle(async (req, res) =>
  ok(res, await guru.getSession(req.user.id, req.role, req.params.id))
);

export const closeSession = handle(async (req, res) =>
  ok(res, await guru.closeSession(req.user.id, req.params.id), 'Sesi presensi ditutup')
);

export const previewSession = handle(async (req, res) =>
  ok(res, await guru.previewSession(req.user.id, req.query))
);

export const getToday = handle(async (req, res) =>
  ok(res, await guru.getToday(req.user.id, req.query))
);

export const getTeaching = handle(async (req, res) =>
  ok(res, await guru.getTeaching(req.user.id))
);

// Sisi siswa dan lainnya (tidak berubah)
export const activeForMe = handle(async (req, res) =>
  ok(res, await service.activeForMe(req.user.id))
);

// Sisi siswa (dibuat ulang sesuai UI)
export const checkin = handle(async (req, res) => {
  const result = await student.checkin(req.user.id, req.params.id, req.body);
  return ok(res, result, result.changed ? 'Presensi tersimpan' : 'Tidak ada perubahan');
});
export const todayForMe = handle(async (req, res) => ok(res, await student.getTodayForMe(req.user.id)));
export const studentOverview = handle(async (req, res) =>
  ok(res, await student.getOverview(req.user.id, req.role, req.params.studentId, req.query))
);
export const studentWeek = handle(async (req, res) =>
  ok(res, await student.getWeek(req.user.id, req.role, req.params.studentId, req.query))
);
export const studentSubject = handle(async (req, res) =>
  ok(res, await student.getSubjectDetail(req.user.id, req.role, req.params.studentId, req.params.subjectId, req.query))
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