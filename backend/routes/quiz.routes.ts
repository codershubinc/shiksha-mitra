import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller.js';

const router = Router();

router.get('/all', quizController.getAllQuizzes);
router.get('/:subjectId', quizController.getQuiz);
router.post('/:subjectId/submit', quizController.submitAttempt);
router.get('/reports/all', quizController.getReports); // /api/quiz/reports/all

export default router;
