import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set test timeout
jest.setTimeout(30000);

// Mock Prisma since it doesn't seem to be actually used
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        $disconnect: jest.fn()
      };
    })
  };
});

// Setup before all tests
beforeAll(async () => {
  // Any setup needed before all tests
});

// Cleanup after each test
afterEach(async () => {
  // Clean up test data if needed
});

// Cleanup after all tests
afterAll(async () => {
  // No actual prisma instance to disconnect
}); 