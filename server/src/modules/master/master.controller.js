import * as masterService from './master.service.js';

//dashboard
export const getDashboardSummary = async (req, res) => {
  try {
    const data = await masterService.getDashboardSummaryService();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data ringkasan dashboard admin',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
      data: null,
    });
  }
};


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const hasNonEmptyFields = (payload, fields) =>
  fields.every((field) => typeof payload[field] === 'string' && payload[field].trim() !== '');

const hasRequiredValues = (payload, fields) =>
  fields.every((field) => payload[field] !== undefined
    && payload[field] !== null
    && String(payload[field]).trim() !== '');

const hasValidUpdateFields = (payload, fields, nullableFields = []) => {
  const providedFields = fields.filter((field) => Object.hasOwn(payload, field));
  return providedFields.length > 0 && providedFields.every((field) => {
    const value = payload[field];
    if (nullableFields.includes(field) && value === null) return true;
    if (typeof value === 'string') return value.trim() !== '';
    return typeof value === 'number' && Number.isFinite(value);
  });
};

const handleUserMutationError = (res, error, action, entity) => {
  if (error.message.includes('tidak ditemukan')) {
    return res.status(404).json({ success: false, message: error.message, data: null });
  }
  return res.status(500).json({ success: false, message: `Gagal ${action} ${entity}`, data: null, error: error.message });
};

const handleControllerError = (res, message, error) =>
  res.status(500).json({ success: false, message, data: null, error: error.message });

// --- KELAS ---
export const getAllClasses = async (req, res) => {
  try {
    const classes = await masterService.getAllClassesService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data kelas', data: classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data kelas', data: null, error: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, level, major, homeroom_teacher_id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kelas wajib diisi!', data: null });
    }
    const newClass = await masterService.createClassService({ name, level, major, homeroom_teacher_id });
    return res.status(201).json({ success: true, message: 'Berhasil membuat kelas baru', data: newClass });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat kelas baru', data: null, error: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await masterService.deleteClassService(id);

    return res.status(200).json({
      success: true,
      message: 'Berhasil menghapus kelas',
      data: deletedClass,
    });
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kelas',
      data: null,
      error: error.message,
    });
  }
};

export const updateHomeroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { homeroom_teacher_id } = req.body;
    const updatedClass = await masterService.updateHomeroomTeacherService(id, homeroom_teacher_id);
    return res.status(200).json({ success: true, message: 'Berhasil mengupdate wali kelas', data: updatedClass });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengupdate wali kelas', data: null, error: error.message });
  }
};

// --- MATA PELAJARAN ---
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await masterService.getAllSubjectsService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data mata pelajaran', data: subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data mata pelajaran', data: null, error: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code, credit_hours } = req.body;
    if (!hasNonEmptyFields(req.body, ['name'])) {
      return res.status(400).json({ success: false, message: 'Nama mata pelajaran wajib diisi!', data: null });
    }
    if (credit_hours !== undefined && (!Number.isInteger(credit_hours) || credit_hours <= 0)) {
      return res.status(400).json({ success: false, message: 'credit_hours harus berupa bilangan bulat positif', data: null });
    }
    const newSubject = await masterService.createSubjectService({ name, code, credit_hours });
    return res.status(201).json({ success: true, message: 'Berhasil membuat mata pelajaran baru', data: newSubject });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat mata pelajaran baru', data: null, error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { credit_hours } = req.body;
    if (!hasValidUpdateFields(req.body, ['name', 'code', 'credit_hours'])) {
      return res.status(400).json({ success: false, message: 'Isi minimal satu field valid untuk diperbarui', data: null });
    }
    if (credit_hours !== undefined && (!Number.isInteger(credit_hours) || credit_hours <= 0)) {
      return res.status(400).json({ success: false, message: 'credit_hours harus berupa bilangan bulat positif', data: null });
    }
    const subject = await masterService.updateSubjectService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Berhasil mengupdate mata pelajaran', data: subject });
  } catch (error) {
    return handleAcademicError(res, error, 'mengupdate mata pelajaran');
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await masterService.deleteSubjectService(req.params.id);
    return res.status(200).json({ success: true, message: 'Berhasil menghapus mata pelajaran', data: subject });
  } catch (error) {
    return handleAcademicError(res, error, 'menghapus mata pelajaran');
  }
};

