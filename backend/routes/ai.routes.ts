import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';

const router = Router();

router.post('/teacher-chat', aiController.teacherChat);
router.post('/socratic-hint', aiController.socraticHint);
router.post('/diagnose-loophole', aiController.diagnoseLoophole);
router.post('/evaluate-batch', aiController.evaluateBatch);

export default router;
