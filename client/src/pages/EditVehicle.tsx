import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import VehicleForm from '../components/forms/VehicleForm';
import { vehicleApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Vehicle } from '@/types/vehicle'; // Import the correct Vehicle type

// Helper function (assuming defined globally or import)
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
};

const EditVehicle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Validate and parse ID
  let vehicleId: number | undefined = undefined;
  if (id) {
    vehicleId = parseInt(id, 10);
    if (isNaN(vehicleId)) {
      console.error("Invalid vehicle ID format in URL");
      // Potentially navigate to an error page or show an inline error
      // return <p>Invalid ID</p>; 
    }
  }

  // Fetch vehicle data
  const { 
    data: vehicle, 
    isLoading, 
    error,
    isError // Add isError for explicit check
  } = useQuery<Vehicle, Error>({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      if (!vehicleId) throw new Error('Vehicle ID is required');
      const data = await vehicleApi.getById(vehicleId);
      if (!data) throw new Error('Vehicle not found.');
      return data;
    },
    enabled: !!vehicleId && !isNaN(vehicleId as number), // Only run if vehicleId is a valid number
    retry: 1, // Retry once on error
  });
  
  const handleSuccess = () => {
    // Navigate back based on where the user likely came from
    if (vehicle?.customerId) {
      navigate(`/customers/${vehicle.customerId}`);
    } else if (vehicleId) {
       navigate(`/vehicles/${vehicleId}`);
    } else {
      navigate('/vehicles'); // Fallback
    }
  };

  const handleCancel = () => {
     // Navigate back based on where the user likely came from
     if (vehicle?.customerId) {
      navigate(`/customers/${vehicle.customerId}`);
    } else if (vehicleId) {
       navigate(`/vehicles/${vehicleId}`);
    } else {
      navigate(-1); // Go back if we can't determine context
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Error state
  if (isError || !vehicle) { // Use isError flag from useQuery and check vehicle data
    return (
      <div className="py-8 max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Vehicle</AlertTitle>
          <AlertDescription>{error ? getErrorMessage(error) : 'Vehicle data could not be retrieved.'}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/vehicles')} variant="outline">
          Back to Vehicles List
        </Button>
      </div>
    );
  }
  
  // Main content
  return (
     <div className="py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            Edit Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
          </CardTitle>
          <CardDescription>
            Update the vehicle details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleForm 
            initialData={vehicle} 
            onSuccess={handleSuccess}
            onCancel={handleCancel} // Use refined cancel handler
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditVehicle; 