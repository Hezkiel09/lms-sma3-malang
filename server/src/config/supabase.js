import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in server/.env.');
}

const authOptions = { persistSession: false, autoRefreshToken: false };

export const supabase = createClient(supabaseUrl, supabaseKey, { auth: authOptions });
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: authOptions });

export const createAuthClient = () => createClient(supabaseUrl, supabaseKey, { auth: authOptions });
