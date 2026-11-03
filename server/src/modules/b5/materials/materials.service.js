import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { supabase, supabaseAdmin } from '../../../config/supabase.js';

const MATERIALS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_MATERIALS;
const SIGNED_URL_TTL_SECONDS = Number(process.env.SUPABASE_SIGNED_URL_TTL_SECONDS || 3600);

const sanitizeStorageFileName = (fileName = 'file') => {
  const baseName = path.basename(fileName).normalize('NFKD');
  const safeName = baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(-120);
  return safeName || 'file';
};

/** Mengubah storage path menjadi signed URL saat data dikirim ke client. */
const addSignedUrlToFile = async (file) => {
  if (!file?.file_url || /^https?:\/\//i.test(file.file_url)) return file;

  if (!MATERIALS_BUCKET) {
    throw new Error('Environment SUPABASE_STORAGE_BUCKET_MATERIALS belum dikonfigurasi.');
  }

  const { data, error } = await supabaseAdmin.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(file.file_url, SIGNED_URL_TTL_SECONDS);

  if (error) throw error;
  return { ...file, file_url: data.signedUrl };
};

const addSignedUrlsToFiles = async (files = []) => Promise.all(files.map(addSignedUrlToFile));

const rollbackCreatedMaterial = async (materialId, uploadedPaths = []) => {
  if (MATERIALS_BUCKET && uploadedPaths.length > 0) {
    const { error } = await supabaseAdmin.storage.from(MATERIALS_BUCKET).remove(uploadedPaths);
    if (error) console.error('Gagal membersihkan file Storage setelah proses materi gagal:', error);
  }

  const { error: filesError } = await supabaseAdmin
    .schema('b5').from('material_files').delete().eq('material_id', materialId);
  if (filesError) console.error('Gagal membersihkan metadata file materi:', filesError);

  const { error: classesError } = await supabaseAdmin
    .schema('b5').from('material_classes').delete().eq('material_id', materialId);
  if (classesError) console.error('Gagal membersihkan relasi kelas materi:', classesError);

  const { error: materialError } = await supabaseAdmin
    .schema('b5').from('materials').delete().eq('id', materialId);
  if (materialError) console.error('Gagal membersihkan record materi:', materialError);
};

/**
 * Service untuk mengambil daftar materi
 * TODO: Implementasikan filtering berdasarkan subject_id, class_id, atau teacher_id jika diperlukan
 */
export const getAllMaterialsService = async (filters = {}) => {
  // Skeleton query ke schema 'b5', tabel 'materials'
  // Disertai relasi kelas (b5.material_classes) dan lampiran (b5.material_files)
  let query = supabase
    .schema('b5')
    .from('materials')
    .select(`
      id,
      teacher_id,
      title,
      description,
      subject_id,
      created_at,
      updated_at,
      material_classes (
        id,
        class_id
      ),
      material_files (
        id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .order('created_at', { ascending: false });

  // Filter opsional jika tersedia pada parameter
  if (filters.subject_id) {
    query = query.eq('subject_id', filters.subject_id);
  }
  if (filters.teacher_id) {
    query = query.eq('teacher_id', filters.teacher_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Promise.all((data || []).map(async (material) => ({
    ...material,
    material_files: await addSignedUrlsToFiles(material.material_files || []),
  })));
};

/**
 * Service untuk mengambil detail satu materi berdasarkan ID.
 * Data lintas schema diambil secara terpisah agar tidak bergantung pada
 * relasi PostgREST lintas schema.
 */
export const getMaterialByIdService = async (id) => {
  const { data: material, error: materialError } = await supabaseAdmin
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
      material_classes (
        id,
        class_id
      ),
      material_files (
        id,
        material_id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_at
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (materialError) throw materialError;
  if (!material) {
    const notFoundError = new Error('Materi tidak ditemukan.');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  // Section -> Course. course_details adalah view yang menyediakan
  // nama Course, kelas, mata pelajaran, dan guru pengampu.
  let section = null;
  let course = null;

  if (material.section_id) {
    const { data: sectionData, error: sectionError } = await supabaseAdmin
      .schema('master')
      .from('course_sections')
      .select('id, course_id, title, description, position, created_at')
      .eq('id', material.section_id)
      .maybeSingle();

    if (sectionError) throw sectionError;
    section = sectionData;

    if (section?.course_id) {
      const { data: courseData, error: courseError } = await supabaseAdmin
        .schema('master')
        .from('course_details')
        .select(`
          id,
          name,
          class_id,
          class_name,
          subject_id,
          subject_name,
          teacher_id,
          teacher_name,
          academic_year,
          semester,
          created_at
        `)
        .eq('id', section.course_id)
        .maybeSingle();

      if (courseError) throw courseError;
      course = courseData;
    }
  }

  // Ambil data master tambahan berdasarkan foreign key material.
  const classIds = [
    ...(course?.class_id ? [course.class_id] : []),
    ...(material.material_classes || []).map((relation) => relation.class_id),
  ].filter(Boolean);
  const uniqueClassIds = [...new Set(classIds)];

  const [subjectResult, teacherResult, classesResult] = await Promise.all([
    material.subject_id
      ? supabaseAdmin.schema('master').from('subjects')
          .select('id, name').eq('id', material.subject_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    material.teacher_id
      ? supabaseAdmin.schema('master').from('teachers')
          .select('id, user_id, nip, name, phone').eq('id', material.teacher_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    uniqueClassIds.length > 0
      ? supabaseAdmin.schema('master').from('classes')
          .select('id, name, level, major').in('id', uniqueClassIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (subjectResult.error) throw subjectResult.error;
  if (teacherResult.error) throw teacherResult.error;
  if (classesResult.error) throw classesResult.error;

  const materialFiles = await addSignedUrlsToFiles(material.material_files || []);
  const classes = classesResult.data || [];

  return {
    ...material,
    section: section
      ? {
          id: section.id,
          course_id: section.course_id,
          title: section.title,
          description: section.description,
          position: section.position,
          created_at: section.created_at,
        }
      : null,
    course: course
      ? {
          id: course.id,
          name: course.name,
          academic_year: course.academic_year,
          semester: course.semester,
          created_at: course.created_at,
        }
      : null,
    subject: subjectResult.data || (course ? {
      id: course.subject_id,
      name: course.subject_name,
    } : null),
    class: classes[0] || (course?.class_id ? {
      id: course.class_id,
      name: course.class_name,
    } : null),
    classes,
    teacher: teacherResult.data || (course?.teacher_id ? {
      id: course.teacher_id,
      name: course.teacher_name,
    } : null),
    uploaded_at: material.created_at,
    material_files: materialFiles,
  };
};

/**
 * Service untuk menambah materi baru (UC-02), termasuk lampiran ke Supabase Storage.
 * Sementara belum memakai autentikasi: teacher_id, subject_id, dan class_id
 * diturunkan dari Course yang terhubung ke Section yang dipilih.
 */
export const createMaterialService = async ({
  sectionId,
  title,
  description,
  status = 'draft',
  files = [],
}) => {
  // 1. Pastikan Section tersedia dan dapat ditelusuri ke Course.
  const { data: section, error: sectionError } = await supabaseAdmin
    .schema('master')
    .from('course_sections')
    .select('id, course_id, title, position')
    .eq('id', sectionId)
    .maybeSingle();

  if (sectionError) throw sectionError;
  if (!section) {
    const error = new Error('Section tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Periksa kepemilikan Course dan turunkan subject_id/class_id dari data Course.
  const { data: course, error: courseError } = await supabaseAdmin
    .schema('master')
    .from('courses')
    .select('id, class_id, subject_id, teacher_id')
    .eq('id', section.course_id)
    .maybeSingle();

  if (courseError) throw courseError;
  if (!course) {
    const error = new Error('Course untuk Section tersebut tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // Belum ada autentikasi/login pada tahap ini. Gunakan teacher_id pemilik Course
  // agar kolom b5.materials.teacher_id tetap terisi dengan FK yang valid.
  const teacherId = course.teacher_id;
  if (!teacherId) {
    const error = new Error('Course belum memiliki Guru yang ditetapkan.');
    error.statusCode = 400;
    throw error;
  }

  if (files.length > 0 && !MATERIALS_BUCKET) {
    const error = new Error('Bucket Storage belum dikonfigurasi. Atur SUPABASE_STORAGE_BUCKET_MATERIALS pada environment server.');
    error.statusCode = 500;
    throw error;
  }

  // 3. Simpan record materi terlebih dahulu agar file dapat memakai material.id pada storage path.
  const { data: material, error: materialError } = await supabaseAdmin
    .schema('b5')
    .from('materials')
    .insert({
      teacher_id: teacherId,
      title: title.trim(),
      description: description?.trim() || null,
      subject_id: course.subject_id,
      section_id: section.id,
      status,
    })
    .select(`
      id,
      teacher_id,
      title,
      description,
      subject_id,
      section_id,
      status,
      created_at,
      updated_at
    `)
    .single();

  if (materialError) throw materialError;

  const uploadedPaths = [];

  try {
    // 4. Simpan relasi kelas untuk menjaga kompatibilitas dengan listing lama.
    if (course.class_id) {
      const { error: relationError } = await supabaseAdmin
        .schema('b5')
        .from('material_classes')
        .insert({ material_id: material.id, class_id: course.class_id });

      if (relationError) throw relationError;
    }

    // 5. Unggah file ke bucket privat. Database menyimpan storage path, bukan URL sementara.
    const fileRows = [];
    for (const file of files) {
      if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
        throw new Error(`Konten file ${file.originalname || 'lampiran'} tidak valid.`);
      }

      const safeFileName = sanitizeStorageFileName(file.originalname);
      const storagePath = `${teacherId}/${material.id}/${randomUUID()}-${safeFileName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(MATERIALS_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      uploadedPaths.push(storagePath);

      fileRows.push({
        material_id: material.id,
        file_name: file.originalname,
        file_url: storagePath,
        file_type: file.mimetype || null,
        file_size: file.size ?? file.buffer.length,
      });
    }

    // 6. Simpan metadata lampiran setelah seluruh upload berhasil.
    let savedFiles = [];
    if (fileRows.length > 0) {
      const { data, error: filesError } = await supabaseAdmin
        .schema('b5')
        .from('material_files')
        .insert(fileRows)
        .select('id, material_id, file_name, file_url, file_type, file_size, uploaded_at');

      if (filesError) throw filesError;
      savedFiles = data || [];
    }

    return {
      ...material,
      section: {
        id: section.id,
        title: section.title,
        position: section.position,
      },
      class_id: course.class_id,
      material_files: await addSignedUrlsToFiles(savedFiles),
    };
  } catch (error) {
    // Jika satu tahap gagal, jangan tinggalkan object Storage atau record parsial.
    await rollbackCreatedMaterial(material.id, uploadedPaths);
    throw error;
  }
};

/**
 * Service untuk memperbarui materi (UC-03)
 */
export const updateMaterialService = async (id, { title, description, subject_id, class_ids }) => {
  // TODO: Implementasikan sinkronisasi class_ids (hapus relasi lama / tambah relasi baru)
  // TODO: Tangani update/hapus file lampiran jika ada perubahan
  const updatePayload = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updatePayload.title = title;
  if (description !== undefined) updatePayload.description = description;
  if (subject_id !== undefined) updatePayload.subject_id = subject_id;

  const { data, error } = await supabase
    .schema('b5')
    .from('materials')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error('Materi tidak ditemukan atau gagal diperbarui');
  }

  return data;
};

/**
 * Service untuk menghapus materi (UC-03)
 */
export const deleteMaterialService = async (id) => {
  // TODO: Hapus juga file fisik dari Supabase Storage jika ada file terlampir
  // Note: Pastikan cascading delete pada database atau hapus manual child rows (material_classes & material_files)
  const { data, error } = await supabase
    .schema('b5')
    .from('materials')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Materi tidak ditemukan atau gagal dihapus');
  }

  return data;
};


