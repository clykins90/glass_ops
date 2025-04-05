import { Customer } from '../types/customer'; 
import { WorkOrder } from '../types/workOrder'; 
import { Vehicle } from '../types/vehicle'; 
import { Profile } from '../types/profile';
import { supabase } from '../lib/supabaseClient';

export interface ScheduleEntry {
  id: string;
  technician_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface TimeOffEntry {
  id: string;
  technician_id: string;
  start_datetime: string;
  end_datetime: string;
  reason?: string;
}

// Define the API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Schedule API functions
export const scheduleApi = {
  // Get technician's schedule
  getTechnicianSchedule: async (technicianId: string): Promise<ScheduleEntry[]> => {
    const response = await fetch(`${API_URL}/technicians/${technicianId}/schedule`, {
      headers: await getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Add schedule entry
  addScheduleEntry: async (
    technicianId: string, 
    scheduleData: Omit<ScheduleEntry, 'id' | 'technician_id'>
  ): Promise<ScheduleEntry> => {
    const data = {
      ...scheduleData,
      technician_id: technicianId
    };
    
    const response = await fetch(`${API_URL}/technicians/${technicianId}/schedule`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Update schedule entry
  updateScheduleEntry: async (
    technicianId: string,
    scheduleId: string,
    scheduleData: Omit<ScheduleEntry, 'id' | 'technician_id'>
  ): Promise<ScheduleEntry> => {
    const data = {
      ...scheduleData,
      technician_id: technicianId
    };
    
    const response = await fetch(`${API_URL}/technicians/${technicianId}/schedule/${scheduleId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Delete schedule entry
  deleteScheduleEntry: async (
    technicianId: string,
    scheduleId: string
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/technicians/${technicianId}/schedule/${scheduleId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
  },
  
  // Get technician's time off
  getTechnicianTimeOff: async (technicianId: string): Promise<TimeOffEntry[]> => {
    const response = await fetch(`${API_URL}/technicians/${technicianId}/time-off`, {
      headers: await getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Add time off entry
  addTimeOffEntry: async (
    technicianId: string,
    timeOffData: Omit<TimeOffEntry, 'id' | 'technician_id'>
  ): Promise<TimeOffEntry> => {
    const data = {
      ...timeOffData,
      technician_id: technicianId
    };
    
    const response = await fetch(`${API_URL}/technicians/${technicianId}/time-off`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Update time off entry
  updateTimeOffEntry: async (
    technicianId: string,
    timeOffId: string,
    timeOffData: Omit<TimeOffEntry, 'id' | 'technician_id'>
  ): Promise<TimeOffEntry> => {
    const data = {
      ...timeOffData,
      technician_id: technicianId
    };
    
    const response = await fetch(`${API_URL}/technicians/${technicianId}/time-off/${timeOffId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Delete time off entry
  deleteTimeOffEntry: async (
    technicianId: string,
    timeOffId: string
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/technicians/${technicianId}/time-off/${timeOffId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || `API Error: ${response.status}`);
    }
  }
}; 