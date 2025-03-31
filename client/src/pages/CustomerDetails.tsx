import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '@/components/ui/button';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: () => customerApi.delete(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
    onError: (error: any) => {
      console.error('Error deleting customer:', error);
      setDeleteError(error.message || 'Failed to delete customer');
      // Keep dialog open to show error
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
    isLoading: workOrdersLoading,
    error: workOrdersError // Get error from the original query
  } = useQuery({
    queryKey: ['customerWorkOrders', customerId],
    queryFn: () => customerApi.getWorkOrders(customerId),
    enabled: !!customerId,
  });

  if (customerLoading || vehiclesLoading || workOrdersLoading) { // Consolidate loading states
    return <div className="p-4 text-center text-muted-foreground">Loading customer details...</div>; // Use muted text
  }

  if (customerError) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading customer details.
        {/* Use Button component and variant */}
        <Button 
          variant="link"
          onClick={() => navigate('/customers')}
          className="ml-2"
        >
          Return to customers
        </Button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Customer not found.
        <Button 
          variant="link"
          onClick={() => navigate('/customers')}
          className="ml-2"
        >
          Return to customers
        </Button>
      </div>
    );
  }

  // Function to get status badge classes (similar to WorkOrders page)
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div>
      {/* Header with actions */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          {/* Use text-foreground */} 
          <h1 className="text-2xl font-semibold text-foreground">
            {customer.firstName} {customer.lastName}
          </h1>
          {/* Use text-muted-foreground */} 
          <p className="mt-1 text-sm text-muted-foreground">
            Customer ID: {customer.id}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          {/* Use standard Button components */}
          <Button
            variant="outline"
            onClick={() => navigate('/customers')}
          >
            Back to Customers
          </Button>
          <Button
            onClick={() => navigate(`/customers/${customer.id}/edit`)}
          >
            Edit Customer
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Customer
          </Button>
        </div>
      </div>

      {/* Customer information */}
      {/* Use bg-card, border-border, text-foreground/muted-foreground */} 
      <div className="mt-6 overflow-hidden bg-card shadow sm:rounded-lg border border-border">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-foreground">Customer Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Personal details and contact information.
          </p>
        </div>
        <div className="border-t border-border px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-border">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Full name</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {customer.firstName} {customer.lastName}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Email address</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {customer.email || 'Not provided'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Phone number</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {customer.phone}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Address</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
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
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${ 
                  customer.isLead 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {customer.isLead ? 'Lead' : 'Customer'}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Source</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {customer.source || 'Not specified'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {customer.notes || 'No notes'}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">
                {new Date(customer.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Vehicles section */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-foreground">Vehicles</h2>
          <Button
            onClick={() => navigate(`/customers/${customer.id}/vehicles/new`)}
          >
            Add Vehicle
          </Button>
        </div>
        
        {vehicles.length === 0 ? (
          <div className="mt-4 rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
            No vehicles found for this customer.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10 sm:rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sm:pl-6">Make & Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Glass Type</TableHead>
                  <TableHead className="relative sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle: any) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-foreground">{vehicle.make} {vehicle.model}</div>
                      <div className="text-muted-foreground">{vehicle.color || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{vehicle.year}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {vehicle.vinNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {vehicle.glassType || 'N/A'}
                    </TableCell>
                    <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link 
                        to={`/vehicles/${vehicle.id}`} 
                        className="text-primary hover:text-primary/80"
                      >
                        View<span className="sr-only">, {vehicle.make} {vehicle.model}</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Work Orders section */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-foreground">Work Orders</h2>
          {/* Use standard Button component */}
          <Button
            onClick={() => navigate(`/customers/${customer.id}/work-orders/add`)} // Corrected route
          >
            Create Work Order
          </Button>
        </div>
        
        {workOrdersLoading ? (
          <div className="mt-4 p-4 text-center text-muted-foreground">Loading work orders...</div>
        ) : workOrdersError ? (
          <div className="mt-4 p-4 text-center text-destructive">Error loading work orders.</div>
        ) : workOrders.length === 0 ? (
          <div className="mt-4 rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
            No work orders found for this customer.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden shadow ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10 sm:rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sm:pl-6">Service</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="relative sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder: any) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-foreground">
                        {workOrder.serviceType.charAt(0).toUpperCase() + workOrder.serviceType.slice(1)}
                      </div>
                      <div className="text-muted-foreground">{workOrder.glassLocation}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {workOrder.vehicle ? `${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}` : 'N/A'} {/* Display year */} 
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {workOrder.scheduledDate 
                        ? new Date(workOrder.scheduledDate).toLocaleDateString() 
                        : 'Not scheduled'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                      {/* Use helper function for badge colors */}
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(workOrder.status)}`}>
                        {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link 
                        to={`/work-orders/${workOrder.id}`} // Corrected route
                        className="text-primary hover:text-primary/80"
                      >
                        View<span className="sr-only">, Work Order #{workOrder.id}</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Customer"
        message={
          deleteError
            ? `Error: ${deleteError}`
            : `Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This action cannot be undone.`
        }
        confirmLabel={deleteError ? "Try Again" : "Delete"}
        cancelLabel={deleteError ? "Close" : "Cancel"}
        onConfirm={() => {
          if (deleteError) {
            // Reset error and try again
            setDeleteError(null);
          }
          deleteCustomerMutation.mutate();
        }}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeleteError(null); // Clear any errors when closing
        }}
        isLoading={deleteCustomerMutation.isLoading}
      />
    </div>
  );
};

export default CustomerDetails; 