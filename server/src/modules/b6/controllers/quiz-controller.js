import { supabase } from '../../../config/supabase.js';
import { isQuizWithinAvailabilityWindow } from '../quiz-availability.js';

const quizError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const respondQuizError = (res, error, message) => res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || message,
    error: error.statusCode ? undefined : error.message,
});

const getTeacherIdForUser = async (userId) => {
    const { data, error } = await supabase.schema('master').from('teachers')
        .select('id').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!data) throw quizError(403, 'Profil guru tidak ditemukan.');
    return data.id;
};

const getStudentQuizContext = async (userId) => {
    const { data: student, error: studentError } = await supabase.schema('master').from('students')
        .select('class_id').eq('user_id', userId).maybeSingle();
    if (studentError) throw studentError;
    if (!student?.class_id) return null;

    const { data: courses, error: coursesError } = await supabase.schema('master').from('courses')
        .select('subject_id').eq('class_id', student.class_id);
    if (coursesError) throw coursesError;

    return {
        classId: student.class_id,
        subjectIds: new Set((courses || []).map((course) => String(course.subject_id))),
    };
};

const quizIsVisibleToStudent = (quiz, context) => Boolean(
    context
    && String(quiz.class_id) === String(context.classId)
    && context.subjectIds.has(String(quiz.subject_id))
    && String(quiz.status || '').toUpperCase() === 'PUBLISHED'
    && isQuizWithinAvailabilityWindow(quiz),
);

const normalizeSchedule = (startAt, endAt) => {
    const parseOptionalDate = (value, label) => {
        if (value === null || value === undefined || value === '') return null;
        const date = new Date(value);
        if (!Number.isFinite(date.getTime())) throw quizError(400, `${label} tidak valid.`);
        return date.toISOString();
    };

    const normalizedStart = parseOptionalDate(startAt, 'Waktu mulai');
    const normalizedEnd = parseOptionalDate(endAt, 'Waktu selesai');
    if (normalizedStart && normalizedEnd && Date.parse(normalizedEnd) <= Date.parse(normalizedStart)) {
        throw quizError(400, 'Waktu selesai harus setelah waktu mulai.');
    }

    return { start_at: normalizedStart, end_at: normalizedEnd };
};

