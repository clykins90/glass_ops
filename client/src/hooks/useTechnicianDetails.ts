import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface TechnicianDetails {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
}

export function useTechnicianDetails(technicianId?: string) {
  const [data, setData] = useState<TechnicianDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!technicianId || !session) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/api/technicians/${technicianId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch technician details:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch technician details'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [technicianId, session]);
  
  return { data, isLoading, error };
} 