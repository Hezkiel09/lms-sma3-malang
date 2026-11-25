import { supabase } from '../../../config/supabase.js';

const validateEssayQuizPoints = async (questions = []) => {
    if (!Array.isArray(questions)) return null;
    const ids = [...new Set(questions.map((question) => question.question_id).filter(Boolean))];
    if (!ids.length) return null;
    const { data, error } = await supabase.schema('b6').from('questions')
        .select('id, question_type').in('id', ids);
    if (error) throw error;
    const essayIds = new Set((data || []).filter((question) =>
        ['ESAI', 'ESSAY'].includes(String(question.question_type || '').toUpperCase())
    ).map((question) => String(question.id)));
    const invalid = questions.some((question) => essayIds.has(String(question.question_id))
        && (!Number.isFinite(Number(question.points)) || Number(question.points) < 0 || Number(question.points) > 10));
    return invalid ? 'Poin soal esai harus di antara 0 dan 10.' : null;
};

// 1. Ambil semua kuis
const getAllQuizzes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .schema('b6')
            .from('quizzes')
            .select('*');

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar kuis',
            data: data
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar kuis',
            error: error.message
        });
    }
};

// 2. Ambil detail kuis beserta soal-soalnya dan opsi jawabannya
const getQuizById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .schema('b6')
            .from('quizzes')
            .select(`
                *,
                quiz_questions (
                    id,
                    question_id,
                    points,
                    question_order,
                    questions (
                        *,
                        question_options (*)
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        let quizResponse = data;
        if (req.user?.role === 'student') {
            quizResponse = {
                ...data,
                quiz_questions: (data.quiz_questions || []).map((quizQuestion) => {
                    const question = quizQuestion.questions || {};
                    const options = question.question_options || question.options || [];
                    return {
                        id: quizQuestion.id,
                        question_id: quizQuestion.question_id,
                        points: quizQuestion.points,
                        question_order: quizQuestion.question_order,
                        questions: {
                            id: question.id,
                            question_text: question.question_text,
                            question_type: question.question_type,
                            image_url: question.image_url,
                            options: options.map(({ id: optionId, option_label, option_text }) => ({
                                id: optionId,
                                option_label,
                                option_text,
                            })),
                        },
                    };
                }),
            };
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail kuis',
            data: quizResponse
        });
    } catch (error) {
        console.error('Error fetching quiz detail:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail kuis',
            error: error.message
        });
    }
};

// 3. Buat Kuis Baru (Bisa langsung menyertakan daftar soal)
const createQuiz = async (req, res) => {
    try {
        const {
            title,
            description,
            subject_id,
            class_id,
            teacher_id,
            duration_minutes,
            start_at,
            end_at,
            status = 'DRAFT',
            passing_grade = 75,
            assessment_type,
            academic_term,
            questions // Array dari [{ question_id, points, question_order }]
        } = req.body;

        const essayPointsError = await validateEssayQuizPoints(questions || []);
        if (essayPointsError) return res.status(400).json({ success: false, message: essayPointsError });

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Judul kuis (title) wajib diisi'
            });
        }

        // Insert kuis utama
        const { data: newQuiz, error: quizError } = await supabase
            .schema('b6')
            .from('quizzes')
            .insert([
                {
                    title,
                    description,
                    subject_id,
                    class_id,
                    teacher_id,
                    duration_minutes,
                    start_at,
                    end_at,
                    status,
                    passing_grade,
                    assessment_type,
                    academic_term
                }
            ])
            .select()
            .single();

        if (quizError) throw quizError;

        // Jika ada list soal yang dikirim bersamaan
        let attachedQuestions = [];
        if (questions && Array.isArray(questions) && questions.length > 0) {
            const formattedQuestions = questions.map((q, index) => ({
                quiz_id: newQuiz.id,
                question_id: q.question_id,
                points: q.points || 1.0,
                question_order: q.question_order || (index + 1)
            }));

            const { data: qData, error: qError } = await supabase
                .schema('b6')
                .from('quiz_questions')
                .insert(formattedQuestions)
                .select();

            if (qError) throw qError;
            attachedQuestions = qData;
        }

        return res.status(201).json({
            success: true,
            message: 'Berhasil membuat kuis baru',
            data: {
                ...newQuiz,
                quiz_questions: attachedQuestions
            }
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat kuis',
            error: error.message
        });
    }
};

// 4. Update/Patch Kuis
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        const { data, error } = await supabase
            .schema('b6')
            .from('quizzes')
            .update(updateFields)
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kuis tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui data kuis',
            data: data[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui kuis',
            error: error.message
        });
    }
};

// 5. Hapus Kuis (beserta relasi soalnya)
const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;

        // Hapus relasi soal kuis dulu
        await supabase
            .schema('b6')
            .from('quiz_questions')
            .delete()
            .eq('quiz_id', id);

        // Hapus kuis
        const { error } = await supabase
            .schema('b6')
            .from('quizzes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil menghapus kuis'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus kuis',
            error: error.message
        });
    }
};

// 6. Tambahkan Soal ke Kuis yang Sudah Ada
const addQuestionsToQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { questions } = req.body; // Array [{ question_id, points, question_order }]

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Daftar soal (questions) tidak boleh kosong'
            });
        }

        const essayPointsError = await validateEssayQuizPoints(questions);
        if (essayPointsError) return res.status(400).json({ success: false, message: essayPointsError });

        const formattedQuestions = questions.map((q, index) => ({
            quiz_id: id,
            question_id: q.question_id,
            points: q.points || 1.0,
            question_order: q.question_order || (index + 1)
        }));

        const { data, error } = await supabase
            .schema('b6')
            .from('quiz_questions')
            .insert(formattedQuestions)
            .select();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Berhasil menambahkan soal ke kuis',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal menambahkan soal ke kuis',
            error: error.message
        });
    }
};

// 7. Hapus 1 Soal dari Kuis
const removeQuestionFromQuiz = async (req, res) => {
    try {
        const { id, questionId } = req.params;

        const { error } = await supabase
            .schema('b6')
            .from('quiz_questions')
            .delete()
            .eq('quiz_id', id)
            .eq('question_id', questionId);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil menghapus soal dari kuis'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus soal dari kuis',
            error: error.message
        });
    }
};

export {
    getAllQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestionsToQuiz,
    removeQuestionFromQuiz
};
