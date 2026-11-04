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

const formatFileSizeStr = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Mengubah storage path menjadi signed URL saat data dikirim ke client. */
const addSignedUrlToFile = async (file) => {
  if (!file?.file_url || /^https?:\/\//i.test(file.file_url)) return file;

  if (!MATERIALS_BUCKET) {
    throw new Error('Environment SUPABASE_STORAGE_BUCKET_MATERIALS belum dikonfigurasi.');
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(MATERIALS_BUCKET)
      .createSignedUrl(file.file_url, SIGNED_URL_TTL_SECONDS);

    if (error) {
      console.warn(`Gagal membuat signed URL untuk file ${file.file_url}:`, error.message);
      return { ...file, file_url: null };
    }

    return { ...file, file_url: data.signedUrl };
  } catch (err) {
    console.warn(`Pengecualian saat membuat signed URL untuk file ${file.file_url}:`, err.message);
    return { ...file, file_url: null };
  }
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
    date: formatDateIndo(material.created_at),
    uploadDate: formatDateIndo(material.created_at),
    category: subjectResult.data?.name || course?.subject_name || 'Umum',
    targetClass: course?.class_name || classes[0]?.name || null,
    fileName: materialFiles[0]?.file_name || null,
    fileSize: materialFiles[0]?.file_size ? formatFileSizeStr(materialFiles[0].file_size) : null,
    fileUrl: materialFiles[0]?.file_url || null,
    author: {
      name: teacherResult.data?.name || course?.teacher_name || 'Guru',
      role: 'Guru',
    },
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
 * Service untuk memperbarui materi dan menambahkan lampiran baru jika ada (UC-03)
 */
export const updateMaterialService = async (
  id,
  { title, description, status, files = [] }
) => {
  // 1. Pastikan materi dengan ID tersebut tersedia
  const { data: existingMaterial, error: findError } = await supabaseAdmin
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
      updated_at
    `)
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!existingMaterial) {
    const error = new Error('Materi tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Siapkan payload update materi
  const updatePayload = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updatePayload.title = title.trim();
  if (description !== undefined) updatePayload.description = description?.trim() || null;
  if (status !== undefined) updatePayload.status = status;

  const { data: updatedMaterial, error: updateError } = await supabaseAdmin
    .schema('b5')
    .from('materials')
    .update(updatePayload)
    .eq('id', id)
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

  if (updateError) throw updateError;

  // 3. Tambahkan lampiran baru jika ada file yang diunggah
  const newlyUploadedPaths = [];
  if (files && files.length > 0) {
    if (!MATERIALS_BUCKET) {
      const error = new Error('Bucket Storage belum dikonfigurasi. Atur SUPABASE_STORAGE_BUCKET_MATERIALS pada environment server.');
      error.statusCode = 500;
      throw error;
    }

    const fileRows = [];
    try {
      for (const file of files) {
        if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
          throw new Error(`Konten file ${file.originalname || 'lampiran'} tidak valid.`);
        }

        const safeFileName = sanitizeStorageFileName(file.originalname);
        const storagePath = `${existingMaterial.teacher_id}/${id}/${randomUUID()}-${safeFileName}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from(MATERIALS_BUCKET)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype || 'application/octet-stream',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;
        newlyUploadedPaths.push(storagePath);

        fileRows.push({
          material_id: id,
          file_name: file.originalname,
          file_url: storagePath,
          file_type: file.mimetype || null,
          file_size: file.size ?? file.buffer.length,
        });
      }

      if (fileRows.length > 0) {
        const { error: filesInsertError } = await supabaseAdmin
          .schema('b5')
          .from('material_files')
          .insert(fileRows);

        if (filesInsertError) throw filesInsertError;
      }
    } catch (uploadOrDbErr) {
      // Rollback file baru yang terlanjur terunggah ke Storage tanpa merusak file lama
      if (MATERIALS_BUCKET && newlyUploadedPaths.length > 0) {
        const { error: rmErr } = await supabaseAdmin.storage
          .from(MATERIALS_BUCKET)
          .remove(newlyUploadedPaths);
        if (rmErr) console.error('Gagal rollback file Storage baru:', rmErr);
      }
      throw uploadOrDbErr;
    }
  }

  // 4. Ambil seluruh lampiran (lama + baru) dengan signed URL
  const { data: allFiles, error: allFilesError } = await supabaseAdmin
    .schema('b5')
    .from('material_files')
    .select('id, material_id, file_name, file_url, file_type, file_size, uploaded_at')
    .eq('material_id', id)
    .order('uploaded_at', { ascending: true });

  if (allFilesError) throw allFilesError;

  return {
    ...updatedMaterial,
    material_files: await addSignedUrlsToFiles(allFiles || []),
  };
};

