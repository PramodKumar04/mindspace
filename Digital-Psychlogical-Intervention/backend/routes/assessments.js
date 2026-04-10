import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getResults, saveResult, submitFlow, deleteResult } from '../controllers/assessmentController.js';

const router = express.Router();

router.get('/results',       authenticate, getResults);
router.post('/results',      authenticate, saveResult);
router.post('/submit-flow',  authenticate, submitFlow);
router.delete('/results/:id', authenticate, deleteResult);

export default router;