import { supabase } from '../../../config/supabase.js';

// Mengambil semua bank soal (Get All)
const getAllQuestionBanks = async (req, res) => {
    try {
        const { data, error } = await supabase
            .schema('b6')
            .from('question_banks')
            .select('*');

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar bank soal',
            data: data
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

        return res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail bank soal',
            data: data
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
            topic_name 
        } = req.body;

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
            .select();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Berhasil membuat bank soal baru',
            data: data[0]
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
            topic_name 
        } = req.body;

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
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bank soal tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui bank soal',
            data: data[0]
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
        const updateFields = req.body; 

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

        return res.status(200).json({
            success: true,
            message: 'Berhasil memperbarui sebagian data bank soal',
            data: data[0]
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