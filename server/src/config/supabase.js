import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config();
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in server/.env.');
}


export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey,
);
