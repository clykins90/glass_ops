import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set test timeout
jest.setTimeout(30000);

// Global Prisma client for tests
export const prisma = new PrismaClient();

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
  await prisma.$disconnect();
}); 