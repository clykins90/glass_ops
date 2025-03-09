export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isLead: boolean;
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
} 