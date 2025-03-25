import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all customers
 * @route GET /api/customers
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { data: customers, error } = await supabase
      .from('Customer')
      .select('*')
      .order('lastName', { ascending: true });

    if (error) throw error;

    res.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      error: 'Failed to fetch customers',
      details: error.message
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
    const { data: customer, error } = await supabase
      .from('Customer')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      throw error;
    }

    res.json(customer);
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      error: 'Failed to fetch customer',
      details: error.message
    });
  }
};

/**
 * Create a new customer
 * @route POST /api/customers
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    const { data: newCustomer, error } = await supabase
      .from('Customer')
      .insert([customerData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(newCustomer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      error: 'Failed to create customer',
      details: error.message
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
    const customerData = req.body;

    // Check if customer exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from('Customer')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      throw checkError;
    }

    const { data: updatedCustomer, error } = await supabase
      .from('Customer')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedCustomer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      error: 'Failed to update customer',
      details: error.message
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
    console.log(`Attempting to delete customer with ID: ${id}`);

    // Check if customer exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from('Customer')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      console.error(`Customer check error for ID ${id}:`, checkError);
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      throw checkError;
    }

    // Check for related vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('Vehicle')
      .select('id')
      .eq('customerId', id);
      
    if (vehiclesError) throw vehiclesError;
    
    if (vehicles && vehicles.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with related vehicles',
        details: 'Please delete the customer\'s vehicles first'
      });
    }
    
    // Check for related work orders
    const { data: workOrders, error: workOrdersError } = await supabase
      .from('WorkOrder')
      .select('id')
      .eq('customerId', id);
      
    if (workOrdersError) throw workOrdersError;
    
    if (workOrders && workOrders.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with related work orders',
        details: 'Please delete the customer\'s work orders first'
      });
    }

    // Perform the delete operation
    const { error } = await supabase
      .from('Customer')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error during delete operation for customer ${id}:`, error);
      throw error;
    }

    console.log(`Successfully deleted customer with ID: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      error: 'Failed to delete customer',
      details: error.message || 'Unknown error occurred'
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
    const { data: existingCustomer, error: checkError } = await supabase
      .from('Customer')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      throw checkError;
    }

    const { data: workOrders, error } = await supabase
      .from('WorkOrder')
      .select(`
        *,
        vehicle:vehicleId (*),
        technician:technicianId (*)
      `)
      .eq('customerId', id)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json(workOrders);
  } catch (error: any) {
    console.error('Error fetching customer work orders:', error);
    res.status(500).json({
      error: 'Failed to fetch customer work orders',
      details: error.message
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
    const { data: existingCustomer, error: checkError } = await supabase
      .from('Customer')
      .select()
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Customer not found'
        });
      }
      throw checkError;
    }

    const { data: vehicles, error } = await supabase
      .from('Vehicle')
      .select('*')
      .eq('customerId', id)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json(vehicles);
  } catch (error: any) {
    console.error('Error fetching customer vehicles:', error);
    res.status(500).json({
      error: 'Failed to fetch customer vehicles',
      details: error.message
    });
  }
}; 