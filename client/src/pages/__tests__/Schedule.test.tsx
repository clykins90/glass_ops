import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Schedule from '../Schedule';
import { WorkOrder } from '../../types/workOrder';
import { getWorkOrders, getWorkOrdersByStatus } from '../../services/workOrderService';
import { getTechnicians, getTechnicianSchedule } from '../../services/technicianService';

// Mock the Calendar component
jest.mock('../../components/Calendar', () => ({
  Calendar: ({ 
    workOrders, 
    onDateClick, 
    onWorkOrderClick 
  }: { 
    workOrders: WorkOrder[]; 
    onDateClick?: (date: Date) => void; 
    onWorkOrderClick?: (workOrder: WorkOrder) => void; 
  }) => (
    <div data-testid="calendar-mock">
      <div>Calendar Component (Mocked)</div>
      <button onClick={() => onDateClick && onDateClick(new Date())}>
        Click Date
      </button>
      {workOrders.length > 0 && (
        <button onClick={() => onWorkOrderClick && onWorkOrderClick(workOrders[0])}>
          Click Work Order
        </button>
      )}
    </div>
  )
}));

// Mock the services
jest.mock('../../services/workOrderService');
jest.mock('../../services/technicianService');
jest.mock('../../components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock the router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Schedule Component', () => {
  const mockWorkOrders = [
    {
      id: 1,
      customerId: 1,
      customer: { id: 1, firstName: 'John', lastName: 'Doe', phone: '123-456-7890' },
      vehicleId: 1,
      vehicle: { id: 1, make: 'Toyota', model: 'Camry', year: 2020 },
      technicianId: 1,
      technician: { id: 1, firstName: 'Tech', lastName: 'One' },
      serviceType: 'replacement',
      glassLocation: 'windshield',
      scheduledDate: new Date().toISOString(),
      status: 'scheduled',
      insuranceClaim: false,
    },
    {
      id: 2,
      customerId: 2,
      customer: { id: 2, firstName: 'Jane', lastName: 'Smith', phone: '987-654-3210' },
      vehicleId: 2,
      vehicle: { id: 2, make: 'Honda', model: 'Civic', year: 2019 },
      technicianId: null,
      serviceType: 'repair',
      glassLocation: 'rear window',
      scheduledDate: null,
      status: 'scheduled',
      insuranceClaim: true,
    }
  ];

  const mockTechnicians = [
    { id: 1, firstName: 'Tech', lastName: 'One', active: true, phone: '111-222-3333' },
    { id: 2, firstName: 'Tech', lastName: 'Two', active: true, phone: '444-555-6666' }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    (getWorkOrders as jest.Mock).mockResolvedValue(mockWorkOrders);
    (getWorkOrdersByStatus as jest.Mock).mockResolvedValue(mockWorkOrders.filter(wo => wo.status === 'scheduled'));
    (getTechnicians as jest.Mock).mockResolvedValue(mockTechnicians);
    (getTechnicianSchedule as jest.Mock).mockResolvedValue(mockWorkOrders.filter(wo => wo.technicianId === 1));
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Schedule />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading schedule...')).toBeInTheDocument();
  });

  test('renders calendar view by default after loading', async () => {
    render(
      <BrowserRouter>
        <Schedule />
      </BrowserRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });
    
    // Check that calendar view is active
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
  });

  test('switches to unscheduled work orders view', async () => {
    render(
      <BrowserRouter>
        <Schedule />
      </BrowserRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });
    
    // Click on unscheduled tab
    fireEvent.click(screen.getByText('Unscheduled Work Orders'));
    
    // Check that unscheduled view is shown
    expect(screen.getByText('Unscheduled Work Orders')).toBeInTheDocument();
    expect(screen.getByText('rear window - repair')).toBeInTheDocument();
  });

  test('switches to technician schedules view', async () => {
    render(
      <BrowserRouter>
        <Schedule />
      </BrowserRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });
    
    // Click on technicians tab
    fireEvent.click(screen.getByText('Technician Schedules'));
    
    // Check that technician view is shown
    expect(screen.getByText('Technician Schedules')).toBeInTheDocument();
    expect(screen.getByText('Schedule for Tech One')).toBeInTheDocument();
  });
}); 