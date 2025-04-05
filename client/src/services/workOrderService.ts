import { workOrderApi } from './api';
import { WorkOrder } from '../types/workOrder';

export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  return workOrderApi.getAll() as Promise<WorkOrder[]>;
};

export const getWorkOrderById = async (id: number): Promise<WorkOrder> => {
  return workOrderApi.getById(id) as Promise<WorkOrder>;
};

export const createWorkOrder = async (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> => {
  return workOrderApi.create(workOrder) as Promise<WorkOrder>;
};

export const updateWorkOrder = async (id: number, workOrder: Partial<WorkOrder>): Promise<WorkOrder> => {
  return workOrderApi.update(id, workOrder) as Promise<WorkOrder>;
};

export const deleteWorkOrder = async (id: number): Promise<void> => {
  return workOrderApi.delete(id);
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  const workOrders = await workOrderApi.getAll() as WorkOrder[];
  return workOrders.filter(wo => wo.status === status);
};

export const getWorkOrdersByDate = async (date: Date): Promise<WorkOrder[]> => {
  const workOrders = await workOrderApi.getAll() as WorkOrder[];
  const dateString = date.toISOString().split('T')[0];
  
  return workOrders.filter(wo => {
    if (!wo.scheduledDate) return false;
    return wo.scheduledDate.toString().includes(dateString);
  });
};

export const getWorkOrdersByTechnician = async (technicianId: number): Promise<WorkOrder[]> => {
  const workOrders = await workOrderApi.getAll() as WorkOrder[];
  return workOrders.filter(wo => Number(wo.technicianId) === technicianId);
}; 