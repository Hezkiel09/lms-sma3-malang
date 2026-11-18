import path from 'node:path';
import { supabaseAdmin } from '../../../config/supabase.js';
import { isValidUUID } from '../../../utils/validation.js';

export const MATERIALS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET_MATERIALS || 'materials';
export const ASSIGNMENTS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET_ASSIGNMENTS || 'assignments';
export const SUBMISSIONS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET_SUBMISSIONS || 'submissions';
export const CORRECTIONS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET_CORRECTIONS || 'corrections';

export const SIGNED_URL_TTL = parseInt(
  process.env.SUPABASE_SIGNED_URL_TTL_SECONDS || '3600',
  10
);

/**
 * Helper: buat signed URL dari bucket Supabase Storage
 */
export async function createSignedUrl(storagePath, bucketName) {
  if (!storagePath || !bucketName) return null;
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (error) {
    console.warn(
      `[student.service] Gagal createSignedUrl bucket '${bucketName}' path '${storagePath}':`,
      error.message
    );
    return null;
  }
  return data?.signedUrl || null;
}

/**
 * Helper: sanitasi nama file agar aman untuk storage path.
 */
function sanitizeFileName(fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
  return `${cleanBase}${ext.toLowerCase()}`;
}

/**
 * Helper: Format ukuran file ke string yang ramah dibaca (KB / MB).
 */
function formatFileSizeStr(sizeInBytes) {
  if (!sizeInBytes || isNaN(sizeInBytes)) return null;
  const bytes = Number(sizeInBytes);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Helper: Format tanggal dan jam ke WIB (Indonesia).
 */
function formatDateTimeIndo(dateStr) {
  if (!dateStr) return { date: '-', time: '-' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const date = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
    const time =
      d
        .toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Jakarta',
        })
        .replace(':', '.') + ' WIB';
    return { date, time };
  } catch {
    return { date: dateStr, time: '' };
  }
}

// In-memory store untuk nomor HP siswa jika tabel DB belum memiliki kolom phone
const studentPhoneMemory = new Map();

/**
 * 1. Profil Siswa
 * GET /api/v1/b5/student/profile
 */
export const getStudentProfileService = async (user) => {
  const studentId = user.studentId;

  const { data: student, error: studentError } = await supabaseAdmin
    .schema('master')
    .from('students')
    .select('id, user_id, nis, name, class_id')
    .eq('id', studentId)
    .maybeSingle();

  if (studentError) throw studentError;

  let classData = null;
  if (student?.class_id) {
    const { data: cls } = await supabaseAdmin
      .schema('master')
      .from('classes')
      .select('id, name, level, major')
      .eq('id', student.class_id)
      .maybeSingle();
    classData = cls;
  }

  let userData = null;
  if (student?.user_id) {
    const { data: usr } = await supabaseAdmin
      .schema('master')
      .from('users')
      .select('id, email, role')
      .eq('id', student.user_id)
      .maybeSingle();
    userData = usr;
  }

  const phone = studentPhoneMemory.get(studentId) || '081234567890';

  return {
    id: student?.id || studentId,
    name: student?.name || user.name || 'Siswa',
    nis: student?.nis || user.nis || '12845',
    email:
      userData?.email ||
      `${(student?.name || 'student').toLowerCase().replace(/\s+/g, '')}@student.smanti.sch.id`,
    phone,
    kelas: classData?.name || user.className || 'X-A',
    school: 'SMAN 3 Malang',
    status: 'Aktif',
    role: 'student',
  };
};

/**
 * Update Profil Siswa (Nomor Telepon)
 * PUT /api/v1/b5/student/profile
 */
export const updateStudentProfileService = async (user, { phone }) => {
  if (phone) {
    studentPhoneMemory.set(user.studentId, String(phone).trim());
  }
  return await getStudentProfileService(user);
};

/**
 * 2. Notifikasi Siswa
 * GET /api/v1/b5/student/notifications
 */
export const getStudentNotificationsService = async (user) => {
  const notifications = [];

  // A. Notifikasi tugas baru yang dibuat guru (3 terbaru)
  const { data: recentAssignments } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, created_at, teacher_id')
    .order('created_at', { ascending: false })
    .limit(3);

  if (recentAssignments && recentAssignments.length > 0) {
    for (const asg of recentAssignments) {
      let guruName = 'Guru Pengajar';
      if (asg.teacher_id) {
        const { data: t } = await supabaseAdmin
          .schema('master')
          .from('teachers')
          .select('name')
          .eq('id', asg.teacher_id)
          .maybeSingle();
        if (t?.name) guruName = t.name;
      }

      notifications.push({
        id: `asg-${asg.id}`,
        text: `${guruName} menambahkan tugas "${asg.title}"`,
        time: asg.created_at ? formatDateTimeIndo(asg.created_at).date : 'Baru saja',
        assignmentId: asg.id,
      });
    }
  }

  // B. Notifikasi penilaian untuk siswa ini (jika ada yang sudah dinilai)
  const { data: gradedSubmissions } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('id, assignment_id, score, graded_at')
    .eq('student_id', user.studentId)
    .not('score', 'is', null)
    .order('graded_at', { ascending: false })
    .limit(3);

  if (gradedSubmissions && gradedSubmissions.length > 0) {
    for (const sub of gradedSubmissions) {
      let asgTitle = 'Tugas';
      if (sub.assignment_id) {
        const { data: asg } = await supabaseAdmin
          .schema('b5')
          .from('assignments')
          .select('title')
          .eq('id', sub.assignment_id)
          .maybeSingle();
        if (asg?.title) asgTitle = asg.title;
      }

      notifications.push({
        id: `grade-${sub.id}`,
        text: `Guru telah memberikan nilai pada tugas "${asgTitle}"`,
        time: sub.graded_at ? formatDateTimeIndo(sub.graded_at).date : 'Baru saja',
        assignmentId: sub.assignment_id,
      });
    }
  }

  // Fallback notifikasi default jika belum ada
  if (notifications.length === 0) {
    notifications.push({
      id: 'default-notif-1',
      text: 'Selamat datang di Portal Siswa SMAN 3 Malang!',
      time: 'Hari ini',
      assignmentId: null,
    });
  }

  return notifications;
};

