import express from 'express';
import {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  assignTechnician,
  scheduleWorkOrder
} from '../controllers/workOrder.controller';

const router = express.Router();

// GET /api/workorders - Get all work orders
router.get('/', getAllWorkOrders);

// GET /api/workorders/:id - Get a single work order
router.get('/:id', getWorkOrderById);

// POST /api/workorders - Create a new work order
router.post('/', createWorkOrder);

// PUT /api/workorders/:id - Update a work order
router.put('/:id', updateWorkOrder);

// DELETE /api/workorders/:id - Delete a work order
router.delete('/:id', deleteWorkOrder);

// PUT /api/workorders/:id/status - Update a work order status
router.put('/:id/status', updateWorkOrderStatus);

// PUT /api/workorders/:id/assign - Assign a technician to a work order
router.put('/:id/assign', assignTechnician);

// PUT /api/workorders/:id/schedule - Schedule a work order
router.put('/:id/schedule', scheduleWorkOrder);

export default router; 