import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../services/api';
import { Customer } from '../types/customer';
import { useAuth } from './AuthContext';
import { isAuthError } from '../services/api';

// Define the context type
interface CustomerContextType {
  customers: Customer[];
  isLoading: boolean;
  error: Error | null;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: number) => Promise<void>;
}

// Create the context with a default value
const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Create a provider component
interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();
  
  // Fetch customers - specify types explicitly
  const { data: customers = [], isLoading, error } = useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => { // Explicit async/Promise return type
      return customerApi.getAll();
    },
    // Don't run the query if we're not authenticated
    enabled: !!session,
    // Don't throw errors for failed requests due to auth
    retry: (count, error) => {
      if (isAuthError(error)) return false;
      return count < 3; // Default retry logic for other errors
    },
    // Silence the error in the console when it's an authentication error
    onError: (error) => {
      if (!isAuthError(error)) {
        console.error('Error fetching customers:', error);
      }
    }
  });

  // Create customer mutation - specify types explicitly
  const createMutation = useMutation<Customer, Error, Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (newCustomer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => { // Explicit async/Promise return type
      return customerApi.create(newCustomer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  // Update customer mutation - specify types explicitly
  const updateMutation = useMutation<Customer, Error, { id: number; customer: Partial<Customer> }>({
    mutationFn: async ({ id, customer }: { id: number; customer: Partial<Customer> }): Promise<Customer> => { // Explicit async/Promise return type
      return customerApi.update(id, customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  // Delete customer mutation - specify types explicitly
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number): Promise<void> => { // Explicit async/Promise return type
      await customerApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  // Create customer function
  const createCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!session) throw new Error('No active session');
    return createMutation.mutateAsync(customer);
  };

  // Update customer function
  const updateCustomer = async (id: number, customer: Partial<Customer>) => {
    if (!session) throw new Error('No active session');
    return updateMutation.mutateAsync({ id, customer });
  };

  // Delete customer function
  const deleteCustomer = async (id: number) => {
    if (!session) throw new Error('No active session');
    await deleteMutation.mutateAsync(id);
  };

  // Context value
  const value: CustomerContextType = {
    customers, // Type should now be correct
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    selectedCustomer,
    setSelectedCustomer,
    createCustomer, // Type should now be correct
    updateCustomer, // Type should now be correct
    deleteCustomer, // Type should now be correct
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

// Custom hook to use the customer context
export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}; 