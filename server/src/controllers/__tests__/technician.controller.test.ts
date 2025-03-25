// Create the mock functions at the top of the file
const mockFrom = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockDelete = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockReturnThis();
const mockGte = jest.fn().mockReturnThis();
const mockLte = jest.fn().mockReturnThis();
const mockNot = jest.fn().mockReturnThis();

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
    single: mockSingle,
    gte: mockGte,
    lte: mockLte,
    not: mockNot
  }
}));

import { Request, Response } from 'express';
import {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getTechnicianWorkOrders,
  getTechnicianSchedule
} from '../technician.controller';

describe('Technician Controller', () => {
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

  describe('getAllTechnicians', () => {
    it('should return all technicians', async () => {
      const mockTechnicians = [
        { id: 1, firstName: 'John', lastName: 'Doe', active: true },
        { id: 2, firstName: 'Jane', lastName: 'Smith', active: true }
      ];

      mockOrder.mockResolvedValue({ data: mockTechnicians, error: null });

      await getAllTechnicians(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Technician');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockJson).toHaveBeenCalledWith(mockTechnicians);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      mockOrder.mockResolvedValue({ data: null, error: mockError });

      await getAllTechnicians(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to fetch technicians',
        details: mockError.message
      });
    });
  });

  describe('getTechnicianById', () => {
    it('should return a technician by ID', async () => {
      const mockTechnician = { id: 1, firstName: 'John', lastName: 'Doe', active: true };
      mockReq.params = { id: '1' };

      mockSingle.mockResolvedValue({ data: mockTechnician, error: null });

      await getTechnicianById(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Technician');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockJson).toHaveBeenCalledWith(mockTechnician);
    });

    it('should return 404 when technician not found', async () => {
      mockReq.params = { id: '999' };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await getTechnicianById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician not found' });
    });
  });

  describe('createTechnician', () => {
    it('should create a new technician', async () => {
      const mockTechnicianData = { 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com',
        phone: '1234567890',
        active: true
      };
      const mockNewTechnician = { id: 1, ...mockTechnicianData };
      mockReq.body = mockTechnicianData;

      mockSingle.mockResolvedValue({ data: mockNewTechnician, error: null });

      await createTechnician(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Technician');
      expect(mockInsert).toHaveBeenCalledWith([mockTechnicianData]);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockNewTechnician);
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Database error');
      mockReq.body = { 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com',
        phone: '1234567890'
      };

      mockSingle.mockResolvedValue({ data: null, error: mockError });

      await createTechnician(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to create technician',
        details: mockError.message
      });
    });
  });

  describe('updateTechnician', () => {
    it('should update a technician', async () => {
      const mockTechnicianData = { 
        firstName: 'John Updated', 
        lastName: 'Doe', 
        active: true 
      };
      const mockUpdatedTechnician = { id: 1, ...mockTechnicianData };
      mockReq.params = { id: '1' };
      mockReq.body = mockTechnicianData;

      mockSingle
        .mockResolvedValueOnce({ data: { id: 1 }, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedTechnician, error: null });

      await updateTechnician(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Technician');
      expect(mockUpdate).toHaveBeenCalledWith(mockTechnicianData);
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedTechnician);
    });

    it('should return 404 when technician not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { firstName: 'John' };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await updateTechnician(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician not found' });
    });
  });

  describe('deleteTechnician', () => {
    it('should delete a technician', async () => {
      mockReq.params = { id: '1' };

      mockSingle.mockResolvedValue({ data: { id: 1 }, error: null });

      await deleteTechnician(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Technician');
      expect(mockDeleteChain.eq).toHaveBeenCalledWith('id', '1');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when technician not found', async () => {
      mockReq.params = { id: '999' };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await deleteTechnician(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician not found' });
    });
  });

  describe('getTechnicianWorkOrders', () => {
    it('should return technician work orders', async () => {
      const mockWorkOrders = [
        { id: 1, technicianId: 1, status: 'pending' },
        { id: 2, technicianId: 1, status: 'completed' }
      ];
      mockReq.params = { id: '1' };

      mockSingle.mockResolvedValueOnce({ data: { id: 1 }, error: null });
      mockOrder.mockResolvedValue({ data: mockWorkOrders, error: null });

      await getTechnicianWorkOrders(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Technician');
      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockJson).toHaveBeenCalledWith(mockWorkOrders);
    });

    it('should return 404 when technician not found', async () => {
      mockReq.params = { id: '999' };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await getTechnicianWorkOrders(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician not found' });
    });
  });

  describe('getTechnicianSchedule', () => {
    it('should return technician schedule for a date range', async () => {
      const mockSchedule = [
        { id: 1, technicianId: 1, scheduledDate: '2024-03-20' },
        { id: 2, technicianId: 1, scheduledDate: '2024-03-21' }
      ];
      mockReq.params = { id: '1' };
      mockReq.query = { 
        fromDate: '2024-03-20', 
        toDate: '2024-03-21' 
      };

      mockSingle.mockResolvedValueOnce({ data: { id: 1 }, error: null });
      mockOrder.mockResolvedValue({ data: mockSchedule, error: null });

      await getTechnicianSchedule(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('Technician');
      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockNot).toHaveBeenCalledWith('status', 'in', ['completed', 'cancelled']);
      expect(mockJson).toHaveBeenCalledWith(mockSchedule);
    });

    it('should return 404 when technician not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.query = { 
        fromDate: '2024-03-20', 
        toDate: '2024-03-21' 
      };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await getTechnicianSchedule(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician not found' });
    });
  });
}); 