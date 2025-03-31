import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TechnicianForm from '../components/forms/TechnicianForm';
import { Profile } from '../types/profile';
import { useTechnicianProfiles } from '../context/TechnicianContext';

const AddTechnician = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createProfile } = useTechnicianProfiles();

  const createMutation = useMutation({
    mutationFn: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => 
      createProfile(data),
    onSuccess: (data) => {
      navigate(`/technicians/${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating profile:", error);
    }
  });

  const handleSubmit = (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Technician Profile
          </h2>
        </div>
      </div>

      {createMutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Error creating profile: {(createMutation.error as Error).message}
          </p>
        </div>
      )}

      <TechnicianForm 
        onSubmit={handleSubmit} 
        isLoading={createMutation.isLoading} 
      />
    </div>
  );
};

export default AddTechnician; 