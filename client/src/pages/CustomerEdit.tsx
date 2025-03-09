import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerForm from '../components/forms/CustomerForm';
import { Customer } from '../types/customer';
import { customerApi } from '../services/api';

const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        if (!id) {
          throw new Error('Customer ID is required');
        }
        
        const data = await customerApi.getById(parseInt(id, 10));
        setCustomer(data);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Failed to load customer. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id]);
  
  const handleCancel = () => {
    navigate(`/customers/${id}`);
  };
  
  const handleSuccess = (updatedCustomer: Customer) => {
    navigate(`/customers/${updatedCustomer.id}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <p className="text-red-700">{error || 'Customer not found'}</p>
        </div>
        <button
          onClick={() => navigate('/customers')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Customers
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
        <p className="text-gray-600">
          Editing {customer.firstName} {customer.lastName}
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <CustomerForm
          initialData={customer}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default CustomerEdit; 