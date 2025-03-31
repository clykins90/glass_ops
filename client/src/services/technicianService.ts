import { technicianApi } from './api';
import { Profile } from '../types/profile';
import { Customer } from '../types/customer';

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
    const response = await technicianApi.getById(technicianId);
    // Filter schedule based on date range
    return response.schedule?.filter((item: TechnicianSchedule) => {
      const itemDate = new Date(item.start_time);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    }) || [];
  } catch (error) {
    console.error('Error fetching technician schedule:', error);
    throw error;
  }
}; 