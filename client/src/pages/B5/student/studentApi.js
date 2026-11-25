const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/b5/student`
  : 'http://localhost:5000/api/v1/b5/student';

/**
 * Mengambil ID siswa yang aktif untuk header x-student-id.
 * Membaca dari localStorage jika ada, atau fallback ke default student (Rafi Aditya Pratama).
 */
export const getActiveStudentId = () => {
  return (
    localStorage.getItem('student_id') ||
    'bf975a8d-8230-483c-aa88-01ee4c46c918'
  );
};

export const setStudentId = (id) => {
  if (id) {
    localStorage.setItem('student_id', id);
  } else {
    localStorage.removeItem('student_id');
  }
};

/**
 * Helper dasar untuk request ke API siswa
 */
const studentFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const studentId = getActiveStudentId();

  const headers = {
    'x-student-id': studentId,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errorMsg;
    } catch (_) {
      // ignore json parse error
    }
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    throw error;
  }

  return await response.json();
};

// 1. Profil & Notifikasi
export const getStudentProfile = async () => {
  const res = await studentFetch('/profile');
  return res.data;
};

export const updateStudentProfile = async (body) => {
  const res = await studentFetch('/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.data;
};

export const getStudentNotifications = async () => {
  const res = await studentFetch('/notifications');
  return res.data || [];
};

// 2. UC-08: Courses & Materi
export const getStudentCourses = async () => {
  const res = await studentFetch('/courses');
  return res.data || [];
};

export const getStudentCourseSections = async (courseId) => {
  const res = await studentFetch(`/courses/${courseId}/sections`);
  return res.data || [];
};

export const getStudentCourseMaterials = async (courseId) => {
  const res = await studentFetch(`/courses/${courseId}/materials`);
  return res.data || [];
};

export const getStudentMaterialDetail = async (materialId) => {
  const res = await studentFetch(`/materials/${materialId}`);
  return res.data;
};

// 3. UC-09: Tugas & Timeline
export const getStudentCourseAssignments = async (courseId, sortBy = '') => {
  const query = sortBy ? `?sortBy=${encodeURIComponent(sortBy)}` : '';
  const res = await studentFetch(`/courses/${courseId}/assignments${query}`);
  return res.data || [];
};

export const getStudentAssignmentDetail = async (assignmentId) => {
  const res = await studentFetch(`/assignments/${assignmentId}`);
  return res.data;
};

export const getStudentTimelineAssignments = async () => {
  const res = await studentFetch('/timeline-assignments');
  return res.data || [];
};

// 4. UC-10: Pengumpulan Tugas (Submissions)
export const getStudentMySubmission = async (assignmentId) => {
  const res = await studentFetch(`/assignments/${assignmentId}/my-submission`);
  return res.data;
};

export const submitStudentAssignment = async (assignmentId, formData) => {
  // Jangan set header Content-Type agar browser otomatis memasang boundary multipart
  const res = await studentFetch(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: formData,
  });
  return res.data;
};

// 5. UC-11: Nilai & Penilaian Siswa (Grades)
export const getStudentCourseGrades = async (courseId) => {
  const res = await studentFetch(`/courses/${courseId}/grades`);
  return res.data;
};

export const getStudentGradeDetail = async (identifier) => {
  // identifier dapat berupa submission_id atau assignment_id
  const res = await studentFetch(`/submissions/${identifier}/grade`);
  return res.data;
};

// 6. Helper Download Langsung
export { downloadFileDirect } from './downloadHelper';

