import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerWorkOrders,
  getCustomerVehicles
} from '../controllers/customer.controller';

const router = express.Router();

// GET /api/customers - Get all customers
router.get('/', getAllCustomers);

// GET /api/customers/:id - Get a single customer
router.get('/:id', getCustomerById);

// POST /api/customers - Create a new customer
router.post('/', createCustomer);

// PUT /api/customers/:id - Update a customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', deleteCustomer);

// GET /api/customers/:id/workorders - Get all work orders for a customer
router.get('/:id/workorders', getCustomerWorkOrders);

// GET /api/customers/:id/vehicles - Get all vehicles for a customer
router.get('/:id/vehicles', getCustomerVehicles);

export default router; 