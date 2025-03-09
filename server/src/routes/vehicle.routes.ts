import express from 'express';

const router = express.Router();

// GET /api/vehicles - Get all vehicles
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Fetch all vehicles - Endpoint not implemented yet' });
});

// GET /api/vehicles/:id - Get a single vehicle
router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Fetch vehicle ${req.params.id} - Endpoint not implemented yet` });
});

// POST /api/vehicles - Create a new vehicle
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create vehicle - Endpoint not implemented yet' });
});

// PUT /api/vehicles/:id - Update a vehicle
router.put('/:id', (req, res) => {
  res.status(200).json({ message: `Update vehicle ${req.params.id} - Endpoint not implemented yet` });
});

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `Delete vehicle ${req.params.id} - Endpoint not implemented yet` });
});

// GET /api/vehicles/:id/workorders - Get all work orders for a vehicle
router.get('/:id/workorders', (req, res) => {
  res.status(200).json({ message: `Fetch work orders for vehicle ${req.params.id} - Endpoint not implemented yet` });
});

export default router; 