import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all vehicles
 * @route GET /api/vehicles
 */
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        customer:customerId(id, firstName, lastName)
      `)
      .match({ company_id: (req as any).user.company_id })
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json(vehicles);
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      error: 'Failed to fetch vehicles',
      details: error.message
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
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        customer:customerId(id, firstName, lastName)
      `)
      .match({ id: id, company_id: (req as any).user.company_id })
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Vehicle not found'
        });
      }
      throw error;
    }

    res.json(vehicle);
  } catch (error: any) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      error: 'Failed to fetch vehicle',
      details: error.message
    });
  }
};

/**
 * Create a new vehicle
 * @route POST /api/vehicles
 */
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = req.body;
    const companyId = (req as any).user.company_id;
    
    // Check if customer exists and belongs to the company
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .match({ id: vehicleData.customerId, company_id: companyId })
      .single();

    if (customerError || !customer) {
      console.error('Error checking customer for vehicle creation:', customerError);
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }

    const { data: newVehicle, error } = await supabase
      .from('vehicles')
      .insert([{ ...vehicleData, company_id: companyId }])
      .select(`
        *,
        customer:customerId (*)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(newVehicle);
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      error: 'Failed to create vehicle',
      details: error.message
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
    const vehicleData = req.body;
    const companyId = (req as any).user.company_id;

    // First, check if the vehicle exists and belongs to the company
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('id, company_id')
      .match({ id: id, company_id: companyId })
      .single();

    if (checkError || !existingVehicle) {
      console.error('Error checking vehicle existence for update:', checkError);
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    // Check if customer exists and belongs to the company (if customerId is provided)
    if (vehicleData.customerId) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .match({ id: vehicleData.customerId, company_id: companyId })
        .single();

      if (customerError || !customer) {
        console.error('Error checking customer for vehicle update:', customerError);
        return res.status(404).json({ error: 'Customer not found or access denied' });
      }
    }

    const { data: updatedVehicle, error } = await supabase
      .from('vehicles')
      .update(vehicleData)
      .match({ id: id, company_id: companyId })
      .select(`
        *,
        customer:customerId (*)
      `)
      .single();

    if (error) throw error;

    res.json(updatedVehicle);
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      error: 'Failed to update vehicle',
      details: error.message
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
    const companyId = (req as any).user.company_id;

    // First, check if the vehicle exists and belongs to the company
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('id, company_id')
      .match({ id: id, company_id: companyId })
      .single();

    if (checkError || !existingVehicle) {
      console.error('Error checking vehicle existence for delete:', checkError);
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    // Delete vehicle
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .match({ id: id, company_id: companyId });

    if (error) throw error;

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      error: 'Failed to delete vehicle',
      details: error.message
    });
  }
}; 