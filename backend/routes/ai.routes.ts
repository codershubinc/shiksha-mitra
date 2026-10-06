import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';

const router = Router();

router.post('/teacher-chat', aiController.teacherChatStream);
router.post('/socratic-hint', aiController.socraticHint);
router.post('/diagnose-loophole', aiController.diagnoseLoophole);
router.post('/evaluate-batch', aiController.evaluateBatch);

router.get('/tts', aiController.ttsProxy);


router.post('/flashcard-explanation', aiController.generateFlashcardExplanation);
router.post('/generate-targeted-flashcards', aiController.generateTargetedFlashcards);
export default router;

