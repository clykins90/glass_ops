import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Use the vehicleApi service directly
const fetchVehicles = () => vehicleApi.getAll();

// Helper function to get error message
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  } else if (typeof err === 'string') {
    return err;
  }
  return 'An unknown error occurred';
};

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles
  });

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter((vehicle: any) => {
    const makeModel = `${vehicle.make} ${vehicle.model}`.toLowerCase();
    return makeModel.includes(searchTerm.toLowerCase()) || 
           vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vehicle.vinNumber?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Handle loading state
  if (isLoading) {
    return <div className="text-center py-8">Loading vehicles...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="text-center py-8 text-red-500 dark:text-red-400">Error loading vehicles: {getErrorMessage(error)}</div>;
  }

  // Render content if no loading or error
  return (
    <div>
      {/* Header and Add Button */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Vehicles</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A list of all vehicles in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => navigate('/vehicles/new')}>
            Add vehicle
          </Button>
        </div>
      </div>
      
      {/* Search Input */}
      <div className="mt-6 mb-6 max-w-md">
        <Input 
          type="text"
          placeholder="Search by make, model, license, or VIN..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Vehicles Table or No Results Message */}
      <div className="mt-4 overflow-hidden shadow ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10 sm:rounded-lg">
        {filteredVehicles.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No vehicles match your search or none exist.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sm:pl-6">Year/Make/Model</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead className="relative sm:pr-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle: any) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                    <div className="text-muted-foreground">{vehicle.color || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {vehicle.customer ? (
                      <Link 
                        to={`/customers/${vehicle.customerId}`}
                        className="text-primary hover:text-primary/80"
                      >
                        {vehicle.customer.firstName} {vehicle.customer.lastName}
                      </Link>
                    ) : (
                      'Not assigned'
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{vehicle.licensePlate || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{vehicle.vinNumber || '-'}</TableCell>
                  <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link 
                      to={`/vehicles/${vehicle.id}`} 
                      className="text-primary hover:text-primary/80"
                    >
                      View<span className="sr-only">, {vehicle.year} {vehicle.make} {vehicle.model}</span>
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

export default Vehicles; 