// Mock the supabase client before imports
const mockSignInWithPassword = jest.fn();
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  }
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from '../LoginPage'; // Adjust the path as necessary
import { AuthProvider } from '../../context/AuthContext'; // Adjust the path
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from '../../components/ui/toaster'; // Adjusted relative path - Commented out for now

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Use actual implementation for Router, Link, etc.
  useNavigate: () => mockNavigate,
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('../../components/ui/use-toast', () => ({ // Adjust path
  useToast: () => ({ toast: mockToast }),
}));

// Create a QueryClient instance for tests
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }, // Disable retries for tests
});

// Helper function to render with providers
const renderLoginPage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* Wrap with AuthProvider if LoginPage uses useAuth, though it doesn't seem to directly */}
        <Router>
          <LoginPage />
          {/* <Toaster /> */}{/* Include Toaster to check for toast messages - Commented out for now */}
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSignInWithPassword.mockClear();
    mockNavigate.mockClear();
    mockToast.mockClear();
    // Reset specific mock implementations if needed
    mockSignInWithPassword.mockReset();
  });

  test('renders login form', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  test('allows user to enter email and password', () => {
    renderLoginPage();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
  });

  test('calls supabase signInWithPassword and navigates on successful login', async () => {
    // Mock successful login response
    mockSignInWithPassword.mockResolvedValueOnce({ data: { user: { id: '123' }, session: { access_token: 'abc' } }, error: null });

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Click the sign-in button
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check if supabase function was called
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Check for success toast (optional but good)
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Login Successful",
    }));


    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('shows error toast and does not navigate on failed login', async () => {
    // Mock failed login response
    const errorMessage = 'Invalid login credentials';
    mockSignInWithPassword.mockResolvedValueOnce({ data: null, error: { message: errorMessage } });

    renderLoginPage();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

    // Click the sign-in button
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check if supabase function was called
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    });

    // Check for error toast
    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        }));
    });


    // Check that navigation did NOT occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Add more tests:
  // - Input validation (e.g., required fields - though browser validation might handle this)
  // - Loading state on the button
}); 