const handleAcademicError = (res, error, action) => {
  const notFound = error.message.includes('tidak ditemukan');
  return res.status(notFound ? 404 : 500).json({
    success: false,
    message: notFound ? error.message : `Gagal ${action}`,
    data: null,
    ...(notFound ? {} : { error: error.message }),
  });
};

// --- JADWAL PELAJARAN ---
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await masterService.getAllSchedulesService(req.query.class_id);
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data jadwal pelajaran', data: schedules });
  } catch (error) {
    return handleAcademicError(res, error, 'mengambil data jadwal pelajaran');
  }
};

export const createSchedule = async (req, res) => {
  try {
    const requiredFields = ['class_id', 'subject_id', 'teacher_id', 'day', 'start_time', 'end_time'];
    if (!hasRequiredValues(req.body, requiredFields)) {
      return res.status(400).json({ success: false, message: 'Class, subject, teacher, hari, waktu mulai, dan waktu selesai wajib diisi', data: null });
    }
    const schedule = await masterService.createScheduleService(req.body);
    return res.status(201).json({ success: true, message: 'Berhasil membuat jadwal pelajaran', data: schedule });
  } catch (error) {
    return handleAcademicError(res, error, 'membuat jadwal pelajaran');
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const allowedFields = ['class_id', 'subject_id', 'teacher_id', 'day', 'start_time', 'end_time', 'room'];
    if (!hasValidUpdateFields(req.body, allowedFields)) {
      return res.status(400).json({ success: false, message: 'Isi minimal satu field valid untuk diperbarui', data: null });
    }
    const schedule = await masterService.updateScheduleService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Berhasil mengupdate jadwal pelajaran', data: schedule });
  } catch (error) {
    return handleAcademicError(res, error, 'mengupdate jadwal pelajaran');
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await masterService.deleteScheduleService(req.params.id);
    return res.status(200).json({ success: true, message: 'Berhasil menghapus jadwal pelajaran', data: schedule });
  } catch (error) {
    return handleAcademicError(res, error, 'menghapus jadwal pelajaran');
  }
};

// --- GURU ---
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await masterService.getAllTeachersService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data guru', data: teachers });
  } catch (error) {
    return handleControllerError(res, 'Gagal mengambil data guru', error);
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { email, password, name, nip } = req.body;
    if (!hasNonEmptyFields(req.body, ['email', 'password', 'name', 'nip'])) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, nama, dan NIP wajib diisi!',
        data: null,
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid', data: null });
    }

    const newTeacher = await masterService.createTeacherService({ email, password, name, nip });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Berhasil mendaftarkan akun Guru baru', 
      data: newTeacher 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mendaftarkan Guru baru', 
      data: null,
      error: error.message 
    });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const allowedFields = ['name', 'nip', 'phone'];
    if (!hasValidUpdateFields(req.body, allowedFields)) {
      return res.status(400).json({ success: false, message: 'Isi minimal satu field valid untuk diperbarui', data: null });
    }
    const teacher = await masterService.updateTeacherService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Berhasil mengupdate data guru', data: teacher });
  } catch (error) {
    return handleUserMutationError(res, error, 'mengupdate', 'data guru');
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await masterService.deleteTeacherService(req.params.id);
    return res.status(200).json({ success: true, message: 'Berhasil menghapus guru', data: teacher });
  } catch (error) {
    return handleUserMutationError(res, error, 'menghapus', 'guru');
  }
};

// --- SISWA ---
export const getAllStudents = async (req, res) => {
  try {
    const students = await masterService.getAllStudentsService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data siswa', data: students });
  } catch (error) {
    return handleControllerError(res, 'Gagal mengambil data siswa', error);
  }
};

