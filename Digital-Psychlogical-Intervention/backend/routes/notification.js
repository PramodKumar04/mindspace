import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { enforceCollegeAccess } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(enforceCollegeAccess);

router.get('/', getMyNotifications);
router.put('/:notificationId/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
