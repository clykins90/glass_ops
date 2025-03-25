import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all work orders
 * @route GET /api/workorders
 */
export const getAllWorkOrders = async (req: Request, res: Response) => {
  try {
    const { data: workOrders, error } = await supabase
      .from('WorkOrder')
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:technicianId (*)
      `)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json(workOrders);
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
    const { data: workOrder, error } = await supabase
      .from('WorkOrder')
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:technicianId (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Work order not found'
        });
      }
      throw error;
    }

    res.json(workOrder);
  } catch (error: any) {
    console.error('Error fetching work order:', error);
    res.status(500).json({
      error: 'Failed to fetch work order',
      details: error.message
    });
  }
};

/**
 * Create a new work order
 * @route POST /api/workorders
 */
export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const workOrderData = req.body;

    // Check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from('Customer')
      .select()
      .eq('id', workOrderData.customerId)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      throw customerError;
    }

    // Check if vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('Vehicle')
      .select()
      .eq('id', workOrderData.vehicleId)
      .single();

    if (vehicleError) {
      if (vehicleError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Vehicle not found'
        });
      }
      throw vehicleError;
    }

    // Check if technician exists
    const { data: technician, error: technicianError } = await supabase
      .from('Technician')
      .select()
      .eq('id', workOrderData.technicianId)
      .single();

    if (technicianError) {
      if (technicianError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Technician not found'
        });
      }
      throw technicianError;
    }

    const { data: newWorkOrder, error } = await supabase
      .from('WorkOrder')
      .insert([workOrderData])
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:technicianId (*)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(newWorkOrder);
  } catch (error: any) {
    console.error('Error creating work order:', error);
    res.status(500).json({
      error: 'Failed to create work order',
      details: error.message
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
    const workOrderData = req.body;

    // Check if work order exists
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('WorkOrder')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Work order not found'
        });
      }
      throw checkError;
    }

    // If customerId is being updated, check if new customer exists
    if (workOrderData.customerId) {
      const { data: customer, error: customerError } = await supabase
        .from('Customer')
        .select()
        .eq('id', workOrderData.customerId)
        .single();

      if (customerError) {
        if (customerError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Customer not found'
          });
        }
        throw customerError;
      }
    }

    // If vehicleId is being updated, check if new vehicle exists
    if (workOrderData.vehicleId) {
      const { data: vehicle, error: vehicleError } = await supabase
        .from('Vehicle')
        .select()
        .eq('id', workOrderData.vehicleId)
        .single();

      if (vehicleError) {
        if (vehicleError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Vehicle not found'
          });
        }
        throw vehicleError;
      }
    }

    // If technicianId is being updated, check if new technician exists
    if (workOrderData.technicianId) {
      const { data: technician, error: technicianError } = await supabase
        .from('Technician')
        .select()
        .eq('id', workOrderData.technicianId)
        .single();

      if (technicianError) {
        if (technicianError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Technician not found'
          });
        }
        throw technicianError;
      }
    }

    const { data: updatedWorkOrder, error } = await supabase
      .from('WorkOrder')
      .update(workOrderData)
      .eq('id', id)
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:technicianId (*)
      `)
      .single();

    if (error) throw error;

    res.json(updatedWorkOrder);
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

    // Check if work order exists
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('WorkOrder')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Work order not found'
        });
      }
      throw checkError;
    }

    const { error } = await supabase
      .from('WorkOrder')
      .delete()
      .eq('id', id);

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
    
    // Check if work order exists
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('WorkOrder')
      .select()
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Work order not found'
        });
      }
      throw checkError;
    }
    
    if (!existingWorkOrder) {
      return res.status(404).json({
        error: 'Work order not found'
      });
    }
    
    // Update data object
    const updateData: any = { status };
    
    // If status is completed and completedDate is not provided, set it to now
    if (status === 'completed') {
      updateData.completedDate = completedDate ? new Date(completedDate) : new Date();
    }
    
    // Update work order status
    const { data: updatedWorkOrder, error } = await supabase
      .from('WorkOrder')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:technicianId (*)
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
 * Assign technician to work order
 * @route PUT /api/workorders/:id/assign
 */
export const assignTechnician = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;
    
    // Check if work order exists
    const { data: existingWorkOrder, error: checkError } = await supabase
      .from('WorkOrder')
      .select()
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Work order not found'
        });
      }
      throw checkError;
    }
    
    if (!existingWorkOrder) {
      return res.status(404).json({
        error: 'Work order not found'
      });
    }
    
    // If technicianId is null, unassign technician
    if (technicianId === null) {
      const { data: updatedWorkOrder, error } = await supabase
        .from('WorkOrder')
        .update({ technicianId: null })
        .eq('id', id)
        .select(`
          *,
          customer:customerId (*),
          vehicle:vehicleId (*),
          technician:technicianId (*)
        `)
        .single();
      
      if (error) throw error;
      
      return res.status(200).json(updatedWorkOrder);
    }
    
    // Check if technician exists
    const { data: technician, error: technicianError } = await supabase
      .from('Technician')
      .select()
      .eq('id', technicianId)
      .single();
    
    if (technicianError) {
      if (technicianError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Technician not found' });
      }
      throw technicianError;
    }
    
    // Assign technician to work order
    const { data: updatedWorkOrder, error } = await supabase
      .from('WorkOrder')
      .update({ technicianId: Number(technicianId) })
      .eq('id', id)
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:technicianId (*)
      `)
      .single();
    
    if (error) throw error;
    
    res.status(200).json(updatedWorkOrder);
  } catch (error: any) {
    console.error(`Error assigning technician to work order ${req.params.id}:`, error);
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
    
    // Check if work order exists
    const { data: existingWorkOrder, error: getError } = await supabase
      .from('WorkOrder')
      .select()
      .eq('id', id)
      .single();
    
    if (getError || !existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // Schedule work order
    const { data: updatedWorkOrder, error } = await supabase
      .from('WorkOrder')
      .update({ 
        scheduledDate: new Date(scheduledDate),
        status: existingWorkOrder.status === 'cancelled' ? 'scheduled' : existingWorkOrder.status
      })
      .eq('id', id)
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*),
        technician:technicianId (*)
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