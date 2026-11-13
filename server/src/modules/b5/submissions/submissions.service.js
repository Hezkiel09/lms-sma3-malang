import path from 'node:path';
import { supabaseAdmin } from '../../../config/supabase.js';
import { isValidUUID } from '../../../utils/validation.js';

// Bucket khusus untuk berkas pengumpulan tugas siswa
export const SUBMISSIONS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET_SUBMISSIONS || 'submissions';

// Bucket khusus untuk berkas koreksi yang diunggah guru
export const CORRECTIONS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET_CORRECTIONS || 'corrections';

export const SIGNED_URL_TTL = parseInt(
  process.env.SUPABASE_SIGNED_URL_TTL_SECONDS || '3600',
  10
);

/**
 * Helper: buat signed URL untuk file di Supabase Storage dengan bucket eksplisit.
 * @param {string} storagePath - Jalur penyimpanan file di bucket
 * @param {string} bucketName - Nama bucket (SUBMISSIONS_BUCKET atau CORRECTIONS_BUCKET)
 */
export async function createSignedUrl(storagePath, bucketName) {
  if (!storagePath || !bucketName) return null;
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (error) {
    console.warn(
      `[createSignedUrl] Gagal membuat signed URL dari bucket '${bucketName}' untuk path '${storagePath}':`,
      error.message
    );
    return null;
  }
  return data?.signedUrl || null;
}

/**
 * Helper: format ukuran file (bytes → readable string).
 */
