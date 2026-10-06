import { Router } from 'express';
import authRoutes from './auth.routes.js';
import aiRoutes from './ai.routes.js';
import awsRoutes from './aws.routes.js';
import quizRoutes from './quiz.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/aws', awsRoutes);
router.use('/quiz', quizRoutes);

export default router;
