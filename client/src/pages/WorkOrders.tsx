import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '../context/WorkOrderContext';
import { WorkOrder } from '../types/workOrder';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

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

  // Get status badge color based on status - UPDATED FOR DARK MODE
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  // Format date for display
  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return 'Not scheduled';
    return new Date(dateInput).toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 dark:text-gray-100">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Work Orders</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            A list of all work orders in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => navigate('/work-orders/add')}>
            Create work order
          </Button>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Input
            type="text"
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="w-full sm:w-1/4">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring dark:text-white dark:placeholder-gray-400"
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
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>Loading work orders...</p>
                </div>
              ) : filteredWorkOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No work orders found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pl-6">ID</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Service Type</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Glass Location</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Scheduled Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Price</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
                    {filteredWorkOrders.map((workOrder) => (
                      <tr key={workOrder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{workOrder.id}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{workOrder.serviceType}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{workOrder.glassLocation}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(workOrder.status)}`}>
                            {workOrder.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(workOrder.scheduledDate)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {workOrder.price ? `$${workOrder.price.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 dark:border-red-400/50 dark:hover:border-red-300" onClick={() => handleDeleteClick(workOrder)}>
                              Delete
                            </Button>
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