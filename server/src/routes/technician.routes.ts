import express from 'express';
import {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getTechnicianWorkOrders,
  getTechnicianSchedule
} from '../controllers/technician.controller';

const router = express.Router();

// GET /api/technicians - Get all technicians
router.get('/', getAllTechnicians);

// GET /api/technicians/:id - Get a single technician
router.get('/:id', getTechnicianById);

// POST /api/technicians - Create a new technician
router.post('/', createTechnician);

// PUT /api/technicians/:id - Update a technician
router.put('/:id', updateTechnician);

// DELETE /api/technicians/:id - Delete a technician
router.delete('/:id', deleteTechnician);

// GET /api/technicians/:id/workorders - Get all work orders for a technician
router.get('/:id/workorders', getTechnicianWorkOrders);

// GET /api/technicians/:id/schedule - Get the schedule for a technician
router.get('/:id/schedule', getTechnicianSchedule);

export default router; 