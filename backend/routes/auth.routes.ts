import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.get('/students', authController.getStudents);
router.post('/link-student', authController.linkStudent);

export default router;
