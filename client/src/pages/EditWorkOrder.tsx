import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workOrderApi } from '../services/api';
import { useWorkOrders } from '../context/WorkOrderContext';
import WorkOrderForm from '../components/forms/WorkOrderForm';
import { WorkOrder } from '../types/workOrder';

const EditWorkOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateWorkOrder } = useWorkOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch work order details
  const { data: workOrder, isLoading, error } = useQuery({
    queryKey: ['workOrder', id],
    queryFn: () => workOrderApi.getById(Number(id)),
    enabled: !!id,
  });

  const handleSubmit = async (data: Partial<WorkOrder>) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await updateWorkOrder(Number(id), data);
      navigate(`/work-orders/${id}`);
    } catch (error) {
      console.error('Error updating work order:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/work-orders/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Loading work order details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading work order details</p>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  // Not found state
  if (!workOrder) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Work order not found</p>
        <button
          type="button"
          className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => navigate('/work-orders')}
        >
          Back to work orders
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Work Order #{workOrder.id}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Update the details of this work order.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <WorkOrderForm
          initialData={workOrder}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditWorkOrder; 