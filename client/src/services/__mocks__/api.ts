// Mock API service
const API_URL = 'http://mock-api-url.com/api';

// Mock API service
export const workOrderApi = {
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
  getByStatus: jest.fn().mockResolvedValue([]),
};

export const customerApi = {
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
};

export const vehicleApi = {
  getAll: jest.fn().mockResolvedValue([]),
  getByCustomerId: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
};

export const technicianApi = {
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue({ schedule: [] }),
};

// Add more API service mocks as needed

export default {
  workOrderApi,
  customerApi,
  vehicleApi,
  technicianApi,
}; 