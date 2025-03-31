import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '../components/Calendar';
import { WorkOrder } from '../types/workOrder';
import { Profile } from '../types/profile';
import { getWorkOrders, getWorkOrdersByStatus } from '../services/workOrderService';
import { TechnicianSchedule, getTechnicians, getTechnicianSchedule } from '../services/technicianService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  CalendarIcon, 
  Plus, 
  Calendar as CalendarIcon2, 
  ClipboardList, 
  Users 
} from 'lucide-react';
import { format, addDays, formatISO, startOfDay, endOfDay } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.tsx';
import { toast } from '../components/ui/use-toast.ts';

type ScheduleTab = 'calendar' | 'unscheduled' | 'technicians';

export default function Schedule() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [unscheduledWorkOrders, setUnscheduledWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [technicianSchedules, setTechnicianSchedules] = useState<{ [key: string]: TechnicianSchedule[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<ScheduleTab>('calendar');
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all work orders
        const workOrdersData = await getWorkOrders();
        setWorkOrders(workOrdersData as unknown as WorkOrder[]);
        
        // Fetch unscheduled work orders
        const unscheduledData = await getWorkOrdersByStatus('scheduled');
        setUnscheduledWorkOrders(
          unscheduledData
            .filter((wo) => !wo.scheduledDate || !wo.technicianId) as unknown as WorkOrder[]
        );
        
        // Fetch technicians
        const techniciansData = await getTechnicians();
        setTechnicians(techniciansData);
        
        // Initialize technician schedules
        if (techniciansData.length > 0) {
          setSelectedTechnician(techniciansData[0].id);
          
          // Fetch schedules for each technician
          const schedules: { [key: string]: TechnicianSchedule[] } = {};
          const schedulePromises = techniciansData.map(async (tech) => {
            try {
              const startDateStr = selectedDate ? formatISO(startOfDay(selectedDate), { representation: 'date' }) : undefined;
              const endDateStr = selectedDate ? formatISO(endOfDay(selectedDate), { representation: 'date' }) : undefined;
              if (!startDateStr || !endDateStr) return;

              const schedule = await getTechnicianSchedule(tech.id, startDateStr, endDateStr);
              (schedules as { [key: string]: TechnicianSchedule[] })[tech.id] = schedule;
            } catch (scheduleError) {
              console.error(`Error fetching schedule for technician ${tech.id}:`, scheduleError);
            }
          });
          await Promise.all(schedulePromises);
          setTechnicianSchedules(schedules as { [key: string]: TechnicianSchedule[] });
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

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

  const handleScheduleWorkOrder = async (workOrder: WorkOrder, technicianId: string, date: Date) => {
    try {
      // Update the work order with the selected technician and date
      
      // Assuming updateWorkOrder takes a number ID - this needs fixing if ID is string
      // await updateWorkOrder(workOrder.id as any, updatedWorkOrderData);

      // Refresh data - simplified
      // fetchData(); 

      // TEMPORARILY COMMENTED OUT STATE UPDATE DUE TO TYPE MISMATCH
      // setTechnicianSchedules(prev => {
      //   const currentSchedule = prev[technicianId] || [];
      //   // This logic is incorrect - needs to create/update TechnicianSchedule, not WorkOrder
      //   const newSchedule = [...currentSchedule, updatedWorkOrderData as any]; 
      //   return { ...prev, [technicianId]: newSchedule };
      // });

      console.log(`Scheduled WO ${workOrder.id} for Tech ${technicianId} on ${date}`);

    } catch (error) {
      console.error('Error scheduling work order:', error);
      toast({
        title: "Error",
        description: "Failed to schedule work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTechnicianChange = async (techId: string) => {
    const id = techId;
    setSelectedTechnician(id);
    
    // Fetch schedule for the selected technician if not already loaded
    if (!technicianSchedules[id]) {
      try {
        const startDateStr = selectedDate ? formatISO(startOfDay(selectedDate), { representation: 'date' }) : undefined;
        const endDateStr = selectedDate ? formatISO(endOfDay(selectedDate), { representation: 'date' }) : undefined;
        if (!startDateStr || !endDateStr) return;

        const schedule = await getTechnicianSchedule(id, startDateStr, endDateStr);
        setTechnicianSchedules(prev => ({
          ...prev,
          [id]: schedule
        }));
      } catch (err) {
        console.error('Error fetching technician schedule:', err);
      }
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

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as ScheduleTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon2 className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="unscheduled" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Unscheduled Work Orders
            {unscheduledWorkOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">{unscheduledWorkOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="technicians" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Technician Schedules
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-0">
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
                            onClick={() => handleWorkOrderClick(wo as unknown as WorkOrder)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">
                                  {wo.glassLocation} - {wo.serviceType}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {wo.scheduledDate && format(new Date(wo.scheduledDate), 'h:mm a')}
                                </div>
                                {wo.technicianId && (
                                  <div className="text-sm text-gray-500">
                                    Technician: {technicians.find(t => String(t.id) === String(wo.technicianId))?.firstName} {technicians.find(t => String(t.id) === String(wo.technicianId))?.lastName}
                                  </div>
                                )}
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(wo.status || 'pending')}`}>
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
        </TabsContent>

        {/* Unscheduled Work Orders View */}
        <TabsContent value="unscheduled" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Unscheduled Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {unscheduledWorkOrders.length > 0 ? (
                <div className="space-y-4">
                  {unscheduledWorkOrders.map(wo => (
                    <div 
                      key={wo.id} 
                      className="p-4 border rounded-md hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="cursor-pointer" onClick={() => handleWorkOrderClick(wo as unknown as WorkOrder)}>
                          <div className="font-medium">
                            {wo.glassLocation} - {wo.serviceType}
                          </div>
                          <div className="text-sm text-gray-500">
                            Customer: {wo.customer?.firstName} {wo.customer?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Vehicle: {wo.vehicle?.year} {wo.vehicle?.make} {wo.vehicle?.model}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Select onValueChange={(value: string) => handleTechnicianChange(value)}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select Technician" />
                            </SelectTrigger>
                            <SelectContent>
                              {technicians.map(tech => (
                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                  {tech.firstName} {tech.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              disabled={!selectedTechnician}
                              onClick={() => selectedTechnician && handleScheduleWorkOrder(wo as unknown as WorkOrder, selectedTechnician, selectedDate || new Date())}
                            >
                              Schedule Today
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled={!selectedTechnician}
                              onClick={() => selectedTechnician && handleScheduleWorkOrder(wo as unknown as WorkOrder, selectedTechnician, addDays(new Date(), 1))}
                            >
                              Tomorrow
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No unscheduled work orders.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technician Schedules View */}
        <TabsContent value="technicians" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Technician Schedules</CardTitle>
                  <Select onValueChange={handleTechnicianChange} defaultValue={selectedTechnician?.toString()}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.firstName} {tech.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTechnician ? (
                  <div>
                    <h3 className="font-medium mb-4">
                      Schedule for {technicians.find(t => t.id === selectedTechnician)?.firstName} {technicians.find(t => t.id === selectedTechnician)?.lastName}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Today's Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {technicianSchedules[selectedTechnician]?.filter(wo => 
                            wo.scheduledDate && 
                            new Date(wo.scheduledDate).toDateString() === new Date().toDateString()
                          ).length > 0 ? (
                            <div className="space-y-3">
                              {technicianSchedules[selectedTechnician]
                                ?.filter(wo => 
                                  wo.scheduledDate && 
                                  new Date(wo.scheduledDate).toDateString() === new Date().toDateString()
                                )
                                .sort((a, b) => 
                                  new Date(a.scheduledDate || '').getTime() - new Date(b.scheduledDate || '').getTime()
                                )
                                .map(wo => (
                                  <div 
                                    key={wo.id} 
                                    className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleWorkOrderClick(wo as unknown as WorkOrder)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium">
                                          {wo.scheduledDate && format(new Date(wo.scheduledDate), 'h:mm a')} - {wo.glassLocation}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {wo.customer?.firstName} {wo.customer?.lastName}
                                        </div>
                                      </div>
                                      <div className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(wo.status || 'pending')}`}>
                                        {wo.status}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No work orders scheduled for today.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Tomorrow's Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {technicianSchedules[selectedTechnician]?.filter(wo => 
                            wo.scheduledDate && 
                            new Date(wo.scheduledDate).toDateString() === addDays(new Date(), 1).toDateString()
                          ).length > 0 ? (
                            <div className="space-y-3">
                              {technicianSchedules[selectedTechnician]
                                ?.filter(wo => 
                                  wo.scheduledDate && 
                                  new Date(wo.scheduledDate).toDateString() === addDays(new Date(), 1).toDateString()
                                )
                                .sort((a, b) => 
                                  new Date(a.scheduledDate || '').getTime() - new Date(b.scheduledDate || '').getTime()
                                )
                                .map(wo => (
                                  <div 
                                    key={wo.id} 
                                    className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleWorkOrderClick(wo as unknown as WorkOrder)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium">
                                          {wo.scheduledDate && format(new Date(wo.scheduledDate), 'h:mm a')} - {wo.glassLocation}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {wo.customer?.firstName} {wo.customer?.lastName}
                                        </div>
                                      </div>
                                      <div className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(wo.status || 'pending')}`}>
                                        {wo.status}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No work orders scheduled for tomorrow.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Upcoming Work Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {technicianSchedules[selectedTechnician]?.filter(wo => 
                          wo.scheduledDate && 
                          new Date(wo.scheduledDate) > addDays(new Date(), 1)
                        ).length > 0 ? (
                          <div className="space-y-3">
                            {technicianSchedules[selectedTechnician]
                              ?.filter(wo => 
                                wo.scheduledDate && 
                                new Date(wo.scheduledDate) > addDays(new Date(), 1)
                              )
                              .sort((a, b) => 
                                new Date(a.scheduledDate || '').getTime() - new Date(b.scheduledDate || '').getTime()
                              )
                              .map(wo => (
                                <div 
                                  key={wo.id} 
                                  className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                                  onClick={() => handleWorkOrderClick(wo as unknown as WorkOrder)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium">
                                        {wo.scheduledDate && format(new Date(wo.scheduledDate), 'MMM d')} - {wo.glassLocation}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {wo.customer?.firstName} {wo.customer?.lastName}
                                      </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(wo.status || 'pending')}`}>
                                      {wo.status}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No upcoming work orders scheduled.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Please select a technician to view their schedule.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
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