// Create the mock functions at the top of the file
const mockFrom = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockDelete = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockReturnThis();

const mockDeleteChain = {
  eq: jest.fn().mockReturnValue({ error: null })
};

// Mock Supabase client
jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: jest.fn().mockReturnValue(mockDeleteChain),
    eq: mockEq,
    order: mockOrder,
    single: mockSingle
  }
}));

import { Request, Response } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../vehicle.controller';

describe('Vehicle Controller', () => {
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
    jest.clearAllMocks();
  });

  describe('getAllVehicles', () => {
    it('should return all vehicles', async () => {
      const mockVehicles = [
        { id: 1, make: 'Toyota', model: 'Camry', customerId: 1 },
        { id: 2, make: 'Honda', model: 'Civic', customerId: 2 }
      ];

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockOrder as jest.Mock).mockResolvedValue({ data: mockVehicles, error: null });

      await getAllVehicles(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Vehicle');
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        customer:customerId (*)
      `);
      expect(mockJson).toHaveBeenCalledWith(mockVehicles);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockOrder as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await getAllVehicles(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to fetch vehicles',
        details: mockError.message
      });
    });
  });

  describe('getVehicleById', () => {
    it('should return a vehicle by ID', async () => {
      const mockVehicle = { 
        id: 1, 
        make: 'Toyota', 
        model: 'Camry', 
        customerId: 1,
        customer: { id: 1, name: 'John Doe' }
      };
      mockReq.params = { id: '1' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: mockVehicle, error: null });

      await getVehicleById(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Vehicle');
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        customer:customerId (*),
        workOrders (*)
      `);
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockJson).toHaveBeenCalledWith(mockVehicle);
    });

    it('should return 404 when vehicle not found', async () => {
      mockReq.params = { id: '999' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await getVehicleById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Vehicle not found' });
    });
  });

  describe('createVehicle', () => {
    it('should create a new vehicle', async () => {
      const mockVehicleData = { 
        make: 'Toyota', 
        model: 'Camry', 
        customerId: 1 
      };
      const mockNewVehicle = { 
        id: 1, 
        ...mockVehicleData,
        customer: { id: 1, name: 'John Doe' }
      };
      mockReq.body = mockVehicleData;

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock)
        .mockResolvedValueOnce({ data: { id: 1 }, error: null }) // Customer check
        .mockResolvedValueOnce({ data: mockNewVehicle, error: null }); // Vehicle creation
      (mockInsert as jest.Mock).mockReturnThis();

      await createVehicle(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Vehicle');
      expect(mockInsert).toHaveBeenCalledWith([mockVehicleData]);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockNewVehicle);
    });

    it('should return 404 when customer not found', async () => {
      mockReq.body = { 
        make: 'Toyota', 
        model: 'Camry', 
        customerId: 999 
      };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await createVehicle(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Customer not found' });
    });
  });

  describe('updateVehicle', () => {
    it('should update a vehicle', async () => {
      const mockVehicleData = { 
        make: 'Toyota Updated', 
        model: 'Camry', 
        customerId: 1 
      };
      const mockUpdatedVehicle = { 
        id: 1, 
        ...mockVehicleData,
        customer: { id: 1, name: 'John Doe' }
      };
      mockReq.params = { id: '1' };
      mockReq.body = mockVehicleData;

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock)
        .mockResolvedValueOnce({ data: { id: 1 }, error: null }) // Vehicle check
        .mockResolvedValueOnce({ data: { id: 1 }, error: null }) // Customer check
        .mockResolvedValueOnce({ data: mockUpdatedVehicle, error: null }); // Update result
      (mockUpdate as jest.Mock).mockReturnThis();

      await updateVehicle(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Vehicle');
      expect(mockUpdate).toHaveBeenCalledWith(mockVehicleData);
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedVehicle);
    });

    it('should return 404 when vehicle not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { make: 'Toyota' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await updateVehicle(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Vehicle not found' });
    });

    it('should return 404 when new customer not found', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { customerId: 999 };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock)
        .mockResolvedValueOnce({ data: { id: 1 }, error: null }) // Vehicle exists
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }); // Customer not found

      await updateVehicle(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Customer not found' });
    });
  });

  describe('deleteVehicle', () => {
    it('should delete a vehicle', async () => {
      mockReq.params = { id: '1' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: { id: 1 }, error: null });

      await deleteVehicle(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Vehicle');
      expect(mockDeleteChain.eq).toHaveBeenCalledWith('id', '1');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when vehicle not found', async () => {
      mockReq.params = { id: '999' };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockEq as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await deleteVehicle(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Vehicle not found' });
    });
  });
}); 