/**
 * Service untuk mengambil seluruh materi dalam sebuah Course (berdasarkan Section)
 * @param {string} courseId - UUID dari Course
 * @returns {Promise<Array>} Daftar materi beserta relasi section dan file lampiran
 */
export const getMaterialsByCourseIdService = async (courseId) => {
  // 1. Periksa keberadaan Course melalui view master.course_details
  const { data: course, error: courseError } = await supabase
    .schema('master')
    .from('course_details')
    .select('id')
    .eq('id', courseId)
    .maybeSingle();

  if (courseError) {
    throw courseError;
  }

  if (!course) {
    const notFoundError = new Error('Course tidak ditemukan');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  // 2. Ambil seluruh Section dari master.course_sections berdasarkan course_id
  const { data: sections, error: sectionsError } = await supabase
    .schema('master')
    .from('course_sections')
    .select('id, title, position')
    .eq('course_id', courseId);

  if (sectionsError) {
    throw sectionsError;
  }

  // Jika course belum memiliki Section, kembalikan array kosong
  if (!sections || sections.length === 0) {
    return [];
  }

  // 3. Kumpulkan section_id dan buat Map untuk lookup cepat O(1)
  const sectionIds = sections.map((s) => s.id);
  const sectionMap = new Map();
  sections.forEach((s) => {
    sectionMap.set(s.id, {
      id: s.id,
      title: s.title,
      position: s.position,
    });
  });

  // 4. Ambil semua materi pada Section tersebut dari b5.materials
  // Jangan otomatis mengecualikan status 'draft' (endpoint guru memerlukan draft & published)
  const { data: materials, error: materialsError } = await supabase
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
    .order('created_at', { ascending: false });

  if (materialsError) {
    throw materialsError;
  }

  if (!materials || materials.length === 0) {
    return [];
  }

  // 5. Format response dengan menyertakan detail section dan metadata lampiran
  return Promise.all(materials.map(async (m) => ({
    id: m.id,
    teacher_id: m.teacher_id,
    title: m.title,
    description: m.description,
    subject_id: m.subject_id,
    section_id: m.section_id,
    status: m.status,
    section: sectionMap.get(m.section_id) || null,
    material_files: await addSignedUrlsToFiles(Array.isArray(m.material_files) ? m.material_files : []),
    created_at: m.created_at,
    updated_at: m.updated_at,
  })));
};
