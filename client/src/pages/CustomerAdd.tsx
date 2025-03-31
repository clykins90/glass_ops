import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerForm from '../components/forms/CustomerForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CustomerAdd: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate('/customers');
  };
  
  return (
    <div className="py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Customer</CardTitle>
          <CardDescription>Create a new customer or lead record</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAdd; 