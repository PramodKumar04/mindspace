import express from 'express';
import {
  getAllUsers,
  updateUserStatus,
  getFlaggedPosts,
  getFlaggedChatSessions,
  getDashboardStats,
  dismissFlaggedPost,
  resolveFlaggedSession
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceCollegeAccess } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require admin authentication and college access
router.use(authenticate);
router.use(enforceCollegeAccess);
router.use(roleCheck(['admin']));

router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.get('/posts/flagged', getFlaggedPosts);
router.put('/posts/:id/dismiss', dismissFlaggedPost);
router.get('/chat/flagged', getFlaggedChatSessions);
router.put('/chat/:id/resolve', resolveFlaggedSession);
router.get('/stats', getDashboardStats);

export default router;
