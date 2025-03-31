// Create the mock functions at the top of the file
const mockFrom = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockDelete = jest.fn().mockReturnThis();
const mockMatch = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockReturnThis();
const mockGte = jest.fn().mockReturnThis();
const mockLte = jest.fn().mockReturnThis();
const mockNot = jest.fn().mockReturnThis();

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
    (mockReq as any).user = { company_id: 1 };
    jest.clearAllMocks();
  });

  describe('getAllTechnicians', () => {
    it('should return all technician profiles for the company', async () => {
      const mockTechnicians = [
        { id: 'uuid-1', firstName: 'John', lastName: 'Doe', role: 'technician', company_id: 1 },
        { id: 'uuid-2', firstName: 'Jane', lastName: 'Smith', role: 'technician', company_id: 1 }
      ];
      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockOrder as jest.Mock).mockResolvedValue({ data: mockTechnicians, error: null });

      await getAllTechnicians(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockMatch).toHaveBeenCalledWith({ role: 'technician', company_id: 1 });
      expect(mockOrder).toHaveBeenCalledWith('lastName', { ascending: true });
      expect(mockJson).toHaveBeenCalledWith(mockTechnicians);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockOrder as jest.Mock).mockResolvedValue({ data: null, error: mockError });

      await getAllTechnicians(mockReq as Request, mockRes as Response);

      expect(mockMatch).toHaveBeenCalledWith({ role: 'technician', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to fetch technicians',
        details: mockError.message
      });
    });
  });

  describe('getTechnicianById', () => {
    it('should return a technician profile by ID', async () => {
      const mockTechnician = { id: 'uuid-1', firstName: 'John', lastName: 'Doe', role: 'technician', company_id: 1 };
      mockReq.params = { id: 'uuid-1' };
      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: mockTechnician, error: null });

      await getTechnicianById(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockMatch).toHaveBeenCalledWith({ id: 'uuid-1', role: 'technician', company_id: 1 });
      expect(mockJson).toHaveBeenCalledWith(mockTechnician);
    });

    it('should return 404 when technician profile not found', async () => {
      mockReq.params = { id: 'uuid-999' };
      (mockReq as any).user = { company_id: 1 };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      await getTechnicianById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician profile not found or not accessible' });
    });
  });

  describe('createTechnician', () => {
    it('should create a new technician profile', async () => {
      const mockTechnicianData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
        // ... other profile fields
      };
      const expectedInsertData = {
        ...mockTechnicianData,
        role: 'technician',
        company_id: 1
      };
      const mockNewTechnicianProfile = { 
        id: 'uuid-new', 
        ...expectedInsertData 
      };
      mockReq.body = mockTechnicianData;
      (mockReq as any).user = { company_id: 1 };

      mockSingle.mockResolvedValue({ data: mockNewTechnicianProfile, error: null });

      await createTechnician(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      // Check that the inserted data includes role and company_id
      expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining(expectedInsertData)]);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockNewTechnicianProfile);
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Database error');
      mockReq.body = { firstName: 'John', lastName: 'Doe' };
      (mockReq as any).user = { company_id: 1 };

      mockSingle.mockResolvedValue({ data: null, error: mockError });

      await createTechnician(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to create technician profile',
        details: mockError.message
      });
    });
  });

  describe('updateTechnician', () => {
    it('should update a technician profile', async () => {
      const mockTechnicianData = {
        firstName: 'John Updated',
        phone: '123-456-7890'
      };
      const mockUpdatedTechnician = { 
        id: 'uuid-1', 
        firstName: 'John Updated', 
        lastName: 'Doe', 
        phone: '123-456-7890',
        role: 'technician',
        company_id: 1
        // ... other fields
      };
      mockReq.params = { id: 'uuid-1' };
      mockReq.body = mockTechnicianData;
      (mockReq as any).user = { company_id: 1 };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockUpdate as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock)
        .mockResolvedValueOnce({ data: { id: 'uuid-1' }, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedTechnician, error: null });

      await updateTechnician(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockMatch).toHaveBeenCalledWith({ id: 'uuid-1', role: 'technician', company_id: 1 });
      expect(mockUpdate).toHaveBeenCalledWith(mockTechnicianData);
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedTechnician);
    });

    it('should return 404 when technician profile not found for update', async () => {
      mockReq.params = { id: 'uuid-999' };
      mockReq.body = { firstName: 'NonExistent' };
      (mockReq as any).user = { company_id: 1 };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      await updateTechnician(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician profile not found or not accessible for update' });
    });
  });

  describe('deleteTechnician', () => {
    it('should delete a technician profile', async () => {
      mockReq.params = { id: 'uuid-1' };
      (mockReq as any).user = { company_id: 1 };

      (mockFrom as jest.Mock).mockReturnThis();
      (mockSelect as jest.Mock).mockReturnThis();
      (mockMatch as jest.Mock).mockReturnThis();
      (mockSingle as jest.Mock).mockResolvedValue({ data: { id: 'uuid-1' }, error: null });

      await deleteTechnician(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockMatch).toHaveBeenCalledWith({ id: 'uuid-1', role: 'technician', company_id: 1 });
      expect(mockDeleteChain.match).toHaveBeenCalledWith({ id: 'uuid-1', role: 'technician', company_id: 1 });
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when technician profile not found for delete', async () => {
      mockReq.params = { id: 'uuid-999' };
      (mockReq as any).user = { company_id: 1 };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } // Simulate not found during check
      });

      await deleteTechnician(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician profile not found or not accessible for deletion' });
    });
  });

  describe('getTechnicianWorkOrders', () => {
    it('should return work orders for a specific technician profile', async () => {
      const mockWorkOrders = [
        { id: 1, assigned_technician_id: 'uuid-1', company_id: 1, description: 'Fix window' },
        { id: 2, assigned_technician_id: 'uuid-1', company_id: 1, description: 'Replace windshield' }
      ];
      mockReq.params = { id: 'uuid-1' };
      (mockReq as any).user = { company_id: 1 };

      mockSingle.mockResolvedValueOnce({ data: { id: 'uuid-1' }, error: null }); // Profile check
      mockOrder.mockResolvedValue({ data: mockWorkOrders, error: null }); // Work order query

      await getTechnicianWorkOrders(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('profiles'); // Check profile first
      expect(mockFrom).toHaveBeenCalledWith('work_orders'); // Then check work orders
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        customers(id, firstName, lastName),
        vehicles(id, make, model, year)
      `);
      expect(mockMatch).toHaveBeenCalledWith({ assigned_technician_id: 'uuid-1', company_id: 1 });
      expect(mockJson).toHaveBeenCalledWith(mockWorkOrders);
    });

    it('should return 404 if technician profile not found', async () => {
      mockReq.params = { id: 'uuid-999' };
      (mockReq as any).user = { company_id: 1 };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } // Simulate profile not found
      });

      await getTechnicianWorkOrders(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician profile not found or not accessible' });
    });
  });

  describe('getTechnicianSchedule', () => {
    it('should return schedule for a specific technician profile', async () => {
      const mockSchedule = [
        { id: 1, assigned_technician_id: 'uuid-1', company_id: 1, scheduledDate: '2024-01-01T10:00:00Z' }
      ];
      mockReq.params = { id: 'uuid-1' };
      mockReq.query = {}; // No date filters
      (mockReq as any).user = { company_id: 1 };

      mockSingle.mockResolvedValueOnce({ data: { id: 'uuid-1' }, error: null }); // Profile check
      mockOrder.mockResolvedValue({ data: mockSchedule, error: null }); // Schedule query

      await getTechnicianSchedule(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockFrom).toHaveBeenCalledWith('work_orders');
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        customers(id, firstName, lastName),
        vehicles(id, make, model, year)
      `);
      expect(mockMatch).toHaveBeenCalledWith({ assigned_technician_id: 'uuid-1', company_id: 1 });
      expect(mockNot).toHaveBeenCalledWith('status', 'in', ['completed', 'cancelled']);
      // Check date filters (defaults to today -> next 7 days)
      // expect(mockGte).toHaveBeenCalledWith('scheduledDate', expect.any(String)); 
      // expect(mockLte).toHaveBeenCalledWith('scheduledDate', expect.any(String));
      expect(mockJson).toHaveBeenCalledWith(mockSchedule);
    });

    it('should return 404 if technician profile not found for schedule', async () => {
      mockReq.params = { id: 'uuid-999' };
      mockReq.query = {};
      (mockReq as any).user = { company_id: 1 };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } // Simulate profile not found
      });

      await getTechnicianSchedule(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Technician profile not found or not accessible' });
    });
  });
}); 