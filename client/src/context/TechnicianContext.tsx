import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi } from '../services/api';
import { Technician } from '../types/technician';

// Define the context type
interface TechnicianContextType {
  technicians: Technician[];
  isLoading: boolean;
  error: Error | null;
  selectedTechnician: Technician | null;
  setSelectedTechnician: (technician: Technician | null) => void;
  createTechnician: (technician: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Technician>;
  updateTechnician: (id: number, technician: Partial<Technician>) => Promise<Technician>;
  deleteTechnician: (id: number) => Promise<void>;
  getActiveTechnicians: () => Technician[];
}

// Create the context with a default value
const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

// Create a provider component
interface TechnicianProviderProps {
  children: ReactNode;
}

export const TechnicianProvider: React.FC<TechnicianProviderProps> = ({ children }) => {
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const queryClient = useQueryClient();

  // Fetch technicians
  const { data: technicians = [], isLoading, error } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => technicianApi.getAll(),
  });

  // Create technician mutation
  const createMutation = useMutation({
    mutationFn: (newTechnician: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => 
      technicianApi.create(newTechnician),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  // Update technician mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, technician }: { id: number; technician: Partial<Technician> }) => 
      technicianApi.update(id, technician),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  // Delete technician mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      technicianApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  // Create technician function
  const createTechnician = async (technician: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createMutation.mutateAsync(technician);
  };

  // Update technician function
  const updateTechnician = async (id: number, technician: Partial<Technician>) => {
    return updateMutation.mutateAsync({ id, technician });
  };

  // Delete technician function
  const deleteTechnician = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  // Get active technicians function
  const getActiveTechnicians = () => {
    return technicians.filter(technician => technician.active);
  };

  // Context value
  const value: TechnicianContextType = {
    technicians,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    selectedTechnician,
    setSelectedTechnician,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    getActiveTechnicians,
  };

  return (
    <TechnicianContext.Provider value={value}>
      {children}
    </TechnicianContext.Provider>
  );
};

// Custom hook to use the technician context
export const useTechnicians = () => {
  const context = useContext(TechnicianContext);
  if (context === undefined) {
    throw new Error('useTechnicians must be used within a TechnicianProvider');
  }
  return context;
}; 