/**
 * 3. UC-08: Ambil Daftar Course/Kelas Siswa
 * GET /api/v1/b5/student/courses
 */
export const getStudentCoursesService = async (user) => {
  // Ambil data course dari view master.course_details
  const { data: allCourses, error: courseError } = await supabaseAdmin
    .schema('master')
    .from('course_details')
    .select('*');

  if (courseError) throw courseError;

  // Saring course yang relevan untuk siswa (cocok class_id atau default active course)
  let studentCourses = (allCourses || []).filter(
    (c) => c.class_id === user.classId || c.id === 'bf720e90-1886-4c01-9868-249181f900dc'
  );

  if (studentCourses.length === 0) {
    studentCourses = allCourses || [];
  }

  // Untuk setiap course, hitung jumlah materi (published only) dan jumlah tugas
  const coursesWithCounts = await Promise.all(
    studentCourses.map(async (c) => {
      // 1. Ambil sections dari course
      const { data: sections } = await supabaseAdmin
        .schema('master')
        .from('course_sections')
        .select('id')
        .eq('course_id', c.id);

      const sectionIds = (sections || []).map((s) => s.id);

      // 2. Hitung materi yang berstatus 'published'
      let materiCount = 0;
      if (sectionIds.length > 0) {
        const { count } = await supabaseAdmin
          .schema('b5')
          .from('materials')
          .select('id', { count: 'exact', head: true })
          .in('section_id', sectionIds)
          .eq('status', 'published');
        materiCount = count || 0;
      }

      // 3. Hitung tugas
      const { count: tugasCount } = await supabaseAdmin
        .schema('b5')
        .from('assignments')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', c.id);

      const mapelName = c.subject_name || 'Mata Pelajaran';
      const className = c.class_name || 'X-A';

      return {
        id: c.id,
        course_id: c.id,
        nama: c.name || `${mapelName} ${className}`.trim(),
        mapel: mapelName.toUpperCase(),
        kelasBadge: `KELAS ${className.toUpperCase()}`,
        desc: `Pelajari konsep materi, tugas, dan evaluasi pembelajaran ${mapelName}.`,
        materi: materiCount,
        tugas: tugasCount || 0,
        tahun: `${c.academic_year || '2026/2027'} • Semester ${c.semester || 'Ganjil'}`,
        guru: c.teacher_name || 'Guru Pengajar',
        progress: 60,
        coverBg: 'bg-[#DDF6F9]',
        class_id: c.class_id,
      };
    })
  );

  return coursesWithCounts;
};

/**
 * 4. UC-08: Ambil Daftar Sections dalam Course
 * GET /api/v1/b5/student/courses/:courseId/sections
 */
