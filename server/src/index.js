import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { supabase } from './config/supabase.js';
import masterRoutes from './modules/master/master.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import bankRouter from './modules/b6/routes/question-bank-routes.js';
import quizRouter from './modules/b6/routes/quiz-routes.js';
import importRouter from './modules/b6/routes/question-import-routes.js';
import optionRouter from './modules/b6/routes/question-options-routes.js';
import attemptRouter from './modules/b6/routes/quiz-attempt-routes.js';
import quizQuestionRouter from './modules/b6/routes/quiz-question-routes.js';
import studentAnswerRouter from './modules/b6/routes/student-answer-routes.js';
import { seedAdmin } from './scripts/seedAdmin.js';

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

// Router Auth & Profil
app.use('/api/v1/auth', authRoutes);

// Router Master Data
app.use('/api/v1/master', masterRoutes);

// B6 - Quiz, Question Banks, Attempts, & Student Answers
app.use('/api/v1/banks', bankRouter);
app.use('/api/v1/quizzes', quizRouter);
app.use('/api/v1/imports', importRouter);
app.use('/api/v1/options', optionRouter);
app.use('/api/v1/attempts', attemptRouter);
app.use('/api/v1/academic', quizQuestionRouter);
app.use('/api/v1/academic', studentAnswerRouter);
app.use('/api/v1/academic/quizzes', quizRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  try {
    await seedAdmin();
  } catch (err) {
    console.error('Seed admin gagal:', err.message);
  }
});
