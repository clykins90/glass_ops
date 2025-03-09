import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Schedule from '../Schedule';
import * as workOrderService from '../../services/workOrderService';
import { WorkOrder } from '../../types/workOrder';

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
      <button 
        data-testid="mock-work-order" 
        onClick={() => onWorkOrderClick && onWorkOrderClick(workOrders[0])}
      >
        Mock Work Order
      </button>
      <button 
        data-testid="mock-date" 
        onClick={() => onDateClick && onDateClick(new Date())}
      >
        Mock Date
      </button>
    </div>
  )
}));

// Mock the workOrderService
jest.mock('../../services/workOrderService');

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Schedule Page', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (workOrderService.getWorkOrders as jest.Mock).mockResolvedValue(mockWorkOrders);
  });

  test('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading schedule...')).toBeInTheDocument();
  });

  test('renders schedule after loading', async () => {
    render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>
    );

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });

    // Check if the schedule title is rendered
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    
    // Check if the add work order button is rendered
    expect(screen.getByText('Add Work Order')).toBeInTheDocument();
  });

  test('navigates to add work order page when button is clicked', async () => {
    render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>
    );

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });

    // Find the add work order button and click it
    const addButton = screen.getByText('Add Work Order');
    fireEvent.click(addButton);

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/work-orders/add');
  });

  test('navigates to work order details when a work order is clicked', async () => {
    render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>
    );

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });

    // Find the mock work order button and click it
    const workOrderButton = screen.getByTestId('mock-work-order');
    fireEvent.click(workOrderButton);

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/work-orders/1');
  });

  test('sets selected date when a date is clicked', async () => {
    render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>
    );

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading schedule...')).not.toBeInTheDocument();
    });

    // Find the mock date button and click it
    const dateButton = screen.getByTestId('mock-date');
    fireEvent.click(dateButton);

    // Check if the selected date is displayed
    await waitFor(() => {
      expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    // Mock the service to throw an error
    (workOrderService.getWorkOrders as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <MemoryRouter>
        <Schedule />
      </MemoryRouter>
    );

    // Wait for the error state to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch work orders. Please try again later.')).toBeInTheDocument();
    });

    // Check if the retry button is rendered
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
}); 