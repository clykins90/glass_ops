import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface CompanyRequiredRouteProps {
  children: ReactNode;
}

const CompanyRequiredRoute: React.FC<CompanyRequiredRouteProps> = ({ children }) => {
  const { user, session } = useAuth();
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkUserCompany = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setHasCompany(!!data?.company_id);
      } catch (error) {
        console.error('Error checking user company:', error);
        setHasCompany(false);
      } finally {
        setCheckingCompany(false);
      }
    };

    checkUserCompany();
  }, [session]);

  if (checkingCompany) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user does not have a company, redirect to select-company page
  if (hasCompany === false) {
    // Avoid redirect loops by checking the current path
    if (location.pathname !== '/select-company') {
      return <Navigate to="/select-company" replace />;
    }
  }

  return <>{children}</>;
};

export default CompanyRequiredRoute; 