import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all technicians
 * @route GET /api/technicians
 */
export const getAllTechnicians = async (req: Request, res: Response) => {
  try {
    const { data: technicians, error } = await supabase
      .from('profiles')
      .select('*')
      .match({ role: 'Technician', company_id: (req as any).user.company_id })
      .order('full_name', { ascending: true });

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
 * Get a single technician (profile) by ID
 * @route GET /api/technicians/:id
 */
export const getTechnicianById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: technician, error } = await supabase
      .from('profiles')
      .select('*')
      .match({ id: id, role: 'Technician', company_id: (req as any).user.company_id })
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Technician profile not found or not accessible'
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
 * Create a new technician (profile)
 * NOTE: This is a temporary implementation. Ideally, this should use Supabase Auth
 * to create a user, which triggers profile creation.
 * @route POST /api/technicians
 */
export const createTechnician = async (req: Request, res: Response) => {
  try {
    // Assuming technicianData includes firstName, lastName, email, phone, etc.
    const technicianData = { 
      ...req.body, 
      role: 'Technician', // Set role explicitly
      company_id: (req as any).user.company_id // Set company_id from requesting user
    };
    
    // We might need to generate a UUID or handle the ID differently if it's 
    // meant to link to auth.users eventually. For now, assume it's auto-generated or handled.
    // Remove potentially conflicting fields like 'id' if present in req.body
    delete technicianData.id; 

    const { data: newTechnicianProfile, error } = await supabase
      .from('profiles')
      .insert([technicianData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Handle potential specific errors like duplicate email if needed
      throw error;
    }

    res.status(201).json(newTechnicianProfile);
  } catch (error: any) {
    console.error('Error creating technician profile:', error);
    res.status(500).json({
      error: 'Failed to create technician profile',
      details: error.message
    });
  }
};

/**
 * Update a technician (profile)
 * @route PUT /api/technicians/:id
 */
export const updateTechnician = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const technicianData = req.body;

    // Cannot change role or company_id via this endpoint
    delete technicianData.role;
    delete technicianData.company_id;
    delete technicianData.id; // Don't allow updating the ID itself

    // Check if technician profile exists
    const { data: existingTechnician, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .match({ id: id, role: 'Technician', company_id: (req as any).user.company_id })
      .single();

    if (checkError || !existingTechnician) {
      console.error('Error checking technician profile for update:', checkError);
      return res.status(404).json({
        error: 'Technician profile not found or not accessible for update'
      });
    }

    // Perform the update
    const { data: updatedTechnician, error } = await supabase
      .from('profiles')
      .update(technicianData)
      .match({ id: id, role: 'Technician', company_id: (req as any).user.company_id })
      .select()
      .single();

    if (error) throw error;

    res.json(updatedTechnician);
  } catch (error: any) {
    console.error('Error updating technician profile:', error);
    res.status(500).json({
      error: 'Failed to update technician profile',
      details: error.message
    });
  }
};

/**
 * Delete a technician (profile)
 * NOTE: This is temporary. Ideally, uses Supabase Auth admin.deleteUser,
 * which might cascade or require manual profile deletion.
 * @route DELETE /api/technicians/:id
 */
export const deleteTechnician = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if technician profile exists
    const { data: existingTechnician, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .match({ id: id, role: 'Technician', company_id: (req as any).user.company_id })
      .single();

    if (checkError || !existingTechnician) {
      console.error('Error checking technician profile for delete:', checkError);
      return res.status(404).json({
        error: 'Technician profile not found or not accessible for deletion'
      });
    }
    
    // TODO: Handle unassigning technician from work orders before deletion?
    // This depends on FK constraints (e.g., ON DELETE SET NULL)
    /*
    await supabase
      .from('work_orders')
      .update({ assigned_technician_id: null })
      .eq('assigned_technician_id', id);
    */

    // Perform the delete
    const { error } = await supabase
      .from('profiles')
      .delete()
      .match({ id: id, role: 'Technician', company_id: (req as any).user.company_id });

    if (error) throw error;

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting technician profile:', error);
    res.status(500).json({
      error: 'Failed to delete technician profile',
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

    // Check if technician profile exists
    const { data: existingTechnician, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .match({ id: id, role: 'Technician', company_id: (req as any).user.company_id })
      .single();

    if (checkError || !existingTechnician) {
      return res.status(404).json({
        error: 'Technician profile not found or not accessible'
      });
    }

    // Fetch work orders assigned to this technician
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers(id, firstName, lastName),
        vehicles(id, make, model, year)
      `)
      .match({ assigned_technician_id: id, company_id: (req as any).user.company_id })
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
 * Get the schedule (upcoming, non-completed work orders) for a technician
 * @route GET /api/technicians/:id/schedule
 */
export const getTechnicianSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fromDate, toDate } = req.query;
    
    // Check if technician profile exists
    const { data: existingTechnician, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .match({ id: id, role: 'Technician', company_id: (req as any).user.company_id })
      .single();
    
    if (checkError || !existingTechnician) {
      return res.status(404).json({ error: 'Technician profile not found or not accessible' });
    }
    
    // Build date filter logic (remains the same)
    const dateFilter: any = {};
    let gteDate: Date;
    let lteDate: Date;

    if (fromDate) {
      gteDate = new Date(fromDate as string);
    } else {
      // Default to today if no fromDate provided
      gteDate = new Date();
      gteDate.setHours(0, 0, 0, 0);
    }
    
    if (toDate) {
      lteDate = new Date(toDate as string);
    } else {
      // Default to 7 days from gteDate if no toDate provided
      lteDate = new Date(gteDate);
      lteDate.setDate(lteDate.getDate() + 7);
    }
    
    // Get technician schedule from work_orders
    const { data: schedule, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers(id, firstName, lastName),
        vehicles(id, make, model, year)
      `)
      .match({ assigned_technician_id: id, company_id: (req as any).user.company_id })
      .gte('scheduledDate', gteDate.toISOString())
      .lte('scheduledDate', lteDate.toISOString())
      .not('status', 'in', ['completed', 'cancelled'])
      .order('scheduledDate', { ascending: true });
    
    if (error) throw error;
    
    res.json(schedule);
  } catch (error: any) {
    console.error('Error fetching technician schedule:', error);
    res.status(500).json({
      error: 'Failed to fetch technician schedule',
      details: error.message
    });
  }
}; 