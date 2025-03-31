import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleForm from '../components/forms/VehicleForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AddVehicle = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const customerIdNum = customerId ? parseInt(customerId, 10) : undefined;
  
  if (customerId && isNaN(customerIdNum as number)) {
     console.error("Invalid customer ID in URL");
  }
  
  const handleSuccess = () => {
    if (customerIdNum) {
      navigate(`/customers/${customerIdNum}`);
    } else {
      navigate('/vehicles');
    }
  };
  
  return (
    <div className="py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Vehicle</CardTitle>
          <CardDescription>
            Enter the details for the new vehicle {customerIdNum ? `for customer #${customerIdNum}` : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleForm 
            customerId={customerIdNum} 
            onSuccess={handleSuccess}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVehicle; 