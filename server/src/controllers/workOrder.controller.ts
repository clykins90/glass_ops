import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all work orders
 * @route GET /api/workorders
 */
export const getAllWorkOrders = async (req: Request, res: Response) => {
  try {
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customerId(id, firstName, lastName),
        vehicle:vehicleId(id, make, model, year), 
        technician:technicianId(id, firstName, lastName)
      `)
      .match({ company_id: (req as any).user.company_id })
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Transform the response to match client expectations
    const transformedWorkOrders = workOrders.map(order => {
      // Map assigned_technician_id to technicianId for the client
      const { technicianId, ...rest } = order;
      return {
        ...rest,
        technicianId: technicianId,
        // Reshape technician data if present
        technician: order.technician ? {
          id: order.technician.id,
          firstName: order.technician.firstName || '',
          lastName: order.technician.lastName || '',
        } : undefined
      };
    });

    res.json(transformedWorkOrders);
  } catch (error: any) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({
      error: 'Failed to fetch work orders',
      details: error.message
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
    
    // Get work order with customer, vehicle, and technician details
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customerId(*),
        vehicle:vehicleId(*),
        technician:technicianId(id, firstName, lastName)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    // Map technicianId for client consistency
    const { technicianId, ...rest } = workOrder;
    
    return res.status(200).json({
      ...rest,
      technicianId: technicianId,
      // If there's a technician, include their details
      technician: workOrder.technician ? {
        id: workOrder.technician.id,
        firstName: workOrder.technician.firstName || '',
        lastName: workOrder.technician.lastName || '',
      } : undefined
    });
  } catch (error) {
    console.error('Error retrieving work order:', error);
    return res.status(500).json({ message: 'Failed to retrieve work order' });
  }
};

/**
 * Create a new work order
 * @route POST /api/workorders
 */
export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const workOrderData = req.body;
    const companyId = (req as any).user.company_id;
    
    // Map technicianId for database compatibility
    const technicianId = workOrderData.technicianId;
    
    // Validate technician exists and belongs to company if provided
    if (technicianId) {
      const { data: technicianCheck, error: technicianError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', technicianId)
        .eq('company_id', companyId)
        .single();
      
      if (technicianError || !technicianCheck) {
        return res.status(400).json({ message: 'Invalid technician ID' });
      }
    }
    
    // Remove technicianId and add technicianId with proper field name
    const { technicianId: _, ...workOrderDataWithoutTechnicianId } = workOrderData;
    
    const { data, error } = await supabase
      .from('work_orders')
      .insert([
        { 
          ...workOrderDataWithoutTechnicianId,
          technicianId,
          company_id: companyId 
        }
      ])
      .select(`
        *,
        customer:customerId(*),
        vehicle:vehicleId(*),
        technician:technicianId(id, firstName, lastName)
      `)
      .single();
    
    if (error) throw error;
    
    const { technicianId: tech_id, ...rest } = data;
    
    return res.status(201).json({
      ...rest,
      technicianId: tech_id,
      // If there's a technician, include their details
      technician: data.technician ? {
        id: data.technician.id,
        firstName: data.technician.firstName || '',
        lastName: data.technician.lastName || '',
      } : undefined
    });
  } catch (error) {
    console.error('Error creating work order:', error);
    return res.status(500).json({ message: 'Failed to create work order' });
  }
};

/**
 * Update a work order
 * @route PUT /api/workorders/:id
 */
export const updateWorkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workOrderData = req.body;

    // Check if work order exists and belongs to the company
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('work_orders')
      .select('id, company_id')
      .match({ id: id, company_id: (req as any).user.company_id })
      .single();

    if (checkError || !existingWorkOrder) {
      console.error('Error checking work order existence for update:', checkError);
      return res.status(404).json({ error: 'Work order not found or access denied' });
    }

    // Check related entities (customer, vehicle, technician) - apply company filter
    if (workOrderData.customerId) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .match({ id: workOrderData.customerId, company_id: (req as any).user.company_id })
        .single();

      if (customerError || !customer) {
        console.error('Error checking customer for work order update:', customerError);
        return res.status(404).json({ error: 'Customer not found or access denied' });
      }
    }

    if (workOrderData.vehicleId !== undefined) {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .match({ id: workOrderData.vehicleId, company_id: (req as any).user.company_id })
        .single();

      if (vehicleError && workOrderData.vehicleId !== null) {
        console.error('Error checking vehicle for work order update:', vehicleError);
        return res.status(404).json({ error: 'Vehicle not found or access denied' });
      }
    }

    // Map technicianId to assigned_technician_id for database compatibility
    const assigned_technician_id = workOrderData.technicianId;
    
    // Check technician exists if provided
    if (assigned_technician_id) {
      const { data: technicianProfile, error: techError } = await supabase
        .from('profiles')
        .select('id')
        .match({
          id: assigned_technician_id,
          role: 'technician',
          company_id: (req as any).user.company_id
        })
        .single();

      if (techError || !technicianProfile) {
        console.error('Error checking technician for work order update:', techError);
        return res.status(404).json({ error: 'Technician profile not found or invalid role/company' });
      }
    }

    // Prepare data for update, convert empty string dates to null
    // Remove technicianId and add assigned_technician_id
    const { technicianId, ...restData } = workOrderData;
    const dataToUpdate = { 
      ...restData,
      assigned_technician_id
    };
    
    if (dataToUpdate.scheduledDate === '') {
      dataToUpdate.scheduledDate = null;
    }
    if (dataToUpdate.completedDate === '') {
      dataToUpdate.completedDate = null;
    }

    // Update work order
    const { data: updatedWorkOrder, error } = await supabase
      .from('work_orders')
      .update(dataToUpdate)
      .match({ id: id, company_id: (req as any).user.company_id })
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:assigned_technician_id (*)
      `)
      .single();

    if (error) throw error;

    // Transform the response to match client expectations
    const { assigned_technician_id: tech_id, ...rest } = updatedWorkOrder;
    const transformedWorkOrder = {
      ...rest,
      technicianId: tech_id,
      // Reshape technician data if present
      technician: updatedWorkOrder.technician ? {
        id: updatedWorkOrder.technician.id,
        firstName: updatedWorkOrder.technician.full_name?.split(' ')[0] || '',
        lastName: updatedWorkOrder.technician.full_name?.split(' ')[1] || '',
      } : undefined
    };

    res.json(transformedWorkOrder);
  } catch (error: any) {
    console.error('Error updating work order:', error);
    res.status(500).json({
      error: 'Failed to update work order',
      details: error.message
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

    // Check if work order exists and belongs to the company
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('work_orders')
      .select('id, company_id')
      .match({ id: id, company_id: (req as any).user.company_id })
      .single();

    if (checkError || !existingWorkOrder) {
      console.error('Error checking work order existence for delete:', checkError);
      return res.status(404).json({ error: 'Work order not found or access denied' });
    }

    const { error } = await supabase
      .from('work_orders')
      .delete()
      .match({ id: id, company_id: (req as any).user.company_id });

    if (error) throw error;

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting work order:', error);
    res.status(500).json({
      error: 'Failed to delete work order',
      details: error.message
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
    
    // Check if work order exists and belongs to the company
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('work_orders')
      .select('id, company_id')
      .match({ id: id, company_id: (req as any).user.company_id })
      .single();
    
    if (checkError || !existingWorkOrder) {
      console.error('Error checking work order existence for status update:', checkError);
      return res.status(404).json({ error: 'Work order not found or access denied' });
    }
    
    // Update data object
    const updateData: any = { status };
    
    // If status is completed and completedDate is not provided, set it to now
    if (status === 'completed') {
      updateData.completedDate = completedDate ? new Date(completedDate) : new Date();
    }
    
    // Update work order status
    const { data: updatedWorkOrder, error } = await supabase
      .from('work_orders')
      .update(updateData)
      .match({ id: id, company_id: (req as any).user.company_id })
      .select(`
        *,
        customer:"customerId"(id, full_name),
        vehicle:"vehicleId"(id, make, model, year),
        technician:assigned_technician_id(id, full_name)
      `)
      .single();
    
    if (error) throw error;
    
    res.status(200).json(updatedWorkOrder);
  } catch (error: any) {
    console.error(`Error updating work order status ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Failed to update work order status',
      details: error.message
    });
  }
};

/**
 * Assigns or unassigns a technician to a work order.
 */
export const assignTechnician = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { technicianId } = req.body; // Keep request body param name simple

  try {
    // 1. Check if work order exists and belongs to the company
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('work_orders')
      .select('id, company_id')
      .match({ id: id, company_id: (req as any).user.company_id })
      .single();

    if (checkError || !existingWorkOrder) {
      console.error('Error checking work order existence for technician assignment:', checkError);
      return res.status(404).json({ error: 'Work order not found or access denied' });
    }

    // 2. Determine the value for assigned_technician_id
    // Use assigned_technician_id consistently, default to null if technicianId is null or undefined
    const assignedTechnicianId = technicianId === null || technicianId === undefined ? null : technicianId;

    // 3. If assigning (not null), validate the technician profile
    if (assignedTechnicianId !== null) {
      const { data: technicianProfile, error: techError } = await supabase
        .from('profiles')
        .select('id')
        .match({
          id: assignedTechnicianId,
          role: 'technician',
          company_id: (req as any).user.company_id
        })
        .single();

      if (techError || !technicianProfile) {
        return res.status(404).json({ error: 'Technician profile not found or invalid role/company' });
      }
    }

    // 4. Update the work order with the new assigned_technician_id
    const { data: updatedWorkOrder, error: updateError } = await supabase
      .from('work_orders')
      .update({ assigned_technician_id: assignedTechnicianId })
      .match({ id: id, company_id: (req as any).user.company_id })
      .select(`
        *,
        customer:"customerId"(id, full_name),
        vehicle:"vehicleId"(id, make, model, year),
        technician:assigned_technician_id(id, full_name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating work order technician assignment:', updateError);
      throw updateError; // Throw error to be caught by the catch block
    }

    res.status(200).json(updatedWorkOrder);

  } catch (error: any) {
    console.error(`Error assigning technician to work order ${id}:`, error);
    res.status(500).json({ 
      error: 'Failed to assign technician to work order',
      details: error.message
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
    
    // Check if work order exists and belongs to the company
    const { data: existingWorkOrder, error: getError } = await supabase
      .from('work_orders')
      .select('id, status, company_id')
      .match({ id: id, company_id: (req as any).user.company_id })
      .single();
    
    if (getError || !existingWorkOrder) {
      console.error('Error checking work order existence for scheduling:', getError);
      return res.status(404).json({ error: 'Work order not found or access denied' });
    }
    
    // Schedule work order
    const { data: updatedWorkOrder, error } = await supabase
      .from('work_orders')
      .update({ 
        scheduledDate: new Date(scheduledDate),
        status: existingWorkOrder.status === 'cancelled' ? 'scheduled' : existingWorkOrder.status
      })
      .match({ id: id, company_id: (req as any).user.company_id })
      .select(`
        *,
        customer:"customerId"(id, full_name),
        vehicle:"vehicleId"(id, make, model, year),
        technician:assigned_technician_id(id, full_name)
      `)
      .single();
    
    if (error) throw error;
    
    res.status(200).json(updatedWorkOrder);
  } catch (error: any) {
    console.error(`Error scheduling work order ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Failed to schedule work order',
      details: error.message
    });
  }
}; 