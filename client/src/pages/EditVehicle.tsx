import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import VehicleForm from '../components/forms/VehicleForm';
import { vehicleApi } from '../services/api';

const EditVehicle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicleId = parseInt(id || '0', 10);
  
  // Fetch vehicle data
  const { 
    data: vehicle, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehicleApi.getById(vehicleId),
    enabled: !!vehicleId,
  });
  
  const handleSuccess = () => {
    // Navigate back to the vehicle details page or customer details page
    if (vehicle?.customerId) {
      navigate(`/customers/${vehicle.customerId}`);
    } else {
      navigate(`/vehicles/${vehicleId}`);
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading vehicle details...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading vehicle details. 
        <button 
          onClick={() => navigate('/vehicles')}
          className="ml-2 text-indigo-600 hover:text-indigo-900"
        >
          Return to vehicles
        </button>
      </div>
    );
  }
  
  if (!vehicle) {
    return (
      <div className="p-4 text-center">
        Vehicle not found.
        <button 
          onClick={() => navigate('/vehicles')}
          className="ml-2 text-indigo-600 hover:text-indigo-900"
        >
          Return to vehicles
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the vehicle details.
        </p>
      </div>
      
      <VehicleForm 
        initialData={vehicle} 
        onSuccess={handleSuccess}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default EditVehicle; 