import { Request, Response } from 'express';
import { prisma } from '../index';

/**
 * Get all work orders
 * @route GET /api/workorders
 */
export const getAllWorkOrders = async (req: Request, res: Response) => {
  try {
    // Extract query parameters for filtering
    const { status, technicianId, fromDate, toDate, customerId, vehicleId } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (status) {
      filter.status = status as string;
    }
    
    if (technicianId) {
      filter.technicianId = Number(technicianId);
    }
    
    if (customerId) {
      filter.customerId = Number(customerId);
    }
    
    if (vehicleId) {
      filter.vehicleId = Number(vehicleId);
    }
    
    // Date range filtering
    if (fromDate || toDate) {
      filter.scheduledDate = {};
      
      if (fromDate) {
        filter.scheduledDate.gte = new Date(fromDate as string);
      }
      
      if (toDate) {
        filter.scheduledDate.lte = new Date(toDate as string);
      }
    }
    
    // Get work orders with filtering
    const workOrders = await prisma.workOrder.findMany({
      where: filter,
      orderBy: {
        scheduledDate: 'asc'
      },
      include: {
        customer: true,
        vehicle: true,
        technician: true
      }
    });
    
    return res.status(200).json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch work orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a single work order by ID
 * @route GET /api/workorders/:id
 */
export const getWorkOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        vehicle: true,
        technician: true
      }
    });
    
    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    return res.status(200).json(workOrder);
  } catch (error) {
    console.error(`Error fetching work order ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch work order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a new work order
 * @route POST /api/workorders
 */
export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const { 
      customerId, 
      vehicleId, 
      technicianId, 
      serviceType, 
      glassLocation, 
      scheduledDate,
      status,
      price,
      paymentType,
      paymentStatus,
      insuranceClaim,
      insuranceInfo,
      warrantyInfo,
      materialsRequired,
      notes
    } = req.body;
    
    // Validate required fields
    if (!customerId || !serviceType || !glassLocation) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        requiredFields: ['customerId', 'serviceType', 'glassLocation']
      });
    }
    
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: Number(customerId) }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if vehicle exists if provided
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: Number(vehicleId) }
      });
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
    }
    
    // Check if technician exists if provided
    if (technicianId) {
      const technician = await prisma.technician.findUnique({
        where: { id: Number(technicianId) }
      });
      
      if (!technician) {
        return res.status(404).json({ error: 'Technician not found' });
      }
    }
    
    // Create work order
    const workOrder = await prisma.workOrder.create({
      data: {
        customerId: Number(customerId),
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
        technicianId: technicianId ? Number(technicianId) : undefined,
        serviceType,
        glassLocation,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        status: status || 'scheduled',
        price: price ? Number(price) : undefined,
        paymentType,
        paymentStatus,
        insuranceClaim: insuranceClaim || false,
        insuranceInfo,
        warrantyInfo,
        materialsRequired,
        notes
      }
    });
    
    return res.status(201).json(workOrder);
  } catch (error) {
    console.error('Error creating work order:', error);
    return res.status(500).json({ 
      error: 'Failed to create work order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update a work order
 * @route PUT /api/workorders/:id
 */
export const updateWorkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      customerId, 
      vehicleId, 
      technicianId, 
      serviceType, 
      glassLocation, 
      scheduledDate,
      completedDate,
      status,
      price,
      paymentType,
      paymentStatus,
      insuranceClaim,
      insuranceInfo,
      warrantyInfo,
      materialsRequired,
      materialsUsed,
      notes
    } = req.body;
    
    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // Check if customer exists if provided
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: Number(customerId) }
      });
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
    }
    
    // Check if vehicle exists if provided
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: Number(vehicleId) }
      });
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
    }
    
    // Check if technician exists if provided
    if (technicianId) {
      const technician = await prisma.technician.findUnique({
        where: { id: Number(technicianId) }
      });
      
      if (!technician) {
        return res.status(404).json({ error: 'Technician not found' });
      }
    }
    
    // Update work order
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: Number(id) },
      data: {
        customerId: customerId ? Number(customerId) : undefined,
        vehicleId: vehicleId !== undefined ? (vehicleId ? Number(vehicleId) : null) : undefined,
        technicianId: technicianId !== undefined ? (technicianId ? Number(technicianId) : null) : undefined,
        serviceType,
        glassLocation,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : undefined,
        status,
        price: price !== undefined ? Number(price) : undefined,
        paymentType,
        paymentStatus,
        insuranceClaim,
        insuranceInfo,
        warrantyInfo,
        materialsRequired,
        materialsUsed,
        notes
      }
    });
    
    return res.status(200).json(updatedWorkOrder);
  } catch (error) {
    console.error(`Error updating work order ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update work order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a work order
 * @route DELETE /api/workorders/:id
 */
export const deleteWorkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // Delete work order
    await prisma.workOrder.delete({
      where: { id: Number(id) }
    });
    
    return res.status(200).json({ message: 'Work order deleted successfully' });
  } catch (error) {
    console.error(`Error deleting work order ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to delete work order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update work order status
 * @route PUT /api/workorders/:id/status
 */
export const updateWorkOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, completedDate } = req.body;
    
    // Validate status
    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses
      });
    }
    
    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // Update data object
    const updateData: any = { status };
    
    // If status is completed and completedDate is not provided, set it to now
    if (status === 'completed') {
      updateData.completedDate = completedDate ? new Date(completedDate) : new Date();
    }
    
    // Update work order status
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: Number(id) },
      data: updateData
    });
    
    return res.status(200).json(updatedWorkOrder);
  } catch (error) {
    console.error(`Error updating work order status ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update work order status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Assign technician to work order
 * @route PUT /api/workorders/:id/assign
 */
export const assignTechnician = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;
    
    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // If technicianId is null, unassign technician
    if (technicianId === null) {
      const updatedWorkOrder = await prisma.workOrder.update({
        where: { id: Number(id) },
        data: { technicianId: null }
      });
      
      return res.status(200).json(updatedWorkOrder);
    }
    
    // Check if technician exists
    const technician = await prisma.technician.findUnique({
      where: { id: Number(technicianId) }
    });
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Assign technician to work order
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: Number(id) },
      data: { technicianId: Number(technicianId) }
    });
    
    return res.status(200).json(updatedWorkOrder);
  } catch (error) {
    console.error(`Error assigning technician to work order ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to assign technician to work order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Schedule work order
 * @route PUT /api/workorders/:id/schedule
 */
export const scheduleWorkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;
    
    // Validate scheduled date
    if (!scheduledDate) {
      return res.status(400).json({ error: 'Scheduled date is required' });
    }
    
    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // Schedule work order
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id: Number(id) },
      data: { 
        scheduledDate: new Date(scheduledDate),
        status: existingWorkOrder.status === 'cancelled' ? 'scheduled' : existingWorkOrder.status
      }
    });
    
    return res.status(200).json(updatedWorkOrder);
  } catch (error) {
    console.error(`Error scheduling work order ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to schedule work order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 