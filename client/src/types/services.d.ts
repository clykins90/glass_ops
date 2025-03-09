// Type declarations for service modules

declare module '../services/workOrderService' {
  import { WorkOrder } from '../types/workOrder';
  
  export function getWorkOrders(): Promise<WorkOrder[]>;
  export function getWorkOrderById(id: number): Promise<WorkOrder>;
  export function createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder>;
  export function updateWorkOrder(id: number, workOrder: Partial<WorkOrder>): Promise<WorkOrder>;
  export function deleteWorkOrder(id: number): Promise<void>;
  export function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]>;
  export function getWorkOrdersByDate(date: Date): Promise<WorkOrder[]>;
  export function getWorkOrdersByTechnician(technicianId: number): Promise<WorkOrder[]>;
}

declare module '../services/technicianService' {
  import { Technician } from '../types/technician';
  import { WorkOrder } from '../types/workOrder';
  
  export function getTechnicians(): Promise<Technician[]>;
  export function getTechnicianById(id: number): Promise<Technician>;
  export function createTechnician(technician: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>): Promise<Technician>;
  export function updateTechnician(id: number, technician: Partial<Technician>): Promise<Technician>;
  export function deleteTechnician(id: number): Promise<void>;
  export function getActiveTechnicians(): Promise<Technician[]>;
  export function getTechnicianSchedule(technicianId: number, date?: Date): Promise<WorkOrder[]>;
  export function getTechnicianWorkload(technicianId: number): Promise<{ 
    scheduled: number; 
    inProgress: number; 
    completed: number; 
    total: number;
  }>;
} 