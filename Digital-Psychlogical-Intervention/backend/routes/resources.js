// backend/routes/resources.js  — full replacement
import express from 'express';
import { authenticate, enforceCollegeAccess } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';
import {
  getResources,
  getResourceTip,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController.js';

const router = express.Router();

// All routes require authentication + college isolation
router.use(authenticate);
router.use(enforceCollegeAccess);

// Student / counselor routes
router.get('/', getResources);     // supports ?ranked=true&category=X&type=Y
router.get('/tip', getResourceTip);   // personalised AI tip
router.get('/:id', getResourceById);

// Admin and Counselor via shared UI
router.post('/', roleCheck(['admin', 'counselor']), createResource);
router.put('/:id', roleCheck(['admin', 'counselor']), updateResource);
router.delete('/:id', roleCheck(['admin', 'counselor']), deleteResource);

export default router;