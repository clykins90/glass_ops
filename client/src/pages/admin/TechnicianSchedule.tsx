import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Clock, Calendar } from 'lucide-react';
import TechnicianScheduleForm from '@/components/forms/TechnicianScheduleForm';
import TimeOffForm from '@/components/forms/TimeOffForm';
import { ScheduleCalendar } from '@/components/ScheduleCalendar';
import { toast } from '@/components/ui/use-toast';
import { technicianApi } from '@/services/api';
import { scheduleApi } from '@/services/scheduleService';
import { workOrderApi } from '@/services/api';

// Simple interfaces for our component
interface ScheduleEntry {
  id: string;
  technician_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface TimeOffEntry {
  id: string;
  technician_id: string;
  start_datetime: string;
  end_datetime: string;
  reason?: string;
}

interface WorkOrder {
  id: string;
  technicianId?: string;
  scheduledDate?: string;
  estimated_duration_minutes?: number;
  serviceType?: string;
  status?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  vehicle?: {
    make?: string;
    model?: string;
  };
}

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TechnicianSchedulePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [timeOffEntries, setTimeOffEntries] = useState<TimeOffEntry[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  
  const [isLoadingTechnician, setIsLoadingTechnician] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isLoadingTimeOff, setIsLoadingTimeOff] = useState(false);
  const [isLoadingWorkOrders, setIsLoadingWorkOrders] = useState(false);
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | undefined>(undefined);
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOffEntry | undefined>(undefined);
  
  const [error, setError] = useState<string | null>(null);

