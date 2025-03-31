import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi } from '../services/api';
import { Profile } from '../types/profile';
import { useAuth } from './AuthContext';
import { isAuthError } from '../services/api';

// Define the context type using Profile
interface TechnicianContextType {
  technicianProfiles: Profile[];
  isLoading: boolean;
  error: Error | null;
  selectedProfile: Profile | null;
  setSelectedProfile: (profile: Profile | null) => void;
  createProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => Promise<Profile>;
  updateProfile: (id: string, profile: Partial<Profile>) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;
  getActiveTechnicianProfiles: () => Profile[];
}

// Create the context with a default value
const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

// Create a provider component
interface TechnicianProviderProps {
  children: ReactNode;
}

export const TechnicianProvider: React.FC<TechnicianProviderProps> = ({ children }) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // Fetch technician profiles
  const { 
    data: techProfiles = [], 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const data = await technicianApi.getAll();
      return data as Profile[];
    },
    enabled: !!session,
    retry: (failureCount, error) => {
      if (isAuthError(error)) return false;
      return failureCount < 3;
    },
    onError: (error) => {
      if (!isAuthError(error)) {
        console.error('Error fetching technicians:', error);
      }
    }
  });

  // Type-safe access to profiles
  const technicianProfiles = techProfiles as Profile[];
  const error = queryError as Error | null;

  // Create profile mutation
  const createMutation = useMutation({
    mutationFn: async (newProfileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => {
      const result = await technicianApi.create(newProfileData);
      return result as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: Partial<Profile> }) => {
      const result = await technicianApi.update(id, profile);
      return result as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  // Delete profile mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => technicianApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  // Create profile function
  const createProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>): Promise<Profile> => {
    if (!session) {
      throw new Error('No active session');
    }
    const result = await createMutation.mutateAsync(profileData);
    return result as Profile;
  };

  // Update profile function
  const updateProfile = async (id: string, profile: Partial<Profile>): Promise<Profile> => {
    if (!session) {
      throw new Error('No active session');
    }
    const result = await updateMutation.mutateAsync({ id, profile });
    return result as Profile;
  };

  // Delete profile function
  const deleteProfile = async (id: string): Promise<void> => {
    if (!session) {
      throw new Error('No active session');
    }
    await deleteMutation.mutateAsync(id);
  };

  // Get active technician profiles function
  const getActiveTechnicianProfiles = (): Profile[] => {
    if (!session) {
      return [];
    }
    return technicianProfiles;
  };

  // Context value
  const value: TechnicianContextType = {
    technicianProfiles,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    selectedProfile,
    setSelectedProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getActiveTechnicianProfiles,
  };

  return (
    <TechnicianContext.Provider value={value}>
      {children}
    </TechnicianContext.Provider>
  );
};

// Custom hook to use the profile context
export const useTechnicianProfiles = () => {
  const context = useContext(TechnicianContext);
  if (context === undefined) {
    throw new Error('useTechnicianProfiles must be used within a TechnicianProvider');
  }
  return context;
}; 