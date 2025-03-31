import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '../context/WorkOrderContext';
import { WorkOrder } from '../types/workOrder';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unknown error occurred';
};

const WorkOrders = () => {
  const navigate = useNavigate();
  const { workOrders, isLoading, error, deleteWorkOrder } = useWorkOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const filteredWorkOrders = workOrders.filter((workOrder) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      workOrder.id.toString().includes(searchTerm) ||
      workOrder.serviceType.toLowerCase().includes(searchLower) ||
      workOrder.glassLocation.toLowerCase().includes(searchLower) ||
      workOrder.status.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || workOrder.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (workOrder: WorkOrder) => {
    setWorkOrderToDelete(workOrder);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (workOrderToDelete) {
      try {
        await deleteWorkOrder(workOrderToDelete.id);
      } catch (err) {
        console.error("Error deleting work order:", err);
      }
      setShowDeleteDialog(false);
      setWorkOrderToDelete(null);
    }
  };

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

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return 'Not scheduled';
    try {
      return new Date(dateInput).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading work orders...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">Error loading work orders: {getErrorMessage(error)}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Work Orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="overflow-hidden shadow ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10 sm:rounded-lg border border-border">
          {filteredWorkOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No work orders found matching your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sm:pl-6">ID</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Glass Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right sm:pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="sm:pl-6 font-medium text-foreground">{workOrder.id}</TableCell>
                    <TableCell>{workOrder.serviceType}</TableCell>
                    <TableCell>{workOrder.glassLocation}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(workOrder.status)}`}>
                        {workOrder.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(workOrder.scheduledDate)}</TableCell>
                    <TableCell>{workOrder.price ? `$${workOrder.price.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell className="text-right sm:pr-6">
                      <div className="flex space-x-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(workOrder)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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