import { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkOrder } from '../types/workOrder';

interface CalendarProps {
  workOrders: WorkOrder[];
  onDateClick?: (date: Date) => void;
  onWorkOrderClick?: (workOrder: WorkOrder) => void;
}

type ViewType = 'day' | 'week' | 'month';

export function Calendar({ workOrders, onDateClick, onWorkOrderClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');

  const nextDate = () => {
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentDate(nextMonth);
    }
  };

  const prevDate = () => {
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      const prevMonth = new Date(currentDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentDate(prevMonth);
    }
  };

  const renderHeader = () => {
    let dateFormat = 'MMMM yyyy';
    if (view === 'day') {
      dateFormat = 'EEEE, MMMM d, yyyy';
    } else if (view === 'week') {
      dateFormat = 'MMMM d, yyyy';
      const endOfWeek = addDays(startOfWeek(currentDate), 6);
      return (
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setView('day')}>Day</Button>
            <Button variant="outline" size="sm" onClick={() => setView('week')}>Week</Button>
            <Button variant="outline" size="sm" onClick={() => setView('month')}>Month</Button>
          </div>
          <div className="text-xl font-semibold">
            {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek, 'MMM d, yyyy')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevDate}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDate}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView('day')}>Day</Button>
          <Button variant="outline" size="sm" onClick={() => setView('week')}>Week</Button>
          <Button variant="outline" size="sm" onClick={() => setView('month')}>Month</Button>
        </div>
        <div className="text-xl font-semibold">
          {format(currentDate, dateFormat)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevDate}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextDate}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-b">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = startOfWeek(monthEnd);
    const dateFormat = 'd';

    const daysInMonth = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Group days into weeks
    const weeks: Date[][] = [];
    let week: Date[] = [];
    
    daysInMonth.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    // If there's a partial week left, add it
    if (week.length > 0) {
      weeks.push(week);
    }

    return (
      <div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b">
            {week.map((day, dayIndex) => {
              const formattedDate = format(day, dateFormat);
              const dayWorkOrders = workOrders.filter(wo => 
                wo.scheduledDate && isSameDay(parseISO(wo.scheduledDate.toString()), day)
              );
              
              return (
                <div
                  key={dayIndex}
                  className={`min-h-[100px] p-2 border-r ${
                    !isSameMonth(day, monthStart)
                      ? 'text-gray-400 bg-gray-50'
                      : 'cursor-pointer hover:bg-gray-100'
                  }`}
                  onClick={() => onDateClick && onDateClick(day)}
                >
                  <div className="text-right">{formattedDate}</div>
                  <div className="mt-2">
                    {dayWorkOrders.map(wo => (
                      <div 
                        key={wo.id} 
                        className={`text-xs p-1 mb-1 rounded truncate cursor-pointer ${
                          getStatusColor(wo.status)
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onWorkOrderClick && onWorkOrderClick(wo);
                        }}
                        data-testid={`work-order-${wo.id}`}
                      >
                        {wo.glassLocation}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    // Create time slots for the day
    const timeSlots = [];
    for (let i = 8; i <= 18; i++) { // 8 AM to 6 PM
      const time = new Date(currentDate);
      time.setHours(i, 0, 0);
      
      const workOrdersAtTime = workOrders.filter(wo => {
        if (!wo.scheduledDate) return false;
        const woDate = new Date(wo.scheduledDate);
        return isSameDay(woDate, currentDate) && woDate.getHours() === i;
      });
      
      timeSlots.push(
        <div key={i} className="flex border-b py-2">
          <div className="w-20 font-medium">
            {format(time, 'h:mm a')}
          </div>
          <div className="flex-1">
            {workOrdersAtTime.map(wo => (
              <div 
                key={wo.id} 
                className={`p-2 mb-1 rounded cursor-pointer ${getStatusColor(wo.status)}`}
                onClick={() => onWorkOrderClick && onWorkOrderClick(wo)}
                data-testid={`work-order-${wo.id}`}
              >
                <div className="font-medium">{wo.glassLocation}</div>
                <div className="text-sm">{wo.serviceType}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return <div className="mt-4">{timeSlots}</div>;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const days = [];
    
    // Create column headers (days of the week)
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div key={i} className="text-center font-medium">
          <div>{format(day, 'EEE')}</div>
          <div>{format(day, 'd')}</div>
        </div>
      );
    }
    
    // Create time slots
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) { // 8 AM to 6 PM
      const rowSlots = [];
      
      // Time label
      const time = new Date();
      time.setHours(hour, 0, 0);
      
      rowSlots.push(
        <div key="time" className="w-20 font-medium">
          {format(time, 'h:mm a')}
        </div>
      );
      
      // Slots for each day
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const day = addDays(startDate, dayIndex);
        const workOrdersAtTime = workOrders.filter(wo => {
          if (!wo.scheduledDate) return false;
          const woDate = new Date(wo.scheduledDate);
          return isSameDay(woDate, day) && woDate.getHours() === hour;
        });
        
        rowSlots.push(
          <div key={dayIndex} className="flex-1 min-h-[60px] border-l p-1">
            {workOrdersAtTime.map(wo => (
              <div 
                key={wo.id} 
                className={`text-xs p-1 mb-1 rounded truncate cursor-pointer ${getStatusColor(wo.status)}`}
                onClick={() => onWorkOrderClick && onWorkOrderClick(wo)}
                data-testid={`work-order-${wo.id}`}
              >
                {wo.glassLocation}
              </div>
            ))}
          </div>
        );
      }
      
      timeSlots.push(
        <div key={hour} className="flex border-b py-1">
          {rowSlots}
        </div>
      );
    }
    
    return (
      <div>
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b py-2">
          <div></div>
          {days}
        </div>
        <div className="mt-2">
          {timeSlots}
        </div>
      </div>
    );
  };

  const getStatusColor = (status?: string) => {
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
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {renderHeader()}
        {view === 'month' && (
          <>
            {renderDays()}
            {renderCells()}
          </>
        )}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </CardContent>
    </Card>
  );
} 