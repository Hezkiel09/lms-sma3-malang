import { supabase } from '../../../config/supabase.js';

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
  return data;
};

/**
 * Service untuk mengambil detail satu materi berdasarkan ID
 */
export const getMaterialByIdService = async (id) => {
  const { data, error } = await supabase
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
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Materi tidak ditemukan');
  }

  return data;
};

/**
 * Service untuk menambah materi baru (UC-02)
 *
 * CATATAN PENTING:
 * 1. Status Publikasi vs Draf: Tabel 'b5.materials' belum memiliki kolom 'status'.
 * 2. Upload File: Supabase Storage & middleware multipart (Multer) belum terpasang.
 * 3. Relasi Kelas: Memasukkan data ke 'b5.materials', lalu relasi kelas ke 'b5.material_classes'.
 * 4. Relasi File: Metadata disimpan di 'b5.material_files'.
 */
export const createMaterialService = async ({
  teacher_id,
  title,
  description,
  subject_id,
  class_ids = [],
  files = [],
}) => {
  // TODO: Tambahkan validasi kelengkapan data & verifikasi foreign key

  // 1. Simpan data materi ke b5.materials
  const { data: material, error: materialError } = await supabase
    .schema('b5')
    .from('materials')
    .insert([
      {
        teacher_id,
        title,
        description: description || null,
        subject_id,
      },
    ])
    .select()
    .single();

  if (materialError) throw materialError;

  // 2. Simpan relasi kelas ke b5.material_classes jika class_ids disediakan
  if (class_ids && class_ids.length > 0) {
    const classRows = class_ids.map((class_id) => ({
      material_id: material.id,
      class_id,
    }));

    const { error: classesError } = await supabase
      .schema('b5')
      .from('material_classes')
      .insert(classRows);

    if (classesError) throw classesError;
  }

  // 3. Simpan metadata file ke b5.material_files jika ada file yang diunggah
  // TODO: Sambungkan ke Supabase Storage setelah middleware upload terpasang
  if (files && files.length > 0) {
    const fileRows = files.map((file) => ({
      material_id: material.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type || null,
      file_size: file.file_size || null,
    }));

    const { error: filesError } = await supabase
      .schema('b5')
      .from('material_files')
      .insert(fileRows);

    if (filesError) throw filesError;
  }

  return material;
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
  return materials.map((m) => ({
    id: m.id,
    teacher_id: m.teacher_id,
    title: m.title,
    description: m.description,
    subject_id: m.subject_id,
    section_id: m.section_id,
    status: m.status,
    section: sectionMap.get(m.section_id) || null,
    material_files: Array.isArray(m.material_files) ? m.material_files : [],
    created_at: m.created_at,
    updated_at: m.updated_at,
  }));
};
