import { Request, Response } from 'express';
import { 
  getAllCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerWorkOrders,
  getCustomerVehicles
} from '../customer.controller';
import { prisma } from '../../index';

// Mock Prisma client
jest.mock('../../index', () => ({
  prisma: {
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    workOrder: {
      findMany: jest.fn()
    },
    vehicle: {
      findMany: jest.fn()
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

describe('Customer Controller', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe('getAllCustomers', () => {
    it('should return all customers', async () => {
      const mockCustomers = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' }
      ];
      
      (prisma.customer.findMany as jest.Mock).mockResolvedValue(mockCustomers);
      
      await getAllCustomers(req, res);
      
      expect(prisma.customer.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCustomers);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (prisma.customer.findMany as jest.Mock).mockRejectedValue(error);
      
      await getAllCustomers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch customers',
        details: 'Database error'
      });
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by ID', async () => {
      const mockCustomer = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe',
        vehicles: [],
        workOrders: []
      };
      
      req.params.id = '1';
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      
      await getCustomerById(req, res);
      
      expect(prisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          vehicles: true,
          workOrders: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    it('should return 404 if customer not found', async () => {
      req.params.id = '999';
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);
      
      await getCustomerById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Customer not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.params.id = '1';
      (prisma.customer.findUnique as jest.Mock).mockRejectedValue(error);
      
      await getCustomerById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch customer',
        details: 'Database error'
      });
    });
  });

  // Additional tests for createCustomer, updateCustomer, deleteCustomer, etc.
  // would follow the same pattern
}); 