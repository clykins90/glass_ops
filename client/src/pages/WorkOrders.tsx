import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '../context/WorkOrderContext';
import { WorkOrder } from '../types/workOrder';
import ConfirmationDialog from '../components/ConfirmationDialog';

const WorkOrders = () => {
  const navigate = useNavigate();
  const { workOrders, isLoading, deleteWorkOrder } = useWorkOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Filter work orders based on search term and status filter
  const filteredWorkOrders = workOrders.filter((workOrder) => {
    const matchesSearch = 
      workOrder.id.toString().includes(searchTerm) ||
      workOrder.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.glassLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workOrder.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle delete confirmation
  const handleDeleteClick = (workOrder: WorkOrder) => {
    setWorkOrderToDelete(workOrder);
    setShowDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (workOrderToDelete) {
      await deleteWorkOrder(workOrderToDelete.id);
      setShowDeleteDialog(false);
      setWorkOrderToDelete(null);
    }
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

  // Format date for display
  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return 'Not scheduled';
    return new Date(dateInput).toLocaleDateString();
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Work Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all work orders in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => navigate('/work-orders/add')}
          >
            Create work order
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="w-full sm:w-1/4">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Loading work orders...</p>
                </div>
              ) : filteredWorkOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No work orders found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service Type</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Glass Location</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Scheduled Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredWorkOrders.map((workOrder) => (
                      <tr key={workOrder.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{workOrder.id}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{workOrder.serviceType}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{workOrder.glassLocation}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(workOrder.status)}`}>
                            {workOrder.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(workOrder.scheduledDate)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {workOrder.price ? `$${workOrder.price.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              onClick={() => handleDeleteClick(workOrder)}
                            >
                              Delete
                            </button>
                          </div>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Work Order"
        message={`Are you sure you want to delete work order #${workOrderToDelete?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default WorkOrders; 