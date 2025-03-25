import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all technicians
 * @route GET /api/technicians
 */
export const getAllTechnicians = async (req: Request, res: Response) => {
  try {
    const { data: technicians, error } = await supabase
      .from('Technician')
      .select('*')
      .order('lastName', { ascending: true });

    if (error) throw error;

    res.json(technicians);
  } catch (error: any) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({
      error: 'Failed to fetch technicians',
      details: error.message
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
    const { data: technician, error } = await supabase
      .from('Technician')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Technician not found'
        });
      }
      throw error;
    }

    res.json(technician);
  } catch (error: any) {
    console.error('Error fetching technician:', error);
    res.status(500).json({
      error: 'Failed to fetch technician',
      details: error.message
    });
  }
};

/**
 * Create a new technician
 * @route POST /api/technicians
 */
export const createTechnician = async (req: Request, res: Response) => {
  try {
    const technicianData = req.body;
    const { data: newTechnician, error } = await supabase
      .from('Technician')
      .insert([technicianData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(newTechnician);
  } catch (error: any) {
    console.error('Error creating technician:', error);
    res.status(500).json({
      error: 'Failed to create technician',
      details: error.message
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
    const technicianData = req.body;

    // Check if technician exists
    const { data: existingTechnician, error: checkError } = await supabase
      .from('Technician')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Technician not found'
        });
      }
      throw checkError;
    }

    const { data: updatedTechnician, error } = await supabase
      .from('Technician')
      .update(technicianData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedTechnician);
  } catch (error: any) {
    console.error('Error updating technician:', error);
    res.status(500).json({
      error: 'Failed to update technician',
      details: error.message
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
    const { data: existingTechnician, error: checkError } = await supabase
      .from('Technician')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Technician not found'
        });
      }
      throw checkError;
    }

    const { error } = await supabase
      .from('Technician')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting technician:', error);
    res.status(500).json({
      error: 'Failed to delete technician',
      details: error.message
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

    // Check if technician exists
    const { data: existingTechnician, error: checkError } = await supabase
      .from('Technician')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Technician not found'
        });
      }
      throw checkError;
    }

    const { data: workOrders, error } = await supabase
      .from('WorkOrder')
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*)
      `)
      .eq('technicianId', id)
      .order('scheduledDate', { ascending: true });

    if (error) throw error;

    res.json(workOrders);
  } catch (error: any) {
    console.error('Error fetching technician work orders:', error);
    res.status(500).json({
      error: 'Failed to fetch technician work orders',
      details: error.message
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
    const existingTechnician = await supabase
      .from('Technician')
      .select()
      .eq('id', id)
      .single();
    
    if (existingTechnician.error) {
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
    const schedule = await supabase
      .from('WorkOrder')
      .select(`
        *,
        customer:customerId (*),
        vehicle:vehicleId (*)
      `)
      .eq('technicianId', id)
      .gte('scheduledDate', dateFilter.gte)
      .lte('scheduledDate', dateFilter.lte)
      .not('status', 'in', ['completed', 'cancelled'])
      .order('scheduledDate', { ascending: true });
    
    if (schedule.error) throw schedule.error;
    
    res.json(schedule.data);
  } catch (error: any) {
    console.error('Error fetching technician schedule:', error);
    res.status(500).json({
      error: 'Failed to fetch technician schedule',
      details: error.message
    });
  }
}; 