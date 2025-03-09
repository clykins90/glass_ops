import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workOrderApi, customerApi, vehicleApi, technicianApi } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useWorkOrders } from '../context/WorkOrderContext';

const WorkOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteWorkOrder, updateWorkOrderStatus } = useWorkOrders();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch work order details
  const { data: workOrder, isLoading: isLoadingWorkOrder, error: workOrderError } = useQuery({
    queryKey: ['workOrder', id],
    queryFn: () => workOrderApi.getById(Number(id)),
    enabled: !!id,
  });

  // Fetch customer details if work order is loaded
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', workOrder?.customerId],
    queryFn: () => customerApi.getById(workOrder.customerId),
    enabled: !!workOrder?.customerId,
  });

  // Fetch vehicle details if work order is loaded and has a vehicle
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ['vehicle', workOrder?.vehicleId],
    queryFn: () => vehicleApi.getById(workOrder.vehicleId),
    enabled: !!workOrder?.vehicleId,
  });

  // Fetch technician details if work order is loaded and has a technician
  const { data: technician, isLoading: isLoadingTechnician } = useQuery({
    queryKey: ['technician', workOrder?.technicianId],
    queryFn: () => technicianApi.getById(workOrder.technicianId),
    enabled: !!workOrder?.technicianId,
  });

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (id) {
      await deleteWorkOrder(Number(id));
      setShowDeleteDialog(false);
      navigate('/work-orders');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (id) {
      await updateWorkOrderStatus(Number(id), newStatus);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (isLoadingWorkOrder) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Loading work order details...</p>
      </div>
    );
  }

  // Error state
  if (workOrderError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading work order details</p>
        <p>{workOrderError instanceof Error ? workOrderError.message : 'Unknown error'}</p>
      </div>
    );
  }

  // Not found state
  if (!workOrder) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Work order not found</p>
        <Link to="/work-orders" className="text-indigo-600 hover:text-indigo-900">
          Back to work orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Work Order #{workOrder.id}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Created on {formatDate(workOrder.createdAt)}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => navigate(`/work-orders/${id}/edit`)}
          >
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold leading-5 ${getStatusBadgeColor(workOrder.status)}`}>
          {workOrder.status}
        </span>
      </div>

      {/* Status Update Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => handleStatusUpdate('scheduled')}
          disabled={workOrder.status === 'scheduled'}
        >
          Mark as Scheduled
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => handleStatusUpdate('in-progress')}
          disabled={workOrder.status === 'in-progress'}
        >
          Mark as In Progress
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => handleStatusUpdate('completed')}
          disabled={workOrder.status === 'completed'}
        >
          Mark as Completed
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => handleStatusUpdate('cancelled')}
          disabled={workOrder.status === 'cancelled'}
        >
          Mark as Cancelled
        </button>
      </div>

      {/* Work Order Details */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Service Details */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Service Details</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Service Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.serviceType}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Glass Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.glassLocation}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Materials Required</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.materialsRequired || 'None specified'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Materials Used</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.materialsUsed || 'None recorded'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Schedule Details</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(workOrder.scheduledDate)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Completed Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(workOrder.completedDate)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Technician</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {isLoadingTechnician ? (
                    'Loading technician...'
                  ) : technician ? (
                    <Link to={`/technicians/${technician.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {technician.firstName} {technician.lastName}
                    </Link>
                  ) : (
                    'No technician assigned'
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Customer Details */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Details</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {isLoadingCustomer ? (
              <p className="text-sm text-gray-500">Loading customer details...</p>
            ) : customer ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link to={`/customers/${customer.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {customer.firstName} {customer.lastName}
                    </Link>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.phone}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.email || 'N/A'}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500">Customer not found</p>
            )}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Vehicle Details</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {isLoadingVehicle ? (
              <p className="text-sm text-gray-500">Loading vehicle details...</p>
            ) : vehicle ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link to={`/vehicles/${vehicle.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Link>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Color</dt>
                  <dd className="mt-1 text-sm text-gray-900">{vehicle.color || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">VIN</dt>
                  <dd className="mt-1 text-sm text-gray-900">{vehicle.vinNumber || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">License Plate</dt>
                  <dd className="mt-1 text-sm text-gray-900">{vehicle.licensePlate || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Glass Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{vehicle.glassType || 'N/A'}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500">No vehicle associated with this work order</p>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Details</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {workOrder.price ? `$${workOrder.price.toFixed(2)}` : 'Not set'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Payment Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.paymentType || 'Not set'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.paymentStatus || 'Not set'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Insurance Claim</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.insuranceClaim ? 'Yes' : 'No'}</dd>
              </div>
              {workOrder.insuranceClaim && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Insurance Information</dt>
                  <dd className="mt-1 text-sm text-gray-900">{workOrder.insuranceInfo || 'No details provided'}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Warranty Information</dt>
                <dd className="mt-1 text-sm text-gray-900">{workOrder.warrantyInfo || 'No warranty information'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Notes</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {workOrder.notes || 'No notes for this work order'}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Work Order"
        message={`Are you sure you want to delete work order #${workOrder.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default WorkOrderDetails; 