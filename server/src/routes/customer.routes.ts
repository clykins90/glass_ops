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
import { requirePermission } from '../middleware/permission';

const router = express.Router();

// GET /api/customers - Get all customers
router.get('/', requirePermission('customers', 'read'), getAllCustomers);

// GET /api/customers/:id - Get a single customer
router.get('/:id', requirePermission('customers', 'read'), getCustomerById);

// POST /api/customers - Create a new customer
router.post('/', requirePermission('customers', 'create'), createCustomer);

// PUT /api/customers/:id - Update a customer
router.put('/:id', requirePermission('customers', 'update'), updateCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', requirePermission('customers', 'delete'), deleteCustomer);

// GET /api/customers/:id/workorders - Get all work orders for a customer
router.get('/:id/workorders', requirePermission('work_orders', 'read'), getCustomerWorkOrders);

// GET /api/customers/:id/vehicles - Get all vehicles for a customer
router.get('/:id/vehicles', requirePermission('vehicles', 'read'), getCustomerVehicles);

export default router; 