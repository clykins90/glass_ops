import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicle.controller';

const router = express.Router();

// GET /api/vehicles - Get all vehicles
router.get('/', getAllVehicles);

// GET /api/vehicles/:id - Get a single vehicle
router.get('/:id', getVehicleById);

// POST /api/vehicles - Create a new vehicle
router.post('/', createVehicle);

// PUT /api/vehicles/:id - Update a vehicle
router.put('/:id', updateVehicle);

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', deleteVehicle);

// GET /api/vehicles/:id/workorders - Get all work orders for a vehicle
router.get('/:id/workorders', (req, res) => {
  res.status(200).json({ message: `Fetch work orders for vehicle ${req.params.id} - Endpoint not implemented yet` });
});

export default router; 