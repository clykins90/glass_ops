import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboard.controller';

const router = express.Router();

// Get dashboard metrics
router.get('/metrics', getDashboardMetrics);

export default router; 