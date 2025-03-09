export interface Vehicle {
  id: number;
  customerId: number;
  make: string;
  model: string;
  year: number;
  color?: string;
  vinNumber?: string;
  licensePlate?: string;
  glassType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 