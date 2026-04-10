import express from 'express';
import { body } from 'express-validator';
import {
  getOrCreateSession,
  sendMessage,
  closeSession,
  getChatHistory
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceCollegeAccess } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import { chatRateLimiter } from '../middleware/security.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication and college access
router.use(authenticate);
router.use(enforceCollegeAccess);

// Student only routes
router.get('/session', roleCheck(['student']), getOrCreateSession);
router.post('/message',
  roleCheck(['student']),
  chatRateLimiter,
  [
    body('content').notEmpty().trim().isLength({ min: 1, max: 2000 })
  ],
  validate,
  sendMessage
);
router.post('/session/:sessionId/close', roleCheck(['student']), closeSession);
router.get('/history', roleCheck(['student']), getChatHistory);

export default router;
