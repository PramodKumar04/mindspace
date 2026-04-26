import express from 'express';
import { addToHistory, getUserHistory } from '../controllers/videoController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/add_to_activity', authenticate, addToHistory);
router.get('/get_all_activity', authenticate, getUserHistory);
router.post('/history', authenticate, addToHistory);
router.get('/history', authenticate, getUserHistory);

export default router;
