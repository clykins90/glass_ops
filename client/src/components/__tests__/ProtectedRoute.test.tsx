import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute'; // Adjust path
import { useAuth } from '../../context/AuthContext'; // Adjust path

// Mock the useAuth hook
jest.mock('../../context/AuthContext'); // Adjust path
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock a component to render inside the protected route
const ProtectedComponent = () => <div>Protected Content</div>;
// Mock the login page component for redirect checks
const LoginPage = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    mockedUseAuth.mockReset();
  });

  test('renders children when user is authenticated', () => {
    // Mock authenticated state
    mockedUseAuth.mockReturnValue({
      loading: false,
      session: { user: { id: '123' }, /* other session props */ } as any, // Cast to any for simplicity
      user: { id: '123' } as any, // Mock user object
      logout: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if protected content is rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    // Check that the login page is NOT rendered
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  test('redirects to login page when user is not authenticated', () => {
    // Mock unauthenticated state
    mockedUseAuth.mockReturnValue({
      loading: false,
      session: null,
      user: null,
      logout: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if login page is rendered (due to redirect)
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    // Check that protected content is NOT rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('shows loading indicator when auth state is loading', () => {
    // Mock loading state
    mockedUseAuth.mockReturnValue({
      loading: true,
      session: null, // Session state doesn't matter while loading
      user: null,
      logout: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
           <Route path="/login" element={<LoginPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Check for loading indicator (using the Skeleton class)
    // Note: This assumes the Skeleton component renders an element with these classes.
    // It might be better to add a data-testid to the loading div in ProtectedRoute.
    const loadingDiv = screen.getByRole('alert', { hidden: true }); // Skeleton might use role=alert or status
    expect(loadingDiv).toBeInTheDocument();
    expect(loadingDiv).toHaveClass('h-12'); // Check for specific styles applied by Skeleton

    // Check that neither protected content nor login page are rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
}); 