import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrderApi } from '../services/api';
import { WorkOrder } from '../types/workOrder';
import { useAuth } from './AuthContext';
import { isAuthError } from '../services/api';

// Define the context type
interface WorkOrderContextType {
  workOrders: WorkOrder[];
  isLoading: boolean;
  error: Error | null;
  selectedWorkOrder: WorkOrder | null;
  setSelectedWorkOrder: (workOrder: WorkOrder | null) => void;
  createWorkOrder: (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkOrder>;
  updateWorkOrder: (id: number, workOrder: Partial<WorkOrder>) => Promise<WorkOrder>;
  deleteWorkOrder: (id: number) => Promise<void>;
  updateWorkOrderStatus: (id: number, status: string) => Promise<WorkOrder>;
  assignTechnician: (id: number, technicianId: number) => Promise<WorkOrder>;
}

// Create the context with a default value
const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined);

// Create a provider component
interface WorkOrderProviderProps {
  children: ReactNode;
}

export const WorkOrderProvider: React.FC<WorkOrderProviderProps> = ({ children }) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // Fetch work orders
  const { data: workOrders = [], isLoading, error } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => workOrderApi.getAll(),
    // Only run query if user is authenticated
    enabled: !!session,
    // Don't retry on authentication errors
    retry: (count, error) => {
      if (isAuthError(error)) return false;
      return count < 3; // Default retry logic for other errors
    },
    // Suppress console errors for auth errors
    onError: (error) => {
      if (!isAuthError(error)) {
        console.error('Error fetching work orders:', error);
      }
    }
  });

  // Create work order mutation
  const createMutation = useMutation({
    mutationFn: (newWorkOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => 
      workOrderApi.create(newWorkOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    },
  });

  // Update work order mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, workOrder }: { id: number; workOrder: Partial<WorkOrder> }) => 
      workOrderApi.update(id, workOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    },
  });

  // Delete work order mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      workOrderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    },
  });

  // Create work order function
  const createWorkOrder = async (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!session) {
      throw new Error('No active session');
    }
    return createMutation.mutateAsync(workOrder);
  };

  // Update work order function
  const updateWorkOrder = async (id: number, workOrder: Partial<WorkOrder>) => {
    if (!session) {
      throw new Error('No active session');
    }
    return updateMutation.mutateAsync({ id, workOrder });
  };

  // Delete work order function
  const deleteWorkOrder = async (id: number) => {
    if (!session) {
      throw new Error('No active session');
    }
    await deleteMutation.mutateAsync(id);
  };

  // Update work order status function
  const updateWorkOrderStatus = async (id: number, status: string) => {
    if (!session) {
      throw new Error('No active session');
    }
    return updateMutation.mutateAsync({ id, workOrder: { status } });
  };

  // Assign technician function
  const assignTechnician = async (id: number, technicianId: number) => {
    if (!session) {
      throw new Error('No active session');
    }
    return updateMutation.mutateAsync({ id, workOrder: { technicianId } });
  };

  // Context value
  const value: WorkOrderContextType = {
    workOrders,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    selectedWorkOrder,
    setSelectedWorkOrder,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    updateWorkOrderStatus,
    assignTechnician,
  };

  return (
    <WorkOrderContext.Provider value={value}>
      {children}
    </WorkOrderContext.Provider>
  );
};

// Custom hook to use the work order context
export const useWorkOrders = () => {
  const context = useContext(WorkOrderContext);
  if (context === undefined) {
    throw new Error('useWorkOrders must be used within a WorkOrderProvider');
  }
  return context;
}; 