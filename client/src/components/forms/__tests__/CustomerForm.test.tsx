/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CustomerForm from '../CustomerForm';

// Create mock functions
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

// Mock the API and navigation
jest.mock('../../../services/api', () => ({
  customerApi: {
    create: (...args: any[]) => mockCreate(...args),
    update: (...args: any[]) => mockUpdate(...args),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('CustomerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with empty fields when no initial data', () => {
    render(
      <BrowserRouter>
        <CustomerForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/First Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Phone/i)).toHaveValue('');
  });

  test('renders form with initial data when provided', () => {
    const initialData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      isLead: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    render(
      <BrowserRouter>
        <CustomerForm initialData={initialData} />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/Phone/i)).toHaveValue('555-123-4567');
  });

  test('shows validation errors for required fields', async () => {
    render(
      <BrowserRouter>
        <CustomerForm />
      </BrowserRouter>
    );

    // Submit the form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Create Customer/i }));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone number is required/i)).toBeInTheDocument();
    });
  });

  test.skip('validates email format', async () => {
    render(
      <BrowserRouter>
        <CustomerForm />
      </BrowserRouter>
    );

    // Fill out required fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-123-4567' } });
    
    // Enter an invalid email
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Customer/i }));

    // Check for email validation error
    await waitFor(() => {
      expect(screen.getByText(/Email is invalid/i)).toBeInTheDocument();
    });
  });

  test('calls create API when submitting new customer', async () => {
    mockCreate.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Doe' });

    render(
      <BrowserRouter>
        <CustomerForm />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-123-4567' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Customer/i }));

    // Check that API was called with correct data
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-123-4567',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/customers/1');
    });
  });

  test('calls update API when editing existing customer', async () => {
    const initialData = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      isLead: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    mockUpdate.mockResolvedValue({ 
      ...initialData, 
      firstName: 'Jane',
      lastName: 'Smith',
    });

    render(
      <BrowserRouter>
        <CustomerForm initialData={initialData} />
      </BrowserRouter>
    );

    // Update the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Smith' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Update Customer/i }));

    // Check that API was called with correct data
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
        })
      );
    });
  });

  test('calls onSuccess callback when provided', async () => {
    const onSuccess = jest.fn();
    mockCreate.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Doe' });

    render(
      <BrowserRouter>
        <CustomerForm onSuccess={onSuccess} />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-123-4567' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Customer/i }));

    // Check that onSuccess was called with the response
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ id: 1, firstName: 'John', lastName: 'Doe' });
      expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate if onSuccess is provided
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();

    render(
      <BrowserRouter>
        <CustomerForm onCancel={onCancel} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('displays error message when API call fails', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <CustomerForm />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-123-4567' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Customer/i }));

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to save customer/i)).toBeInTheDocument();
    });
  });
}); 