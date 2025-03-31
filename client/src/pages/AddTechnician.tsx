import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TechnicianForm from '../components/forms/TechnicianForm';
import { Profile } from '../types/profile';
import { useTechnicianProfiles } from '../context/TechnicianContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

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
  });

  const handleSubmit = (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => {
    createMutation.mutate(data);
  };

  return (
    <div className="py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Technician Profile</CardTitle>
          <CardDescription>Create a new profile for a technician.</CardDescription>
        </CardHeader>
        <CardContent>
          {createMutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Creating Profile</AlertTitle>
              <AlertDescription>
                {(createMutation.error as Error).message || 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          )}

          <TechnicianForm 
            onSubmit={handleSubmit} 
            isLoading={createMutation.isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTechnician; 