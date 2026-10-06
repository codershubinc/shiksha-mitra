import { Router } from 'express';
import { awsController } from '../controllers/aws.controller.js';

const router = Router();

router.get('/status', awsController.getStatus);
router.post('/test', awsController.testConnection);
router.get('/records', awsController.getRecords);
router.post('/save-record', awsController.saveRecord);
router.post('/sync', awsController.syncData);

export default router;
