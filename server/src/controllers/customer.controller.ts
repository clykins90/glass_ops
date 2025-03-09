import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * Get all customers
 * @route GET /api/customers
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch customers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a single customer by ID
 * @route GET /api/customers/:id
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        vehicles: true,
        workOrders: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    return res.status(200).json(customer);
  } catch (error) {
    console.error(`Error fetching customer ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new customer
 * @route POST /api/customers
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, address, city, state, zipCode, isLead, notes, source } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ error: 'First name, last name, and phone are required' });
    }
    
    const newCustomer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        isLead: isLead !== undefined ? isLead : true,
        notes,
        source
      }
    });
    
    return res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ 
      error: 'Failed to create customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a customer
 * @route PUT /api/customers/:id
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, city, state, zipCode, isLead, notes, source } = req.body;
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        isLead,
        notes,
        source
      }
    });
    
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error(`Error updating customer ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a customer
 * @route DELETE /api/customers/:id
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Delete customer
    await prisma.customer.delete({
      where: { id: Number(id) }
    });
    
    return res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(`Error deleting customer ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to delete customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all work orders for a customer
 * @route GET /api/customers/:id/workorders
 */
export const getCustomerWorkOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get customer work orders
    const workOrders = await prisma.workOrder.findMany({
      where: { customerId: Number(id) },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        vehicle: true,
        technician: true
      }
    });
    
    return res.status(200).json(workOrders);
  } catch (error) {
    console.error(`Error fetching work orders for customer ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch customer work orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all vehicles for a customer
 * @route GET /api/customers/:id/vehicles
 */
export const getCustomerVehicles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get customer vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { customerId: Number(id) },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error(`Error fetching vehicles for customer ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch customer vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 