export const getStudentCourseSectionsService = async (courseId, user) => {
  if (!isValidUUID(courseId)) {
    const error = new Error('courseId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  const { data: sections, error } = await supabaseAdmin
    .schema('master')
    .from('course_sections')
    .select('id, course_id, title, description, position, created_at')
    .eq('course_id', courseId)
    .order('position', { ascending: true });

  if (error) throw error;
  return sections || [];
};

/**
 * 4b. UC-08: Ambil Seluruh Materi (HANYA 'published') dalam Course
 * GET /api/v1/b5/student/courses/:courseId/materials
 */
export const getStudentCourseMaterialsService = async (courseId, user) => {
  if (!isValidUUID(courseId)) {
    const error = new Error('courseId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Ambil sections dari course
  const { data: sections, error: secErr } = await supabaseAdmin
    .schema('master')
    .from('course_sections')
    .select('id, title, position')
    .eq('course_id', courseId);

  if (secErr) throw secErr;
  if (!sections || sections.length === 0) return [];

  const sectionIds = sections.map((s) => s.id);

  // 2. Ambil materi HANYA yang berstatus 'published'
  const { data: materials, error: matErr } = await supabaseAdmin
    .schema('b5')
    .from('materials')
    .select(`
      id,
      teacher_id,
      title,
      description,
      subject_id,
      section_id,
      status,
      created_at,
      updated_at,
      material_files (
        id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .in('section_id', sectionIds)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (matErr) throw matErr;

  // 3. Sertakan signed URL untuk setiap berkas materi
  const materialsWithSignedUrls = await Promise.all(
    (materials || []).map(async (m) => {
      const filesWithUrls = await Promise.all(
        (m.material_files || []).map(async (f) => {
          const signedUrl = await createSignedUrl(f.file_url, MATERIALS_BUCKET);
          return {
            ...f,
            signed_url: signedUrl,
            file_url: signedUrl || f.file_url,
            file_size_formatted: formatFileSizeStr(f.file_size),
          };
        })
      );

      const primaryFile = filesWithUrls[0] || null;

      return {
        ...m,
        material_files: filesWithUrls,
        primary_file: primaryFile,
        file_url: primaryFile?.signed_url || null,
        file_name: primaryFile?.file_name || null,
        file_size_formatted: primaryFile?.file_size_formatted || null,
      };
    })
  );

  return materialsWithSignedUrls;
};

/**
 * 5. UC-08: Ambil Detail Materi Siswa (WAJIB Published)
 * GET /api/v1/b5/student/materials/:materialId
 */
export const getStudentMaterialDetailService = async (materialId, user) => {
  if (!isValidUUID(materialId)) {
    const error = new Error('materialId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Ambil data materi dari schema b5
  const { data: material, error } = await supabaseAdmin
    .schema('b5')
    .from('materials')
    .select(`
      id,
      teacher_id,
      title,
      description,
      subject_id,
      section_id,
      status,
      created_at,
      updated_at,
      material_files (
        id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .eq('id', materialId)
    .maybeSingle();

  if (error) throw error;

  if (!material) {
    const notFound = new Error('Materi tidak ditemukan.');
    notFound.statusCode = 404;
    throw notFound;
  }

  // Siswa dilarang melihat materi berstatus draft
  if (material.status !== 'published') {
    const forbidden = new Error('Materi ini belum dipublikasikan oleh guru.');
    forbidden.statusCode = 403;
    throw forbidden;
  }

  // 2. Ambil data section dari schema master
  let sectionData = null;
  if (material.section_id) {
    const { data: sec } = await supabaseAdmin
      .schema('master')
      .from('course_sections')
      .select('id, course_id, title')
      .eq('id', material.section_id)
      .maybeSingle();
    sectionData = sec;
  }

  // 3. Ambil data guru dari schema master
  let teacherData = null;
  if (material.teacher_id) {
    const { data: tch } = await supabaseAdmin
      .schema('master')
      .from('teachers')
      .select('id, name')
      .eq('id', material.teacher_id)
      .maybeSingle();
    teacherData = tch;
  }

  // 4. Buat signed URL untuk setiap lampiran
  const filesWithUrls = await Promise.all(
    (material.material_files || []).map(async (f) => {
      const signedUrl = await createSignedUrl(f.file_url, MATERIALS_BUCKET);
      return {
        ...f,
        signed_url: signedUrl,
        file_url: signedUrl || f.file_url,
        file_size_formatted: formatFileSizeStr(f.file_size),
      };
    })
  );

  return {
    ...material,
    section: sectionData,
    teacher: teacherData,
    material_files: filesWithUrls,
  };
};

/**
 * 6. UC-09: Ambil Daftar Tugas dalam Course beserta Status Pengumpulan Siswa
 * GET /api/v1/b5/student/courses/:courseId/assignments
 */
export const getStudentCourseAssignmentsService = async (courseId, user, query = {}) => {
  if (!isValidUUID(courseId)) {
    const error = new Error('courseId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Ambil detail course untuk nama mapel & kelas
  const { data: courseInfo } = await supabaseAdmin
    .schema('master')
    .from('course_details')
    .select('name, class_name, subject_name, teacher_name')
    .eq('id', courseId)
    .maybeSingle();

  // 2. Ambil seluruh tugas di course ini dari schema b5
  const { data: assignments, error: asgErr } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select(`
      id,
      course_id,
      section_id,
      class_id,
      teacher_id,
      subject_id,
      title,
      instructions,
      deadline,
      start_at,
      submission_type,
      allow_late_submission,
      created_at,
      assignment_files (
        id,
        file_name,
        file_url,
        file_type,
        file_size
      )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (asgErr) throw asgErr;
  if (!assignments || assignments.length === 0) return [];

  const assignmentIds = assignments.map((a) => a.id);

  // 3. Ambil pengumpulan tugas siswa ini
  const { data: mySubmissions } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select(
      'id, assignment_id, student_id, status, score, feedback, is_late, submitted_at, graded_at'
    )
    .in('assignment_id', assignmentIds)
    .eq('student_id', user.studentId);

  const submissionMap = new Map();
  (mySubmissions || []).forEach((sub) => {
    submissionMap.set(sub.assignment_id, sub);
  });

  const now = new Date();

  // 4. Gabungkan status untuk setiap tugas
  const enrichedAssignments = await Promise.all(
    assignments.map(async (asg) => {
      const mySub = submissionMap.get(asg.id);
      const deadlineDate = asg.deadline ? new Date(asg.deadline) : null;
      const isPastDeadline = deadlineDate && now > deadlineDate;

      let statusSiswa = 'BELUM DIKERJAKAN';
      if (mySub) {
        if (mySub.score !== null && mySub.score !== undefined) {
          statusSiswa = 'SUDAH DINILAI';
        } else if (mySub.is_late || mySub.status === 'Terlambat') {
          statusSiswa = 'TERLAMBAT';
        } else {
          statusSiswa = 'DISERAHKAN';
        }
      } else if (isPastDeadline) {
        statusSiswa = 'TERLEWAT';
      }

      const filesWithUrls = await Promise.all(
        (asg.assignment_files || []).map(async (f) => {
          const signedUrl = await createSignedUrl(f.file_url, ASSIGNMENTS_BUCKET);
          return {
            ...f,
            signed_url: signedUrl,
            file_url: signedUrl || f.file_url,
            file_size_formatted: formatFileSizeStr(f.file_size),
          };
        })
      );

      const primaryFile = filesWithUrls[0] || null;
      const deadlineFormatted = asg.deadline
        ? formatDateTimeIndo(asg.deadline).date
        : '12 Okt 2026';

      return {
        id: asg.id,
        assignment_id: asg.id,
        title: asg.title,
        instructions: asg.instructions,
        section_id: asg.section_id,
        course_id: asg.course_id,
        kelas_nama: courseInfo?.class_name || 'X-A',
        mapel_nama: courseInfo?.subject_name || 'Matematika',
        deadline: asg.deadline,
        deadline_formatted: deadlineFormatted,
        deadline_raw: asg.deadline,
        start_at: asg.start_at,
        status: statusSiswa,
        status_pengumpulan: statusSiswa,
        is_selesai: statusSiswa === 'DISERAHKAN' || statusSiswa === 'SUDAH DINILAI',
        allow_late_submission: asg.allow_late_submission,
        submission: mySub || null,
        score: mySub?.score ?? null,
        file_name: primaryFile?.file_name || null,
        file_url: primaryFile?.signed_url || null,
        assignment_files: filesWithUrls,
        created_at: asg.created_at,
      };
    })
  );

  // Sorting
  if (query.sortBy === 'Deadline Terdekat') {
    enrichedAssignments.sort((a, b) => {
      const dateA = new Date(a.deadline || '2099-12-31');
      const dateB = new Date(b.deadline || '2099-12-31');
      return dateA - dateB;
    });
  }

  return enrichedAssignments;
};

/**
 * 7. UC-09: Ambil Detail Tugas Siswa
 * GET /api/v1/b5/student/assignments/:assignmentId
 */
export const getStudentAssignmentDetailService = async (assignmentId, user) => {
  if (!isValidUUID(assignmentId)) {
    const error = new Error('assignmentId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Ambil data assignment dari schema b5
  const { data: assignment, error } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select(`
      id,
      course_id,
      section_id,
      class_id,
      teacher_id,
      subject_id,
      title,
      instructions,
      deadline,
      start_at,
      submission_type,
      allow_late_submission,
      created_at,
      assignment_files (
        id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .eq('id', assignmentId)
    .maybeSingle();

  if (error) throw error;
  if (!assignment) {
    const notFound = new Error('Tugas tidak ditemukan.');
    notFound.statusCode = 404;
    throw notFound;
  }

  // 2. Ambil informasi course_details dari schema master
  let courseDetails = null;
  if (assignment.course_id) {
    const { data: cd } = await supabaseAdmin
      .schema('master')
      .from('course_details')
      .select('*')
      .eq('id', assignment.course_id)
      .maybeSingle();
    courseDetails = cd;
  }

  // 3. Ambil data guru dari master.teachers
  let teacherData = null;
  if (assignment.teacher_id) {
    const { data: t } = await supabaseAdmin
      .schema('master')
      .from('teachers')
      .select('id, name, nip, phone')
      .eq('id', assignment.teacher_id)
      .maybeSingle();
    teacherData = t;
  }

  // 4. Buat signed URL untuk lampiran soal dari guru
  const filesWithUrls = await Promise.all(
    (assignment.assignment_files || []).map(async (f) => {
      const signedUrl = await createSignedUrl(f.file_url, ASSIGNMENTS_BUCKET);
      return {
        ...f,
        signed_url: signedUrl,
        file_url: signedUrl || f.file_url,
        file_size_formatted: formatFileSizeStr(f.file_size),
      };
    })
  );

  // 5. Cek apakah siswa sudah pernah mengumpulkan tugas ini
  const { data: mySubmission } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select(`
      id,
      status,
      score,
      feedback,
      is_late,
      submission_attempt,
      submitted_at,
      graded_at,
      submission_files (
        id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .eq('assignment_id', assignmentId)
    .eq('student_id', user.studentId)
    .maybeSingle();

  let mySubWithUrls = null;
  if (mySubmission) {
    const subFiles = await Promise.all(
      (mySubmission.submission_files || []).map(async (sf) => ({
        ...sf,
        signed_url: await createSignedUrl(sf.file_url, SUBMISSIONS_BUCKET),
        file_size_formatted: formatFileSizeStr(sf.file_size),
      }))
    );
    mySubWithUrls = {
      ...mySubmission,
      submission_files: subFiles,
    };
  }

  const startFormatted = formatDateTimeIndo(assignment.start_at || assignment.created_at);
  const dueFormatted = formatDateTimeIndo(assignment.deadline);

  const instructionsList = assignment.instructions
    ? assignment.instructions
        .split('\n')
        .map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter((s) => s.length > 0)
    : [];

  const guruName = teacherData?.name || courseDetails?.teacher_name || 'Guru Pengajar';
  const subjectName = courseDetails?.subject_name || 'Mata Pelajaran';
  const className = courseDetails?.class_name || 'X-A';

  return {
    id: assignment.id,
    assignment_id: assignment.id,
    title: assignment.title,
    kelas_nama: `${subjectName} ${className}`,
    guru_nama: guruName,
    guru_role: `Guru ${subjectName}`,
    start_date: startFormatted.date,
    start_time: startFormatted.time,
    start_at_raw: assignment.start_at || assignment.created_at,
    due_date: dueFormatted.date,
    due_time: dueFormatted.time,
    due_date_iso: assignment.deadline,
    deadline_raw: assignment.deadline,
    instructions: assignment.instructions,
    instructions_list: instructionsList.length > 0 ? instructionsList : null,
    submission_type: assignment.submission_type
      ? assignment.submission_type.toUpperCase()
      : 'PDF',
    allow_late_submission: assignment.allow_late_submission,
    assignment_files: filesWithUrls,
    my_submission: mySubWithUrls,
    is_submitted: Boolean(mySubWithUrls),
  };
};

/**
 * 8. UC-09: Ambil Timeline Tugas untuk Widget Kalender di Dashboard Siswa
 * GET /api/v1/b5/student/timeline-assignments
 */
export const getStudentTimelineAssignmentsService = async (user) => {
  // Ambil data course details untuk lookup
  const { data: allCourses } = await supabaseAdmin
    .schema('master')
    .from('course_details')
    .select('id, name, class_name, subject_name');

  const courseMap = new Map();
  (allCourses || []).forEach((c) => courseMap.set(c.id, c));

  // Ambil semua tugas
  const { data: assignments, error } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, deadline, course_id')
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true });

  if (error) throw error;
  if (!assignments || assignments.length === 0) return [];

  // Ambil submission siswa
  const { data: mySubmissions } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('assignment_id, status, score')
    .eq('student_id', user.studentId);

  const submittedSet = new Set((mySubmissions || []).map((s) => s.assignment_id));

  const timeline = assignments.map((asg) => {
    const d = new Date(asg.deadline);
    const isValidDate = !isNaN(d.getTime());
    const isCompleted = submittedSet.has(asg.id);
    const course = courseMap.get(asg.course_id);

    return {
      id: asg.id,
      judul: asg.title,
      kelas: course ? `${course.subject_name} ${course.class_name}` : 'Matematika X A',
      deadlineStr: isValidDate
        ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        : '12 Okt 2026',
      day: isValidDate ? d.getDate() : 1,
      month: isValidDate ? d.getMonth() : 9, // 0-indexed (9 = Oktober)
      year: isValidDate ? d.getFullYear() : 2026,
      waktu: isValidDate
        ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') +
          ' WIB'
        : '23:59 WIB',
      status: isCompleted ? 'SELESAI' : 'BELUM DIKERJAKAN',
    };
  });

  return timeline;
};

/**
 * 9. UC-10: Ambil Data Pengumpulan Tugas Milik Siswa
 * GET /api/v1/b5/student/assignments/:assignmentId/my-submission
 */
export const getStudentMySubmissionService = async (assignmentId, user) => {
  if (!isValidUUID(assignmentId)) {
    const error = new Error('assignmentId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  const { data: submission, error } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select(`
      id,
      assignment_id,
      student_id,
      status,
      score,
      feedback,
      is_late,
      submission_attempt,
      submitted_at,
      graded_at,
      updated_at,
      submission_files (
        id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .eq('assignment_id', assignmentId)
    .eq('student_id', user.studentId)
    .maybeSingle();

  if (error) throw error;
  if (!submission) return null;

  const filesWithUrls = await Promise.all(
    (submission.submission_files || []).map(async (file) => {
      const signedUrl = await createSignedUrl(file.file_url, SUBMISSIONS_BUCKET);
      return {
        ...file,
        signed_url: signedUrl,
        file_url: signedUrl || file.file_url,
        file_size_formatted: formatFileSizeStr(file.file_size),
      };
    })
  );

  // Ambil file koreksi dari guru (jika ada) dari bucket 'corrections'
  const { data: correctionFiles } = await supabaseAdmin
    .schema('b5')
    .from('correction_files')
    .select('id, file_name, file_url, file_type, file_size, uploaded_at')
    .eq('submission_id', submission.id)
    .order('uploaded_at', { ascending: false });

  const correctionFilesWithUrls = await Promise.all(
    (correctionFiles || []).map(async (cf) => {
      const signedUrl = await createSignedUrl(cf.file_url, CORRECTIONS_BUCKET);
      return {
        ...cf,
        signed_url: signedUrl,
        file_url: signedUrl || cf.file_url,
        file_size_formatted: formatFileSizeStr(cf.file_size),
      };
    })
  );

  const submittedFormatted = formatDateTimeIndo(submission.submitted_at);

  return {
    ...submission,
    submitted_at_formatted:
      submittedFormatted.date && submittedFormatted.time
        ? `${submittedFormatted.date}, ${submittedFormatted.time}`
        : submission.submitted_at,
    submission_files: filesWithUrls,
    correction_files: correctionFilesWithUrls,
  };
};

/**
 * 10. UC-10: Pengumpulan Tugas oleh Siswa (Submit / Resubmit)
 * POST /api/v1/b5/student/assignments/:assignmentId/submissions
 */
export const submitStudentAssignmentService = async (assignmentId, user, files, body = {}) => {
  if (!isValidUUID(assignmentId)) {
    const error = new Error('assignmentId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verifikasi tugas di b5.assignments
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, class_id, course_id, deadline, allow_late_submission, submission_type')
    .eq('id', assignmentId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) {
    const error = new Error('Tugas tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Ambil class_id tugas (dengan fallback ke master.courses.class_id jika NULL)
  let targetClassId = assignment.class_id;
  if (!targetClassId && assignment.course_id) {
    const { data: courseData } = await supabaseAdmin
      .schema('master')
      .from('courses')
      .select('id, class_id')
      .eq('id', assignment.course_id)
      .maybeSingle();

    if (courseData?.class_id) {
      targetClassId = courseData.class_id;
      // Perbarui b5.assignments agar ke depannya selalu terisi konsisten
      await supabaseAdmin
        .schema('b5')
        .from('assignments')
        .update({ class_id: targetClassId })
        .eq('id', assignment.id);
    }
  }

  // Validasi hak akses (class_id)
  if (user.classId && targetClassId && targetClassId !== user.classId) {
    const [{ data: targetClass }, { data: studentClass }] = await Promise.all([
      supabaseAdmin.schema('master').from('classes').select('name').eq('id', targetClassId).maybeSingle(),
      supabaseAdmin.schema('master').from('classes').select('name').eq('id', user.classId).maybeSingle(),
    ]);

    const targetClassName = targetClass?.name || 'kelas lain';
    const studentClassName = studentClass?.name || user.className || 'kelas Anda';

    const error = new Error(
      `Akses ditolak. Tugas ini ditujukan untuk kelas ${targetClassName}, sedangkan Anda terdaftar di kelas ${studentClassName}.`
    );
    error.statusCode = 403;
    throw error;
  }

  // 3. Validasi keberadaan file (Alternate Flow A1)
  const fileList = Array.isArray(files) ? files : files ? [files] : [];
  if (fileList.length === 0) {
    const error = new Error('Minimal satu berkas tugas harus diunggah.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Cek apakah sudah pernah mengumpulkan (Alternate Flow A4)
  const { data: existingSubmission, error: existingError } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', user.studentId)
    .maybeSingle();

  if (existingError) throw existingError;

  // Jika sudah dinilai, tolak pengumpulan ulang
  if (existingSubmission && existingSubmission.score !== null) {
    const error = new Error('Tugas sudah dinilai oleh guru dan tidak dapat dikirim ulang.');
    error.statusCode = 400;
    throw error;
  }

  // 5. Validasi deadline & keterlambatan (Alternate Flow A2 & A3)
  const now = new Date();
  let isLate = false;
  let status = 'submitted';

  if (assignment.deadline) {
    const deadlineDate = new Date(assignment.deadline);
    if (now > deadlineDate) {
      if (!assignment.allow_late_submission) {
        const error = new Error(
          'Batas waktu pengumpulan telah berakhir dan tugas ini tidak menerima pengumpulan terlambat.'
        );
        error.statusCode = 400;
        throw error;
      }
      isLate = true;
      status = 'Terlambat';
    }
  }

  let targetSubmissionId;
  let submissionAttempt = 1;

  if (existingSubmission) {
    submissionAttempt = (existingSubmission.submission_attempt || 1) + 1;

    const { data: updatedSub, error: updateSubErr } = await supabaseAdmin
      .schema('b5')
      .from('submissions')
      .update({
        status,
        is_late: isLate,
        submitted_at: now.toISOString(),
        updated_at: now.toISOString(),
        submission_attempt: submissionAttempt,
      })
      .eq('id', existingSubmission.id)
      .select('*')
      .single();

    if (updateSubErr) throw updateSubErr;
    targetSubmissionId = updatedSub.id;

    // Bersihkan berkas lama dari Supabase Storage dan tabel b5.submission_files
    const { data: oldFiles } = await supabaseAdmin
      .schema('b5')
      .from('submission_files')
      .select('id, file_url')
      .eq('submission_id', existingSubmission.id);

    if (oldFiles && oldFiles.length > 0) {
      const pathsToRemove = oldFiles.map((f) => f.file_url).filter(Boolean);
      if (pathsToRemove.length > 0) {
        await supabaseAdmin.storage.from(SUBMISSIONS_BUCKET).remove(pathsToRemove);
      }
      await supabaseAdmin
        .schema('b5')
        .from('submission_files')
        .delete()
        .eq('submission_id', existingSubmission.id);
    }
  } else {
    // Pengumpulan baru
    const { data: newSub, error: insertSubErr } = await supabaseAdmin
      .schema('b5')
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.studentId,
        status,
        is_late: isLate,
        submission_attempt: 1,
        submitted_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select('*')
      .single();

    if (insertSubErr) throw insertSubErr;
    targetSubmissionId = newSub.id;
    submissionAttempt = 1;
  }

  // 6. Unggah file baru ke Supabase Storage (bucket 'submissions')
  const uploadedStoragePaths = [];
  const uploadedFileRecords = [];

  try {
    for (const file of fileList) {
      const safeName = sanitizeFileName(file.originalname);
      // Format path: {assignmentId}/{studentId}/{timestamp}_{safeName}
      const storagePath = `${assignmentId}/${user.studentId}/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(SUBMISSIONS_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Gagal mengunggah berkas ${file.originalname} ke bucket '${SUBMISSIONS_BUCKET}': ${uploadError.message}`
        );
      }

      uploadedStoragePaths.push(storagePath);

      const { data: fileRecord, error: fileDbErr } = await supabaseAdmin
        .schema('b5')
        .from('submission_files')
        .insert({
          submission_id: targetSubmissionId,
          file_name: file.originalname,
          file_url: storagePath,
          file_type: file.mimetype || 'application/octet-stream',
          file_size: file.size,
          uploaded_at: now.toISOString(),
        })
        .select('*')
        .single();

      if (fileDbErr) throw fileDbErr;
      uploadedFileRecords.push(fileRecord);
    }
  } catch (err) {
    // Rollback berkas yang sempat terunggah jika ada kegagalan
    if (uploadedStoragePaths.length > 0) {
      await supabaseAdmin.storage.from(SUBMISSIONS_BUCKET).remove(uploadedStoragePaths);
    }
    throw err;
  }

  // 7. Ambil hasil submission lengkap dan kembalikan
  return await getStudentMySubmissionService(assignmentId, user);
};

/**
 * 11. UC-11: Ambil Rekap Nilai Siswa untuk Course Tertentu
 * GET /api/v1/b5/student/courses/:courseId/grades
 */
export const getStudentCourseGradesService = async (courseId, user) => {
  if (!isValidUUID(courseId)) {
    const error = new Error('courseId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Ambil data semua tugas pada course
  const { data: assignments, error: asgErr } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, instructions, submission_type, deadline, start_at, created_at')
    .eq('course_id', courseId)
    .order('deadline', { ascending: false });

  if (asgErr) throw asgErr;

  const assignmentList = assignments || [];
  const assignmentIds = assignmentList.map((a) => a.id);

  // 2. Ambil data submission siswa untuk tugas-tugas tersebut
  let submissions = [];
  if (assignmentIds.length > 0) {
    const { data: subData, error: subErr } = await supabaseAdmin
      .schema('b5')
      .from('submissions')
      .select('id, assignment_id, student_id, status, score, feedback, is_late, submitted_at, graded_at')
      .eq('student_id', user.studentId)
      .in('assignment_id', assignmentIds);

    if (subErr) throw subErr;
    submissions = subData || [];
  }

  const submissionMap = new Map();
  submissions.forEach((s) => submissionMap.set(s.assignment_id, s));

  // 3. Ambil data apakah ada file koreksi guru untuk submission yang ada
  const submissionIds = submissions.map((s) => s.id);
  const correctionSet = new Set();
  if (submissionIds.length > 0) {
    const { data: corrData } = await supabaseAdmin
      .schema('b5')
      .from('correction_files')
      .select('submission_id')
      .in('submission_id', submissionIds);

    (corrData || []).forEach((c) => correctionSet.add(c.submission_id));
  }

  // 4. Hitung statistik
  const totalAsesmen = assignmentList.length;
  let totalScore = 0;
  let gradedCount = 0;
  let submittedCount = 0;
  let lateCount = 0;
  let missedCount = 0;
  const now = new Date();

  const items = assignmentList.map((asg) => {
    const sub = submissionMap.get(asg.id);
    const deadlineDate = asg.deadline ? new Date(asg.deadline) : null;
    const isPastDeadline = deadlineDate ? now > deadlineDate : false;

    let status = 'BELUM DIKERJAKAN';
    let badgeColor = 'bg-gray-100 text-gray-700';

    if (sub) {
      submittedCount++;
      if (sub.is_late || sub.status === 'Terlambat') {
        lateCount++;
      }

      if (sub.score !== null && sub.score !== undefined) {
        totalScore += Number(sub.score);
        gradedCount++;
        status = 'SUDAH DINILAI';
        badgeColor = 'bg-emerald-100 text-emerald-700';
      } else if (sub.is_late || sub.status === 'Terlambat') {
        status = 'TERLAMBAT';
        badgeColor = 'bg-amber-100 text-amber-700';
      } else {
        status = 'MENUNGGU PENILAIAN';
        badgeColor = 'bg-blue-100 text-blue-700';
      }
    } else if (isPastDeadline) {
      missedCount++;
      status = 'TERLEWAT';
      badgeColor = 'bg-rose-100 text-rose-700';
    }

    const submittedFormatted = sub?.submitted_at ? formatDateTimeIndo(sub.submitted_at) : null;
    const nilaiAngka = sub?.score !== null && sub?.score !== undefined ? Number(sub.score) : 0;
    const nilaiStr = sub?.score !== null && sub?.score !== undefined ? `${sub.score}/100` : '—';
    const jenis = asg.submission_type ? asg.submission_type.toUpperCase() : 'TUGAS';

    return {
      id: sub?.id || asg.id,
      assignment_id: asg.id,
      submission_id: sub?.id || null,
      asesmen: asg.title,
      jenis,
      dikumpulkan: submittedFormatted ? submittedFormatted.date : '—',
      status,
      badgeColor,
      nilaiAngka,
      nilai: nilaiStr,
      has_feedback: Boolean(sub?.feedback),
      has_correction_file: sub ? correctionSet.has(sub.id) : false,
      deadline_iso: asg.deadline,
    };
  });

  const rataRata = gradedCount > 0 ? (totalScore / gradedCount).toFixed(2).replace('.', ',') : '0';
  const rataRataNum = gradedCount > 0 ? Math.round((totalScore / gradedCount) * 10) / 10 : 0;
  const penyelesaianPercent =
    totalAsesmen > 0 ? Math.round((submittedCount / totalAsesmen) * 100 * 10) / 10 : 0;

  return {
    course_id: courseId,
    stats: {
      rata_rata: rataRata,
      rata_rata_num: rataRataNum,
      penyelesaian: `${penyelesaianPercent}%`,
      penyelesaian_num: penyelesaianPercent,
      total_asesmen: totalAsesmen,
      sudah_dinilai: gradedCount,
      terlambat: lateCount,
      terlewat: missedCount,
    },
    items,
  };
};

/**
 * 12. UC-11: Detail Penilaian Siswa (Nilai, Feedback, & File Koreksi)
 * GET /api/v1/b5/student/submissions/:submissionId/grade
 * Alias: GET /api/v1/b5/student/assignments/:assignmentId/grade
 */
export const getStudentGradeDetailService = async (identifier, user) => {
  if (!isValidUUID(identifier)) {
    const error = new Error('Identifier tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Coba cari submission berdasarkan ID submission
  let { data: submission, error: subErr } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select(`
      id,
      assignment_id,
      student_id,
      status,
      score,
      feedback,
      is_late,
      submission_attempt,
      submitted_at,
      graded_at,
      updated_at
    `)
    .eq('id', identifier)
    .maybeSingle();

  if (subErr) throw subErr;

  // Jika tidak ditemukan by submission.id, coba cari by assignment_id untuk student ini
  if (!submission) {
    const { data: subByAsg, error: subByAsgErr } = await supabaseAdmin
      .schema('b5')
      .from('submissions')
      .select(`
        id,
        assignment_id,
        student_id,
        status,
        score,
        feedback,
        is_late,
        submission_attempt,
        submitted_at,
        graded_at,
        updated_at
      `)
      .eq('assignment_id', identifier)
      .eq('student_id', user.studentId)
      .maybeSingle();

    if (subByAsgErr) throw subByAsgErr;
    submission = subByAsg;
  }

  // 2. Jika submission tetap tidak ditemukan, cek apakah identifier adalah assignment_id valid
  if (!submission) {
    const { data: asg } = await supabaseAdmin
      .schema('b5')
      .from('assignments')
      .select('id, title')
      .eq('id', identifier)
      .maybeSingle();

    if (asg) {
      const notFound = new Error('Belum ada pengumpulan atau penilaian untuk tugas ini.');
      notFound.statusCode = 404;
      throw notFound;
    }

    const notFound = new Error('Data penilaian tidak ditemukan.');
    notFound.statusCode = 404;
    throw notFound;
  }

  // 3. ENFORCE STRICT OWNERSHIP: Siswa hanya boleh melihat nilainya sendiri!
  if (submission.student_id !== user.studentId) {
    const forbidden = new Error(
      'Akses ditolak. Anda tidak memiliki hak untuk melihat penilaian siswa lain.'
    );
    forbidden.statusCode = 403;
    throw forbidden;
  }

  // 4. Ambil detail tugas
  const { data: assignment, error: asgErr } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, instructions, deadline, course_id, class_id')
    .eq('id', submission.assignment_id)
    .maybeSingle();

  if (asgErr) throw asgErr;

  // 5. Ambil data profil siswa (nama, nis, kelas)
  const { data: student } = await supabaseAdmin
    .schema('master')
    .from('students')
    .select('id, name, nis, class_id')
    .eq('id', submission.student_id)
    .maybeSingle();

  let classData = null;
  const targetClassId = student?.class_id || user.classId || assignment?.class_id;
  if (targetClassId) {
    const { data: cls } = await supabaseAdmin
      .schema('master')
      .from('classes')
      .select('id, name')
      .eq('id', targetClassId)
      .maybeSingle();
    classData = cls;
  }

  // 6. Ambil berkas pengumpulan siswa (submission_files)
  const { data: subFiles } = await supabaseAdmin
    .schema('b5')
    .from('submission_files')
    .select('id, file_name, file_url, file_type, file_size, uploaded_at')
    .eq('submission_id', submission.id);

  const submissionFilesWithUrls = await Promise.all(
    (subFiles || []).map(async (sf) => {
      const signedUrl = await createSignedUrl(sf.file_url, SUBMISSIONS_BUCKET);
      return {
        ...sf,
        signed_url: signedUrl,
        file_url: signedUrl || sf.file_url,
        file_size_formatted: formatFileSizeStr(sf.file_size),
      };
    })
  );

  // 7. Ambil berkas koreksi dari guru (correction_files)
  const { data: corrFiles } = await supabaseAdmin
    .schema('b5')
    .from('correction_files')
    .select('id, file_name, file_url, file_type, file_size, uploaded_at')
    .eq('submission_id', submission.id)
    .order('uploaded_at', { ascending: false });

  const correctionFilesWithUrls = await Promise.all(
    (corrFiles || []).map(async (cf) => {
      const signedUrl = await createSignedUrl(cf.file_url, CORRECTIONS_BUCKET);
      return {
        ...cf,
        signed_url: signedUrl,
        file_url: signedUrl || cf.file_url,
        file_size_formatted: formatFileSizeStr(cf.file_size),
      };
    })
  );

  const submittedFormatted = formatDateTimeIndo(submission.submitted_at);
  const waktuPengumpulan =
    submittedFormatted.date && submittedFormatted.time
      ? `${submittedFormatted.date}, ${submittedFormatted.time}`
      : '-';

  const isGraded = submission.score !== null && submission.score !== undefined;
  const primaryCorrectionFile = correctionFilesWithUrls[0] || null;

  return {
    id: submission.id,
    submission_id: submission.id,
    assignment_id: assignment?.id || submission.assignment_id,
    namaSiswa: student?.name || user.name || 'Siswa',
    nis: student?.nis || user.nis || '-',
    kelas: classData?.name || user.className || 'X - A',
    namaTugas: assignment?.title || 'Tugas',
    waktuPengumpulan,
    nilai: isGraded ? Number(submission.score) : null,
    kkm: 75,
    status: isGraded ? 'SUDAH DINILAI' : 'MENUNGGU PENILAIAN',
    isGraded,
    hasFeedback: Boolean(submission.feedback || primaryCorrectionFile),
    feedbackText: submission.feedback || '',
    fileKoreksi: primaryCorrectionFile?.file_name || null,
    fileKoreksiUrl: primaryCorrectionFile?.signed_url || null,
    fileKoreksiSize: primaryCorrectionFile?.file_size_formatted || null,
    correction_files: correctionFilesWithUrls,
    submission_files: submissionFilesWithUrls,
  };
};
