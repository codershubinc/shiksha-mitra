import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { QuizModel } from './backend/models/quiz.model.js';

dotenv.config({ path: path.resolve('backend/.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shiksha-mitra';

const checkData = async () => {
  try {
    await mongoose.connect(mongoUri);
    const quizzes = await QuizModel.find({});
    for (const q of quizzes) {
      console.log(`Subject: ${q.subjectId}, Questions: ${q.questions.length}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}

checkData();
