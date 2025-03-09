import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '../components/Calendar';
import { WorkOrder } from '../types/workOrder';
import { getWorkOrders } from '../services/workOrderService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function Schedule() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await getWorkOrders();
        setWorkOrders(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch work orders. Please try again later.');
        console.error('Error fetching work orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    navigate(`/work-orders/${workOrder.id}`);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddWorkOrder = () => {
    if (selectedDate) {
      // Format the date to ISO string and pass it as a query parameter
      const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");
      navigate(`/work-orders/add?scheduledDate=${encodeURIComponent(formattedDate)}`);
    } else {
      navigate('/work-orders/add');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <div className="flex items-center gap-4">
          {selectedDate && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span>Selected: {format(selectedDate, 'MMMM d, yyyy')}</span>
            </div>
          )}
          <Button onClick={handleAddWorkOrder}>
            <Plus className="h-4 w-4 mr-2" />
            {selectedDate ? 'Schedule for Selected Date' : 'Add Work Order'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Calendar 
          workOrders={workOrders} 
          onDateClick={handleDateClick} 
          onWorkOrderClick={handleWorkOrderClick} 
        />

        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>Work Orders for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrders.filter(wo => 
                wo.scheduledDate && 
                new Date(wo.scheduledDate).toDateString() === selectedDate.toDateString()
              ).length > 0 ? (
                <div className="space-y-4">
                  {workOrders
                    .filter(wo => 
                      wo.scheduledDate && 
                      new Date(wo.scheduledDate).toDateString() === selectedDate.toDateString()
                    )
                    .map(wo => (
                      <div 
                        key={wo.id} 
                        className="p-4 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => handleWorkOrderClick(wo)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">
                              {wo.glassLocation} - {wo.serviceType}
                            </div>
                            <div className="text-sm text-gray-500">
                              {wo.scheduledDate && format(new Date(wo.scheduledDate), 'h:mm a')}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(wo.status)}`}>
                            {wo.status}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No work orders scheduled for this date.
                  <div className="mt-4">
                    <Button onClick={handleAddWorkOrder}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Work Order
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string) {
  switch (status) {
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
} 