import { Request, Response } from 'express';
import {
  getTotalCustomers,
  getActiveWorkOrders,
  getScheduledToday,
  getRecentWorkOrders,
  getWorkOrdersByStatus,
  getWorkOrdersByServiceType,
  getTechnicianWorkload
} from '../services/supabase/dashboardService';

/**
 * Get metrics for the dashboard
 */
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    // Execute all queries in parallel for efficiency
    const [
      totalCustomers,
      activeWorkOrders,
      scheduledToday,
      recentWorkOrders,
      workOrdersByStatus,
      workOrdersByServiceType,
      technicianWorkload
    ] = await Promise.all([
      getTotalCustomers(),
      getActiveWorkOrders(),
      getScheduledToday(),
      getRecentWorkOrders(5), // Get 5 most recent work orders
      getWorkOrdersByStatus(),
      getWorkOrdersByServiceType(),
      getTechnicianWorkload()
    ]);

    // Return the metrics
    return res.status(200).json({
      totalCustomers,
      activeWorkOrders,
      scheduledToday,
      recentWorkOrders,
      workOrdersByStatus,
      workOrdersByServiceType,
      technicianWorkload
    });
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return res.status(500).json({ error: 'Failed to get dashboard metrics' });
  }
}; 