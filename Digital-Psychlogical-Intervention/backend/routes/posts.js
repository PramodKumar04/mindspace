import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  getMentionCandidates,
  toggleLike,
  reportPost,
  deletePost
} from '../controllers/postController.js';
import {
  createComment,
  deleteComment
} from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceCollegeAccess } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes require authentication and college access
router.use(authenticate);
router.use(enforceCollegeAccess);

// Post routes
router.post('/', roleCheck(['student']), createPost);
router.get('/', getPosts);
router.get('/:id/mention-candidates', getMentionCandidates);
router.get('/:id', getPostById);
router.post('/:id/like', toggleLike);
router.post('/:id/report', reportPost);
router.delete('/:id', roleCheck(['admin']), deletePost);

// Comment routes
router.post('/:postId/comments', createComment);
router.delete('/comments/:id', deleteComment);

export default router;
