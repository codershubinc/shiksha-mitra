import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  imageUrl?: string;
}

export interface IQuiz extends Document {
  subjectId: string;
  title: string;
  durationMinutes: number;
  questions: IQuestion[];
}

const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  imageUrl: { type: String },
});

const QuizSchema: Schema = new Schema({
  subjectId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  questions: [QuestionSchema],
});

export const QuizModel = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export interface IExamAttempt extends Document {
  userId: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  answers: {
    questionIndex: number;
    selectedOption: string;
    isCorrect: boolean;
  }[];
  completedAt: Date;
}

const ExamAttemptSchema: Schema = new Schema({
  userId: { type: String, required: true },
  subjectId: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  }],
  completedAt: { type: Date, default: Date.now },
});

export const ExamAttemptModel = mongoose.models.ExamAttempt || mongoose.model<IExamAttempt>('ExamAttempt', ExamAttemptSchema);
