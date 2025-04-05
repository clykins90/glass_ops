import express from 'express';
import { 
  startConversation, 
  getConversationById, 
  sendMessage,
  createWorkOrder
} from '../controllers/agentController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Agent routes
router.post('/conversations', startConversation);
router.get('/conversations/:id', getConversationById);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/workorders', createWorkOrder);

export default router; 