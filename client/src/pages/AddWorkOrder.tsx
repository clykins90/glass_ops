import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '../context/WorkOrderContext';
import WorkOrderForm from '../components/forms/WorkOrderForm';
import { WorkOrder } from '../types/workOrder';
import { useToast } from "../components/ui/use-toast";

const AddWorkOrder = () => {
  const navigate = useNavigate();
  const { createWorkOrder } = useWorkOrders();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<WorkOrder>) => {
    setIsSubmitting(true);
    try {
      const newWorkOrder = await createWorkOrder(data as Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>);
      navigate(`/work-orders/${newWorkOrder.id}`);
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        variant: "destructive",
        title: "Error Creating Work Order",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/work-orders');
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create Work Order</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Add a new work order to the system.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <WorkOrderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default AddWorkOrder; 