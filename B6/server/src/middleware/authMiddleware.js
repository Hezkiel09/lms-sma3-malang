import { supabase } from '../config/supabase.js';

export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    // verifikasi jwt
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    // 2. Cek role user di tabel master.users
    const { data: userData, error: userError } = await supabase
      .schema('master') // scheme master
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak: Hanya untuk Admin' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};