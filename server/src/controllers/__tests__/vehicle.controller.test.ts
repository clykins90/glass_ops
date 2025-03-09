import { Request, Response } from 'express';
import { 
  getAllVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../vehicle.controller';
import { prisma } from '../../index';

// Mock Prisma client
jest.mock('../../index', () => ({
  prisma: {
    vehicle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    customer: {
      findUnique: jest.fn()
    }
  }
}));

// Mock request and response
const mockRequest = () => {
  const req: Partial<Request> = {};
  req.body = {};
  req.params = {};
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('Vehicle Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('getAllVehicles', () => {
    it('should return all vehicles', async () => {
      const mockVehicles = [
        { id: 1, make: 'Toyota', model: 'Camry', year: 2020, customerId: 1, customer: { firstName: 'John', lastName: 'Doe' } },
        { id: 2, make: 'Honda', model: 'Accord', year: 2019, customerId: 2, customer: { firstName: 'Jane', lastName: 'Smith' } }
      ];
      
      (prisma.vehicle.findMany as jest.Mock).mockResolvedValue(mockVehicles);
      
      await getAllVehicles(req, res);
      
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVehicles);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (prisma.vehicle.findMany as jest.Mock).mockRejectedValue(error);
      
      await getAllVehicles(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch vehicles',
        details: 'Database error'
      });
    });
  });

  describe('getVehicleById', () => {
    it('should return a vehicle by ID', async () => {
      const mockVehicle = { 
        id: 1, 
        make: 'Toyota', 
        model: 'Camry', 
        year: 2020, 
        customerId: 1, 
        customer: { firstName: 'John', lastName: 'Doe' },
        workOrders: []
      };
      
      req.params.id = '1';
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);
      
      await getVehicleById(req, res);
      
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          customer: true,
          workOrders: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVehicle);
    });

    it('should return 404 if vehicle not found', async () => {
      req.params.id = '999';
      (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);
      
      await getVehicleById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehicle not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      (prisma.vehicle.findUnique as jest.Mock).mockRejectedValue(error);
      
      await getVehicleById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch vehicle',
        details: 'Database error'
      });
    });
  });

  // Additional tests for createVehicle, updateVehicle, deleteVehicle
  // would follow the same pattern
}); 