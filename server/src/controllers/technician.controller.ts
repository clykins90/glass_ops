import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * Get all technicians
 * @route GET /api/technicians
 */
export const getAllTechnicians = async (req: Request, res: Response) => {
  try {
    // Extract query parameters for filtering
    const { active } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (active !== undefined) {
      filter.active = active === 'true';
    }
    
    // Get technicians with filtering
    const technicians = await prisma.technician.findMany({
      where: filter,
      orderBy: {
        lastName: 'asc'
      }
    });
    
    return res.status(200).json(technicians);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch technicians',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a single technician by ID
 * @route GET /api/technicians/:id
 */
export const getTechnicianById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const technician = await prisma.technician.findUnique({
      where: { id: Number(id) }
    });
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    return res.status(200).json(technician);
  } catch (error) {
    console.error(`Error fetching technician ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch technician',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new technician
 * @route POST /api/technicians
 */
export const createTechnician = async (req: Request, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      skills,
      notes,
      active
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        requiredFields: ['firstName', 'lastName', 'phone']
      });
    }
    
    // Create technician
    const technician = await prisma.technician.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        skills: skills || [],
        notes,
        active: active !== undefined ? active : true
      }
    });
    
    return res.status(201).json(technician);
  } catch (error) {
    console.error('Error creating technician:', error);
    return res.status(500).json({ 
      error: 'Failed to create technician',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a technician
 * @route PUT /api/technicians/:id
 */
export const updateTechnician = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      skills,
      notes,
      active
    } = req.body;
    
    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingTechnician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Update technician
    const updatedTechnician = await prisma.technician.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        email,
        phone,
        skills,
        notes,
        active
      }
    });
    
    return res.status(200).json(updatedTechnician);
  } catch (error) {
    console.error(`Error updating technician ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update technician',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a technician
 * @route DELETE /api/technicians/:id
 */
export const deleteTechnician = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingTechnician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Check if technician has assigned work orders
    const assignedWorkOrders = await prisma.workOrder.findMany({
      where: { 
        technicianId: Number(id),
        status: { notIn: ['completed', 'cancelled'] }
      }
    });
    
    if (assignedWorkOrders.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete technician with assigned work orders',
        assignedWorkOrders: assignedWorkOrders.length
      });
    }
    
    // Delete technician
    await prisma.technician.delete({
      where: { id: Number(id) }
    });
    
    return res.status(200).json({ message: 'Technician deleted successfully' });
  } catch (error) {
    console.error(`Error deleting technician ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to delete technician',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all work orders for a technician
 * @route GET /api/technicians/:id/workorders
 */
export const getTechnicianWorkOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingTechnician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Build filter
    const filter: any = {
      technicianId: Number(id)
    };
    
    if (status) {
      filter.status = status as string;
    }
    
    // Get technician work orders
    const workOrders = await prisma.workOrder.findMany({
      where: filter,
      orderBy: {
        scheduledDate: 'asc'
      },
      include: {
        customer: true,
        vehicle: true
      }
    });
    
    return res.status(200).json(workOrders);
  } catch (error) {
    console.error(`Error fetching work orders for technician ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch technician work orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get the schedule for a technician
 * @route GET /api/technicians/:id/schedule
 */
export const getTechnicianSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fromDate, toDate } = req.query;
    
    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingTechnician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Build date filter
    const dateFilter: any = {};
    
    if (fromDate) {
      dateFilter.gte = new Date(fromDate as string);
    } else {
      // Default to today if no fromDate provided
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter.gte = today;
    }
    
    if (toDate) {
      dateFilter.lte = new Date(toDate as string);
    } else if (fromDate) {
      // Default to 7 days from fromDate if no toDate provided
      const endDate = new Date(fromDate as string);
      endDate.setDate(endDate.getDate() + 7);
      dateFilter.lte = endDate;
    } else {
      // Default to 7 days from today if no dates provided
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      dateFilter.lte = endDate;
    }
    
    // Get technician schedule
    const schedule = await prisma.workOrder.findMany({
      where: {
        technicianId: Number(id),
        scheduledDate: dateFilter,
        status: { notIn: ['completed', 'cancelled'] }
      },
      orderBy: {
        scheduledDate: 'asc'
      },
      include: {
        customer: true,
        vehicle: true
      }
    });
    
    return res.status(200).json(schedule);
  } catch (error) {
    console.error(`Error fetching schedule for technician ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch technician schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 