function formatFileSizeStr(sizeInBytes) {
  if (!sizeInBytes || isNaN(sizeInBytes)) return null;
  const bytes = Number(sizeInBytes);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Helper: format tanggal ke format Indonesia WIB.
 */
function formatDateTimeIndo(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
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
  } catch {
    return dateStr;
  }
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
 * Service: Pengumpulan Tugas oleh Siswa (Submit Assignment).
 * Mengunggah berkas siswa ke bucket 'submissions' di Supabase Storage,
 * lalu mencatat metadata ke b5.submissions dan b5.submission_files.
 *
 * @param {Object} params
 * @param {string} params.assignmentId - ID tugas
 * @param {string} params.studentId - ID siswa
 * @param {Array} params.files - Daftar file yang diunggah siswa (dari req.files)
 */
export const submitAssignmentService = async ({ assignmentId, studentId, files }) => {
  if (!isValidUUID(assignmentId)) {
    const error = new Error('assignmentId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  if (!isValidUUID(studentId)) {
    const error = new Error('studentId tidak valid. Format harus UUID.');
    error.statusCode = 400;
    throw error;
  }

  if (!files || files.length === 0) {
    const error = new Error('Minimal satu berkas tugas harus diunggah.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verifikasi keberadaan tugas
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, deadline, allow_late_submission')
    .eq('id', assignmentId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) {
    const error = new Error('Tugas tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Cek batas waktu pengumpulan
  const now = new Date();
  let isLate = false;
  if (assignment.deadline) {
    const deadlineDate = new Date(assignment.deadline);
    if (now > deadlineDate) {
      if (!assignment.allow_late_submission) {
        const error = new Error(
          'Batas waktu pengumpulan tugas telah berakhir dan tugas ini tidak menerima pengumpulan terlambat.'
        );
        error.statusCode = 400;
        throw error;
      }
      isLate = true;
    }
  }

  // 3. Cek apakah siswa sudah pernah mengumpulkan tugas ini
  const { data: existingSubmission, error: existingError } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existingError) throw existingError;

  let submissionRecord = existingSubmission;
  const currentAttempt = (existingSubmission?.submission_attempt || 0) + 1;

  if (existingSubmission) {
    // Perbarui status pengumpulan jika sudah pernah submit
    const { data: updatedSub, error: updateSubErr } = await supabaseAdmin
      .schema('b5')
      .from('submissions')
      .update({
        status: isLate ? 'Terlambat' : 'submitted',
        is_late: isLate,
        submitted_at: now.toISOString(),
        submission_attempt: currentAttempt,
        updated_at: now.toISOString(),
      })
      .eq('id', existingSubmission.id)
      .select('*')
      .single();

    if (updateSubErr) throw updateSubErr;
    submissionRecord = updatedSub;
  } else {
    // Buat record pengumpulan baru
    const { data: newSub, error: insertSubErr } = await supabaseAdmin
      .schema('b5')
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        status: isLate ? 'Terlambat' : 'submitted',
        is_late: isLate,
        submitted_at: now.toISOString(),
        submission_attempt: currentAttempt,
        updated_at: now.toISOString(),
      })
      .select('*')
      .single();

    if (insertSubErr) throw insertSubErr;
    submissionRecord = newSub;
  }

  // 4. Unggah berkas-berkas siswa ke bucket 'submissions' di Supabase Storage
  const uploadedFilesRecords = [];
  const uploadedStoragePaths = [];

  try {
    for (const file of files) {
      const safeName = sanitizeFileName(file.originalname);
      // Jalur penyimpanan di bucket 'submissions':
      // {assignmentId}/{studentId}/{timestamp}_{filename}
      const storagePath = `${assignmentId}/${studentId}/${Date.now()}_${safeName}`;

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

      // Simpan metadata ke tabel b5.submission_files
      const { data: fileRecord, error: fileDbErr } = await supabaseAdmin
        .schema('b5')
        .from('submission_files')
        .insert({
          submission_id: submissionRecord.id,
          file_name: file.originalname,
          file_url: storagePath,
          file_type: file.mimetype || 'application/octet-stream',
          file_size: file.size,
          uploaded_at: now.toISOString(),
        })
        .select('*')
        .single();

      if (fileDbErr) throw fileDbErr;
      uploadedFilesRecords.push(fileRecord);
    }
  } catch (error) {
    // Rollback berkas yang sempat terunggah jika terjadi kegagalan
    if (uploadedStoragePaths.length > 0) {
      await supabaseAdmin.storage
        .from(SUBMISSIONS_BUCKET)
        .remove(uploadedStoragePaths);
    }
    throw error;
  }

  return await getSubmissionByIdService(submissionRecord.id);
};

/**
 * Service: ambil semua submissions untuk suatu assignment (UC-06 & UC-07).
 * GET /api/v1/b5/assignments/:assignmentId/submissions
 */
export const getSubmissionsByAssignmentIdService = async (assignmentId) => {
  // 1. Verifikasi keberadaan assignment
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .schema('b5')
    .from('assignments')
    .select('id, title, class_id, course_id, deadline')
    .eq('id', assignmentId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) {
    const error = new Error('Tugas tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Ambil semua submissions untuk assignment ini
  const { data: submissions, error: submissionsError } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('id, assignment_id, student_id, status, is_late, score, feedback, submitted_at, graded_at')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });

  if (submissionsError) throw submissionsError;

  // 3. Untuk setiap submission, ambil file siswa dan file koreksi guru
  const submissionsWithDetails = await Promise.all(
    (submissions || []).map(async (sub) => {
      // Ambil file yang dikumpulkan siswa dari bucket 'submissions' secara eksplisit
      const { data: files } = await supabaseAdmin
        .schema('b5')
        .from('submission_files')
        .select('id, submission_id, file_name, file_url, file_type, file_size, uploaded_at')
        .eq('submission_id', sub.id)
        .order('uploaded_at', { ascending: true });

      const filesWithUrls = await Promise.all(
        (files || []).map(async (f) => ({
          ...f,
          signed_url: await createSignedUrl(f.file_url, SUBMISSIONS_BUCKET),
          file_size_formatted: formatFileSizeStr(f.file_size),
        }))
      );

      // Ambil file koreksi guru dari bucket 'corrections' secara eksplisit
      const { data: corrections } = await supabaseAdmin
        .schema('b5')
        .from('correction_files')
        .select('id, submission_id, file_name, file_url, file_type, file_size, uploaded_at')
        .eq('submission_id', sub.id)
        .order('uploaded_at', { ascending: true });

      const correctionsWithUrls = await Promise.all(
        (corrections || []).map(async (c) => ({
          ...c,
          signed_url: await createSignedUrl(c.file_url, CORRECTIONS_BUCKET),
          file_size_formatted: formatFileSizeStr(c.file_size),
        }))
      );

      // Ambil data siswa dari master.students
      let studentData = null;
      if (sub.student_id) {
        const { data: student } = await supabaseAdmin
          .schema('master')
          .from('students')
          .select('id, user_id, nis, name')
          .eq('id', sub.student_id)
          .maybeSingle();
        studentData = student;
      }

      const primaryStudentFile = filesWithUrls[0] || null;
      const primaryCorrectionFile = correctionsWithUrls[0] || null;

      // Status label yang ramah untuk UI frontend
      const displayStatus =
        sub.score !== null
          ? 'Sudah dinilai'
          : sub.is_late
            ? 'Terlambat'
            : sub.status === 'submitted' || sub.submitted_at
              ? 'Diserahkan'
              : 'Belum mengumpulkan';

      return {
        ...sub,
        id: sub.id,
        submission_id: sub.id,
        student_id: sub.student_id,
        name: studentData?.name || 'Siswa',
        nama: studentData?.name || 'Siswa',
        nis: studentData?.nis || '-',
        asesmen: assignment.title,
        status: displayStatus,
        submittedAt: sub.submitted_at ? formatDateTimeIndo(sub.submitted_at).split(',')[0] : '',
        time: sub.submitted_at ? formatDateTimeIndo(sub.submitted_at).split(',')[1]?.trim() : '',
        submitted_at_formatted: formatDateTimeIndo(sub.submitted_at),
        graded_at_formatted: formatDateTimeIndo(sub.graded_at),
        score: sub.score,
        nilai: sub.score !== null ? sub.score : '--',
        feedback: sub.feedback || '',
        student: studentData,
        file: primaryStudentFile?.file_name || null,
        fileName: primaryStudentFile?.file_name || null,
        fileSize: primaryStudentFile?.file_size_formatted || null,
        fileUrl: primaryStudentFile?.signed_url || null,
        files: filesWithUrls,
        fileKoreksiName: primaryCorrectionFile?.file_name || null,
        fileKoreksiUrl: primaryCorrectionFile?.signed_url || null,
        correction_files: correctionsWithUrls,
      };
    })
  );

  // 4. Hitung ringkasan pengumpulan
  const totalSubmissions = submissionsWithDetails.length;
  const totalSubmitted = submissionsWithDetails.filter(
    (s) => s.submitted_at || s.status === 'Diserahkan' || s.status === 'Sudah dinilai'
  ).length;
  const totalGraded = submissionsWithDetails.filter((s) => s.score !== null).length;
  const totalLate = submissionsWithDetails.filter((s) => s.is_late).length;
  const totalPending = submissionsWithDetails.filter(
    (s) => (s.submitted_at || s.status === 'Diserahkan') && s.score === null
  ).length;

  return {
    assignment_id: assignmentId,
    assignment_title: assignment.title,
    submissions: submissionsWithDetails,
    summary: {
      total_submissions: totalSubmissions,
      total_submitted: totalSubmitted,
      total_graded: totalGraded,
      total_late: totalLate,
      total_pending: totalPending,
    },
  };
};

/**
 * Service: ambil detail satu submission berdasarkan ID (UC-07).
 * GET /api/v1/b5/submissions/:submissionId
 */
export const getSubmissionByIdService = async (submissionId) => {
  // 1. Ambil submission
  const { data: submission, error } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('id, assignment_id, student_id, status, is_late, score, feedback, submitted_at, graded_at')
    .eq('id', submissionId)
    .maybeSingle();

  if (error) throw error;
  if (!submission) {
    const err = new Error('Data pengumpulan tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Ambil file pekerjaan siswa dari bucket 'submissions' secara eksplisit
  const { data: files } = await supabaseAdmin
    .schema('b5')
    .from('submission_files')
    .select('id, submission_id, file_name, file_url, file_type, file_size, uploaded_at')
    .eq('submission_id', submissionId)
    .order('uploaded_at', { ascending: true });

  const filesWithUrls = await Promise.all(
    (files || []).map(async (f) => ({
      ...f,
      signed_url: await createSignedUrl(f.file_url, SUBMISSIONS_BUCKET),
      file_size_formatted: formatFileSizeStr(f.file_size),
    }))
  );

  // 3. Ambil file koreksi guru dari bucket 'corrections' secara eksplisit
  const { data: corrections } = await supabaseAdmin
    .schema('b5')
    .from('correction_files')
    .select('id, submission_id, file_name, file_url, file_type, file_size, uploaded_at')
    .eq('submission_id', submissionId)
    .order('uploaded_at', { ascending: true });

  const correctionsWithUrls = await Promise.all(
    (corrections || []).map(async (c) => ({
      ...c,
      signed_url: await createSignedUrl(c.file_url, CORRECTIONS_BUCKET),
      file_size_formatted: formatFileSizeStr(c.file_size),
    }))
  );

  // 4. Ambil data siswa
  let studentData = null;
  if (submission.student_id) {
    const { data: student } = await supabaseAdmin
      .schema('master')
      .from('students')
      .select('id, user_id, nis, name, class_id')
      .eq('id', submission.student_id)
      .maybeSingle();
    studentData = student;
  }

  // 5. Ambil detail tugas
  let assignmentData = null;
  if (submission.assignment_id) {
    const { data: assignment } = await supabaseAdmin
      .schema('b5')
      .from('assignments')
      .select('id, title, deadline, class_id, course_id')
      .eq('id', submission.assignment_id)
      .maybeSingle();
    assignmentData = assignment;
  }

  const primaryFile = filesWithUrls[0] || null;
  const primaryCorrection = correctionsWithUrls[0] || null;

  const displayStatus =
    submission.score !== null
      ? 'SUDAH DINILAI'
      : submission.is_late
        ? 'TERLAMBAT'
        : 'DISERAHKAN';

  return {
    ...submission,
    id: submission.id,
    submission_id: submission.id,
    student_id: submission.student_id,
    nama: studentData?.name || 'Siswa',
    name: studentData?.name || 'Siswa',
    nis: studentData?.nis || '-',
    asesmen: assignmentData?.title || 'Tugas',
    kelas: 'X - A',
    status: displayStatus,
    submitted_at_formatted: formatDateTimeIndo(submission.submitted_at),
    graded_at_formatted: formatDateTimeIndo(submission.graded_at),
    dikumpulkan: submission.submitted_at ? formatDateTimeIndo(submission.submitted_at) : '--',
    score: submission.score,
    nilai: submission.score !== null ? submission.score : '--',
    feedback: submission.feedback || '',
    kkm: 75,
    fileName: primaryFile?.file_name || null,
    fileSize: primaryFile?.file_size_formatted || null,
    fileUrl: primaryFile?.signed_url || null,
    files: filesWithUrls,
    fileKoreksiName: primaryCorrection?.file_name || null,
    fileKoreksiUrl: primaryCorrection?.signed_url || null,
    correction_files: correctionsWithUrls,
    student: studentData,
    assignment: assignmentData,
  };
};

/**
 * Service: beri nilai / perbarui nilai submission (UC-07).
 * PUT /api/v1/b5/submissions/:submissionId/grade
 *
 * File koreksi guru disimpan di bucket 'corrections' (CORRECTIONS_BUCKET).
 *
 * Payload:
 * - score: number (0-100)
 * - feedback: string (opsional)
 * - file: file koreksi guru (opsional, dari req.files[0])
 * - removeCorrectionFileId: UUID file koreksi lama yang ingin dihapus (opsional)
 */
export const gradeSubmissionService = async (
  submissionId,
  { score, feedback, file, removeCorrectionFileId }
) => {
  // 1. Validasi submission ada
  const { data: existing, error: fetchError } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('id, assignment_id, student_id, status, score, submitted_at')
    .eq('id', submissionId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing) {
    const err = new Error('Data pengumpulan tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Validasi nilai
  const scoreNum = Number(score);
  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
    const err = new Error('Nilai harus berupa angka antara 0 sampai 100.');
    err.statusCode = 400;
    throw err;
  }

  // 3. Hapus file koreksi spesifik jika diminta via removeCorrectionFileId
  if (removeCorrectionFileId && isValidUUID(removeCorrectionFileId)) {
    const { data: oldFile } = await supabaseAdmin
      .schema('b5')
      .from('correction_files')
      .select('id, file_url')
      .eq('id', removeCorrectionFileId)
      .eq('submission_id', submissionId)
      .maybeSingle();

    if (oldFile?.file_url) {
      // Hapus dari bucket 'corrections'
      await supabaseAdmin.storage.from(CORRECTIONS_BUCKET).remove([oldFile.file_url]);
      // Fallback pembersihan jika file sempat tersimpan di bucket 'submissions'
      await supabaseAdmin.storage.from(SUBMISSIONS_BUCKET).remove([oldFile.file_url]);

      await supabaseAdmin
        .schema('b5')
        .from('correction_files')
        .delete()
        .eq('id', removeCorrectionFileId);
    }
  }

  // 4. Upload file koreksi baru ke bucket 'corrections' jika disertakan
  let newCorrectionRecord = null;
  if (file && file.buffer) {
    // Jika ada file baru yang diunggah, bersihkan file koreksi lama yang sudah ada sebelumnya
    // agar tidak meninggalkan file lama yang tidak terpakai
    const { data: previousCorrections } = await supabaseAdmin
      .schema('b5')
      .from('correction_files')
      .select('id, file_url')
      .eq('submission_id', submissionId);

    if (previousCorrections && previousCorrections.length > 0) {
      const pathsToRemove = previousCorrections.map((c) => c.file_url).filter(Boolean);
      if (pathsToRemove.length > 0) {
        await supabaseAdmin.storage.from(CORRECTIONS_BUCKET).remove(pathsToRemove);
        await supabaseAdmin.storage.from(SUBMISSIONS_BUCKET).remove(pathsToRemove);
      }
      await supabaseAdmin
        .schema('b5')
        .from('correction_files')
        .delete()
        .eq('submission_id', submissionId);
    }

    const safeName = sanitizeFileName(file.originalname);
    // Jalur penyimpanan di bucket 'corrections':
    // {submissionId}/{timestamp}_{filename}
    const storagePath = `${submissionId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(CORRECTIONS_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      const err = new Error(
        `Gagal mengunggah file koreksi ke bucket '${CORRECTIONS_BUCKET}': ${uploadError.message}`
      );
      err.statusCode = 500;
      throw err;
    }

    const { data: insertedCorrection, error: insertError } = await supabaseAdmin
      .schema('b5')
      .from('correction_files')
      .insert({
        submission_id: submissionId,
        file_name: file.originalname,
        file_url: storagePath,
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (insertError) {
      // Rollback file jika gagal insert ke DB
      await supabaseAdmin.storage.from(CORRECTIONS_BUCKET).remove([storagePath]);
      throw insertError;
    }

    newCorrectionRecord = insertedCorrection;
  }

  // 5. Update submission di DB
  const updatePayload = {
    score: scoreNum,
    status: 'Sudah dinilai',
    graded_at: new Date().toISOString(),
  };

  if (feedback !== undefined) {
    updatePayload.feedback = feedback !== null ? String(feedback).trim() : null;
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .update(updatePayload)
    .eq('id', submissionId)
    .select('id, assignment_id, student_id, status, is_late, score, feedback, submitted_at, graded_at')
    .single();

  if (updateError) throw updateError;

  // 6. Return detail lengkap yang telah diperbarui
  return await getSubmissionByIdService(submissionId);
};

/**
 * Service: hapus satu file koreksi guru (UC-07).
 * DELETE /api/v1/b5/submissions/:submissionId/correction-files/:fileId
 *
 * Menghapus file dari bucket 'corrections' dan tabel b5.correction_files.
 * File pengumpulan siswa di bucket 'submissions' sama sekali tidak terpengaruh.
 */
export const deleteCorrectionFileService = async (submissionId, fileId) => {
  const { data: correctionFile, error: fetchError } = await supabaseAdmin
    .schema('b5')
    .from('correction_files')
    .select('id, submission_id, file_url, file_name')
    .eq('id', fileId)
    .eq('submission_id', submissionId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!correctionFile) {
    const err = new Error('File koreksi tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  if (correctionFile.file_url) {
    // Hapus dari bucket 'corrections'
    await supabaseAdmin.storage.from(CORRECTIONS_BUCKET).remove([correctionFile.file_url]);
    // Fallback jika file berada di bucket 'submissions'
    await supabaseAdmin.storage.from(SUBMISSIONS_BUCKET).remove([correctionFile.file_url]);
  }

  const { error: deleteError } = await supabaseAdmin
    .schema('b5')
    .from('correction_files')
    .delete()
    .eq('id', fileId);

  if (deleteError) throw deleteError;

  return {
    deleted_file_id: fileId,
    file_name: correctionFile.file_name,
  };
};
