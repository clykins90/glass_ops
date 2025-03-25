import { Request, Response } from 'express';
import { supabase } from '../../utils/supabase';
import {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  assignTechnician,
  scheduleWorkOrder
} from '../workOrder.controller';

// Mock the entire supabase module
jest.mock('../../utils/supabase');

describe('WorkOrder Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let mockFrom: jest.SpyInstance;

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
    mockFrom = jest.spyOn(supabase, 'from');
    jest.clearAllMocks();
  });

  describe('getAllWorkOrders', () => {
    it('should return all work orders', async () => {
      const mockWorkOrders = [
        { id: 1, customerId: 1, vehicleId: 1, technicianId: 1, status: 'pending' },
        { id: 2, customerId: 2, vehicleId: 2, technicianId: 2, status: 'completed' }
      ];

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockWorkOrders, error: null })
        })
      }));

      await getAllWorkOrders(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockJson).toHaveBeenCalledWith(mockWorkOrders);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      
      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: mockError })
        })
      }));

      await getAllWorkOrders(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Failed to fetch work orders',
        details: mockError.message
      });
    });
  });

  describe('getWorkOrderById', () => {
    it('should return a work order by ID', async () => {
      const mockWorkOrder = { 
        id: 1, 
        customerId: 1, 
        vehicleId: 1, 
        technicianId: 1, 
        status: 'pending' 
      };
      mockReq.params = { id: '1' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockWorkOrder, error: null })
          })
        })
      }));

      await getWorkOrderById(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockJson).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 404 when work order not found', async () => {
      mockReq.params = { id: '999' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      }));

      await getWorkOrderById(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Work order not found' });
    });
  });

  describe('createWorkOrder', () => {
    it('should create a new work order', async () => {
      const mockWorkOrderData = {
        customerId: 1,
        vehicleId: 1,
        technicianId: 1,
        serviceType: 'replacement',
        glassLocation: 'windshield',
        scheduledDate: '2024-03-20',
        status: 'pending'
      };
      const mockNewWorkOrder = { id: 1, ...mockWorkOrderData };
      mockReq.body = mockWorkOrderData;

      mockFrom.mockImplementation((table) => {
        if (table === 'Customer' || table === 'Vehicle' || table === 'Technician') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
              })
            })
          };
        }
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockNewWorkOrder, error: null })
            })
          })
        };
      });

      await createWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockNewWorkOrder);
    });

    it('should return 404 when customer not found', async () => {
      mockReq.body = {
        customerId: 999,
        vehicleId: 1,
        technicianId: 1
      };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      }));

      await createWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Customer not found' });
    });
  });

  describe('updateWorkOrder', () => {
    it('should update a work order', async () => {
      const mockWorkOrderData = {
        status: 'completed',
        notes: 'Work completed successfully'
      };
      const mockUpdatedWorkOrder = { 
        id: 1, 
        customerId: 1, 
        vehicleId: 1, 
        technicianId: 1,
        ...mockWorkOrderData 
      };
      mockReq.params = { id: '1' };
      mockReq.body = mockWorkOrderData;

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockUpdatedWorkOrder, error: null })
            })
          })
        })
      }));

      await updateWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedWorkOrder);
    });

    it('should return 404 when work order not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { status: 'completed' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      }));

      await updateWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Work order not found' });
    });
  });

  describe('deleteWorkOrder', () => {
    it('should delete a work order', async () => {
      mockReq.params = { id: '1' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
          })
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      }));

      await deleteWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 when work order not found', async () => {
      mockReq.params = { id: '999' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      }));

      await deleteWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Work order not found' });
    });
  });

  describe('updateWorkOrderStatus', () => {
    it('should update work order status', async () => {
      const mockWorkOrder = { 
        id: 1, 
        status: 'in-progress' 
      };
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'in-progress' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockWorkOrder, error: null })
            })
          })
        })
      }));

      await updateWorkOrderStatus(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockJson).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 404 when work order not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { status: 'in-progress' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      }));

      await updateWorkOrderStatus(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Work order not found' });
    });
  });

  describe('assignTechnician', () => {
    it('should assign a technician to a work order', async () => {
      const mockWorkOrder = { 
        id: 1, 
        technicianId: 1 
      };
      mockReq.params = { id: '1' };
      mockReq.body = { technicianId: 1 };

      mockFrom.mockImplementation((table) => {
        if (table === 'Technician') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
              })
            })
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockWorkOrder, error: null })
              })
            })
          })
        };
      });

      await assignTechnician(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockJson).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 404 when work order not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { technicianId: 1 };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      }));

      await assignTechnician(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Work order not found' });
    });
  });

  describe('scheduleWorkOrder', () => {
    it('should schedule a work order', async () => {
      const mockWorkOrder = { 
        id: 1, 
        scheduledDate: '2024-03-20',
        status: 'scheduled'
      };
      mockReq.params = { id: '1' };
      mockReq.body = { scheduledDate: '2024-03-20' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
          })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockWorkOrder, error: null })
            })
          })
        })
      }));

      await scheduleWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockFrom).toHaveBeenCalledWith('WorkOrder');
      expect(mockJson).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 404 when work order not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { scheduledDate: '2024-03-20' };

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          })
        })
      }));

      await scheduleWorkOrder(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Work order not found' });
    });
  });
}); 