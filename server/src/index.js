import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import masterRoutes from './modules/master/master.routes.js';
import b5Routes from './modules/b5/b5.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

// Router Master Data
app.use('/api/v1/master', masterRoutes);

// Router Modul B5 (Materi, dsb.)
app.use('/api/v1/b5', b5Routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
