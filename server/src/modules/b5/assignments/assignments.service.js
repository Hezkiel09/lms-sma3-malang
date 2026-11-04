import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { supabaseAdmin } from '../../../config/supabase.js';

const ASSIGNMENTS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_ASSIGNMENTS || 'assignments';
const SIGNED_URL_TTL_SECONDS = Number(process.env.SUPABASE_SIGNED_URL_TTL_SECONDS || 3600);

const sanitizeStorageFileName = (fileName = 'file') => {
  const baseName = path.basename(fileName).normalize('NFKD');
  const safeName = baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(-120);

  return safeName || 'file';
};

const formatFileSizeStr = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '';

  const d = new Date(dateStr);

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
};

const formatDateTimeIndo = (dateStr) => {
  if (!dateStr) return '';

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  const dateFormatted = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  const timeFormatted = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).replace(':', '.');

  return `${dateFormatted}, ${timeFormatted} WIB`;
};

/**
 * Mengubah path Storage menjadi signed URL privat.
 */
const addSignedUrlToFile = async (file) => {
  if (!file?.file_url || /^https?:\/\//i.test(file.file_url)) {
    return file;
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(ASSIGNMENTS_BUCKET)
      .createSignedUrl(file.file_url, SIGNED_URL_TTL_SECONDS);

    if (error) {
      console.warn(
        `Gagal membuat signed URL untuk file tugas ${file.file_url}:`,
        error.message
      );

      return { ...file, file_url: null };
    }

    return { ...file, file_url: data.signedUrl };
  } catch (err) {
    console.warn(
      `Pengecualian saat membuat signed URL file tugas ${file.file_url}:`,
      err.message
    );

    return { ...file, file_url: null };
  }
};

const addSignedUrlsToFiles = async (files = []) =>
  Promise.all(files.map(addSignedUrlToFile));

/**
 * Rollback data dan file jika pembuatan tugas gagal di tengah jalan.
 */
const rollbackCreatedAssignment = async (assignmentId, uploadedPaths = []) => {
  if (uploadedPaths.length > 0) {
    const { error } = await supabaseAdmin.storage
      .from(ASSIGNMENTS_BUCKET)
      .remove(uploadedPaths);

    if (error) {
      console.error(
        'Gagal membersihkan file tugas dari Storage saat rollback:',
        error
      );
    }
  }

  const { error: filesError } = await supabaseAdmin
    .schema('b5')
    .from('assignment_files')
    .delete()
    .eq('assignment_id', assignmentId);

  if (filesError) {
    console.error('Gagal membersihkan metadata lampiran tugas:', filesError);
  }

  const { error: assignmentError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .delete()
    .eq('id', assignmentId);

  if (assignmentError) {
    console.error('Gagal membersihkan record tugas:', assignmentError);
  }
};

/**
 * Normalisasi format submission_type.
 * Menerima string atau array.
 */
const normalizeSubmissionType = (submissionType) => {
  if (Array.isArray(submissionType)) {
    return submissionType
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean)
      .join(',') || 'file';
  }

  if (typeof submissionType === 'string' && submissionType.trim()) {
    return submissionType.trim().toLowerCase();
  }

  return 'file';
};

/**
 * Service untuk membuat tugas baru (UC-04).
 * Relasi tugas ditentukan berdasarkan Section.
 */
