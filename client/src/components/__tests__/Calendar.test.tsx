import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '../Calendar';
import { format } from 'date-fns';

describe('Calendar Component', () => {
  const mockWorkOrders = [
    {
      id: 1,
      customerId: 1,
      vehicleId: 1,
      technicianId: 1,
      serviceType: 'replacement',
      glassLocation: 'windshield',
      status: 'scheduled',
      scheduledDate: new Date().toISOString(),
      insuranceClaim: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const mockDateClick = jest.fn();
  const mockWorkOrderClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders calendar with month view by default', () => {
    render(
      <Calendar 
        workOrders={mockWorkOrders} 
        onDateClick={mockDateClick} 
        onWorkOrderClick={mockWorkOrderClick} 
      />
    );

    // Check if the calendar title is rendered
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    
    // Check if the month view is active (days of week should be visible)
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    // etc.
  });

  test('switches between different views', () => {
    render(
      <Calendar 
        workOrders={mockWorkOrders} 
        onDateClick={mockDateClick} 
        onWorkOrderClick={mockWorkOrderClick} 
      />
    );

    // Switch to day view
    fireEvent.click(screen.getByText('Day'));
    
    // Check if day view is rendered (should show hourly slots)
    expect(screen.getByText('8:00 am')).toBeInTheDocument();
    
    // Switch to week view
    fireEvent.click(screen.getByText('Week'));
    
    // Check if week view is rendered
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    
    // Switch back to month view
    fireEvent.click(screen.getByText('Month'));
    
    // Check if month view is rendered
    const currentMonth = format(new Date(), 'MMMM yyyy');
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  test('calls onDateClick when a date is clicked', () => {
    render(
      <Calendar 
        workOrders={mockWorkOrders} 
        onDateClick={mockDateClick} 
        onWorkOrderClick={mockWorkOrderClick} 
      />
    );

    // Find a date cell and click it
    const dateCell = screen.getAllByText('1')[0]; // First day of the month
    fireEvent.click(dateCell);
    
    // Check if onDateClick was called
    expect(mockDateClick).toHaveBeenCalled();
  });

  test('calls onWorkOrderClick when a work order is clicked', () => {
    render(
      <Calendar 
        workOrders={mockWorkOrders} 
        onDateClick={mockDateClick} 
        onWorkOrderClick={mockWorkOrderClick} 
      />
    );

    // Find a work order by its test ID and click it
    const workOrderElement = screen.getByTestId('work-order-1');
    fireEvent.click(workOrderElement);
    
    // Check if onWorkOrderClick was called with the correct work order
    expect(mockWorkOrderClick).toHaveBeenCalledWith(mockWorkOrders[0]);
  });
}); 