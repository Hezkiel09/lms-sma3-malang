import { supabase } from '../../../config/supabase.js';

const attachCoursesToBanks = async (banks) => {
    if (!banks.length) return [];

    const bankIds = banks.map((bank) => bank.id);
    const { data: mappings, error: mappingError } = await supabase
        .schema('b6')
        .from('question_bank_courses')
        .select('question_bank_id, course_id')
        .in('question_bank_id', bankIds);

    if (mappingError) throw mappingError;

    const courseIds = [...new Set((mappings || []).map((mapping) => mapping.course_id))];
    let courses = [];
    if (courseIds.length) {
        const { data, error } = await supabase
            .schema('master')
            .from('courses')
            .select(`
                id,
                class_id,
                subject_id,
                academic_year,
                semester,
                classes:classes!courses_class_id_fkey(id, name, level, major),
                subjects:subjects!courses_subject_id_fkey(id, name)
            `)
            .in('id', courseIds);

        if (error) throw error;
        courses = data || [];
    }

    const courseById = new Map(courses.map((course) => [String(course.id), course]));
    const coursesByBankId = new Map();
    (mappings || []).forEach((mapping) => {
        const course = courseById.get(String(mapping.course_id));
        if (!course) return;
        const bankCourses = coursesByBankId.get(String(mapping.question_bank_id)) || [];
        bankCourses.push(course);
        coursesByBankId.set(String(mapping.question_bank_id), bankCourses);
    });

    return banks.map((bank) => ({
        ...bank,
        courses: coursesByBankId.get(String(bank.id)) || [],
    }));
};

const syncBankCourses = async (bankId, courseIds, subjectId) => {
    const uniqueCourseIds = [...new Set(courseIds.map((id) => String(id)))];
    if (uniqueCourseIds.length && !subjectId) {
        throw new Error('Mata pelajaran bank soal wajib terhubung sebelum kelas dipetakan');
    }

    if (uniqueCourseIds.length) {
        const { data: courses, error: courseError } = await supabase
            .schema('master')
            .from('courses')
            .select('id, subject_id')
            .in('id', uniqueCourseIds);
        if (courseError) throw courseError;

        const courseById = new Map((courses || []).map((course) => [
            String(course.id),
            String(course.subject_id),
        ]));
        if (uniqueCourseIds.some((courseId) => courseById.get(courseId) !== String(subjectId))) {
            throw new Error('Semua kelas yang dipetakan harus menggunakan mata pelajaran bank soal');
        }
    }

    const { data: existingMappings, error: readError } = await supabase
        .schema('b6')
        .from('question_bank_courses')
        .select('course_id')
        .eq('question_bank_id', bankId);
    if (readError) throw readError;

    const existingIds = (existingMappings || []).map((mapping) => String(mapping.course_id));
    const existingSet = new Set(existingIds);
    const requestedSet = new Set(uniqueCourseIds);
    const addedIds = uniqueCourseIds.filter((id) => !existingSet.has(id));
    const removedIds = existingIds.filter((id) => !requestedSet.has(id));

    if (addedIds.length) {
        const { error } = await supabase
            .schema('b6')
            .from('question_bank_courses')
            .insert(addedIds.map((courseId) => ({
                question_bank_id: bankId,
                course_id: courseId,
            })));
        if (error) throw error;
    }

    if (removedIds.length) {
        const { error } = await supabase
            .schema('b6')
            .from('question_bank_courses')
            .delete()
            .eq('question_bank_id', bankId)
            .in('course_id', removedIds);
        if (error) throw error;
    }
};

// Mengambil semua bank soal (Get All)
const getAllQuestionBanks = async (req, res) => {
    try {
        const { data, error } = await supabase
            .schema('b6')
            .from('question_banks')
            .select('*');

        if (error) throw error;
        const banksWithCourses = await attachCoursesToBanks(data || []);

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar bank soal',
            data: banksWithCourses
        });
    } catch (error) {
        console.error('Error fetching question banks:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar bank soal',
            error: error.message
        });
    }
};

