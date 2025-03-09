import { Request, Response } from 'express';
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
import { prisma } from '../../index';

// Mock Prisma client
jest.mock('../../index', () => ({
  prisma: {
    workOrder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    customer: {
      findUnique: jest.fn()
    },
    vehicle: {
      findUnique: jest.fn()
    },
    technician: {
      findUnique: jest.fn()
    }
  }
}));

// Mock request and response
const mockRequest = () => {
  const req: Partial<Request> = {};
  req.body = {};
  req.params = {};
  req.query = {};
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('Work Order Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('getAllWorkOrders', () => {
    it('should return all work orders', async () => {
      const mockWorkOrders = [
        { 
          id: 1, 
          customerId: 1, 
          vehicleId: 1, 
          technicianId: 1,
          serviceType: 'replacement',
          glassLocation: 'windshield',
          status: 'scheduled',
          customer: { firstName: 'John', lastName: 'Doe' },
          vehicle: { make: 'Toyota', model: 'Camry' },
          technician: { firstName: 'Tech', lastName: 'One' }
        },
        { 
          id: 2, 
          customerId: 2, 
          vehicleId: 2, 
          technicianId: null,
          serviceType: 'repair',
          glassLocation: 'driver window',
          status: 'completed',
          customer: { firstName: 'Jane', lastName: 'Smith' },
          vehicle: { make: 'Honda', model: 'Accord' },
          technician: null
        }
      ];
      
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue(mockWorkOrders);
      
      await getAllWorkOrders(req, res);
      
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { scheduledDate: 'asc' },
        include: {
          customer: true,
          vehicle: true,
          technician: true
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrders);
    });

    it('should apply filters when provided', async () => {
      const mockWorkOrders = [
        { 
          id: 1, 
          customerId: 1, 
          vehicleId: 1, 
          technicianId: 1,
          serviceType: 'replacement',
          glassLocation: 'windshield',
          status: 'scheduled',
          scheduledDate: new Date('2023-03-15'),
          customer: { firstName: 'John', lastName: 'Doe' },
          vehicle: { make: 'Toyota', model: 'Camry' },
          technician: { firstName: 'Tech', lastName: 'One' }
        }
      ];
      
      req.query = {
        status: 'scheduled',
        technicianId: '1',
        customerId: '1',
        vehicleId: '1',
        fromDate: '2023-03-01',
        toDate: '2023-03-31'
      };
      
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue(mockWorkOrders);
      
      await getAllWorkOrders(req, res);
      
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: {
          status: 'scheduled',
          technicianId: 1,
          customerId: 1,
          vehicleId: 1,
          scheduledDate: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          }
        },
        orderBy: { scheduledDate: 'asc' },
        include: {
          customer: true,
          vehicle: true,
          technician: true
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrders);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (prisma.workOrder.findMany as jest.Mock).mockRejectedValue(error);
      
      await getAllWorkOrders(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch work orders',
        details: 'Database error'
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
        serviceType: 'replacement',
        glassLocation: 'windshield',
        status: 'scheduled',
        customer: { firstName: 'John', lastName: 'Doe' },
        vehicle: { make: 'Toyota', model: 'Camry' },
        technician: { firstName: 'Tech', lastName: 'One' }
      };
      
      req.params.id = '1';
      (prisma.workOrder.findUnique as jest.Mock).mockResolvedValue(mockWorkOrder);
      
      await getWorkOrderById(req, res);
      
      expect(prisma.workOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          customer: true,
          vehicle: true,
          technician: true
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 404 if work order not found', async () => {
      req.params.id = '999';
      (prisma.workOrder.findUnique as jest.Mock).mockResolvedValue(null);
      
      await getWorkOrderById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Work order not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      (prisma.workOrder.findUnique as jest.Mock).mockRejectedValue(error);
      
      await getWorkOrderById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch work order',
        details: 'Database error'
      });
    });
  });

  describe('createWorkOrder', () => {
    it('should create a new work order', async () => {
      const mockWorkOrder = { 
        id: 1, 
        customerId: 1, 
        vehicleId: 1, 
        technicianId: 1,
        serviceType: 'replacement',
        glassLocation: 'windshield',
        status: 'scheduled',
        scheduledDate: new Date('2023-03-15'),
        price: 350,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      req.body = {
        customerId: 1,
        vehicleId: 1,
        technicianId: 1,
        serviceType: 'replacement',
        glassLocation: 'windshield',
        scheduledDate: '2023-03-15',
        price: 350
      };
      
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.create as jest.Mock).mockResolvedValue(mockWorkOrder);
      
      await createWorkOrder(req, res);
      
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(prisma.workOrder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: 1,
          vehicleId: 1,
          technicianId: 1,
          serviceType: 'replacement',
          glassLocation: 'windshield',
          status: 'scheduled'
        })
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        customerId: 1,
        // Missing serviceType and glassLocation
      };
      
      await createWorkOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        requiredFields: ['customerId', 'serviceType', 'glassLocation']
      });
    });

    it('should return 404 if customer not found', async () => {
      req.body = {
        customerId: 999,
        serviceType: 'replacement',
        glassLocation: 'windshield'
      };
      
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);
      
      await createWorkOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Customer not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.body = {
        customerId: 1,
        serviceType: 'replacement',
        glassLocation: 'windshield'
      };
      
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.create as jest.Mock).mockRejectedValue(error);
      
      await createWorkOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create work order',
        details: 'Database error'
      });
    });
  });

  describe('updateWorkOrderStatus', () => {
    it('should update work order status', async () => {
      const mockWorkOrder = { 
        id: 1, 
        status: 'in-progress'
      };
      
      req.params.id = '1';
      req.body = {
        status: 'in-progress'
      };
      
      (prisma.workOrder.findUnique as jest.Mock).mockResolvedValue({ id: 1, status: 'scheduled' });
      (prisma.workOrder.update as jest.Mock).mockResolvedValue(mockWorkOrder);
      
      await updateWorkOrderStatus(req, res);
      
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'in-progress' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should set completedDate when status is completed', async () => {
      const mockWorkOrder = { 
        id: 1, 
        status: 'completed',
        completedDate: new Date()
      };
      
      req.params.id = '1';
      req.body = {
        status: 'completed'
      };
      
      (prisma.workOrder.findUnique as jest.Mock).mockResolvedValue({ id: 1, status: 'in-progress' });
      (prisma.workOrder.update as jest.Mock).mockResolvedValue(mockWorkOrder);
      
      await updateWorkOrderStatus(req, res);
      
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { 
          status: 'completed',
          completedDate: expect.any(Date)
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 400 if status is invalid', async () => {
      req.params.id = '1';
      req.body = {
        status: 'invalid-status'
      };
      
      await updateWorkOrderStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid status',
        validStatuses: ['scheduled', 'in-progress', 'completed', 'cancelled']
      });
    });
  });

  describe('assignTechnician', () => {
    it('should assign a technician to a work order', async () => {
      const mockWorkOrder = { 
        id: 1, 
        technicianId: 1
      };
      
      req.params.id = '1';
      req.body = {
        technicianId: 1
      };
      
      (prisma.workOrder.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.update as jest.Mock).mockResolvedValue(mockWorkOrder);
      
      await assignTechnician(req, res);
      
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { technicianId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should unassign a technician when technicianId is null', async () => {
      const mockWorkOrder = { 
        id: 1, 
        technicianId: null
      };
      
      req.params.id = '1';
      req.body = {
        technicianId: null
      };
      
      (prisma.workOrder.findUnique as jest.Mock).mockResolvedValue({ id: 1, technicianId: 1 });
      (prisma.workOrder.update as jest.Mock).mockResolvedValue(mockWorkOrder);
      
      await assignTechnician(req, res);
      
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { technicianId: null }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrder);
    });
  });

  describe('scheduleWorkOrder', () => {
    it('should schedule a work order', async () => {
      const scheduledDate = new Date('2023-03-15');
      const mockWorkOrder = { 
        id: 1, 
        scheduledDate,
        status: 'scheduled'
      };
      
      req.params.id = '1';
      req.body = {
        scheduledDate: '2023-03-15'
      };
      
      (prisma.workOrder.findUnique as jest.Mock).mockResolvedValue({ id: 1, status: 'scheduled' });
      (prisma.workOrder.update as jest.Mock).mockResolvedValue(mockWorkOrder);
      
      await scheduleWorkOrder(req, res);
      
      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { 
          scheduledDate: expect.any(Date),
          status: 'scheduled'
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrder);
    });

    it('should return 400 if scheduledDate is missing', async () => {
      req.params.id = '1';
      req.body = {};
      
      await scheduleWorkOrder(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Scheduled date is required' });
    });
  });
}); 