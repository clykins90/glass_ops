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
import { prisma } from '../../index';

// Mock Prisma client
jest.mock('../../index', () => ({
  prisma: {
    technician: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    workOrder: {
      findMany: jest.fn()
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

describe('Technician Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('getAllTechnicians', () => {
    it('should return all technicians', async () => {
      const mockTechnicians = [
        { id: 1, firstName: 'John', lastName: 'Smith', active: true },
        { id: 2, firstName: 'Jane', lastName: 'Doe', active: false }
      ];
      
      (prisma.technician.findMany as jest.Mock).mockResolvedValue(mockTechnicians);
      
      await getAllTechnicians(req, res);
      
      expect(prisma.technician.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { lastName: 'asc' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTechnicians);
    });

    it('should filter by active status when provided', async () => {
      const mockTechnicians = [
        { id: 1, firstName: 'John', lastName: 'Smith', active: true }
      ];
      
      req.query = { active: 'true' };
      (prisma.technician.findMany as jest.Mock).mockResolvedValue(mockTechnicians);
      
      await getAllTechnicians(req, res);
      
      expect(prisma.technician.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { lastName: 'asc' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTechnicians);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (prisma.technician.findMany as jest.Mock).mockRejectedValue(error);
      
      await getAllTechnicians(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch technicians',
        details: 'Database error'
      });
    });
  });

  describe('getTechnicianById', () => {
    it('should return a technician by ID', async () => {
      const mockTechnician = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567',
        skills: ['windshield replacement'],
        active: true
      };
      
      req.params.id = '1';
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue(mockTechnician);
      
      await getTechnicianById(req, res);
      
      expect(prisma.technician.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTechnician);
    });

    it('should return 404 if technician not found', async () => {
      req.params.id = '999';
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue(null);
      
      await getTechnicianById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Technician not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      (prisma.technician.findUnique as jest.Mock).mockRejectedValue(error);
      
      await getTechnicianById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch technician',
        details: 'Database error'
      });
    });
  });

  describe('createTechnician', () => {
    it('should create a new technician', async () => {
      const mockTechnician = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567',
        skills: ['windshield replacement'],
        notes: 'Experienced technician',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      req.body = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567',
        skills: ['windshield replacement'],
        notes: 'Experienced technician'
      };
      
      (prisma.technician.create as jest.Mock).mockResolvedValue(mockTechnician);
      
      await createTechnician(req, res);
      
      expect(prisma.technician.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '555-123-4567',
          skills: ['windshield replacement'],
          notes: 'Experienced technician',
          active: true
        })
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTechnician);
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        firstName: 'John',
        // Missing lastName and phone
      };
      
      await createTechnician(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        requiredFields: ['firstName', 'lastName', 'phone']
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.body = {
        firstName: 'John',
        lastName: 'Smith',
        phone: '555-123-4567'
      };
      
      (prisma.technician.create as jest.Mock).mockRejectedValue(error);
      
      await createTechnician(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create technician',
        details: 'Database error'
      });
    });
  });

  describe('updateTechnician', () => {
    it('should update a technician', async () => {
      const mockTechnician = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Smith Updated',
        email: 'john.updated@example.com',
        phone: '555-987-6543',
        skills: ['windshield replacement', 'side window repair'],
        notes: 'Updated notes',
        active: true,
        updatedAt: new Date()
      };
      
      req.params.id = '1';
      req.body = {
        lastName: 'Smith Updated',
        email: 'john.updated@example.com',
        phone: '555-987-6543',
        skills: ['windshield replacement', 'side window repair'],
        notes: 'Updated notes'
      };
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.technician.update as jest.Mock).mockResolvedValue(mockTechnician);
      
      await updateTechnician(req, res);
      
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          lastName: 'Smith Updated',
          email: 'john.updated@example.com',
          phone: '555-987-6543',
          skills: ['windshield replacement', 'side window repair'],
          notes: 'Updated notes'
        })
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTechnician);
    });

    it('should return 404 if technician not found', async () => {
      req.params.id = '999';
      req.body = { lastName: 'Smith Updated' };
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue(null);
      
      await updateTechnician(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Technician not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      req.body = { lastName: 'Smith Updated' };
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.technician.update as jest.Mock).mockRejectedValue(error);
      
      await updateTechnician(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to update technician',
        details: 'Database error'
      });
    });
  });

  describe('deleteTechnician', () => {
    it('should delete a technician', async () => {
      req.params.id = '1';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.technician.delete as jest.Mock).mockResolvedValue({ id: 1 });
      
      await deleteTechnician(req, res);
      
      expect(prisma.technician.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Technician deleted successfully' });
    });

    it('should return 404 if technician not found', async () => {
      req.params.id = '999';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue(null);
      
      await deleteTechnician(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Technician not found' });
    });

    it('should return 400 if technician has assigned work orders', async () => {
      req.params.id = '1';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue([
        { id: 1, status: 'scheduled' },
        { id: 2, status: 'in-progress' }
      ]);
      
      await deleteTechnician(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot delete technician with assigned work orders',
        assignedWorkOrders: 2
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.technician.delete as jest.Mock).mockRejectedValue(error);
      
      await deleteTechnician(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to delete technician',
        details: 'Database error'
      });
    });
  });

  describe('getTechnicianWorkOrders', () => {
    it('should return work orders for a technician', async () => {
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
          vehicle: { make: 'Toyota', model: 'Camry' }
        }
      ];
      
      req.params.id = '1';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue(mockWorkOrders);
      
      await getTechnicianWorkOrders(req, res);
      
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { technicianId: 1 },
        orderBy: { scheduledDate: 'asc' },
        include: {
          customer: true,
          vehicle: true
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrders);
    });

    it('should filter by status when provided', async () => {
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
          vehicle: { make: 'Toyota', model: 'Camry' }
        }
      ];
      
      req.params.id = '1';
      req.query = { status: 'scheduled' };
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue(mockWorkOrders);
      
      await getTechnicianWorkOrders(req, res);
      
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { 
          technicianId: 1,
          status: 'scheduled'
        },
        orderBy: { scheduledDate: 'asc' },
        include: {
          customer: true,
          vehicle: true
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockWorkOrders);
    });

    it('should return 404 if technician not found', async () => {
      req.params.id = '999';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue(null);
      
      await getTechnicianWorkOrders(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Technician not found' });
    });
  });

  describe('getTechnicianSchedule', () => {
    it('should return schedule for a technician with default date range', async () => {
      const mockSchedule = [
        { 
          id: 1, 
          customerId: 1, 
          vehicleId: 1, 
          technicianId: 1,
          serviceType: 'replacement',
          glassLocation: 'windshield',
          status: 'scheduled',
          scheduledDate: new Date(),
          customer: { firstName: 'John', lastName: 'Doe' },
          vehicle: { make: 'Toyota', model: 'Camry' }
        }
      ];
      
      req.params.id = '1';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue(mockSchedule);
      
      await getTechnicianSchedule(req, res);
      
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { 
          technicianId: 1,
          scheduledDate: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          },
          status: { notIn: ['completed', 'cancelled'] }
        },
        orderBy: { scheduledDate: 'asc' },
        include: {
          customer: true,
          vehicle: true
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSchedule);
    });

    it('should use provided date range', async () => {
      const mockSchedule = [
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
          vehicle: { make: 'Toyota', model: 'Camry' }
        }
      ];
      
      req.params.id = '1';
      req.query = {
        fromDate: '2023-03-01',
        toDate: '2023-03-31'
      };
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.workOrder.findMany as jest.Mock).mockResolvedValue(mockSchedule);
      
      await getTechnicianSchedule(req, res);
      
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith({
        where: { 
          technicianId: 1,
          scheduledDate: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          },
          status: { notIn: ['completed', 'cancelled'] }
        },
        orderBy: { scheduledDate: 'asc' },
        include: {
          customer: true,
          vehicle: true
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSchedule);
    });

    it('should return 404 if technician not found', async () => {
      req.params.id = '999';
      
      (prisma.technician.findUnique as jest.Mock).mockResolvedValue(null);
      
      await getTechnicianSchedule(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Technician not found' });
    });
  });
}); 