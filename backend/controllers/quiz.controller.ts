import { Request, Response } from 'express';
import { QuizModel, ExamAttemptModel } from '../models/quiz.model.js';
import { getAuthenticatedUser } from './auth.controller.js';

export const quizController = {
  async getAllQuizzes(req: Request, res: Response) {
    try {
      const quizzes = await QuizModel.find({}, 'subjectId title durationMinutes questions').lean();
      const summary = quizzes.map(q => ({
        id: q.subjectId,
        title: q.title,
        durationMinutes: q.durationMinutes,
        totalQuestions: q.questions.length,
      }));
      return res.json(summary);
    } catch (err) {
      console.error('getAllQuizzes error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getQuiz(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;
      
      let quiz = await QuizModel.findOne({ subjectId });
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Hide correct answers from the client if needed, or send them if the frontend handles validation
      return res.json(quiz);
    } catch (err: any) {
      console.error('getQuiz error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async submitAttempt(req: Request, res: Response) {
    try {
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthenticated' });
      }

      const { subjectId } = req.params;
      const { answers } = req.body; // Array of { questionIndex, selectedOption }

      const quiz = await QuizModel.findOne({ subjectId });
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      let score = 0;
      const evaluatedAnswers = answers.map((ans: any) => {
        const question = quiz.questions[ans.questionIndex];
        const isCorrect = question.correctAnswer === ans.selectedOption;
        if (isCorrect) score++;
        return {
          questionIndex: ans.questionIndex,
          selectedOption: ans.selectedOption,
          isCorrect
        };
      });

      const attempt = await ExamAttemptModel.create({
        userId: user.id,
        subjectId,
        score,
        totalQuestions: quiz.questions.length,
        answers: evaluatedAnswers
      });

      return res.status(201).json(attempt);
    } catch (err: any) {
      console.error('submitAttempt error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getReports(req: Request, res: Response) {
    try {
      const user = await getAuthenticatedUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthenticated' });

      // If student, return their own attempts.
      // If teacher/parent, this could be extended to accept a userId query param.
      let targetUserId = user.id;
      if ((user.role === 'teacher' || user.role === 'parent') && req.query.studentId) {
        targetUserId = req.query.studentId as string;
      }

      const attempts = await ExamAttemptModel.find({ userId: targetUserId }).sort({ completedAt: -1 });
      return res.json(attempts);
    } catch (err: any) {
      console.error('getReports error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
