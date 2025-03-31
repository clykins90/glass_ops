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

declare module '../services/profileService' {
  import { Profile } from '../types/profile';
  import { WorkOrder } from '../types/workOrder';
  
  export function getTechnicianProfiles(): Promise<Profile[]>;
  export function getTechnicianProfileById(id: string): Promise<Profile>;
  export function createTechnicianProfile(profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>): Promise<Profile>;
  export function updateTechnicianProfile(id: string, profileData: Partial<Profile>): Promise<Profile>;
  export function deleteTechnicianProfile(id: string): Promise<void>;
  export function getActiveTechnicianProfiles(): Promise<Profile[]>;
  export function getTechnicianSchedule(technicianProfileId: string, date?: Date): Promise<WorkOrder[]>;
  export function getTechnicianWorkload(technicianProfileId: string): Promise<{ 
    scheduled: number; 
    inProgress: number; 
    completed: number; 
    total: number;
  }>;
} 