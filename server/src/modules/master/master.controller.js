import * as masterService from './master.service.js';

// --- KELAS ---
export const getAllClasses = async (req, res) => {
  try {
    const classes = await masterService.getAllClassesService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data kelas', data: classes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data kelas', error: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, level, major, homeroom_teacher_id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kelas wajib diisi!' });
    }
    const newClass = await masterService.createClassService({ name, level, major, homeroom_teacher_id });
    return res.status(201).json({ success: true, message: 'Berhasil membuat kelas baru', data: newClass });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat kelas baru', error: error.message });
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
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kelas',
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
    return res.status(500).json({ success: false, message: 'Gagal mengupdate wali kelas', error: error.message });
  }
};

// --- MATA PELAJARAN ---
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await masterService.getAllSubjectsService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data mata pelajaran', data: subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data mata pelajaran', error: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama mata pelajaran wajib diisi!' });
    }
    const newSubject = await masterService.createSubjectService(name);
    return res.status(201).json({ success: true, message: 'Berhasil membuat mata pelajaran baru', data: newSubject });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat mata pelajaran baru', error: error.message });
  }
};

// --- GURU ---
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await masterService.getAllTeachersService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data guru', data: teachers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data guru', error: error.message });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { email, password, name, nip } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, dan nama wajib diisi!' 
      });
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
      error: error.message 
    });
  }
};

// --- SISWA ---
export const getAllStudents = async (req, res) => {
  try {
    const students = await masterService.getAllStudentsService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data siswa', data: students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data siswa', error: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { email, password, name, nis, class_id } = req.body;
    if (!email || !password || !name || !nis) {
      return res.status(400).json({ success: false, message: 'Email, password, nama, dan NIS wajib diisi!' });
    }
    const newStudent = await masterService.createStudentService({ email, password, name, nis, class_id });
    return res.status(201).json({ success: true, message: 'Berhasil mendaftarkan siswa baru', data: newStudent });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mendaftarkan siswa', error: error.message });
  }
};

// --- ORANG TUA ---
export const createParent = async (req, res) => {
  try {
    const { nis, password, name, phone } = req.body;
    if (!nis || !password || !name) {
      return res.status(400).json({ success: false, message: 'NIS anak, password, dan nama orang tua wajib diisi!' });
    }
    const newParent = await masterService.createParentService({ nis, password, name, phone });
    return res.status(201).json({ success: true, message: 'Berhasil mendaftarkan Orang Tua', data: newParent });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mendaftarkan Orang Tua', error: error.message });
  }
};

export const getAllParents = async (req, res) => {
  try {
    const parents = await masterService.getAllParentsService();
    return res.status(200).json({ success: true, message: 'Berhasil mengambil data orang tua', data: parents });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data orang tua', error: error.message });
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
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data course',
      error: error.message,
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { class_id, subject_id, teacher_id, academic_year, semester } = req.body;

    if (!class_id || !subject_id) {
      return res.status(400).json({
        success: false,
        message: 'Class ID dan Subject ID wajib diisi!',
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
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat course baru',
      error: error.message,
    });
  }
};