import express from 'express';
import {
  getDashboardMetrics,
  getRecentWorkOrdersController,
  getTechnicianStatsController
} from '../controllers/dashboard.controller';

const router = express.Router();

// Get dashboard metrics
router.get('/metrics', getDashboardMetrics);

// Get recent work orders
router.get('/recent-work-orders', getRecentWorkOrdersController);

// Get technician stats
router.get('/technician-stats', getTechnicianStatsController);

export default router; 