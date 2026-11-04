import * as assignmentsService from './assignments.service.js';
import { isValidUUID } from '../../../utils/validation.js';

const MONTHS_MAP = {
  jan: '01', januari: '01', january: '01',
  feb: '02', februari: '02', february: '02',
  mar: '03', maret: '03', march: '03',
  apr: '04', april: '04',
  mei: '05', may: '05',
  jun: '06', juni: '06', june: '06',
  jul: '07', juli: '07', july: '07',
  agu: '08', ags: '08', agustus: '08', aug: '08', august: '08',
  sep: '09', september: '09',
  okt: '10', oktober: '10', oct: '10', october: '10',
  nov: '11', november: '11',
  des: '12', desember: '12', dec: '12', december: '12',
};

/**
 * Mengurai input tanggal dan waktu ke Date object.
 * Zona waktu default: Asia/Jakarta (+07:00).
 */
const parseDateTimeInput = (dateInput, timeInput, defaultTime = '00:00') => {
  if (!dateInput) return null;

  // Format ISO lengkap
  if (
    typeof dateInput === 'string' &&
    (dateInput.includes('T') || dateInput.includes('Z'))
  ) {
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const dateStr = String(dateInput).trim();
  let timeStr = timeInput ? String(timeInput).trim() : defaultTime;

  // Normalisasi waktu menjadi HH:mm:ss
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (timeMatch) {
    const hh = timeMatch[1].padStart(2, '0');
    const mm = timeMatch[2];
    const ss = timeMatch[3] || '00';

    timeStr = `${hh}:${mm}:${ss}`;
  } else {
    return null;
  }

  // Format YYYY-MM-DD
  const isoDateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoDateMatch) {
    const d = new Date(`${dateStr}T${timeStr}+07:00`);

    if (!isNaN(d.getTime())) return d;
  }

  // Format tanggal Indonesia/Inggris, contoh 20 Jan 2026
  const textDateMatch = dateStr.match(
    /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/
  );

  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, '0');
    const monthKey = textDateMatch[2].toLowerCase();
    const month = MONTHS_MAP[monthKey];
    const year = textDateMatch[3];

    if (month) {
      const d = new Date(
        `${year}-${month}-${day}T${timeStr}+07:00`
      );

      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
};

/**
 * Mengubah input menjadi boolean.
 */
const parseBooleanInput = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  return null;
};

/**
 * Controller untuk membuat tugas baru (UC-04).
 * Endpoint: POST /api/v1/b5/assignments
 */
export const createAssignment = async (req, res) => {
  try {
    const {
      section_id,
      course_id,
      title,
      instructions,
      description,
      start_at,
      start_date,
      start_time,
      deadline,
      due_date,
      deadline_date,
      due_time,
      deadline_time,
      submission_type,
      allow_late_submission,
      notify_students,
    } = req.body;

    // 1. Validasi Section ID
    if (!section_id || !isValidUUID(section_id)) {
      return res.status(400).json({
        success: false,
        message: 'Section ID wajib diisi dengan format UUID yang valid.',
      });
    }

    // Course ID opsional, tetapi jika dikirim harus valid
    if (course_id && !isValidUUID(course_id)) {
      return res.status(400).json({
        success: false,
        message: 'Format Course ID tidak valid.',
      });
    }

    // 2. Validasi Judul
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Judul tugas wajib diisi.',
      });
    }

    if (title.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Judul tugas maksimal 255 karakter.',
      });
    }

    // 3. Validasi dan parsing waktu mulai
    const startDateInput = start_at || start_date;
    const startTimeInput = start_time;

    const startDate = parseDateTimeInput(
      startDateInput,
      startTimeInput,
      '00:00'
    );

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Format waktu mulai (start_at / start_date) tidak valid.',
      });
    }

    // 4. Validasi dan parsing deadline
    const deadlineDateInput = deadline || due_date || deadline_date;
    const deadlineTimeInput = deadline_time || due_time;

    const deadlineDate = parseDateTimeInput(
      deadlineDateInput,
      deadlineTimeInput,
      '23:59'
    );

    if (!deadlineDate) {
      return res.status(400).json({
        success: false,
        message: 'Format tenggat waktu (deadline / due_date) tidak valid.',
      });
    }

    // 5. Validasi deadline harus setelah waktu mulai
    if (deadlineDate.getTime() <= startDate.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'Waktu tenggat (deadline) tidak boleh lebih awal dari atau sama dengan waktu mulai.',
      });
    }

    // 6. Validasi boolean
    const parsedAllowLate = parseBooleanInput(
      allow_late_submission,
      false
    );

    if (parsedAllowLate === null) {
      return res.status(400).json({
        success: false,
        message: 'Nilai allow_late_submission harus berupa boolean.',
      });
    }

    const parsedNotify = parseBooleanInput(
      notify_students,
      false
    );

    if (parsedNotify === null) {
      return res.status(400).json({
        success: false,
        message: 'Nilai notify_students harus berupa boolean.',
      });
    }

    // 7. Panggil service pembuatan tugas berdasarkan Section
    const newAssignment = await assignmentsService.createAssignmentService({
      sectionId: section_id,
      courseId: course_id || null,
      title,
      instructions: instructions || null,
      description: description || null,
      startDate,
      deadlineDate,
      submissionType: submission_type || 'file',
      allowLateSubmission: parsedAllowLate,
      notifyStudents: parsedNotify,
      files: req.files || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Tugas berhasil dibuat.',
      data: newAssignment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error creating assignment:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat membuat tugas.',
    });
  }
};

/**
 * Controller mengambil detail tugas berdasarkan ID.
 * Endpoint: GET /api/v1/b5/assignments/:id
 */
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: 'Format Assignment ID tidak valid.',
      });
    }

    const assignment =
      await assignmentsService.getAssignmentByIdService(id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail tugas.',
      data: assignment,
    });
  } catch (error) {
    if (
      error.statusCode === 404 ||
      error.message?.includes('tidak ditemukan')
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error fetching assignment detail:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil detail tugas.',
    });
  }
};

/**
 * Controller mengambil daftar tugas dalam Course.
 * Endpoint: GET /api/v1/b5/courses/:courseId/assignments
 */
export const getAssignmentsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidUUID(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Format Course ID tidak valid.',
      });
    }

    const assignments =
      await assignmentsService.getAssignmentsByCourseIdService(courseId);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar tugas.',
      data: assignments,
    });
  } catch (error) {
    if (
      error.statusCode === 404 ||
      error.message?.includes('tidak ditemukan')
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error fetching course assignments:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil daftar tugas.',
    });
  }
};

/**
 * Controller mengambil daftar tugas berdasarkan Course dan Section.
 * Endpoint: GET /api/v1/b5/courses/:courseId/sections/:sectionId/assignments
 */
export const getAssignmentsBySectionId = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    if (!isValidUUID(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Format Course ID tidak valid.',
      });
    }

    if (!isValidUUID(sectionId)) {
      return res.status(400).json({
        success: false,
        message: 'Format Section ID tidak valid.',
      });
    }

    const assignments =
      await assignmentsService.getAssignmentsBySectionIdService(
        courseId,
        sectionId
      );

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar tugas berdasarkan section.',
      data: assignments,
    });
  } catch (error) {
    if (
      error.statusCode === 404 ||
      error.message?.includes('tidak ditemukan')
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error fetching section assignments:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat mengambil tugas berdasarkan section.',
    });
  }
};
