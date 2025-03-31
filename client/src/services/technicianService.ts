import { technicianApi } from './api';
import { Profile } from '../types/profile';
import { Customer } from '../types/customer';
import { WorkOrder } from '../types/workOrder';
import { getWorkOrdersByTechnician } from './profileService';

export interface TechnicianSchedule {
  id: string;
  technician_id: string;
  work_order_id: string;
  start_time: string;
  end_time: string;
  
  // Additional properties used in Schedule.tsx
  technicianId?: string;
  scheduledDate?: string;
  glassLocation?: string;
  status?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
}

export const getTechnicians = async (): Promise<Profile[]> => {
  try {
    return await technicianApi.getAll();
  } catch (error) {
    console.error('Error fetching technicians:', error);
    throw error;
  }
};

export const getTechnicianSchedule = async (technicianId: string, startDate: string, endDate: string): Promise<TechnicianSchedule[]> => {
  try {
    const workOrders: WorkOrder[] = await getWorkOrdersByTechnician(technicianId);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredWorkOrders = workOrders.filter(wo => {
      if (!wo.scheduledDate) return false;
      const itemDate = new Date(wo.scheduledDate);
      return itemDate >= start && itemDate <= end;
    });

    // Map filtered WorkOrders to the TechnicianSchedule structure
    return filteredWorkOrders.map(wo => {
      // Ensure the dates used are strings in the expected format
      const startTimeStr = typeof wo.scheduledDate === 'string' 
                          ? wo.scheduledDate 
                          : wo.scheduledDate instanceof Date 
                          ? wo.scheduledDate.toISOString() 
                          : new Date().toISOString(); // Fallback
      const endTimeStr = startTimeStr; // Assuming schedule item corresponds to the work order date for now

      return {
        id: wo.id.toString(), // Use work order ID as string for the schedule item ID
        technician_id: technicianId,
        work_order_id: wo.id.toString(), // Convert WorkOrder ID number to string
        start_time: startTimeStr, // Ensure this is a string
        end_time: endTimeStr,     // Ensure this is a string (adjust if WO has duration/end time)
        
        // Add other fields from WorkOrder if needed for TechnicianSchedule interface
        technicianId: technicianId,
        scheduledDate: startTimeStr, // Keep consistent
        glassLocation: wo.glassLocation,
        status: wo.status,
        // Map customer details if available on WorkOrder type and needed
        // customer: wo.customer ? { firstName: wo.customer.firstName, lastName: wo.customer.lastName } : undefined,
      };
    });

  } catch (error) {
    console.error('Error fetching technician schedule:', error);
    throw error;
  }
}; 