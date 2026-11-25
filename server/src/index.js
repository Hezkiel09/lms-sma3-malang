import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { supabase } from './config/supabase.js';
import authRouter from './modules/auth/auth.routes.js';
import b5Routes from './modules/b5/b5.routes.js';
import bankRouter from './modules/b6/routes/question-bank-routes.js';
import quizRouter from './modules/b6/routes/quiz-routes.js';
import importRouter from './modules/b6/routes/question-import-routes.js';
import optionRouter from './modules/b6/routes/question-options-routes.js';
import attemptRouter from './modules/b6/routes/quiz-attempt-routes.js';
import masterRouter from './modules/master/master.routes.js';
import quizQuestionRouter from './modules/b6/routes/quiz-question-routes.js';
import studentAnswerRouter from './modules/b6/routes/student-answer-routes.js';
import { seedAdmin } from './scripts/seedAdmin.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const { error } = await supabase.schema('master').from('users').select('id').limit(1);
    if (error) throw error;
    return res.status(200).json({ success: true, message: 'Server is healthy' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server is unhealthy', error: error.message });
  }
});

app.get('/', (req, res) => res.json({ message: 'Server is healthy', data: [] }));

// Router Auth, Master, B5, & B6
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/master', masterRouter);
app.use('/api/v1/b5', b5Routes);

app.use('/api/v1/banks', bankRouter);
app.use('/api/v1/quizzes', quizRouter);
app.use('/api/v1/imports', importRouter);
app.use('/api/v1/options', optionRouter);
app.use('/api/v1/attempts', attemptRouter);
app.use('/api/v1/academic', quizQuestionRouter);
app.use('/api/v1/academic', studentAnswerRouter);

app.listen(port, async () => {
  console.log(`Server is running on port http://localhost:${port}`);
  try {
    await seedAdmin();
  } catch (error) {
    console.error('Seed admin gagal:', error.message);
  }
});