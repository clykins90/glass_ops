import { workOrderApi } from './api';
import { WorkOrder } from '../types/workOrder';

export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  return workOrderApi.getAll();
};

export const getWorkOrderById = async (id: number): Promise<WorkOrder> => {
  return workOrderApi.getById(id);
};

export const createWorkOrder = async (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> => {
  return workOrderApi.create(workOrder);
};

export const updateWorkOrder = async (id: number, workOrder: Partial<WorkOrder>): Promise<WorkOrder> => {
  return workOrderApi.update(id, workOrder);
};

export const deleteWorkOrder = async (id: number): Promise<void> => {
  return workOrderApi.delete(id);
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  const workOrders = await workOrderApi.getAll();
  return workOrders.filter(wo => wo.status === status);
};

export const getWorkOrdersByDate = async (date: Date): Promise<WorkOrder[]> => {
  const workOrders = await workOrderApi.getAll();
  const dateString = date.toISOString().split('T')[0];
  
  return workOrders.filter(wo => {
    if (!wo.scheduledDate) return false;
    return wo.scheduledDate.toString().includes(dateString);
  });
};

export const getWorkOrdersByTechnician = async (technicianId: number): Promise<WorkOrder[]> => {
  const workOrders = await workOrderApi.getAll();
  return workOrders.filter(wo => wo.technicianId === technicianId);
}; 