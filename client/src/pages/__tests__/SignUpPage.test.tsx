import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignUpPage from '../SignUpPage'; // Adjust path
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from '../../components/ui/toaster'; // Commented out for consistency

// --- Mocks ---
const mockSignUp = jest.fn();
const mockCompanyInsert = jest.fn();
const mockCompanySelect = jest.fn();
const mockCompanySingle = jest.fn();

jest.mock('../../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signUp: jest.fn(), // We'll assign mockSignUp to this later
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
      from: jest.fn().mockImplementation((tableName) => {
        if (tableName === 'companies') {
          return {
            insert: mockCompanyInsert.mockReturnValue({
              select: mockCompanySelect.mockReturnValue({
                single: mockCompanySingle
              })
            })
          };
        }
        return { insert: jest.fn(), select: jest.fn(), update: jest.fn(), delete: jest.fn() };
      }),
    }
  };
});

// Now that all imports are done, assign the mocks
const supabaseMock = require('../../lib/supabaseClient').supabase;
supabaseMock.auth.signUp = mockSignUp;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('../../components/ui/use-toast', () => ({ // Adjust path
  useToast: () => ({ toast: mockToast }),
}));

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

// Helper function
const renderSignUpPage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <SignUpPage />
        {/* <Toaster /> */}{/* Commented out */}
      </Router>
    </QueryClientProvider>
  );
};

// --- Test Suite ---
describe('SignUpPage', () => {
  beforeEach(() => {
    // Reset mocks
    mockSignUp.mockClear();
    mockCompanyInsert.mockClear();
    mockCompanySelect.mockClear();
    mockCompanySingle.mockClear();
    mockNavigate.mockClear();
    mockToast.mockClear();
    // Reset implementations
    mockSignUp.mockReset();
    mockCompanySingle.mockReset();
  });

  test('renders sign up form with all fields', () => {
    renderSignUpPage();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument(); // Use regex for exact match
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows user to fill the form', () => {
    renderSignUpPage();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Test Inc.' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    expect(screen.getByLabelText(/first name/i)).toHaveValue('Test');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('User');
    expect(screen.getByLabelText(/company name/i)).toHaveValue('Test Inc.');
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('password123');
    expect(screen.getByLabelText(/confirm password/i)).toHaveValue('password123');
  });

  test('shows error toast if passwords do not match', async () => {
    renderSignUpPage();

    // Fill form with mismatching passwords
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Test Inc.' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create an account/i }));

    // Check for error toast
    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Sign Up Error",
            description: "Passwords do not match.",
            variant: "destructive",
        }));
    });

    // Ensure Supabase functions were not called and navigation didn't happen
    expect(mockCompanyInsert).not.toHaveBeenCalled();
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

   test('shows error toast if company name is missing', async () => {
    renderSignUpPage();

    // Fill form without company name
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: ' ' } }); // Empty
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create an account/i }));

    // Check for error toast
    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Sign Up Error",
            description: "Company name is required.",
            variant: "destructive",
        }));
    });

    // Ensure Supabase functions were not called and navigation didn't happen
    expect(mockCompanyInsert).not.toHaveBeenCalled();
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('calls supabase insert company and signup, then navigates on success', async () => {
    const companyId = 'fake-company-uuid';
    const userId = 'fake-user-uuid';
    const userEmail = 'test@example.com';
    const firstName = 'Test';
    const lastName = 'User';

    // Mock successful company creation
    mockCompanySingle.mockResolvedValueOnce({ 
      data: { id: companyId, name: 'Test Inc.' }, 
      error: null 
    });
    
    // Mock successful user signup
    mockSignUp.mockResolvedValueOnce({ 
      data: { 
        user: { 
          id: userId, 
          email: userEmail, 
          identities: [{ id: 'some-identity' }] 
        } 
      }, 
      error: null 
    });

    renderSignUpPage();

    // Fill form correctly
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: firstName } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: lastName } });
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Test Inc.' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: userEmail } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create an account/i }));

    // Wait for async operations to complete
    await waitFor(() => {
      // Check company insert call
      expect(mockCompanyInsert).toHaveBeenCalledTimes(1);
      expect(mockCompanyInsert).toHaveBeenCalledWith([{ name: 'Test Inc.' }]);
      expect(mockCompanySelect).toHaveBeenCalledTimes(1);
      expect(mockCompanySingle).toHaveBeenCalledTimes(1);
      
      // Check signup call
      expect(mockSignUp).toHaveBeenCalledTimes(1);
      expect(mockSignUp).toHaveBeenCalledWith({
        email: userEmail,
        password: 'password123',
        options: {
          data: {
            company_id: companyId,
            role: 'admin',
            full_name: `${firstName} ${lastName}`
          }
        }
      });
      
      // Check toast was called
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Sign Up Successful"
      }));
      
      // Check navigation
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // TODO: Add tests for API error scenarios (company insert fails, signup fails)
}); 