import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all vehicles
 * @route GET /api/vehicles
 */
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const { data: vehicles, error } = await supabase
      .from('Vehicle')
      .select(`
        *,
        customer:customerId (*)
      `)
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
      .from('Vehicle')
      .select(`
        *,
        customer:customerId (*),
        workOrders (*)
      `)
      .eq('id', id)
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
    
    // Check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from('Customer')
      .select()
      .eq('id', vehicleData.customerId)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      throw customerError;
    }

    const { data: newVehicle, error } = await supabase
      .from('Vehicle')
      .insert([vehicleData])
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

    // Check if vehicle exists
    const { data: existingVehicle, error: checkError } = await supabase
      .from('Vehicle')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Vehicle not found'
        });
      }
      throw checkError;
    }

    // If customerId is being updated, check if new customer exists
    if (vehicleData.customerId) {
      const { data: customer, error: customerError } = await supabase
        .from('Customer')
        .select()
        .eq('id', vehicleData.customerId)
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

    const { data: updatedVehicle, error } = await supabase
      .from('Vehicle')
      .update(vehicleData)
      .eq('id', id)
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

    // Check if vehicle exists
    const { data: existingVehicle, error: checkError } = await supabase
      .from('Vehicle')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Vehicle not found'
        });
      }
      throw checkError;
    }

    const { error } = await supabase
      .from('Vehicle')
      .delete()
      .eq('id', id);

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