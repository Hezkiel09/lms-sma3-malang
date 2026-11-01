import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bankRouter from './modules/b6/routes/question-bank-routes.js';
import quizRouter from './modules/b6/routes/quiz-routes.js';
import masterRouter from './modules/master/master.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

app.use('/api/v1/banks', bankRouter);
app.use('/api/v1/quizzes', quizRouter);
app.use('/api/v1/master', masterRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Server is healthy & Database connected!', data: [] });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});