export const createStudent = async (req, res) => {
  try {
    const { email, password, name, nis, class_id } = req.body;
    if (!hasNonEmptyFields(req.body, ['email', 'password', 'name', 'nis'])) {
      return res.status(400).json({ success: false, message: 'Email, password, nama, dan NIS wajib diisi!', data: null });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid', data: null });
    }
    const newStudent = await masterService.createStudentService({ email, password, name, nis, class_id });
    return res.status(201).json({ success: true, message: 'Berhasil mendaftarkan siswa baru', data: newStudent });
  } catch (error) {
    return handleControllerError(res, 'Gagal mendaftarkan siswa', error);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const allowedFields = ['name', 'nis', 'class_id', 'parent_id'];
    if (!hasValidUpdateFields(req.body, allowedFields, ['class_id', 'parent_id'])) {
      return res.status(400).json({ success: false, message: 'Isi minimal satu field valid untuk diperbarui', data: null });
    }
    const student = await masterService.updateStudentService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Berhasil mengupdate data siswa', data: student });
  } catch (error) {
    return handleUserMutationError(res, error, 'mengupdate', 'data siswa');
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await masterService.deleteStudentService(req.params.id);
    return res.status(200).json({ success: true, message: 'Berhasil menghapus siswa', data: student });
  } catch (error) {
    return handleUserMutationError(res, error, 'menghapus', 'siswa');
  }
};

// --- ORANG TUA ---
export const createParent = async (req, res) => {
  try {
    const { nis, password, name, phone } = req.body;
    if (!hasNonEmptyFields(req.body, ['nis', 'password', 'name'])) {
      return res.status(400).json({ success: false, message: 'NIS anak, password, dan nama orang tua wajib diisi!', data: null });
    }
    const newParent = await masterService.createParentService({ nis, password, name, phone });
    return res.status(201).json({ success: true, message: 'Berhasil mendaftarkan Orang Tua', data: newParent });
  } catch (error) {
    return handleControllerError(res, 'Gagal mendaftarkan Orang Tua', error);
  }
};

export const updateParent = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'address'];
    if (!hasValidUpdateFields(req.body, allowedFields)) {
      return res.status(400).json({ success: false, message: 'Isi minimal satu field valid untuk diperbarui', data: null });
    }
    const parent = await masterService.updateParentService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Berhasil mengupdate data orang tua', data: parent });
  } catch (error) {
    return handleUserMutationError(res, error, 'mengupdate', 'data orang tua');
  }
};

export const deleteParent = async (req, res) => {
  try {
    const parent = await masterService.deleteParentService(req.params.id);
    return res.status(200).json({ success: true, message: 'Berhasil menghapus orang tua', data: parent });
  } catch (error) {
    return handleUserMutationError(res, error, 'menghapus', 'orang tua');
  }
};

export const getAllParents = async (req, res) => {
  try {
    const parents = await masterService.getAllParentsService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data orang tua', data: parents });
  } catch (error) {
    return handleControllerError(res, 'Gagal mengambil data orang tua', error);
  }
};


// --- COURSES ---
export const getAllCourses = async (req, res) => {
  try {
    const courses = await masterService.getAllCoursesService();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data course',
      data: courses,
    });
  } catch (error) {
    return handleControllerError(res, 'Gagal mengambil data course', error);
  }
};

export const createCourse = async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id, academic_year, semester } = req.body;

    if (!class_id || !subject_id) {
      return res.status(400).json({
        success: false,
        message: 'Class ID dan Subject ID wajib diisi!',
        data: null,
      });
    }

    const newCourse = await masterService.createCourseService({
      class_id,
      subject_id,
      teacher_id,
      academic_year,
      semester,
    });

    return res.status(201).json({
      success: true,
      message: 'Berhasil membuat course baru',
      data: newCourse,
    });
  } catch (error) {
    return handleControllerError(res, 'Gagal membuat course baru', error);
  }
};