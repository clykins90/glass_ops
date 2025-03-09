import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleForm from '../components/forms/VehicleForm';
import { useVehicles } from '../context/VehicleContext';

const AddVehicle = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { createVehicle } = useVehicles();
  
  const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
  
  const handleSuccess = () => {
    // Navigate back to the customer details page if we have a customer ID
    if (customerIdNum) {
      navigate(`/customers/${customerIdNum}`);
    } else {
      // Otherwise, navigate to the vehicles list
      navigate('/vehicles');
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Vehicle</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the details for the new vehicle.
        </p>
      </div>
      
      <VehicleForm 
        customerId={customerIdNum} 
        onSuccess={handleSuccess}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default AddVehicle; 