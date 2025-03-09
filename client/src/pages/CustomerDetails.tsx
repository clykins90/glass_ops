import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: () => customerApi.delete(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    }
  });

  // Fetch customer details
  const { 
    data: customer, 
    isLoading: customerLoading, 
    error: customerError 
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getById(customerId),
    enabled: !!customerId,
  });

  // Fetch customer vehicles
  const { 
    data: vehicles = [], 
    isLoading: vehiclesLoading 
  } = useQuery({
    queryKey: ['customerVehicles', customerId],
    queryFn: () => customerApi.getVehicles(customerId),
    enabled: !!customerId,
  });

  // Fetch customer work orders
  const { 
    data: workOrders = [], 
    isLoading: workOrdersLoading 
  } = useQuery({
    queryKey: ['customerWorkOrders', customerId],
    queryFn: () => customerApi.getWorkOrders(customerId),
    enabled: !!customerId,
  });

  if (customerLoading) {
    return <div className="p-4 text-center">Loading customer details...</div>;
  }

  if (customerError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading customer details. 
        <button 
          onClick={() => navigate('/customers')}
          className="ml-2 text-indigo-600 hover:text-indigo-900"
        >
          Return to customers
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-4 text-center">
        Customer not found.
        <button 
          onClick={() => navigate('/customers')}
          className="ml-2 text-indigo-600 hover:text-indigo-900"
        >
          Return to customers
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
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Customer ID: {customer.id}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back to Customers
          </button>
          <button
            type="button"
            onClick={() => navigate(`/customers/${customer.id}/edit`)}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Customer
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Customer
          </button>
        </div>
      </div>

      {/* Customer information */}
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and contact information.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {customer.firstName} {customer.lastName}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {customer.email || 'Not provided'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {customer.phone}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {customer.address ? (
                  <>
                    {customer.address}<br />
                    {customer.city}, {customer.state} {customer.zipCode}
                  </>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  customer.isLead ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {customer.isLead ? 'Lead' : 'Customer'}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Source</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {customer.source || 'Not specified'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {customer.notes || 'No notes'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(customer.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Vehicles section */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Vehicles</h2>
          <button
            type="button"
            onClick={() => navigate(`/customers/${customer.id}/vehicles/new`)}
            className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0"
          >
            Add Vehicle
          </button>
        </div>
        
        {vehiclesLoading ? (
          <div className="mt-4 p-4 text-center">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="mt-4 rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500">
            No vehicles found for this customer.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Make & Model
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Year
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    VIN
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Glass Type
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {vehicles.map((vehicle: any) => (
                  <tr key={vehicle.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                      <div className="text-gray-500">{vehicle.color || 'N/A'}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vehicle.year}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {vehicle.vinNumber || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {vehicle.glassType || 'N/A'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link to={`/vehicles/${vehicle.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View<span className="sr-only">, {vehicle.make} {vehicle.model}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Work Orders section */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Work Orders</h2>
          <button
            type="button"
            onClick={() => navigate(`/customers/${customer.id}/workorders/new`)}
            className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0"
          >
            Create Work Order
          </button>
        </div>
        
        {workOrdersLoading ? (
          <div className="mt-4 p-4 text-center">Loading work orders...</div>
        ) : workOrders.length === 0 ? (
          <div className="mt-4 rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500">
            No work orders found for this customer.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Service
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Vehicle
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Scheduled Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {workOrders.map((workOrder: any) => (
                  <tr key={workOrder.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">
                        {workOrder.serviceType.charAt(0).toUpperCase() + workOrder.serviceType.slice(1)}
                      </div>
                      <div className="text-gray-500">{workOrder.glassLocation}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {workOrder.vehicle ? `${workOrder.vehicle.make} ${workOrder.vehicle.model}` : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {workOrder.scheduledDate 
                        ? new Date(workOrder.scheduledDate).toLocaleDateString() 
                        : 'Not scheduled'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        workOrder.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : workOrder.status === 'in-progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : workOrder.status === 'cancelled' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link to={`/workorders/${workOrder.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View<span className="sr-only">, Work Order #{workOrder.id}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => deleteCustomerMutation.mutate()}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteCustomerMutation.isLoading}
      />
    </div>
  );
};

export default CustomerDetails; 