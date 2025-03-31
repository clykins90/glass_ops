import { technicianApi } from './api';
import { Profile } from '../types/profile';
import { WorkOrder } from '../types/workOrder';
import { workOrderApi } from './api'; // Assuming workOrderApi is defined in ./api

// Renamed functions to reflect Profile usage, but keeping API mapping

export const getTechnicianProfiles = async (): Promise<Profile[]> => {
  // technicianApi.getAll() now returns profiles with role 'technician'
  const result = await technicianApi.getAll();
  return result as Profile[]; 
};

export const getTechnicianProfileById = async (id: string): Promise<Profile> => {
  const result = await technicianApi.getById(id);
  return result as Profile;
};

// Create function still takes partial data, backend sets role/company
export const createTechnicianProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>): Promise<Profile> => {
  const result = await technicianApi.create(profileData);
  return result as Profile;
};

export const updateTechnicianProfile = async (id: string, profileData: Partial<Profile>): Promise<Profile> => {
  // Remove fields that shouldn't be updated via this service
  delete profileData.role;
  delete profileData.company_id;
  delete profileData.id;
  delete profileData.createdAt;
  delete profileData.updatedAt;
  // Potentially remove email if it should be updated via auth?
  
  const result = await technicianApi.update(id, profileData);
  return result as Profile;
};

export const deleteTechnicianProfile = async (id: string): Promise<void> => {
  return technicianApi.delete(id);
};

// This function might need removal/rework depending on how 'active' is handled in profiles
export const getActiveTechnicianProfiles = async (): Promise<Profile[]> => {
  const profiles = await technicianApi.getAll();
  // TODO: Filter based on actual status field if it exists, or remove this concept
  // Example: return profiles.filter(p => p.status === 'active');
  return profiles as Profile[]; // Temporary: return all fetched technician profiles
};

// Fetch work orders specifically assigned to a technician profile ID
export const getWorkOrdersByTechnician = async (technicianProfileId: string): Promise<WorkOrder[]> => {
  const allWorkOrders = await workOrderApi.getAll();
  // TODO: This should ideally filter via API query if possible?
  // Or ensure the work order type includes assigned_technician_id
  return (allWorkOrders as any[]).filter(wo => wo.assigned_technician_id === technicianProfileId) as WorkOrder[];
};

// Function to get schedule - uses getWorkOrdersByTechnician and filters dates locally
export const getTechnicianSchedule = async (technicianProfileId: string): Promise<WorkOrder[]> => {
  const workOrders = await getWorkOrdersByTechnician(technicianProfileId);
  // TODO: Filter by date range and status (scheduled/in-progress)
  // This logic might need refinement based on WorkOrder type and requirements
  return workOrders.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled');
};

// Workload calculation - uses getWorkOrdersByTechnician
export const getTechnicianWorkload = async (technicianProfileId: string): Promise<{ 
  scheduled: number; 
  inProgress: number; 
  completed: number; 
  total: number;
}> => {
  const workOrders = await getWorkOrdersByTechnician(technicianProfileId);
  
  const scheduled = workOrders.filter(wo => wo.status === 'scheduled').length;
  const inProgress = workOrders.filter(wo => wo.status === 'in-progress').length;
  const completed = workOrders.filter(wo => wo.status === 'completed').length;
  
  return {
    scheduled,
    inProgress,
    completed,
    total: workOrders.length
  };
}; 