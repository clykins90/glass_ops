import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * Get all vehicles
 * @route GET /api/vehicles
 */
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: true
      }
    });
    
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a single vehicle by ID
 * @route GET /api/vehicles/:id
 */
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        workOrders: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    return res.status(200).json(vehicle);
  } catch (error) {
    console.error(`Error fetching vehicle ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new vehicle
 * @route POST /api/vehicles
 */
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { 
      customerId, 
      make, 
      model, 
      year, 
      color, 
      vinNumber, 
      licensePlate, 
      glassType, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!customerId || !make || !model || !year) {
      return res.status(400).json({ error: 'Customer ID, make, model, and year are required' });
    }
    
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: Number(customerId) }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const newVehicle = await prisma.vehicle.create({
      data: {
        customerId: Number(customerId),
        make,
        model,
        year: Number(year),
        color,
        vinNumber,
        licensePlate,
        glassType,
        notes
      }
    });
    
    return res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return res.status(500).json({ 
      error: 'Failed to create vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a vehicle
 * @route PUT /api/vehicles/:id
 */
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      customerId, 
      make, 
      model, 
      year, 
      color, 
      vinNumber, 
      licensePlate, 
      glassType, 
      notes 
    } = req.body;
    
    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // If customerId is provided, check if customer exists
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: Number(customerId) }
      });
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
    }
    
    // Update vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: {
        customerId: customerId ? Number(customerId) : undefined,
        make,
        model,
        year: year ? Number(year) : undefined,
        color,
        vinNumber,
        licensePlate,
        glassType,
        notes
      }
    });
    
    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error(`Error updating vehicle ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a vehicle
 * @route DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id: Number(id) }
    });
    
    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error(`Error deleting vehicle ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to delete vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 