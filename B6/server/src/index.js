import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { supabase } from './config/supabase.js';
import masterRoutes from './modules/master/master.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.schema('master').from('users').select('*');
    if (error) throw error;
    res.status(200).json({ message: 'Server is healthy', data });
  } catch (error) {
    res.status(500).json({ message: 'Server is unhealthy', error: error.message });
  }
});

// Router Master Data
app.use('/api/v1/master', masterRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});