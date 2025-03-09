import { technicianApi } from './api';
import { Technician } from '../types/technician';
import { WorkOrder } from '../types/workOrder';
import { getWorkOrdersByTechnician } from './workOrderService';

export const getTechnicians = async (): Promise<Technician[]> => {
  return technicianApi.getAll();
};

export const getTechnicianById = async (id: number): Promise<Technician> => {
  return technicianApi.getById(id);
};

export const createTechnician = async (technician: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>): Promise<Technician> => {
  return technicianApi.create(technician);
};

export const updateTechnician = async (id: number, technician: Partial<Technician>): Promise<Technician> => {
  return technicianApi.update(id, technician);
};

export const deleteTechnician = async (id: number): Promise<void> => {
  return technicianApi.delete(id);
};

export const getActiveTechnicians = async (): Promise<Technician[]> => {
  const technicians = await technicianApi.getAll();
  return technicians.filter(tech => tech.active);
};

export const getTechnicianSchedule = async (technicianId: number, date?: Date): Promise<WorkOrder[]> => {
  const workOrders = await getWorkOrdersByTechnician(technicianId);
  
  if (!date) {
    return workOrders;
  }
  
  const dateString = date.toISOString().split('T')[0];
  return workOrders.filter(wo => {
    if (!wo.scheduledDate) return false;
    return wo.scheduledDate.toString().includes(dateString);
  });
};

export const getTechnicianWorkload = async (technicianId: number): Promise<{ 
  scheduled: number; 
  inProgress: number; 
  completed: number; 
  total: number;
}> => {
  const workOrders = await getWorkOrdersByTechnician(technicianId);
  
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