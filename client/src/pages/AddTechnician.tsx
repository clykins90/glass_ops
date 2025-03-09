import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi } from '../services/api';
import TechnicianForm from '../components/forms/TechnicianForm';
import { Technician } from '../types/technician';

const AddTechnician = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => 
      technicianApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      navigate(`/technicians/${data.id}`);
    },
  });

  const handleSubmit = (data: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => {
    createMutation.mutate(data);
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Technician
          </h2>
        </div>
      </div>

      {createMutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Error creating technician: {(createMutation.error as Error).message}
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