// Mengambil detail bank soal berdasarkan ID (Get by ID)
const getQuestionBankById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .schema('b6')
            .from('question_banks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        const [bankWithCourses] = await attachCoursesToBanks(data ? [data] : []);

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail bank soal',
            data: bankWithCourses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail bank soal',
            error: error.message
        });
    }
};

// Membuat bank soal baru (POST)
const createQuestionBank = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            subject_id, 
            teacher_id, 
            class_level, 
            subject_name, 
            topic_name,
            course_ids
        } = req.body;

        if (course_ids !== undefined && (!Array.isArray(course_ids)
            || course_ids.some((courseId) => typeof courseId !== 'string' || !courseId.trim()))) {
            return res.status(400).json({
                success: false,
                message: 'course_ids harus berupa daftar ID course yang valid'
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Nama bank soal wajib diisi'
            });
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('question_banks')
            .insert([
                {
                    name,
                    description,
                    subject_id,
                    teacher_id,
                    class_level,
                    subject_name,
                    topic_name
                }
            ])
            .select()
            .single();

        if (error) throw error;
        if (Array.isArray(course_ids)) {
            try {
                await syncBankCourses(data.id, course_ids, data.subject_id);
            } catch (mappingError) {
                const { error: cleanupError } = await supabase
                    .schema('b6')
                    .from('question_banks')
                    .delete()
                    .eq('id', data.id);
                if (cleanupError) {
                    throw new Error(`${mappingError.message}; cleanup bank also failed: ${cleanupError.message}`);
                }
                throw mappingError;
            }
        }
        const [bankWithCourses] = await attachCoursesToBanks([data]);

        return res.status(201).json({
            success: true,
            message: 'Berhasil membuat bank soal baru',
            data: bankWithCourses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat bank soal',
            error: error.message
        });
    }
};

// Memperbarui Bank Soal (PUT/PATCH)
const updateQuestionBank = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            description, 
            subject_id, 
            teacher_id, 
            class_level, 
            subject_name, 
            topic_name,
            course_ids
        } = req.body;

        if (course_ids !== undefined && (!Array.isArray(course_ids)
            || course_ids.some((courseId) => typeof courseId !== 'string' || !courseId.trim()))) {
            return res.status(400).json({
                success: false,
                message: 'course_ids harus berupa daftar ID course yang valid'
            });
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('question_banks')
            .update({
                name,
                description,
                subject_id,
                teacher_id,
                class_level,
                subject_name,
                topic_name
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Bank soal tidak ditemukan'
            });
        }

        if (Array.isArray(course_ids)) await syncBankCourses(id, course_ids, data.subject_id);
        const [bankWithCourses] = await attachCoursesToBanks([data]);

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui bank soal',
            data: bankWithCourses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui bank soal',
            error: error.message
        });
    }
};

//Memperbarui sebagian bank soal (PATCH)
const patchQuestionBank = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_ids, ...updateFields } = req.body;
        if (course_ids !== undefined && (!Array.isArray(course_ids)
            || course_ids.some((courseId) => typeof courseId !== 'string' || !courseId.trim()))) {
            return res.status(400).json({
                success: false,
                message: 'course_ids harus berupa daftar ID course yang valid'
            });
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('question_banks')
            .update(updateFields) 
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bank soal tidak ditemukan'
            });
        }

        if (Array.isArray(course_ids)) await syncBankCourses(id, course_ids, data[0].subject_id);
        const [bankWithCourses] = await attachCoursesToBanks([data[0]]);

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui sebagian data bank soal',
            data: bankWithCourses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui bank soal',
            error: error.message
        });
    }
};

// Hapus bank soal (Delete)
const deleteQuestionBank = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .schema('b6')
            .from('question_banks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil menghapus bank soal'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus bank soal',
            error: error.message
        });
    }
};

export {
    getAllQuestionBanks,
    getQuestionBankById,
    createQuestionBank,
    updateQuestionBank,
    patchQuestionBank,
    deleteQuestionBank
};