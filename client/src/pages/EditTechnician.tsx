import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { technicianApi } from '../services/api';
import TechnicianForm from '../components/forms/TechnicianForm';
import { Profile } from '../types/profile';
import { useTechnicianProfiles } from '../context/TechnicianContext';
// Import themed components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button'; // Added Button import
import { AlertCircle, Loader2 } from 'lucide-react';

// Helper function (assuming defined globally or import)
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
};

const EditTechnician = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProfile } = useTechnicianProfiles();

  // Fetch technician profile details
  const { 
    data: profile,
    isLoading, 
    error,
    isError // Add isError
  } = useQuery<Profile, Error>({
    queryKey: ['technician', id], // Use 'technician' key
    queryFn: async () => { // Make async
      if (!id) throw new Error('Technician ID is required');
      const data = await technicianApi.getById(id); // Removed ! assertion
      if (!data) throw new Error('Technician profile not found.');
      return data;
    },
    enabled: !!id,
    retry: 1, // Add retry
  });

  // Update profile mutation using context function
  const updateMutation = useMutation({
    mutationFn: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => {
      if (!id) throw new Error('Profile ID is missing');
      return updateProfile(id, data); // updateProfile comes from context
    },
    onSuccess: () => {
      // Consider invalidating query if context doesn't handle it
      // queryClient.invalidateQueries({ queryKey: ['technician', id] });
      // queryClient.invalidateQueries({ queryKey: ['technicianProfiles'] });
      navigate(`/technicians/${id}`); // Navigate to detail page on success
    },
    // Error is handled via updateMutation.isError below
  });

  const handleSubmit = (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'company_id' | 'role'>) => {
    updateMutation.mutate(data);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Fetch Error State
  if (isError || !profile) { // Check isError flag
    return (
      <div className="py-8 max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>{error ? getErrorMessage(error) : 'Profile data could not be retrieved.'}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/technicians')} variant="outline">
          Back to Technicians List
        </Button>
      </div>
    );
  }

  // Main Content
  return (
    <div className="py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Technician Profile</CardTitle>
          <CardDescription>
            Editing {profile.firstName} {profile.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display mutation error */}
          {updateMutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Updating Profile</AlertTitle>
              <AlertDescription>
                {getErrorMessage(updateMutation.error)}
              </AlertDescription>
            </Alert>
          )}

          <TechnicianForm 
            initialData={profile} 
            onSubmit={handleSubmit} 
            isLoading={updateMutation.isLoading} 
            error={null} // Clear form-level error if mutation fails (handled above)
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTechnician; 