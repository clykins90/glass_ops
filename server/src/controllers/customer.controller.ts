import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all customers
 * @route GET /api/customers
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    // Validate that req.user and company_id exist
    const companyId = (req as any).user?.company_id;
    if (!companyId) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'Missing company ID - you may need to log in again'
      });
    }

    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .match({ company_id: companyId })
      .order('firstName', { ascending: true })
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
      .from('customers')
      .select('*')
      .match({ id: id, company_id: (req as any).user.company_id })
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
      .from('customers')
      .insert([{ ...customerData, company_id: (req as any).user.company_id }])
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

    // First, check if the customer exists and belongs to the company
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .match({ id: id, company_id: (req as any).user.company_id });

    if (checkError || !existingCustomer || existingCustomer.length === 0) {
      console.error('Error checking customer existence for update:', checkError);
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(customerData)
      .match({ id: id, company_id: (req as any).user.company_id })
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
    const companyId = (req as any).user.company_id;
    console.log(`Attempting to delete customer with ID: ${id} for company ${companyId}`);

    // First, check if the customer exists and belongs to the company
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .match({ id: id, company_id: companyId });

    if (checkError || !existingCustomer || existingCustomer.length === 0) {
      console.error('Error checking customer existence for delete:', checkError);
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }

    // Check for related vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id')
      .match({ customerId: id, company_id: companyId });
      
    if (vehiclesError) throw vehiclesError;
    
    if (vehicles && vehicles.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with related vehicles',
        details: 'Please delete the customer\'s vehicles first'
      });
    }
    
    // Check for related work orders
    const { data: workOrders, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('id')
      .match({ customerId: id, company_id: companyId });
      
    if (workOrdersError) throw workOrdersError;
    
    if (workOrders && workOrders.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer with related work orders',
        details: 'Please delete the customer\'s work orders first'
      });
    }

    // Perform the delete operation
    const { error } = await supabase
      .from('customers')
      .delete()
      .match({ id: id, company_id: companyId });

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
    const companyId = (req as any).user.company_id;

    // First, check if the customer exists and belongs to the company
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .match({ id: id, company_id: companyId });

    if (checkError || !existingCustomer || existingCustomer.length === 0) {
      console.error('Error checking customer existence for work orders:', checkError);
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }

    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        vehicle:vehicleId (*),
        technician:technicianId (*)
      `)
      .match({ customerId: id, company_id: companyId })
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
    const companyId = (req as any).user.company_id;

    // First, check if the customer exists and belongs to the company
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .match({ id: id, company_id: companyId });

    if (checkError || !existingCustomer || existingCustomer.length === 0) {
      console.error('Error checking customer existence for vehicles:', checkError);
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .match({ customerId: id, company_id: companyId })
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