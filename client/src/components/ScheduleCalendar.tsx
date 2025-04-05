import { useState } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  eachDayOfInterval, 
  isSameDay,
  endOfWeek,
  addWeeks,
  subWeeks,
  parseISO
} from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ScheduleCalendarProps {
  schedules: ScheduleEntry[];
  timeOffEntries: TimeOffEntry[];
  workOrders: WorkOrder[];
  onScheduleClick?: (schedule: ScheduleEntry) => void;
  onTimeOffClick?: (timeOff: TimeOffEntry) => void;
  onWorkOrderClick?: (workOrder: WorkOrder) => void;
  technicians?: { id: string; full_name: string }[];
  selectedTechnicianId?: string;
  onTechnicianSelect?: (technicianId: string) => void;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

export function ScheduleCalendar({ 
  schedules, 
  timeOffEntries, 
  workOrders,
  onScheduleClick,
  onTimeOffClick,
  onWorkOrderClick,
  technicians,
  selectedTechnicianId,
  onTechnicianSelect
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Navigation functions
  const prevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const nextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  // Generate dates for the current week
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(weekStart);
  
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  // Get technician's name if available
  const selectedTechnicianName = technicians?.find(
    tech => tech.id === selectedTechnicianId
  )?.full_name || 'Technician';

  // Filter schedules for the selected technician
  const filteredSchedules = selectedTechnicianId 
    ? schedules.filter(schedule => schedule.technician_id === selectedTechnicianId)
    : schedules;

  // Filter time off entries for the selected technician and current week
  const filteredTimeOff = timeOffEntries.filter(timeOff => {
    if (selectedTechnicianId && timeOff.technician_id !== selectedTechnicianId) {
      return false;
    }
    
    const startDate = new Date(timeOff.start_datetime);
    const endDate = new Date(timeOff.end_datetime);
    
    // Check if time off period overlaps with the current week
    return (
      (startDate <= weekEnd && endDate >= weekStart)
    );
  });

  // Filter work orders for the selected technician and current week
  const filteredWorkOrders = workOrders.filter(wo => {
    if (!wo.scheduledDate || !wo.technicianId) return false;
    
    if (selectedTechnicianId && wo.technicianId !== selectedTechnicianId) {
      return false;
    }
    
    const woDate = new Date(wo.scheduledDate);
    return weekDays.some(day => isSameDay(day, woDate));
  });

  // Get schedule for a specific day
  const getScheduleForDay = (dayOfWeek: number) => {
    return filteredSchedules.filter(
      schedule => schedule.day_of_week === dayOfWeek
    );
  };

  // Get time off for a specific day
  const getTimeOffForDay = (date: Date) => {
    return filteredTimeOff.filter(timeOff => {
      const startDate = new Date(timeOff.start_datetime);
      const endDate = new Date(timeOff.end_datetime);
      return date >= startDate && date <= endDate;
    });
  };

  // Get work orders for a specific day
  const getWorkOrdersForDay = (date: Date) => {
    return filteredWorkOrders.filter(wo => {
      if (!wo.scheduledDate) return false;
      const woDate = new Date(wo.scheduledDate);
      return isSameDay(date, woDate);
    });
  };

  // Get work orders for a specific day and hour
  const getWorkOrdersForHour = (date: Date, hour: number) => {
    return filteredWorkOrders.filter(wo => {
      if (!wo.scheduledDate) return false;
      const woDate = new Date(wo.scheduledDate);
      return isSameDay(date, woDate) && woDate.getHours() === hour;
    });
  };

  // Check if a day has schedule
  const dayHasSchedule = (date: Date) => {
    const dayOfWeek = date.getDay();
    return filteredSchedules.some(
      schedule => schedule.day_of_week === dayOfWeek
    );
  };

  // Check if an hour is within a technician's schedule
  const isHourScheduled = (date: Date, hour: number) => {
    const dayOfWeek = date.getDay();
    const scheduleEntries = getScheduleForDay(dayOfWeek);
    
    return scheduleEntries.some(schedule => {
      const [startHour] = schedule.start_time.split(':').map(Number);
      const [endHour] = schedule.end_time.split(':').map(Number);
      return hour >= startHour && hour < endHour;
    });
  };

  // Check if an hour is within time off period
  const isHourTimeOff = (date: Date, hour: number) => {
    const timeOffs = getTimeOffForDay(date);
    const hourDate = new Date(date);
    hourDate.setHours(hour, 0, 0, 0);
    
    return timeOffs.some(timeOff => {
      const startDate = new Date(timeOff.start_datetime);
      const endDate = new Date(timeOff.end_datetime);
      return hourDate >= startDate && hourDate <= endDate;
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>
          {selectedTechnicianId 
            ? `${selectedTechnicianName}'s Schedule` 
            : 'Technician Schedule'}
        </CardTitle>
        <div className="flex items-center space-x-4">
          {technicians && technicians.length > 0 && (
            <div className="flex items-center space-x-2">
              <select
                value={selectedTechnicianId || ''}
                onChange={(e) => onTechnicianSelect?.(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">All Technicians</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </div>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row with days of the week */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 font-medium text-center">Time</div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-2 font-medium text-center ${
                    isSameDay(day, new Date()) 
                      ? 'bg-primary/10 dark:bg-primary/20' 
                      : ''
                  }`}
                >
                  <div>{format(day, 'EEE')}</div>
                  <div>{format(day, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b">
                <div className="p-2 text-sm font-medium border-r">
                  {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                </div>
                
                {weekDays.map((day, dayIndex) => {
                  const isScheduled = isHourScheduled(day, hour);
                  const isOff = isHourTimeOff(day, hour);
                  const workOrdersInHour = getWorkOrdersForHour(day, hour);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`p-1 min-h-[80px] border-r relative ${
                        isScheduled 
                          ? isOff 
                            ? 'bg-gray-200 dark:bg-gray-800' // Time off
                            : 'bg-green-50 dark:bg-green-900/20' // Scheduled
                          : 'bg-gray-50 dark:bg-gray-900' // Not scheduled
                      }`}
                    >
                      {isOff && (
                        <div 
                          className="absolute inset-0 bg-gray-300/50 dark:bg-gray-700/50 flex items-center justify-center"
                          onClick={() => {
                            const timeOff = getTimeOffForDay(day)[0];
                            if (timeOff && onTimeOffClick) {
                              onTimeOffClick(timeOff);
                            }
                          }}
                        >
                          <div className="text-xs font-medium p-1">Time Off</div>
                        </div>
                      )}
                      
                      {workOrdersInHour.map((wo) => (
                        <div
                          key={wo.id}
                          className={`text-xs p-1 mb-1 rounded cursor-pointer ${getStatusColor(wo.status)}`}
                          onClick={() => onWorkOrderClick && onWorkOrderClick(wo)}
                        >
                          <div className="font-medium truncate">
                            <p className="text-xs font-medium truncate">{wo.customer ? `${wo.customer.firstName || ''} ${wo.customer.lastName || ''}`.trim() || 'Customer' : 'Customer'}</p>
                          </div>
                          <div className="truncate">
                            {wo.vehicle?.make} {wo.vehicle?.model}
                          </div>
                          <div>{wo.serviceType}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 