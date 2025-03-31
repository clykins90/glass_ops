// Define common types used throughout the application

export interface Vehicle {
  id?: string | number;
  customerId: string | number;
  make: string;
  model: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  vinNumber?: string; // For backward compatibility
  color?: string;
  glassType?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id?: string | number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyId?: string | number;
  isLead?: boolean;
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrder {
  id?: string | number;
  customerId: string | number;
  vehicleId: string | number;
  technicianId?: string | number;
  serviceType: string;
  description: string;
  status: string;
  scheduledDate?: string | Date;
  completedDate?: string | Date;
  price?: number;
  notes?: string;
  customer?: Customer;
  vehicle?: Vehicle;
  technician?: {
    id: string | number;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  company_id?: string;
  role?: string;
}

// Add other types as needed 