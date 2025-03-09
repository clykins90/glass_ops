import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';

const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicleId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: () => vehicleApi.delete(vehicleId),
    onSuccess: (_, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['customerVehicles'] });
      
      // Navigate back to the customer page if we have a customer ID
      if (vehicle?.customerId) {
        navigate(`/customers/${vehicle.customerId}`);
      } else {
        navigate('/vehicles');
      }
    }
  });

  // Fetch vehicle details
  const { 
    data: vehicle, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => vehicleApi.getById(vehicleId),
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading vehicle details...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading vehicle details. 
        <button 
          onClick={() => navigate('/vehicles')}
          className="ml-2 text-indigo-600 hover:text-indigo-900"
        >
          Return to vehicles
        </button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-4 text-center">
        Vehicle not found.
        <button 
          onClick={() => navigate('/vehicles')}
          className="ml-2 text-indigo-600 hover:text-indigo-900"
        >
          Return to vehicles
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with actions */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Vehicle ID: {vehicle.id}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back to Vehicles
          </button>
          {vehicle.customerId && (
            <button
              type="button"
              onClick={() => navigate(`/customers/${vehicle.customerId}`)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              View Owner
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Vehicle
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Vehicle
          </button>
        </div>
      </div>

      {/* Vehicle information */}
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Vehicle Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Details about the vehicle.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Make & Model</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {vehicle.make} {vehicle.model}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Year</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {vehicle.year}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Color</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {vehicle.color || 'Not specified'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">VIN Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {vehicle.vinNumber || 'Not provided'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">License Plate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {vehicle.licensePlate || 'Not provided'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Glass Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {vehicle.glassType || 'Not specified'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
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
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {vehicle.notes || 'No notes'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(vehicle.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Work Orders section - could be added in the future */}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Vehicle"
        message={`Are you sure you want to delete this ${vehicle.year} ${vehicle.make} ${vehicle.model}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => deleteVehicleMutation.mutate()}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteVehicleMutation.isLoading}
      />
    </div>
  );
};

export default VehicleDetails; 