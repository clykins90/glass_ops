import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { customerApi } from '../services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Helper function to get error message (assuming it exists or defined elsewhere, or define here)
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  } else if (typeof err === 'string') {
    return err;
  }
  return 'An unknown error occurred';
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: customerApi.getAll,
    refetchOnMount: true,
    staleTime: 0
  });
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer: any) => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.phone?.includes(searchTerm);
  });

  // Handle loading state
  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading customers...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="p-4 text-center text-destructive">Error loading customers: {getErrorMessage(error)}</div>;
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A list of all customers and leads in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => navigate('/customers/add')}>
            Add customer
          </Button>
        </div>
      </div>
      
      <div className="mt-6 mb-6 max-w-md">
        <Input 
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-hidden shadow ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10 sm:rounded-lg border border-border">
        {filteredCustomers.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No customers found matching your search.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sm:pl-6">Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="relative sm:pr-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-foreground">{customer.firstName} {customer.lastName}</div>
                    <div className="text-muted-foreground">{customer.city ? `${customer.city}, ${customer.state}` : '-'}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{customer.phone || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{customer.email || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${ 
                      customer.isLead ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {customer.isLead ? 'Lead' : 'Customer'}
                    </span>
                  </TableCell>
                  <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link to={`/customers/${customer.id}`} className="text-primary hover:text-primary/80">
                      View<span className="sr-only">, {customer.firstName} {customer.lastName}</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Customers; 