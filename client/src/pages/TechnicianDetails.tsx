import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technicianApi, workOrderApi } from '../services/api';
import { Technician } from '../types/technician';
import ConfirmationDialog from '../components/ConfirmationDialog';

const TechnicianDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch technician details
  const { 
    data: technician, 
    isLoading, 
    error 
  } = useQuery<Technician>({
    queryKey: ['technician', id],
    queryFn: () => technicianApi.getById(Number(id)),
    enabled: !!id,
  });

  // Fetch technician's work orders
  const { 
    data: workOrders, 
    isLoading: isLoadingWorkOrders 
  } = useQuery({
    queryKey: ['technician-workorders', id],
    queryFn: () => workOrderApi.getAll().then(orders => 
      orders.filter(order => order.technicianId === Number(id))
    ),
    enabled: !!id,
  });

  // Delete technician mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => technicianApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      navigate('/technicians');
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (id) {
      deleteMutation.mutate(Number(id));
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading technician details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading technician: {(error as Error).message}</div>;
  }

  if (!technician) {
    return <div className="p-8 text-center text-red-500">Technician not found</div>;
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {technician.firstName} {technician.lastName}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {technician.phone}
            </div>
            {technician.email && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {technician.email}
              </div>
            )}
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                <path d="M10 4a1 1 0 100 2 1 1 0 000-2zm0 10a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              Status: <span className={`ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                technician.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {technician.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/technicians/${id}/edit`)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Technician Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and skills.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {technician.firstName} {technician.lastName}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{technician.phone}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{technician.email || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Skills</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-1">
                  {technician.skills.length > 0 ? (
                    technician.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No skills listed</span>
                  )}
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {technician.notes || 'No notes available'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Work Orders</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Work orders assigned to this technician.
          </p>
        </div>
        <div className="border-t border-gray-200">
          {isLoadingWorkOrders ? (
            <div className="p-4 text-center">Loading work orders...</div>
          ) : workOrders && workOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Scheduled Date</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {workOrders.map((workOrder) => (
                    <tr key={workOrder.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        #{workOrder.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {workOrder.customer?.firstName} {workOrder.customer?.lastName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {workOrder.serviceType} - {workOrder.glassLocation}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          workOrder.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : workOrder.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : workOrder.status === 'scheduled'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workOrder.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {workOrder.scheduledDate 
                          ? new Date(workOrder.scheduledDate).toLocaleDateString() 
                          : 'Not scheduled'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No work orders assigned to this technician.
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Technician"
        message={`Are you sure you want to delete ${technician.firstName} ${technician.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default TechnicianDetails; 