const validateQuizMetadata = async (quiz, teacherId) => {
    if (!String(quiz.title || '').trim()) throw quizError(400, 'Judul kuis wajib diisi.');
    if (!quiz.class_id || !quiz.subject_id) {
        throw quizError(400, 'Kelas dan mata pelajaran wajib dipilih.');
    }
    if (!Number.isFinite(Number(quiz.duration_minutes)) || Number(quiz.duration_minutes) <= 0) {
        throw quizError(400, 'Durasi kuis harus lebih dari 0 menit.');
    }
    if (!Number.isFinite(Number(quiz.passing_grade))
        || Number(quiz.passing_grade) < 0
        || Number(quiz.passing_grade) > 100) {
        throw quizError(400, 'KKM harus berada di antara 0 sampai 100.');
    }

    const { data: course, error } = await supabase.schema('master').from('courses')
        .select('id')
        .eq('class_id', quiz.class_id)
        .eq('subject_id', quiz.subject_id)
        .eq('teacher_id', teacherId)
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    if (!course) {
        throw quizError(400, 'Kelas dan mata pelajaran harus merupakan course yang diampu guru ini.');
    }
};

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

        let quizzes = data || [];
        if (req.user?.role === 'student') {
            const context = await getStudentQuizContext(req.user.id);
            quizzes = context
                ? quizzes.filter((quiz) => quizIsVisibleToStudent(quiz, context))
                : [];
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar kuis',
            data: quizzes
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return respondQuizError(res, error, 'Gagal mengambil daftar kuis');
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

        if (req.user?.role === 'student') {
            const context = await getStudentQuizContext(req.user.id);
            if (!quizIsVisibleToStudent(data, context)) {
                throw quizError(404, 'Kuis tidak ditemukan atau belum tersedia.');
            }
        }

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
        return respondQuizError(res, error, 'Gagal mengambil detail kuis');
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
            duration_minutes,
            start_at,
            end_at,
            passing_grade = 75,
            assessment_type,
            academic_term,
            questions // Array dari [{ question_id, points, question_order }]
        } = req.body;
        const teacherId = await getTeacherIdForUser(req.user.id);
        const quizData = {
            title: String(title || '').trim(),
            description: description || '',
            subject_id,
            class_id,
            teacher_id: teacherId,
            duration_minutes: Number(duration_minutes),
            passing_grade: Number(passing_grade),
            ...normalizeSchedule(start_at, end_at),
        };
        await validateQuizMetadata(quizData, teacherId);

        const essayPointsError = await validateEssayQuizPoints(questions || []);
        if (essayPointsError) return res.status(400).json({ success: false, message: essayPointsError });

        // Insert kuis utama
        const { data: newQuiz, error: quizError } = await supabase
            .schema('b6')
            .from('quizzes')
            .insert([
                {
                    ...quizData,
                    status: 'DRAFT',
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
        return respondQuizError(res, error, 'Gagal membuat kuis');
    }
};

// 4. Update/Patch Kuis
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = await getTeacherIdForUser(req.user.id);
        const { data: currentQuiz, error: readError } = await supabase.schema('b6').from('quizzes')
            .select('*').eq('id', id).eq('teacher_id', teacherId).maybeSingle();
        if (readError) throw readError;
        if (!currentQuiz) throw quizError(404, 'Kuis tidak ditemukan.');
        if (req.body.status && req.body.status !== currentQuiz.status) {
            throw quizError(400, 'Perubahan status harus melalui alur publikasi.');
        }

        const allowedFields = [
            'title', 'description', 'subject_id', 'class_id', 'duration_minutes',
            'passing_grade', 'assessment_type', 'academic_term', 'start_at', 'end_at',
        ];
        const submittedFields = Object.fromEntries(
            Object.entries(req.body).filter(([field]) => allowedFields.includes(field)),
        );
        const mergedQuiz = {
            ...currentQuiz,
            ...submittedFields,
            teacher_id: teacherId,
            title: String(submittedFields.title ?? currentQuiz.title).trim(),
            duration_minutes: Number(submittedFields.duration_minutes ?? currentQuiz.duration_minutes),
            passing_grade: Number(submittedFields.passing_grade ?? currentQuiz.passing_grade),
        };
        const schedule = normalizeSchedule(
            Object.hasOwn(submittedFields, 'start_at') ? submittedFields.start_at : currentQuiz.start_at,
            Object.hasOwn(submittedFields, 'end_at') ? submittedFields.end_at : currentQuiz.end_at,
        );
        await validateQuizMetadata(mergedQuiz, teacherId);
        const updateFields = { ...submittedFields, ...schedule };
        if (Object.hasOwn(updateFields, 'duration_minutes')) {
            updateFields.duration_minutes = mergedQuiz.duration_minutes;
        }
        if (Object.hasOwn(updateFields, 'passing_grade')) {
            updateFields.passing_grade = mergedQuiz.passing_grade;
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('quizzes')
            .update(updateFields)
            .eq('id', id).eq('teacher_id', teacherId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            throw quizError(404, 'Kuis tidak ditemukan.');
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui data kuis',
            data: data[0]
        });
    } catch (error) {
        return respondQuizError(res, error, 'Gagal memperbarui kuis');
    }
};

const publishQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = await getTeacherIdForUser(req.user.id);
        const { data: quiz, error: readError } = await supabase.schema('b6').from('quizzes')
            .select('*').eq('id', id).eq('teacher_id', teacherId).maybeSingle();
        if (readError) throw readError;
        if (!quiz) throw quizError(404, 'Kuis tidak ditemukan.');

        const quizData = { ...quiz, teacher_id: teacherId };
        await validateQuizMetadata(quizData, teacherId);

        const { count, error: questionError } = await supabase.schema('b6').from('quiz_questions')
            .select('id', { count: 'exact', head: true }).eq('quiz_id', id);
        if (questionError) throw questionError;
        if (!count) throw quizError(400, 'Tambahkan minimal satu soal sebelum mempublikasikan kuis.');

        const now = new Date();
        const requestedStart = Object.hasOwn(req.body, 'start_at') ? req.body.start_at : quiz.start_at;
        const requestedEnd = Object.hasOwn(req.body, 'end_at') ? req.body.end_at : quiz.end_at;
        const schedule = normalizeSchedule(
            requestedStart || now.toISOString(),
            requestedEnd,
        );
        const startsAt = Date.parse(schedule.start_at);
        const endsAt = schedule.end_at ? Date.parse(schedule.end_at) : null;
        if (startsAt > now.getTime() && !endsAt) {
            throw quizError(400, 'Kuis terjadwal wajib memiliki waktu selesai.');
        }
        if (endsAt !== null && endsAt <= now.getTime()) {
            throw quizError(400, 'Waktu selesai kuis harus berada di masa depan.');
        }

        const { data, error } = await supabase.schema('b6').from('quizzes')
            .update({ status: 'PUBLISHED', ...schedule })
            .eq('id', id).eq('teacher_id', teacherId)
            .select().single();
        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: startsAt > now.getTime() ? 'Kuis berhasil dijadwalkan.' : 'Kuis berhasil dipublikasikan.',
            data,
        });
    } catch (error) {
        return respondQuizError(res, error, 'Gagal mempublikasikan kuis');
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
    publishQuiz,
    deleteQuiz,
    addQuestionsToQuiz,
    removeQuestionFromQuiz
};
