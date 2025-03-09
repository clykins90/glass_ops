import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerForm from '../components/forms/CustomerForm';

const CustomerAdd: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate('/customers');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-600">Create a new customer or lead record</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <CustomerForm onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CustomerAdd; 