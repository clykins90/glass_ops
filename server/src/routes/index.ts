import express from 'express';
import customerRoutes from './customer.routes';
import vehicleRoutes from './vehicle.routes';
import workOrderRoutes from './workOrder.routes';
import technicianRoutes from './technician.routes';
import dashboardRoutes from './dashboard.routes';
import agentRoutes from './agentRoutes';
import scheduleRoutes from './schedule.routes';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Create auth endpoints that bypass authentication middleware
const authRouter = express.Router();
router.use('/auth', authRouter);

// Health check endpoint that doesn't require authentication
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply authentication middleware to all other routes
router.use(authMiddleware);

// Protected API routes
router.use('/customers', customerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/workorders', workOrderRoutes);
router.use('/technicians', technicianRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/agent', agentRoutes);
router.use('/', scheduleRoutes); // Schedule routes have their own path prefixes

export default router; 