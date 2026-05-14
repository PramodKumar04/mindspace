import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  createGroupPost,
  getGroupPosts,
  toggleLikePost
} from '../controllers/groupController.js';
import { authenticate, enforceCollegeAccess } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and college isolation
router.use(authenticate);
router.use(enforceCollegeAccess);

// Group management
router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/:id/join', joinGroup);
router.post('/:id/leave', leaveGroup);

// Group posts
router.post('/:groupId/posts', createGroupPost);
router.get('/:groupId/posts', getGroupPosts);
router.post('/posts/:postId/like', toggleLikePost);

export default router;
