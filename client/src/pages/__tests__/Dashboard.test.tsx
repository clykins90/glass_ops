import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { dashboardApi } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  dashboardApi: {
    getMetrics: jest.fn(),
  },
}));

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div>Cell</div>,
}));

const mockDashboardData = {
  totalCustomers: 25,
  activeWorkOrders: 10,
  scheduledToday: 5,
  recentWorkOrders: [
    {
      id: 1,
      status: 'scheduled',
      serviceType: 'replacement',
      scheduledDate: '2023-06-15T10:00:00.000Z',
      customer: {
        firstName: 'John',
        lastName: 'Doe',
      },
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
      },
      technician: {
        firstName: 'Mike',
        lastName: 'Smith',
      },
    },
  ],
  workOrdersByStatus: [
    { status: 'scheduled', count: 5 },
    { status: 'in-progress', count: 3 },
    { status: 'completed', count: 12 },
  ],
  workOrdersByServiceType: [
    { serviceType: 'replacement', count: 15 },
    { serviceType: 'repair', count: 5 },
  ],
  technicianWorkload: [
    {
      id: 1,
      firstName: 'Mike',
      lastName: 'Smith',
      _count: {
        workOrders: 5,
      },
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Doe',
      _count: {
        workOrders: 3,
      },
    },
  ],
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    (dashboardApi.getMetrics as jest.Mock).mockResolvedValue(mockDashboardData);
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Check for loading indicators
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  test('renders dashboard metrics after loading', async () => {
    (dashboardApi.getMetrics as jest.Mock).mockResolvedValue(mockDashboardData);
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Total customers
      expect(screen.getByText('10')).toBeInTheDocument(); // Active work orders
      expect(screen.getByText('5')).toBeInTheDocument(); // Scheduled today
    });
    
    // Check for recent work order
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Toyota Camry/)).toBeInTheDocument();
    
    // Check for technician workload
    expect(screen.getByText('Mike Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  test('renders error message when API fails', async () => {
    (dashboardApi.getMetrics as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    });
  });
}); 