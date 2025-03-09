export interface Technician {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  skills: string[];
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
} 