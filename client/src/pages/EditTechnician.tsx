import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi } from '../services/api';
import TechnicianForm from '../components/forms/TechnicianForm';
import { Profile } from '../types/profile';
import { useTechnicianProfiles } from '../context/TechnicianContext';

const EditTechnician = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateProfile } = useTechnicianProfiles();

  // Fetch technician profile details
  const { 
    data: profile,
    isLoading, 
    error 
  } = useQuery<Profile>({
    queryKey: ['technician', id],
    queryFn: () => technicianApi.getById(id!),
    enabled: !!id,
  });

  // Update profile mutation using context function
  const updateMutation = useMutation({
    mutationFn: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => {
      if (!id) throw new Error('Profile ID is missing');
      return updateProfile(id, data);
    },
    onSuccess: (data) => {
      navigate(`/technicians/${id}`);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
    }
  });

  const handleSubmit = (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading technician profile details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading profile: {(error as Error).message}</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500">Technician profile not found</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Technician Profile: {profile.firstName} {profile.lastName}
          </h2>
        </div>
      </div>

      {updateMutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Error updating profile: {(updateMutation.error as Error).message}
          </p>
        </div>
      )}

      <TechnicianForm 
        initialData={profile} 
        onSubmit={handleSubmit} 
        isLoading={updateMutation.isLoading} 
      />
    </div>
  );
};

export default EditTechnician; 