  // Fetch technician details
  const fetchTechnician = async () => {
    if (!id) return;
    
    setIsLoadingTechnician(true);
    
    try {
      const data = await technicianApi.getById(id);
      setTechnician(data);
    } catch (err: any) {
      console.error('Failed to fetch technician:', err);
      toast({
        title: 'Error',
        description: 'Failed to load technician details',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTechnician(false);
    }
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    if (!id) return;
    
    setIsLoadingSchedules(true);
    setError(null);
    
    try {
      const data = await scheduleApi.getTechnicianSchedule(id);
      setSchedules(data);
    } catch (err: any) {
      console.error('Failed to fetch schedules:', err);
      setError(err.message || 'Failed to fetch schedules');
      toast({
        title: 'Error',
        description: 'Failed to load technician schedules',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // Fetch time off entries
  const fetchTimeOff = async () => {
    if (!id) return;
    
    setIsLoadingTimeOff(true);
    setError(null);
    
    try {
      const data = await scheduleApi.getTechnicianTimeOff(id);
      setTimeOffEntries(data);
    } catch (err: any) {
      console.error('Failed to fetch time off entries:', err);
      setError(err.message || 'Failed to fetch time off entries');
      toast({
        title: 'Error',
        description: 'Failed to load technician time off entries',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTimeOff(false);
    }
  };

  // Fetch work orders
  const fetchWorkOrders = async () => {
    if (!id) return;
    
    setIsLoadingWorkOrders(true);
    
    try {
      // This needs to be customized based on your actual API structure
      const params = new URLSearchParams({ 
        technicianId: id,
        status: 'scheduled,in_progress'
      }).toString();
      
      const data = await workOrderApi.getAll();
      // Filter work orders by technician ID and statuses
      const filteredData = data.filter(
        wo => wo.technicianId === id && 
        (wo.status === 'scheduled' || wo.status === 'in_progress')
      );
      
      // Type cast to ensure compatibility with the component's WorkOrder type
      setWorkOrders(filteredData as unknown as WorkOrder[]);
    } catch (err: any) {
      console.error('Failed to fetch work orders:', err);
      toast({
        title: 'Error',
        description: 'Failed to load work orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingWorkOrders(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      fetchTechnician();
      fetchSchedules();
      fetchTimeOff();
      fetchWorkOrders();
    }
  }, [id]);

  // Handle schedule submission
  const handleScheduleSubmit = async (data: Omit<ScheduleEntry, 'id' | 'technician_id'>) => {
    if (!id) return;
    
    setError(null);
    
    try {
      if (editingSchedule?.id) {
        // Update existing schedule
        await scheduleApi.updateScheduleEntry(id, editingSchedule.id, data);
        toast({
          title: 'Success',
          description: 'Schedule updated successfully',
        });
      } else {
        // Add new schedule
        await scheduleApi.addScheduleEntry(id, data);
        toast({
          title: 'Success',
          description: 'Schedule added successfully',
        });
      }
      
      // Refresh schedules
      fetchSchedules();
      setShowScheduleForm(false);
      setEditingSchedule(undefined);
    } catch (err: any) {
      console.error('Failed to save schedule:', err);
      setError(err.message || 'Failed to save schedule');
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive',
      });
    }
  };

  // Handle time off submission
  const handleTimeOffSubmit = async (data: Omit<TimeOffEntry, 'id' | 'technician_id'>) => {
    if (!id) return;
    
    setError(null);
    
    try {
      if (editingTimeOff?.id) {
        // Update existing time off
        await scheduleApi.updateTimeOffEntry(id, editingTimeOff.id, data);
        toast({
          title: 'Success',
          description: 'Time off updated successfully',
        });
      } else {
        // Add new time off
        await scheduleApi.addTimeOffEntry(id, data);
        toast({
          title: 'Success',
          description: 'Time off added successfully',
        });
      }
      
      // Refresh time off entries
      fetchTimeOff();
      setShowTimeOffForm(false);
      setEditingTimeOff(undefined);
    } catch (err: any) {
      console.error('Failed to save time off:', err);
      setError(err.message || 'Failed to save time off');
      toast({
        title: 'Error',
        description: 'Failed to save time off',
        variant: 'destructive',
      });
    }
  };

  // Handle schedule deletion
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!id) return;
    
    if (!window.confirm('Are you sure you want to delete this schedule entry?')) {
      return;
    }
    
    try {
      await scheduleApi.deleteScheduleEntry(id, scheduleId);
      toast({
        title: 'Success',
        description: 'Schedule deleted successfully',
      });
      
      // Refresh schedules
      fetchSchedules();
    } catch (err: any) {
      console.error('Failed to delete schedule:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  // Handle time off deletion
  const handleDeleteTimeOff = async (timeOffId: string) => {
    if (!id) return;
    
    if (!window.confirm('Are you sure you want to delete this time off entry?')) {
      return;
    }
    
    try {
      await scheduleApi.deleteTimeOffEntry(id, timeOffId);
      toast({
        title: 'Success',
        description: 'Time off deleted successfully',
      });
      
      // Refresh time off entries
      fetchTimeOff();
    } catch (err: any) {
      console.error('Failed to delete time off:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete time off',
        variant: 'destructive',
      });
    }
  };

  // Handle schedule click in calendar
  const handleScheduleClick = (schedule: ScheduleEntry) => {
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
  };

  // Handle time off click in calendar
  const handleTimeOffClick = (timeOff: TimeOffEntry) => {
    setEditingTimeOff(timeOff);
    setShowTimeOffForm(true);
  };

  // Handle work order click in calendar
  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    navigate(`/work-orders/${workOrder.id}`);
  };

  // Loading states
  const isLoading = isLoadingTechnician || isLoadingSchedules || isLoadingTimeOff || isLoadingWorkOrders;

  if (isLoadingTechnician) {
    return <div className="p-8 text-center">Loading technician details...</div>;
  }

  if (!technician) {
    return <div className="p-8 text-center">Technician not found</div>;
  }

  const technicianName = `${technician.firstName} ${technician.lastName}`;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{technicianName}'s Schedule</h1>
          <p className="text-muted-foreground">Manage work schedule and time off</p>
        </div>
        <Button onClick={() => navigate('/technicians')}>Back to Technicians</Button>
      </div>

      {/* Forms */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <TechnicianScheduleForm
              technicianId={id!}
              initialData={editingSchedule}
              onSubmit={handleScheduleSubmit}
              onCancel={() => {
                setShowScheduleForm(false);
                setEditingSchedule(undefined);
                setError(null);
              }}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      )}

      {showTimeOffForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <TimeOffForm
              technicianId={id!}
              initialData={editingTimeOff}
              onSubmit={handleTimeOffSubmit}
              onCancel={() => {
                setShowTimeOffForm(false);
                setEditingTimeOff(undefined);
                setError(null);
              }}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      )}

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar"><Calendar className="h-4 w-4 mr-2" />Calendar View</TabsTrigger>
          <TabsTrigger value="schedules"><Clock className="h-4 w-4 mr-2" />Regular Hours</TabsTrigger>
          <TabsTrigger value="timeoff"><Clock className="h-4 w-4 mr-2" />Time Off</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <ScheduleCalendar
            schedules={schedules}
            timeOffEntries={timeOffEntries}
            workOrders={workOrders}
            onScheduleClick={handleScheduleClick}
            onTimeOffClick={handleTimeOffClick}
            onWorkOrderClick={handleWorkOrderClick}
            selectedTechnicianId={id}
          />
        </TabsContent>

        {/* Regular Hours */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Regular Work Hours</h2>
            <Button onClick={() => {
              setEditingSchedule(undefined);
              setShowScheduleForm(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>

          {isLoadingSchedules ? (
            <div className="text-center p-4">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No regular hours scheduled yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setEditingSchedule(undefined);
                    setShowScheduleForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schedules.map((schedule) => {
                // Get day name
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = dayNames[schedule.day_of_week];
                
                // Format times
                const formatTime = (timeStr: string) => {
                  const [hours, minutes] = timeStr.split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours, 10));
                  date.setMinutes(parseInt(minutes, 10));
                  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                };
                
                return (
                  <Card key={schedule.id} className="overflow-hidden">
                    <CardHeader className="bg-primary/10 dark:bg-primary/20 py-3">
                      <CardTitle className="text-lg">{dayName}</CardTitle>
                      <CardDescription>
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScheduleClick(schedule)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Time Off */}
        <TabsContent value="timeoff" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Time Off Requests</h2>
            <Button onClick={() => {
              setEditingTimeOff(undefined);
              setShowTimeOffForm(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Off
            </Button>
          </div>

          {isLoadingTimeOff ? (
            <div className="text-center p-4">Loading time off entries...</div>
          ) : timeOffEntries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No time off requests scheduled.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setEditingTimeOff(undefined);
                    setShowTimeOffForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Off
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timeOffEntries.map((timeOff) => {
                // Format dates
                const formatDate = (dateStr: string) => {
                  const date = new Date(dateStr);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                };
                
                return (
                  <Card key={timeOff.id} className="overflow-hidden">
                    <CardHeader className="bg-yellow-100 dark:bg-yellow-900/30 py-3">
                      <CardTitle className="text-lg">Time Off</CardTitle>
                      <CardDescription>
                        From: {formatDate(timeOff.start_datetime)}
                        <br />
                        To: {formatDate(timeOff.end_datetime)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      {timeOff.reason && (
                        <p className="text-sm mb-3">Reason: {timeOff.reason}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTimeOffClick(timeOff)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTimeOff(timeOff.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicianSchedulePage; 