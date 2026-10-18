import * as masterService from './master.service.js';

export const getAllClasses = async (req, res) => {
  try {
    const classes = await masterService.getAllClassesService();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data kelas',
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kelas',
      error: error.message,
    });
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, level, major, homeroom_teacher_id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kelas wajib diisi!' });
    }

    const newClass = await masterService.createClassService(name, level, major, homeroom_teacher_id || null);
    return res.status(201).json({
      success: true,
      message: 'Berhasil membuat kelas baru',
      data: newClass,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat kelas baru',
      error: error.message,
    });
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
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kelas',
      error: error.message,
    });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await masterService.getAllSubjectsService();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data mata pelajaran',
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data mata pelajaran',
      error: error.message,
    });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama mata pelajaran wajib diisi!' });
    }

    const newSubject = await masterService.createSubjectService(name);
    return res.status(201).json({
      success: true,
      message: 'Berhasil membuat mata pelajaran baru',
      data: newSubject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat mata pelajaran baru',
      error: error.message,
    });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { email, password, name, nip } = req.body;
    if (!email || !password || !name || !nip) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, nama, dan NIP wajib diisi!',
      });
    }

    const newTeacher = await masterService.createTeacherService({ email, password, name, nip });
    return res.status(201).json({
      success: true,
      message: 'Berhasil mendaftarkan akun Guru baru',
      data: newTeacher,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mendaftarkan Guru baru',
      error: error.message,
    });
  }
};