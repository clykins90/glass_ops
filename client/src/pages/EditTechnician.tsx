import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi } from '../services/api';
import TechnicianForm from '../components/forms/TechnicianForm';
import { Technician } from '../types/technician';

const EditTechnician = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch technician details
  const { 
    data: technician, 
    isLoading, 
    error 
  } = useQuery<Technician>({
    queryKey: ['technician', id],
    queryFn: () => technicianApi.getById(Number(id)),
    enabled: !!id,
  });

  // Update technician mutation
  const updateMutation = useMutation({
    mutationFn: (data: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => 
      technicianApi.update(Number(id), data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      queryClient.invalidateQueries({ queryKey: ['technician', id] });
      navigate(`/technicians/${id}`);
    },
  });

  const handleSubmit = (data: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading technician details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading technician: {(error as Error).message}</div>;
  }

  if (!technician) {
    return <div className="p-8 text-center text-red-500">Technician not found</div>;
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Technician: {technician.firstName} {technician.lastName}
          </h2>
        </div>
      </div>

      {updateMutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Error updating technician: {(updateMutation.error as Error).message}
          </p>
        </div>
      )}

      <TechnicianForm 
        initialData={technician}
        onSubmit={handleSubmit} 
        isLoading={updateMutation.isLoading} 
      />
    </div>
  );
};

export default EditTechnician; 