/**
 * Service untuk mengubah nama satu lampiran (UC-03)
 */
export const renameMaterialFileService = async (materialId, fileId, newFileName) => {
  // 1. Verifikasi lampiran milik materi yang sesuai
  const { data: existingFile, error: findError } = await supabaseAdmin
    .schema('b5')
    .from('material_files')
    .select('id, material_id, file_name, file_url, file_type, file_size, uploaded_at')
    .eq('id', fileId)
    .eq('material_id', materialId)
    .maybeSingle();

  if (findError) throw findError;
  if (!existingFile) {
    const error = new Error('Lampiran tidak ditemukan pada materi ini.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Update file_name di database tanpa mengubah objek fisik di Storage
  const { data: updatedFile, error: updateError } = await supabaseAdmin
    .schema('b5')
    .from('material_files')
    .update({ file_name: newFileName.trim() })
    .eq('id', fileId)
    .eq('material_id', materialId)
    .select('id, material_id, file_name, file_url, file_type, file_size, uploaded_at')
    .single();

  if (updateError) throw updateError;

  return addSignedUrlToFile(updatedFile);
};

/**
 * Service untuk menghapus satu lampiran dari Storage dan database (UC-03)
 */
export const deleteMaterialFileService = async (materialId, fileId) => {
  // 1. Verifikasi lampiran milik materi yang sesuai
  const { data: existingFile, error: findError } = await supabaseAdmin
    .schema('b5')
    .from('material_files')
    .select('id, material_id, file_name, file_url')
    .eq('id', fileId)
    .eq('material_id', materialId)
    .maybeSingle();

  if (findError) throw findError;
  if (!existingFile) {
    const error = new Error('Lampiran tidak ditemukan pada materi ini.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Hapus file fisik dari Supabase Storage terlebih dahulu
  if (MATERIALS_BUCKET && existingFile.file_url) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(MATERIALS_BUCKET)
      .remove([existingFile.file_url]);

    if (storageError) {
      console.error('Gagal menghapus file dari Storage:', storageError);
      const error = new Error('Gagal menghapus file fisik lampiran dari storage.');
      error.statusCode = 500;
      throw error;
    }
  }

  // 3. Hapus metadata dari b5.material_files setelah storage bersih
  const { error: deleteError } = await supabaseAdmin
    .schema('b5')
    .from('material_files')
    .delete()
    .eq('id', fileId)
    .eq('material_id', materialId);

  if (deleteError) throw deleteError;

  return {
    id: fileId,
    material_id: materialId,
    file_name: existingFile.file_name,
  };
};

/**
 * Service untuk menghapus seluruh materi beserta lampirannya (UC-03)
 */
export const deleteMaterialService = async (id) => {
  // 1. Verifikasi materi tersedia
  const { data: existingMaterial, error: findError } = await supabaseAdmin
    .schema('b5')
    .from('materials')
    .select('id, title')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw findError;
  if (!existingMaterial) {
    const error = new Error('Materi tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Ambil seluruh lampiran milik materi ini
  const { data: files, error: filesError } = await supabaseAdmin
    .schema('b5')
    .from('material_files')
    .select('id, file_url')
    .eq('material_id', id);

  if (filesError) throw filesError;

  // 3. Hapus seluruh file fisik terkait dari Supabase Storage
  const storagePaths = (files || []).map((f) => f.file_url).filter(Boolean);
  if (MATERIALS_BUCKET && storagePaths.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(MATERIALS_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.error('Gagal menghapus file-file dari storage:', storageError);
      const error = new Error('Gagal menghapus file fisik materi dari storage.');
      error.statusCode = 500;
      throw error;
    }
  }

  // 4. Hapus metadata lampiran di b5.material_files
  const { error: deleteFilesError } = await supabaseAdmin
    .schema('b5')
    .from('material_files')
    .delete()
    .eq('id', id);

  if (deleteFilesError) throw deleteFilesError;

  // 5. Hapus relasi kelas di b5.material_classes
  const { error: deleteClassesError } = await supabaseAdmin
    .schema('b5')
    .from('material_classes')
    .delete()
    .eq('id', id);

  if (deleteClassesError) throw deleteClassesError;

  // 6. Hapus record utama di b5.materials
  const { data: deletedMaterial, error: deleteMaterialError } = await supabaseAdmin
    .schema('b5')
    .from('materials')
    .delete()
    .eq('id', id)
    .select('id, title, section_id')
    .maybeSingle();

  if (deleteMaterialError) throw deleteMaterialError;

  return deletedMaterial || { id, title: existingMaterial.title };
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
