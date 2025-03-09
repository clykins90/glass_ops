import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VehicleForm from '../VehicleForm';
import { vehicleApi } from '../../../services/api';

// Mock the API and navigation
jest.mock('../../../services/api', () => ({
  vehicleApi: {
    create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    update: jest.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('VehicleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockVehicle = {
    id: 1,
    customerId: 1,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    color: 'Silver',
    vinNumber: '1HGCM82633A123456',
    licensePlate: 'ABC123',
    glassType: 'Laminated',
    notes: 'Test notes',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  test('renders form with empty fields for new vehicle', () => {
    renderWithRouter(<VehicleForm customerId={1} />);
    
    // Check that form fields are rendered
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vin number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/license plate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/glass type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    
    // Check that the submit button says "Add Vehicle"
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument();
  });

  test('renders form with populated fields for existing vehicle', () => {
    renderWithRouter(<VehicleForm initialData={mockVehicle} />);
    
    // Check that form fields are populated with the correct values
    expect(screen.getByLabelText(/make/i)).toHaveValue('Toyota');
    expect(screen.getByLabelText(/model/i)).toHaveValue('Camry');
    expect(screen.getByLabelText(/color/i)).toHaveValue('Silver');
    expect(screen.getByLabelText(/vin number/i)).toHaveValue('1HGCM82633A123456');
    expect(screen.getByLabelText(/license plate/i)).toHaveValue('ABC123');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Test notes');
    
    // Check that the submit button says "Update Vehicle"
    expect(screen.getByRole('button', { name: /update vehicle/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithRouter(<VehicleForm customerId={1} />);
    
    // Clear required fields
    fireEvent.change(screen.getByLabelText(/make \*/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/model \*/i), { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/make is required/i)).toBeInTheDocument();
      expect(screen.getByText(/model is required/i)).toBeInTheDocument();
    });
    
    // API should not be called
    expect(vehicleApi.create).not.toHaveBeenCalled();
  });

  test('submits form for new vehicle', async () => {
    const onSuccessMock = jest.fn();
    (vehicleApi.create as jest.Mock).mockResolvedValue(mockVehicle);
    
    renderWithRouter(<VehicleForm customerId={1} onSuccess={onSuccessMock} />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/make \*/i), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText(/model \*/i), { target: { value: 'Camry' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    
    // Check that API was called with correct data
    await waitFor(() => {
      expect(vehicleApi.create).toHaveBeenCalledWith(expect.objectContaining({
        customerId: 1,
        make: 'Toyota',
        model: 'Camry',
      }));
      expect(onSuccessMock).toHaveBeenCalledWith(mockVehicle);
    });
  });

  test('submits form for existing vehicle', async () => {
    const onSuccessMock = jest.fn();
    (vehicleApi.update as jest.Mock).mockResolvedValue(mockVehicle);
    
    renderWithRouter(<VehicleForm initialData={mockVehicle} onSuccess={onSuccessMock} />);
    
    // Change a field
    fireEvent.change(screen.getByLabelText(/color/i), { target: { value: 'Blue' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update vehicle/i }));
    
    // Check that API was called with correct data
    await waitFor(() => {
      expect(vehicleApi.update).toHaveBeenCalledWith(1, expect.objectContaining({
        color: 'Blue',
      }));
      expect(onSuccessMock).toHaveBeenCalledWith(mockVehicle);
    });
  });
}); 