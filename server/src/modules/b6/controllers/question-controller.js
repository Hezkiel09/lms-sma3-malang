import { supabase } from '../../../config/supabase.js';

// Mengambil semua soal beserta opsinya berdasarkan Bank Soal ID (GET by ID)
const getQuestionsByBankId = async (req, res) => {
    try {
        const { bankId } = req.params;

        const { data, error } = await supabase
            .schema('b6')
            .from('questions')
            .select(`
                *,
                question_options (*)
            `)
            .eq('question_bank_id', bankId);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar soal',
            data: data
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar soal',
            error: error.message
        });
    }
};

// Menambahkan soal baru secara manual beserta pilihan jawabannya (POST)
const createQuestion = async (req, res) => {
    try {
        const { bankId } = req.params;
        const {
            question_text,
            question_type = 'PILIHAN_GANDA',
            default_points = 1.0,
            scoring_method,
            reference_answer,
            grading_rubric,
            image_url,
            explanation,
            options
        } = req.body;

        if (!question_text) {
            return res.status(400).json({
                success: false,
                message: 'Teks pertanyaan (question_text) wajib diisi'
            });
        }

        const { data: newQuestion, error: questionError } = await supabase
            .schema('b6')
            .from('questions')
            .insert([
                {
                    question_bank_id: bankId,
                    question_text,
                    question_type,
                    default_points,
                    scoring_method,
                    reference_answer,
                    grading_rubric,
                    image_url,
                    explanation
                }
            ])
            .select()
            .single();

        if (questionError) throw questionError;

        let insertedOptions = [];
        if (options && Array.isArray(options) && options.length > 0) {
            const formattedOptions = options.map((opt) => ({
                question_id: newQuestion.id,
                option_label: opt.option_label,
                option_text: opt.option_text,
                is_correct: opt.is_correct || false
            }));

            const { data: optionsData, error: optionsError } = await supabase
                .schema('b6')
                .from('question_options')
                .insert(formattedOptions)
                .select();

            if (optionsError) throw optionsError;
            insertedOptions = optionsData;
        }

        return res.status(201).json({
            success: true,
            message: 'Berhasil membuat soal dan opsi jawaban',
            data: {
                ...newQuestion,
                question_options: insertedOptions
            }
        });
    } catch (error) {
        console.error('Error creating question:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat soal',
            error: error.message
        });
    }
};

// Import soal via Excel (Placeholder) (POST)
const importExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File Excel wajib diunggah'
            });
        }

        // TODO: Tambahkan logika parsing excel (misal pakai package xlsx/exceljs)
        return res.status(200).json({
            success: true,
            message: 'Fitur import Excel belum diimplementasikan sepenuhnya'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengimpor Excel',
            error: error.message
        });
    }
};

// Update soal dan opsinya (PUT/PATCH)
const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const {
            question_text,
            question_type,
            default_points,
            scoring_method,
            reference_answer,
            grading_rubric,
            image_url,
            explanation,
            options
        } = req.body;

        // 1. Update tabel b6.questions
        const { data: updatedQuestion, error: questionError } = await supabase
            .schema('b6')
            .from('questions')
            .update({
                question_text,
                question_type,
                default_points,
                scoring_method,
                reference_answer,
                grading_rubric,
                image_url,
                explanation
            })
            .eq('id', questionId)
            .select()
            .single();

        if (questionError) throw questionError;

        // 2. Jika array options dikirim, perbarui opsi jawaban
        let updatedOptions = [];
        if (options && Array.isArray(options)) {
            // Hapus opsi lama
            await supabase
                .schema('b6')
                .from('question_options')
                .delete()
                .eq('question_id', questionId);

            // Insert opsi baru
            if (options.length > 0) {
                const formattedOptions = options.map((opt) => ({
                    question_id: questionId,
                    option_label: opt.option_label,
                    option_text: opt.option_text,
                    is_correct: opt.is_correct || false
                }));

                const { data: optionsData, error: optionsError } = await supabase
                    .schema('b6')
                    .from('question_options')
                    .insert(formattedOptions)
                    .select();

                if (optionsError) throw optionsError;
                updatedOptions = optionsData;
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui soal',
            data: {
                ...updatedQuestion,
                question_options: updatedOptions
            }
        });
    } catch (error) {
        console.error('Error updating question:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui soal',
            error: error.message
        });
    }
};

//Memperbarui sebagian soal (PATCH)
const patchQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { options, ...questionFields } = req.body;

        let updatedQuestion = null;

        // 1. Jika ada field soal yang dikirim (selain options), update tabel b6.questions
        if (Object.keys(questionFields).length > 0) {
            const { data, error } = await supabase
                .schema('b6')
                .from('questions')
                .update(questionFields)
                .eq('id', questionId)
                .select()
                .single();

            if (error) throw error;
            updatedQuestion = data;
        }

        // 2. Jika opsi jawaban juga disertakan, perbarui opsinya
        let updatedOptions = [];
        if (options && Array.isArray(options)) {
            await supabase
                .schema('b6')
                .from('question_options')
                .delete()
                .eq('question_id', questionId);

            if (options.length > 0) {
                const formattedOptions = options.map((opt) => ({
                    question_id: questionId,
                    option_label: opt.option_label,
                    option_text: opt.option_text,
                    is_correct: opt.is_correct || false
                }));

                const { data: optionsData, error: optionsError } = await supabase
                    .schema('b6')
                    .from('question_options')
                    .insert(formattedOptions)
                    .select();

                if (optionsError) throw optionsError;
                updatedOptions = optionsData;
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui sebagian data soal',
            data: {
                ...updatedQuestion,
                ...(options ? { question_options: updatedOptions } : {})
            }
        });
    } catch (error) {
        console.error('Error patching question:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui soal',
            error: error.message
        });
    }
};

// Hapus 1 soal beserta opsi jawabannya (DELETE)
const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        // Hapus opsi terlebih dahulu
        await supabase
            .schema('b6')
            .from('question_options')
            .delete()
            .eq('question_id', questionId);

        // Hapus soal utama
        const { error } = await supabase
            .schema('b6')
            .from('questions')
            .delete()
            .eq('id', questionId);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil menghapus soal'
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus soal',
            error: error.message
        });
    }
};

export {
    getQuestionsByBankId,
    createQuestion,
    importExcel,
    updateQuestion,
    patchQuestion,
    deleteQuestion
};