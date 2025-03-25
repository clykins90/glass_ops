import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

// Use the vehicleApi service directly
const fetchVehicles = () => vehicleApi.getAll();

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
  
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Vehicles</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all vehicles in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/vehicles/new')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add vehicle
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="mt-6 mb-4">
        <div className="relative rounded-md shadow-sm max-w-md">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Vehicles table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {isLoading ? (
                <div className="p-4 text-center">Loading vehicles...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">Error loading vehicles</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-4 text-center">No vehicles found</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Vehicle
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Owner
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        License Plate
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        VIN
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredVehicles.map((vehicle: any) => (
                      <tr key={vehicle.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <div className="text-gray-500">{vehicle.color}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {vehicle.customer ? (
                            <Link 
                              to={`/customers/${vehicle.customerId}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {vehicle.customer.firstName} {vehicle.customer.lastName}
                            </Link>
                          ) : (
                            'Not assigned'
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vehicle.licensePlate || '-'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vehicle.vinNumber || '-'}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link to={`/vehicles/${vehicle.id}`} className="text-indigo-600 hover:text-indigo-900">
                            View<span className="sr-only">, {vehicle.year} {vehicle.make} {vehicle.model}</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles; 