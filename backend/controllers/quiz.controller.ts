import { Request, Response } from 'express';
import { QuizModel, ExamAttemptModel } from '../models/quiz.model.js';
import { getAuthenticatedUser } from './auth.controller.js';

export const quizController = {
  async getQuiz(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;
      
      let quiz = await QuizModel.findOne({ subjectId });
      
      // Seed some dummy quizzes if not exist to make it a "real quiz" look for demo
      if (!quiz) {
        if (subjectId === 'sci') {
          quiz = await QuizModel.create({
            subjectId: 'sci',
            title: 'Science Mock Exam',
            durationMinutes: 15,
            questions: [
              {
                questionText: 'What is the powerhouse of the cell?',
                options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
                correctAnswer: 'Mitochondria',
                explanation: 'Mitochondria generate most of the chemical energy needed to power the cell.'
              },
              {
                questionText: 'Which planet is known as the Red Planet?',
                options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 'Mars',
                explanation: 'Mars appears red due to iron oxide (rust) on its surface.'
              },
              {
                questionText: 'What gas do plants absorb from the atmosphere?',
                options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
                correctAnswer: 'Carbon Dioxide',
                explanation: 'Plants use carbon dioxide for photosynthesis.'
              }
            ]
          });
        } else if (subjectId === 'math') {
          quiz = await QuizModel.create({
            subjectId: 'math',
            title: 'Mathematics Mock Exam',
            durationMinutes: 15,
            questions: [
              {
                questionText: 'What is 15% of 200?',
                options: ['15', '20', '30', '35'],
                correctAnswer: '30',
                explanation: '(15/100) * 200 = 30'
              },
              {
                questionText: 'If 3x = 12, what is the value of x?',
                options: ['2', '3', '4', '6'],
                correctAnswer: '4',
                explanation: 'Divide both sides by 3.'
              }
            ]
          });
        } else {
          quiz = await QuizModel.create({
            subjectId,
            title: `${subjectId.toUpperCase()} Mock Exam`,
            durationMinutes: 10,
            questions: [
              {
                questionText: 'Sample Question 1',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option A'
              }
            ]
          });
        }
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
