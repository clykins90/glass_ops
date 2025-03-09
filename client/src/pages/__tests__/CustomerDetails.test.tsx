/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomerDetails from '../CustomerDetails';

// Create mock functions
const mockGetById = jest.fn();
const mockGetVehicles = jest.fn();
const mockGetWorkOrders = jest.fn();
const mockDelete = jest.fn();

// Mock the API
jest.mock('../../services/api', () => ({
  customerApi: {
    getById: (...args: any[]) => mockGetById(...args),
    getVehicles: (...args: any[]) => mockGetVehicles(...args),
    getWorkOrders: (...args: any[]) => mockGetWorkOrders(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

// Create a test QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('CustomerDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    mockGetById.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      isLead: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    });
    mockGetVehicles.mockResolvedValue([]);
    mockGetWorkOrders.mockResolvedValue([]);
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    const testQueryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={['/customers/1']}>
          <Routes>
            <Route path="/customers/:id" element={ui} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  test('renders customer details', async () => {
    renderWithProviders(<CustomerDetails />);
    
    // Wait for customer data to load
    await waitFor(() => {
      expect(screen.getAllByText(/John Doe/i)[0]).toBeInTheDocument();
    });
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-123-4567')).toBeInTheDocument();
  });

  test('shows delete confirmation dialog when delete button is clicked', async () => {
    renderWithProviders(<CustomerDetails />);
    
    // Wait for customer data to load
    await waitFor(() => {
      expect(screen.getAllByText(/John Doe/i)[0]).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /Delete Customer/i }));
    
    // Check that confirmation dialog is shown
    expect(screen.getByText(/Are you sure you want to delete John Doe/i)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('closes confirmation dialog when cancel is clicked', async () => {
    renderWithProviders(<CustomerDetails />);
    
    // Wait for customer data to load
    await waitFor(() => {
      expect(screen.getAllByText(/John Doe/i)[0]).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /Delete Customer/i }));
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check that confirmation dialog is closed
    await waitFor(() => {
      expect(screen.queryByText(/Are you sure you want to delete John Doe/i)).not.toBeInTheDocument();
    });
  });

  test('deletes customer and navigates when confirm is clicked', async () => {
    mockDelete.mockResolvedValue({ success: true });
    
    renderWithProviders(<CustomerDetails />);
    
    // Wait for customer data to load
    await waitFor(() => {
      expect(screen.getAllByText(/John Doe/i)[0]).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /Delete Customer/i }));
    
    // Click confirm button
    fireEvent.click(screen.getByText('Delete'));
    
    // Check that delete API was called
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(mockNavigate).toHaveBeenCalledWith('/customers');
    });
  });
}); 