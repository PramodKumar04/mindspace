import express from 'express';
import { createCollege, getAllColleges, getCollegeById } from '../controllers/collegeController.js';
import { authenticate } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// Public routes
router.get('/', getAllColleges);
router.get('/:id', getCollegeById);

// Admin only routes
router.post('/', authenticate, roleCheck(['admin']), createCollege);

export default router;
