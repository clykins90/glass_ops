import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../services/api';
import { Vehicle } from '../types/vehicle';
import { useAuth } from './AuthContext';
import { isAuthError } from '../services/api';

// Define the context type
interface VehicleContextType {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: Error | null;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (id: number) => Promise<void>;
  getCustomerVehicles: (customerId: number) => Promise<Vehicle[]>;
}

// Create the context with a default value
const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

// Create a provider component
interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // Fetch vehicles
  const { data: vehiclesData = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const data = await vehicleApi.getAll();
      return data as Vehicle[];
    },
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
        console.error('Error fetching vehicles:', error);
      }
    }
  });

  // Type-safe access to vehicles
  const vehicles = vehiclesData as Vehicle[];
  
  // Create vehicle mutation
  const createMutation = useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = await vehicleApi.create(newVehicle);
      return result as Vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Update vehicle mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, vehicle }: { id: number; vehicle: Partial<Vehicle> }) => {
      const result = await vehicleApi.update(id, vehicle);
      return result as Vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Delete vehicle mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      vehicleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Create vehicle function
  const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
    if (!session) {
      throw new Error('No active session');
    }
    const result = await createMutation.mutateAsync(vehicle);
    return result as Vehicle;
  };

  // Update vehicle function
  const updateVehicle = async (id: number, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    if (!session) {
      throw new Error('No active session');
    }
    const result = await updateMutation.mutateAsync({ id, vehicle });
    return result as Vehicle;
  };

  // Delete vehicle function
  const deleteVehicle = async (id: number): Promise<void> => {
    if (!session) {
      throw new Error('No active session');
    }
    await deleteMutation.mutateAsync(id);
  };

  // Get customer vehicles function
  const getCustomerVehicles = async (customerId: number): Promise<Vehicle[]> => {
    if (!session) {
      return [];
    }
    const customerVehicles = vehicles.filter(vehicle => (vehicle as Vehicle).customerId === customerId);
    return customerVehicles as Vehicle[];
  };

  // Context value
  const value: VehicleContextType = {
    vehicles,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    selectedVehicle,
    setSelectedVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getCustomerVehicles,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

// Custom hook to use the vehicle context
export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
}; 