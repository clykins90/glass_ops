export interface WorkOrder {
  id: number;
  customerId: number;
  vehicleId?: number;
  technicianId?: number;
  serviceType: string;
  glassLocation: string;
  materialsRequired?: string;
  materialsUsed?: string;
  scheduledDate?: string;
  completedDate?: string;
  status: string;
  price?: number;
  paymentType?: string;
  paymentStatus?: string;
  insuranceClaim: boolean;
  insuranceInfo?: string;
  warrantyInfo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 