export const createAssignmentService = async ({
  sectionId,
  courseId = null,
  title,
  instructions,
  description = null,
  startDate,
  deadlineDate,
  submissionType = 'file',
  allowLateSubmission = false,
  notifyStudents = false,
  files = [],
}) => {
  // 1. Validasi keberadaan Section
  const { data: section, error: sectionError } = await supabaseAdmin
    .schema('master')
    .from('course_sections')
    .select('id, title, description, course_id, position')
    .eq('id', sectionId)
    .maybeSingle();

  if (sectionError) throw sectionError;

  if (!section) {
    const error = new Error('Section tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Pastikan Course yang dikirim (jika ada) sesuai dengan Section
  if (courseId && courseId !== section.course_id) {
    const error = new Error(
      'Course ID tidak sesuai dengan Section yang dipilih.'
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Ambil Course berdasarkan Section
  const { data: course, error: courseError } = await supabaseAdmin
    .schema('master')
    .from('courses')
    .select('id, class_id, subject_id, teacher_id')
    .eq('id', section.course_id)
    .maybeSingle();

  if (courseError) throw courseError;

  if (!course) {
    const error = new Error('Course tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const teacherId = course.teacher_id;

  if (!teacherId) {
    const error = new Error('Course belum memiliki Guru yang ditetapkan.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedSubtype = normalizeSubmissionType(submissionType);

  // 4. Simpan record tugas ke b5.assignments
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .insert({
      section_id: section.id,
      course_id: course.id,
      class_id: course.class_id,
      teacher_id: teacherId,
      subject_id: course.subject_id,
      title: title.trim(),
      instructions: instructions ? instructions.trim() : null,
      description: description ? description.trim() : null,
      start_at: startDate.toISOString(),
      deadline: deadlineDate.toISOString(),
      submission_type: normalizedSubtype,
      allow_late_submission: Boolean(allowLateSubmission),
      notify_students: Boolean(notifyStudents),
    })
    .select(`
      id,
      section_id,
      course_id,
      class_id,
      teacher_id,
      subject_id,
      title,
      description,
      instructions,
      start_at,
      deadline,
      submission_type,
      allow_late_submission,
      notify_students,
      created_at,
      updated_at
    `)
    .single();

  if (assignmentError) throw assignmentError;

  const uploadedPaths = [];

  try {
    // 5. Upload lampiran ke bucket assignments jika tersedia
    const fileRows = [];

    for (const file of files) {
      if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
        throw new Error(
          `Konten file ${file.originalname || 'lampiran'} tidak valid.`
        );
      }

      const safeFileName = sanitizeStorageFileName(file.originalname);

      const storagePath =
        `${teacherId}/${assignment.id}/${randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(ASSIGNMENTS_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadedPaths.push(storagePath);

      fileRows.push({
        assignment_id: assignment.id,
        file_name: file.originalname,
        file_url: storagePath,
        file_type: file.mimetype || null,
        file_size: file.size ?? file.buffer.length,
      });
    }

    // 6. Simpan metadata lampiran ke b5.assignment_files
    let savedFiles = [];

    if (fileRows.length > 0) {
      const { data, error: filesInsertError } = await supabaseAdmin
        .schema('b5')
        .from('assignment_files')
        .insert(fileRows)
        .select(
          'id, assignment_id, file_name, file_url, file_type, file_size, uploaded_at'
        );

      if (filesInsertError) throw filesInsertError;

      savedFiles = data || [];
    }

    const filesWithSignedUrls = await addSignedUrlsToFiles(savedFiles);

    return {
      ...assignment,
      section,
      publishedAt: formatDateIndo(assignment.created_at),
      deadline_formatted: formatDateTimeIndo(assignment.deadline),
      start_at_wib: formatDateTimeIndo(assignment.start_at),
      allowed_file_types: normalizedSubtype.split(',').map((s) => s.trim()),
      assignment_files: filesWithSignedUrls,
    };
  } catch (error) {
    await rollbackCreatedAssignment(assignment.id, uploadedPaths);
    throw error;
  }
};

/**
 * Service untuk mengambil detail tugas berdasarkan ID (Persiapan UC-06).
 */
export const getAssignmentByIdService = async (id) => {
  // 1. Ambil data utama tugas
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select(`
      id,
      section_id,
      course_id,
      class_id,
      teacher_id,
      subject_id,
      title,
      description,
      instructions,
      start_at,
      deadline,
      submission_type,
      allow_late_submission,
      notify_students,
      created_at,
      updated_at
    `)
    .eq('id', id)
    .maybeSingle();

  if (assignmentError) throw assignmentError;

  if (!assignment) {
    const error = new Error('Tugas tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Ambil lampiran guru
  const { data: filesData, error: filesError } = await supabaseAdmin
    .schema('b5')
    .from('assignment_files')
    .select(
      'id, assignment_id, file_name, file_url, file_type, file_size, uploaded_at'
    )
    .eq('assignment_id', id)
    .order('uploaded_at', { ascending: true });

  if (filesError) throw filesError;

  const assignmentFiles = await addSignedUrlsToFiles(filesData || []);

  // 3. Ambil data pendukung dari schema master dan b5
  const [
    courseResult,
    classResult,
    subjectResult,
    teacherResult,
    submissionsResult,
    sectionResult,
  ] = await Promise.all([
    assignment.course_id
      ? supabaseAdmin
          .schema('master')
          .from('course_details')
          .select('*')
          .eq('id', assignment.course_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    assignment.class_id
      ? supabaseAdmin
          .schema('master')
          .from('classes')
          .select('id, name, level, major')
          .eq('id', assignment.class_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    assignment.subject_id
      ? supabaseAdmin
          .schema('master')
          .from('subjects')
          .select('id, name')
          .eq('id', assignment.subject_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    assignment.teacher_id
      ? supabaseAdmin
          .schema('master')
          .from('teachers')
          .select('id, user_id, nip, name, phone')
          .eq('id', assignment.teacher_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    // Ringkasan pengumpulan siswa (persiapan UC-06)
    supabaseAdmin
      .schema('b5')
      .from('submissions')
      .select('id, status, is_late, score')
      .eq('assignment_id', id),

    assignment.section_id
      ? supabaseAdmin
          .schema('master')
          .from('course_sections')
          .select('id, title, description, course_id, position')
          .eq('id', assignment.section_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (courseResult.error) throw courseResult.error;
  if (classResult.error) throw classResult.error;
  if (subjectResult.error) throw subjectResult.error;
  if (teacherResult.error) throw teacherResult.error;
  if (submissionsResult.error) throw submissionsResult.error;
  if (sectionResult.error) throw sectionResult.error;

  const submissions = submissionsResult.data || [];

  const submittedCount = submissions.filter(
    (s) => s.status && s.status !== 'unsubmitted'
  ).length;

  const gradedCount = submissions.filter(
    (s) => s.score !== null
  ).length;

  const lateCount = submissions.filter(
    (s) => s.is_late
  ).length;

  const primaryFile = assignmentFiles[0] || null;

  return {
    ...assignment,
    section: sectionResult.data || null,
    publishedAt: formatDateIndo(assignment.created_at),
    deadline_formatted: formatDateTimeIndo(assignment.deadline),
    deadline: assignment.deadline,
    deadline_raw: assignment.deadline,
    start_date: assignment.start_at,
    start_date_formatted: formatDateTimeIndo(assignment.start_at),
    start_at_wib: formatDateTimeIndo(assignment.start_at),
    instruction: assignment.instructions,
    subject: subjectResult.data?.name || courseResult.data?.subject_name || 'Mata Pelajaran',
    className: classResult.data?.name || courseResult.data?.class_name || 'Kelas',

    author: {
      name: teacherResult.data?.name || courseResult.data?.teacher_name || 'Guru',
      nip: teacherResult.data?.nip || null,
    },

    course: courseResult.data || null,
    class: classResult.data || null,

    allowed_file_types: (assignment.submission_type || 'file')
      .split(',')
      .map((s) => s.trim()),

    attachment: primaryFile?.file_name || null,
    attachmentSize: primaryFile?.file_size
      ? formatFileSizeStr(primaryFile.file_size)
      : null,
    attachmentUrl: primaryFile?.file_url || null,

    assignment_files: assignmentFiles.map((f) => ({ ...f, signed_url: f.file_url })),
    files: assignmentFiles.map((f) => ({ ...f, signed_url: f.file_url })),

    submission_summary: {
      total_submitted: submittedCount,
      total_graded: gradedCount,
      total_late: lateCount,
    },
  };
};

/**
 * Service untuk mengambil seluruh tugas dalam suatu Course.
 * Tetap dipertahankan untuk kompatibilitas endpoint lama.
 */
export const getAssignmentsByCourseIdService = async (courseId) => {
  // 1. Verifikasi keberadaan Course
  const { data: course, error: courseError } = await supabaseAdmin
    .schema('master')
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .maybeSingle();

  if (courseError) throw courseError;

  if (!course) {
    const error = new Error('Course tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Ambil semua tugas dalam Course
  const { data: assignments, error: assignmentsError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select(`
      id,
      section_id,
      course_id,
      class_id,
      teacher_id,
      subject_id,
      title,
      description,
      instructions,
      start_at,
      deadline,
      submission_type,
      allow_late_submission,
      notify_students,
      created_at,
      updated_at,
      assignment_files (
        id,
        assignment_id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (assignmentsError) throw assignmentsError;

  return Promise.all(
    (assignments || []).map(async (item) => ({
      ...item,
      publishedAt: formatDateIndo(item.created_at),
      deadline_formatted: formatDateTimeIndo(item.deadline),
      start_at_wib: formatDateTimeIndo(item.start_at),
      allowed_file_types: (item.submission_type || 'file')
        .split(',')
        .map((s) => s.trim()),
      assignment_files: await addSignedUrlsToFiles(
        item.assignment_files || []
      ),
    }))
  );
};

/**
 * Service untuk mengambil tugas berdasarkan Course dan Section.
 */
export const getAssignmentsBySectionIdService = async (
  courseId,
  sectionId
) => {
  // 1. Pastikan Section berada di Course yang diminta
  const { data: section, error: sectionError } = await supabaseAdmin
    .schema('master')
    .from('course_sections')
    .select('id, title, description, course_id, position')
    .eq('id', sectionId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (sectionError) throw sectionError;

  if (!section) {
    const error = new Error(
      'Section tidak ditemukan pada Course tersebut.'
    );
    error.statusCode = 404;
    throw error;
  }

  // 2. Ambil tugas berdasarkan Course dan Section
  const { data: assignments, error: assignmentsError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select(`
      id,
      section_id,
      course_id,
      class_id,
      teacher_id,
      subject_id,
      title,
      description,
      instructions,
      start_at,
      deadline,
      submission_type,
      allow_late_submission,
      notify_students,
      created_at,
      updated_at,
      assignment_files (
        id,
        assignment_id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .eq('course_id', courseId)
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false });

  if (assignmentsError) throw assignmentsError;

  return Promise.all(
    (assignments || []).map(async (item) => ({
      ...item,
      section,
      publishedAt: formatDateIndo(item.created_at),
      deadline_formatted: formatDateTimeIndo(item.deadline),
      start_at_wib: formatDateTimeIndo(item.start_at),
      allowed_file_types: (item.submission_type || 'file')
        .split(',')
        .map((s) => s.trim()),
      assignment_files: await addSignedUrlsToFiles(
        item.assignment_files || []
      ),
    }))
  );
};

/**
 * Service untuk memperbarui data tugas (UC-05), menghapus lampiran tertentu, dan mengunggah lampiran baru.
 */
export const updateAssignmentService = async (
  id,
  {
    title,
    instructions,
    description,
    startDate,
    deadlineDate,
    submissionType,
    allowLateSubmission,
    notifyStudents,
    deletedFileIds = [],
    files = [],
  }
) => {
  // 1. Pastikan tugas tersedia
  const { data: existingAssignment, error: findError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!existingAssignment) {
    const error = new Error('Tugas tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Siapkan data update
  const updatePayload = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined && title !== null) updatePayload.title = title.trim();
  if (instructions !== undefined) updatePayload.instructions = instructions ? instructions.trim() : null;
  if (description !== undefined) updatePayload.description = description ? description.trim() : null;
  if (startDate instanceof Date && !isNaN(startDate.getTime())) {
    updatePayload.start_at = startDate.toISOString();
  }
  if (deadlineDate instanceof Date && !isNaN(deadlineDate.getTime())) {
    updatePayload.deadline = deadlineDate.toISOString();
  }
  if (submissionType !== undefined && submissionType !== null) {
    updatePayload.submission_type = String(submissionType).toLowerCase().trim();
  }
  if (allowLateSubmission !== undefined) {
    updatePayload.allow_late_submission = Boolean(allowLateSubmission);
  }
  if (notifyStudents !== undefined) {
    updatePayload.notify_students = Boolean(notifyStudents);
  }

  const { error: updateError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .update(updatePayload)
    .eq('id', id);

  if (updateError) throw updateError;

  // 3. Hapus lampiran yang diminta di deletedFileIds
  if (Array.isArray(deletedFileIds) && deletedFileIds.length > 0) {
    for (const fileId of deletedFileIds) {
      if (!fileId) continue;
      const { data: fileRow } = await supabaseAdmin
        .schema('b5')
        .from('assignment_files')
        .select('id, file_url')
        .eq('id', fileId)
        .eq('assignment_id', id)
        .maybeSingle();

      if (fileRow) {
        if (fileRow.file_url && ASSIGNMENTS_BUCKET) {
          const { error: storageErr } = await supabaseAdmin.storage
            .from(ASSIGNMENTS_BUCKET)
            .remove([fileRow.file_url]);
          if (storageErr) console.warn('Gagal menghapus file dari storage:', storageErr.message);
        }
        await supabaseAdmin
          .schema('b5')
          .from('assignment_files')
          .delete()
          .eq('id', fileId)
          .eq('assignment_id', id);
      }
    }
  }

  // 4. Unggah lampiran baru jika ada
  if (Array.isArray(files) && files.length > 0) {
    const teacherId = existingAssignment.teacher_id || 'general';
    for (const file of files) {
      if (!file || !file.buffer) continue;
      const safeFileName = sanitizeStorageFileName(file.originalname);
      const storagePath = `${teacherId}/${id}/${randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(ASSIGNMENTS_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload lampiran tugas baru gagal:', uploadError);
        continue;
      }

      await supabaseAdmin
        .schema('b5')
        .from('assignment_files')
        .insert({
          assignment_id: id,
          file_name: file.originalname,
          file_url: storagePath,
          file_type: file.mimetype || null,
          file_size: file.size ?? file.buffer.length,
        });
    }
  }

  // 5. Kembalikan detail tugas yang telah diperbarui
  return getAssignmentByIdService(id);
};

/**
 * Service untuk menghapus seluruh tugas beserta file lampirannya (UC-05).
 */
export const deleteAssignmentService = async (id) => {
  // 1. Verifikasi tugas tersedia
  const { data: existingAssignment, error: findError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, course_id, section_id')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!existingAssignment) {
    const error = new Error('Tugas tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Ambil seluruh lampiran milik tugas ini
  const { data: files } = await supabaseAdmin
    .schema('b5')
    .from('assignment_files')
    .select('id, file_url')
    .eq('assignment_id', id);

  // 3. Hapus file fisik dari Supabase Storage
  const storagePaths = (files || []).map((f) => f.file_url).filter(Boolean);
  if (storagePaths.length > 0 && ASSIGNMENTS_BUCKET) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(ASSIGNMENTS_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.warn('Gagal menghapus file tugas dari storage (dilanjutkan):', storageError.message);
    }
  }

  // 4. Hapus metadata lampiran di b5.assignment_files
  await supabaseAdmin
    .schema('b5')
    .from('assignment_files')
    .delete()
    .eq('assignment_id', id);

  // 5. Bersihkan data submission jika ada relasi
  try {
    await supabaseAdmin
      .schema('b5')
      .from('submissions')
      .delete()
      .eq('assignment_id', id);
  } catch (subErr) {
    console.warn('Pembersihan submission tidak diperlukan atau dilewati:', subErr.message);
  }

  // 6. Hapus record utama di b5.assignments
  const { data: deletedAssignment, error: deleteError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .delete()
    .eq('id', id)
    .select('id, title, section_id, course_id')
    .maybeSingle();

  if (deleteError) throw deleteError;

  return deletedAssignment || existingAssignment;
};

/**
 * Service untuk menghapus satu file lampiran tugas (UC-05).
 */
export const deleteAssignmentFileService = async (assignmentId, fileId) => {
  const { data: fileRow, error: findError } = await supabaseAdmin
    .schema('b5')
    .from('assignment_files')
    .select('id, file_url, file_name')
    .eq('id', fileId)
    .eq('assignment_id', assignmentId)
    .maybeSingle();

  if (findError) throw findError;
  if (!fileRow) {
    const error = new Error('Lampiran tidak ditemukan pada tugas ini.');
    error.statusCode = 404;
    throw error;
  }

  if (fileRow.file_url && ASSIGNMENTS_BUCKET) {
    const { error: storageErr } = await supabaseAdmin.storage
      .from(ASSIGNMENTS_BUCKET)
      .remove([fileRow.file_url]);
    if (storageErr) console.warn('Gagal menghapus file dari storage:', storageErr.message);
  }

  const { error: deleteError } = await supabaseAdmin
    .schema('b5')
    .from('assignment_files')
    .delete()
    .eq('id', fileId)
    .eq('assignment_id', assignmentId);

  if (deleteError) throw deleteError;

  return { id: fileId, file_name: fileRow.file_name };
};
