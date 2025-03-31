import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Using relative path
import { Skeleton } from './ui/skeleton'; // Import Skeleton for loading state
import { supabase } from '../lib/supabaseClient';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, session, user } = useAuth();
  const [checkingCompany, setCheckingCompany] = useState(false);
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const location = useLocation();

  // Check if user has a company when authenticated
  useEffect(() => {
    const checkUserCompany = async () => {
      if (!session?.user) return;

      try {
        setCheckingCompany(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setHasCompany(!!data?.company_id);
      } catch (error) {
        console.error('Error checking user company:', error);
        setHasCompany(false); // Assume no company on error
      } finally {
        setCheckingCompany(false);
      }
    };

    if (session?.user) {
      checkUserCompany();
    }
  }, [session]);

  // Handle the initial loading state
  if (loading || checkingCompany) {
    // Show a loading indicator, e.g., a simple message or a spinner
    // Using Skeleton might be appropriate if wrapping a layout
    return (
      <div className="flex items-center justify-center h-screen">
         <Skeleton className="h-12 w-1/2" />
          {/* Or replace with a more sophisticated loading spinner component */}
      </div>
    );
  }

  // Check if user is logged in (session exists and potentially user object)
  // Supabase provides session object which is a good indicator of auth status
  if (!session) {
    // User not logged in, redirect to login page
    // Pass the current location to redirect back after login (optional)
    // return <Navigate to="/login" state={{ from: location }} replace />;
    return <Navigate to="/login" replace />;
  }

  // Check if the user has a company - only for main app routes
  // Skip this check for the select-company page itself to avoid redirect loops
  if (hasCompany === false && !location.pathname.includes('/select-company')) {
    return <Navigate to="/select-company" replace />;
  }

  // User is logged in and has a company (or is on select-company page), render the requested component/children
  return <>{children}</>;
};

export default ProtectedRoute; 