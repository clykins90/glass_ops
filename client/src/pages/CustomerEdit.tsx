import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerForm from '../components/forms/CustomerForm';
import { Customer } from '../types/customer';
import { customerApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true); // Ensure loading is true at start
      setError(null); // Clear previous errors
      try {
        if (!id) {
          throw new Error('Customer ID is required');
        }
        const customerId = parseInt(id, 10);
        if (isNaN(customerId)) {
          throw new Error('Invalid Customer ID format');
        }
        
        const data = await customerApi.getById(customerId);
        if (!data) { // Handle case where API returns null/undefined for not found
          throw new Error('Customer not found.');
        }
        setCustomer(data);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customer. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id]);
  
  const handleCancel = () => {
    // Navigate back to customer details or list if ID is somehow lost
    navigate(id ? `/customers/${id}` : '/customers');
  };
  
  const handleSuccess = (updatedCustomer: Customer) => {
    navigate(`/customers/${updatedCustomer.id}`);
  };
  
  // Loading state using themed components
  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Error state using themed components
  if (error || !customer) { // Check !customer again in case API returned null
    return (
      <div className="py-8 max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Customer</AlertTitle>
          <AlertDescription>{error || 'Customer data could not be retrieved.'}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/customers')} variant="outline">
          Back to Customers List
        </Button>
      </div>
    );
  }
  
  // Main content using Card and themed form
  return (
    <div className="py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Customer</CardTitle>
          <CardDescription>
            Editing {customer.firstName} {customer.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm
            initialData={customer}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerEdit; 