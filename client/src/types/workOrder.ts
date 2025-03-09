export interface WorkOrder {
  id: number;
  customerId: number;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
  };
  vehicleId?: number;
  vehicle?: {
    id: number;
    make: string;
    model: string;
    year: number;
    color?: string;
  };
  technicianId?: number;
  technician?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  serviceType: string;
  glassLocation: string;
  materialsRequired?: string;
  materialsUsed?: string;
  scheduledDate?: string | Date;
  completedDate?: string | Date;
  status: string;
  price?: number;
  paymentType?: string;
  paymentStatus?: string;
  insuranceClaim: boolean;
  insuranceInfo?: string;
  warrantyInfo?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
} 