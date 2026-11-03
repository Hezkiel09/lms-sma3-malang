import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bankRouter from './modules/b6/routes/question-bank-routes.js';
import quizRouter from './modules/b6/routes/quiz-routes.js';
import importRouter from './modules/b6/routes/question-import-routes.js';
import optionRouter from './modules/b6/routes/question-options-routes.js';
import attemptRouter from './modules/b6/routes/quiz-attempt-routes.js';
import masterRouter from './modules/master/master.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

// B6 - Quiz
app.use('/api/v1/banks', bankRouter);
app.use('/api/v1/quizzes', quizRouter);
app.use('/api/v1/imports', importRouter);
app.use('/api/v1/master', masterRouter);
app.use('/api/v1/options', optionRouter);
app.use('/api/v1/attempts', attemptRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Server is healthy & Database connected!', data: [] });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});