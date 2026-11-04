import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import { ok, handle } from './b8.http.js';
import { master } from './b8.db.js';
import * as c from './dashboard.controller.js';

const router = Router();

// Profil singkat user yang sedang login (nama, kelas, mapel) untuk header FE.
// Tidak pernah melempar error: kalau gagal, FE tetap dapat id/email/role.
async function loadProfile(userId, role) {
  const out = { name: null };
  try {
    const { data: u } = await master().from('users').select('name').eq('id', userId).maybeSingle();
    out.name = u?.name ?? null;

    if (role === 'student') {
      const { data: s } = await master().from('students').select('id, name, nis, class_id').eq('user_id', userId).maybeSingle();
      if (s) {
        out.name = s.name ?? out.name;
        out.nis = s.nis;
        out.student_id = s.id;
        if (s.class_id) {
          const { data: cl } = await master().from('classes').select('name').eq('id', s.class_id).maybeSingle();
          out.class_name = cl?.name ?? null;
        }
      }
    } else if (role === 'teacher') {
      const { data: t } = await master().from('teachers').select('id, name, nip').eq('user_id', userId).maybeSingle();
      if (t) {
        out.name = t.name ?? out.name;
        out.nip = t.nip;
        out.teacher_id = t.id;
        const { data: sch } = await master().from('schedules').select('subject_id').eq('teacher_id', t.id);
        const subjectIds = [...new Set((sch ?? []).map((x) => x.subject_id).filter(Boolean))];
        if (subjectIds.length) {
          const { data: subs } = await master().from('subjects').select('name').in('id', subjectIds);
          const names = (subs ?? []).map((x) => x.name).filter((n) => n !== 'Bimbingan Wali Kelas');
          out.subject_label = names.length ? `Guru ${names.slice(0, 2).join(' & ')}` : 'Guru';
        } else {
          out.subject_label = 'Guru';
        }
      }
    } else if (role === 'parent') {
      const { data: p } = await master().from('parents').select('name').eq('user_id', userId).maybeSingle();
      out.name = p?.name ?? out.name;
    }
  } catch (e) {
    console.error('[me] gagal memuat profil:', e.message);
  }
  return out;
}

// Siapa yang sedang login (dipakai FE untuk menentukan tampilan).
router.get(
  '/me',
  requireRole('admin', 'teacher', 'parent', 'student'),
  handle(async (req, res) => {
    const profile = await loadProfile(req.user.id, req.role);
    ok(res, { id: req.user.id, email: req.user.email, role: req.role, ...profile });
  })
);

router.get('/dashboard/teacher', requireRole('teacher'), c.teacherDashboard); // UC-10
router.get('/dashboard/parent', requireRole('parent'), c.parentDashboard); // UC-20

export default router;
