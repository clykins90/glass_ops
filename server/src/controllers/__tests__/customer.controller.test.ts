// Create the mock functions at the top of the file
const mockFrom = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockDelete = jest.fn().mockReturnThis();
const mockMatch = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockReturnThis();

const mockDeleteChain = {
  match: jest.fn().mockReturnValue({ error: null })
};

// Mock Supabase client
jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: jest.fn().mockReturnValue(mockDeleteChain),
    match: mockMatch,
    order: mockOrder,
    single: mockSingle
  }
}));

import { Request, Response } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerVehicles
} from '../customer.controller';

describe('Customer Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();
    mockRes = {
      json: mockJson,
      status: mockStatus,
      send: mockSend
    };
    mockReq = {};
    (mockReq as any).user = { company_id: 1 };
    jest.clearAllMocks();
  });

  describe('getAllCustomers', () => {
    it('should return all customers', async () => {
      const mockCustomers = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' }
      ];

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockOrder as jest.Mock).mockResolvedValue({ data: mockCustomers, error: null });

      await getAllCustomers(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('customers');
      expect(mockMatch).toHaveBeenCalledWith({ company_id: 1 });
      expect(mockOrder).toHaveBeenCalledWith('lastName', { ascending: true });
      expect(mockJson).toHaveBeenCalledWith(mockCustomers);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockOrder as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await getAllCustomers(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to fetch customers',
        details: mockError.message
      });
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by ID', async () => {
      const mockCustomer = { id: 1, firstName: 'John', lastName: 'Doe' };
      mockReq.params = { id: '1' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: mockCustomer, error: null });

      await getCustomerById(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('customers');
      expect(mockMatch).toHaveBeenCalledWith({ id: '1', company_id: 1 });
      expect(mockJson).toHaveBeenCalledWith(mockCustomer);
    });

    it('should return 404 when customer not found', async () => {
      mockReq.params = { id: '999' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await getCustomerById(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ id: '999', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Customer not found' });
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const mockCustomerData = { firstName: 'John', lastName: 'Doe' };
      const mockNewCustomer = { id: 1, ...mockCustomerData };
      mockReq.body = mockCustomerData;

      (mockFrom as jest.Mock).mockReturnThis();
      (mockInsert as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: mockNewCustomer, error: null });

      await createCustomer(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('customers');
      expect(mockInsert).toHaveBeenCalledWith([{ ...mockCustomerData, company_id: 1 }]);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockNewCustomer);
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Database error');
      mockReq.body = { firstName: 'John', lastName: 'Doe' };

      mockSingle.mockResolvedValue({ data: null, error: mockError });

      await createCustomer(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to create customer',
        details: mockError.message
      });
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer', async () => {
      const mockCustomerData = { firstName: 'John Updated', lastName: 'Doe' };
      const mockUpdatedCustomer = { id: 1, ...mockCustomerData };
      mockReq.params = { id: '1' };
      mockReq.body = mockCustomerData;

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockUpdate as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock)
        .mockResolvedValueOnce({ data: { id: 1 }, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedCustomer, error: null });

      await updateCustomer(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ id: '1', company_id: 1 });
      expect(mockUpdate).toHaveBeenCalledWith(mockCustomerData);
      expect(mockMatch).toHaveBeenCalledWith({ id: '1', company_id: 1 });
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedCustomer);
    });

    it('should return 404 when customer not found for update', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { firstName: 'Non Existent' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockResolvedValue({ data: [], error: null });

      await updateCustomer(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ id: '999', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Customer not found or access denied' });
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      mockReq.params = { id: '1' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock)
         .mockResolvedValueOnce({ data: [{ id: 1 }], error: null })
         .mockResolvedValueOnce({ data: [], error: null })
         .mockResolvedValueOnce({ data: [], error: null });

      await deleteCustomer(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenNthCalledWith(1, { id: '1', company_id: 1 });
      expect(mockMatch).toHaveBeenNthCalledWith(2, { customerId: '1', company_id: 1 });
      expect(mockMatch).toHaveBeenNthCalledWith(3, { customerId: '1', company_id: 1 });
      expect(mockDeleteChain.match).toHaveBeenCalledWith({ id: '1', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when customer not found for delete', async () => {
      mockReq.params = { id: '999' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockResolvedValue({ data: [], error: null });

      await deleteCustomer(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ id: '999', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Customer not found or access denied' });
    });

    it('should return 400 if customer has related vehicles', async () => {
      mockReq.params = { id: '1' };
      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock)
        .mockResolvedValueOnce({ data: [{ id: 1 }], error: null })
        .mockResolvedValueOnce({ data: [{ id: 10 }], error: null });

      await deleteCustomer(mockReq as Request, mockRes as Response);
      expect(mockMatch).toHaveBeenNthCalledWith(1, { id: '1', company_id: 1 });
      expect(mockMatch).toHaveBeenNthCalledWith(2, { customerId: '1', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ error: 'Cannot delete customer with related vehicles' }));
    });
    
    it('should return 400 if customer has related work orders', async () => {
      mockReq.params = { id: '1' };
      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock)
        .mockResolvedValueOnce({ data: [{ id: 1 }], error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [{ id: 100 }], error: null });

      await deleteCustomer(mockReq as Request, mockRes as Response);
      expect(mockMatch).toHaveBeenNthCalledWith(1, { id: '1', company_id: 1 });
      expect(mockMatch).toHaveBeenNthCalledWith(2, { customerId: '1', company_id: 1 });
      expect(mockMatch).toHaveBeenNthCalledWith(3, { customerId: '1', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ error: 'Cannot delete customer with related work orders' }));
    });
  });

  describe('getCustomerVehicles', () => {
    it('should return customer vehicles', async () => {
      const mockVehicles = [
        { id: 1, customerId: 1, make: 'Toyota', model: 'Camry' },
        { id: 2, customerId: 1, make: 'Honda', model: 'Civic' }
      ];
      mockReq.params = { id: '1' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock)
        .mockResolvedValueOnce({ data: [{ id: 1 }], error: null })
        .mockReturnThis();
      (mockOrder as jest.Mock).mockResolvedValue({ data: mockVehicles, error: null });

      await getCustomerVehicles(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ id: '1', company_id: 1 });
      expect(mockFrom).toHaveBeenCalledWith('vehicles');
      expect(mockMatch).toHaveBeenCalledWith({ customerId: '1', company_id: 1 });
      expect(mockJson).toHaveBeenCalledWith(mockVehicles);
    });

    it('should return 404 when customer not found', async () => {
      mockReq.params = { id: '999' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockResolvedValue({ data: [], error: null });

      await getCustomerVehicles(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ id: '999', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Customer not found or access denied' });
    });
  });
}); 