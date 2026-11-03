import { supabase } from '../../../config/supabase.js';

export const getAllImports = async (req, res) => {
    try {
        const { data, error } = await supabase
            .schema('b6')
            .from('question_imports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar riwayat import',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil riwayat import',
            error: error.message
        });
    }
};

export const getImportById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .schema('b6')
            .from('question_imports')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail import',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail import',
            error: error.message
        });
    }
};

export const createImportLog = async (req, res) => {
    try {
        const {
            file_name,
            teacher_id,
            total_processed = 0,
            total_valid = 0,
            total_invalid = 0,
            status = 'PENDING',
            error_details = null
        } = req.body;

        if (!file_name) {
            return res.status(400).json({
                success: false,
                message: 'Nama file (file_name) wajib diisi'
            });
        }

        const { data, error } = await supabase
            .schema('b6')
            .from('question_imports')
            .insert([
                {
                    file_name,
                    teacher_id,
                    total_processed,
                    total_valid,
                    total_invalid,
                    status,
                    error_details
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Berhasil membuat log import',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat log import',
            error: error.message
        });
    }
};

export const updateImportLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        const { data, error } = await supabase
            .schema('b6')
            .from('question_imports')
            .update(updateFields)
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Log import tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui status import',
            data: data[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui log import',
            error: error.message
        });
    }
};

export const deleteImportLog = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .schema('b6')
            .from('question_imports')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil menghapus riwayat import'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus riwayat import',
            error: error.message
        });
    }
};