import { supabase } from '../../../config/supabase.js';

export const getOptionsByQuestionId = async (req, res) => {
    try {
        const { questionId } = req.params;

        const { data, error } = await supabase
            .schema('b6')
            .from('question_options')
            .select('*')
            .eq('question_id', questionId)
            .order('option_label', { ascending: true }); 

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil pilihan jawaban',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil pilihan jawaban',
            error: error.message
        });
    }
};

export const getOptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .schema('b6')
            .from('question_options')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Pilihan jawaban tidak ditemukan'
                });
            }
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail pilihan jawaban',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail pilihan jawaban',
            error: error.message
        });
    }
};

export const createOption = async (req, res) => {
    try {
        const { question_id, option_label, option_text, is_correct = false } = req.body;

        if (!question_id || !option_text) {
            return res.status(400).json({
                success: false,
                message: 'question_id dan option_text wajib diisi'
            });
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('question_options') 
            .insert([
                {
                    question_id,
                    option_label, 
                    option_text,
                    is_correct
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Berhasil membuat pilihan jawaban',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat pilihan jawaban',
            error: error.message
        });
    }
};

export const updateOption = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        const { data, error } = await supabase
            .schema('b6')
            .from('question_options') 
            .update(updateFields)
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pilihan jawaban tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui pilihan jawaban',
            data: data[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui pilihan jawaban',
            error: error.message
        });
    }
};

export const deleteOption = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .schema('b6')
            .from('question_options') 
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil menghapus pilihan jawaban'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus pilihan jawaban',
            error: error.message
        });
    }
};