import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../services/api';
import { Vehicle } from '../types/vehicle';

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

  // Fetch vehicles
  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleApi.getAll(),
  });

  // Create vehicle mutation
  const createMutation = useMutation({
    mutationFn: (newVehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => 
      vehicleApi.create(newVehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // Update vehicle mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, vehicle }: { id: number; vehicle: Partial<Vehicle> }) => 
      vehicleApi.update(id, vehicle),
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
  const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(vehicle);
  };

  // Update vehicle function
  const updateVehicle = async (id: number, vehicle: Partial<Vehicle>) => {
    return updateMutation.mutateAsync({ id, vehicle });
  };

  // Delete vehicle function
  const deleteVehicle = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  // Get customer vehicles function
  const getCustomerVehicles = async (customerId: number) => {
    const customerVehicles = vehicles.filter(vehicle => vehicle.customerId === customerId);
    return customerVehicles;
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