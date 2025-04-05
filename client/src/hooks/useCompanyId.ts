import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export function useCompanyId() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && (user as User).company_id) {
      setCompanyId((user as User).company_id as string);
    }
  }, [user]);

  return companyId;
} 