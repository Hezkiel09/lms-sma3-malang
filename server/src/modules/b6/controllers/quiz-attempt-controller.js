import { supabase } from '../../../config/supabase.js';

export const getAllAttempts = async (req, res) => {
    try {
        const { quiz_id, student_id } = req.query;
        let query = supabase.schema('b6').from('quiz_attempts').select('*').order('started_at', { ascending: false });

        if (quiz_id) query = query.eq('quiz_id', quiz_id);
        if (student_id) query = query.eq('student_id', student_id);

        const { data, error } = await query;

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar percobaan kuis',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar percobaan kuis',
            error: error.message
        });
    }
};

export const getAttemptById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .schema('b6')
            .from('quiz_attempts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ success: false, message: 'Percobaan kuis tidak ditemukan' });
            }
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail percobaan kuis',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail percobaan kuis',
            error: error.message
        });
    }
};

export const createAttempt = async (req, res) => {
    try {
        const { quiz_id, student_id, status = 'SEDANG_MENGERJAKAN' } = req.body;

        if (!quiz_id || !student_id) {
            return res.status(400).json({
                success: false,
                message: 'quiz_id dan student_id wajib diisi'
            });
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('quiz_attempts')
            .insert([
                {
                    quiz_id,
                    student_id,
                    status,
                    grading_status: 'BELUM_MULAI' 
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Berhasil memulai kuis',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal memulai kuis',
            error: error.message
        });
    }
};

export const updateAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        if (updateFields.status === 'SELESAI' && !updateFields.submitted_at) {
            updateFields.submitted_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('quiz_attempts')
            .update(updateFields)
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Percobaan kuis tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui data percobaan kuis',
            data: data[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui percobaan kuis',
            error: error.message
        });
    }
};

export const deleteAttempt = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .schema('b6')
            .from('quiz_attempts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil menghapus percobaan kuis'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus percobaan kuis',
            error: error.message
        });
    }
};