import { supabase } from '../lib/supabaseClient';
// Import necessary types
import { Customer } from '../types/customer'; 
import { WorkOrder } from '../types/workOrder'; 
import { Vehicle } from '../types/vehicle'; 
import { Profile } from '../types/profile'; // Assuming Technician maps to Profile

// Check if we're in a test environment
const isTest = typeof jest !== 'undefined';

// Use fallback URL for tests
const API_URL = isTest ? 'http://test-api-url.com/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Helper function to check if an error is an authentication error
export const isAuthError = (error: any): boolean => {
  // Check for common auth error patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('unauthorized') || 
           message.includes('authentication') || 
           message.includes('forbidden') ||
           message.includes('auth error') ||
           message.includes('token');
  }
  return false;
};

// API request wrapper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  try {
    // Get token from Supabase session
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    console.log("API Request to", endpoint, "Token exists:", !!token);
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn(`Making unauthenticated request to ${endpoint} - this may fail if authentication is required`);
    }

    // Make the request
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `API Error: ${response.status}`;
      
      if (response.status === 401) {
        console.error(`Authentication error for ${endpoint}:`, errorMessage);
        // Consider refreshing the session or redirecting to login here
      }
      
      throw new Error(errorMessage);
    }

    // Return the response data
    if (response.status !== 204) {
      return response.json();
    }
    
    return {} as T;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

// Generic CRUD operations
const createCrudApi = <T>(entityPath: string) => ({
  getAll: async (): Promise<T[]> => 
    apiRequest<T[]>(entityPath),
  
  getById: async (id: string | number): Promise<T> => 
    apiRequest<T>(`${entityPath}/${id}`),
  
  create: async (data: Partial<T>): Promise<T> => 
    apiRequest<T>(entityPath, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: async (id: string | number, data: Partial<T>): Promise<T> => 
    apiRequest<T>(`${entityPath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: async (id: string | number): Promise<void> => 
    apiRequest<void>(`${entityPath}/${id}`, {
      method: 'DELETE',
    }),
});

// Export specific APIs
export const workOrderApi = {
  ...createCrudApi<WorkOrder>('workorders'),
  getByStatus: async (status: string) => 
    apiRequest<WorkOrder[]>(`workorders/status/${status}`)
};

export const customerApi = {
  ...createCrudApi<Customer>('customers'),
  getVehicles: async (customerId: string | number) => 
    apiRequest<Vehicle[]>(`customers/${customerId}/vehicles`),
  getWorkOrders: async (customerId: string | number) => 
    apiRequest<WorkOrder[]>(`customers/${customerId}/workorders`)
};

export const vehicleApi = {
  ...createCrudApi<Vehicle>('vehicles'),
  getByCustomerId: async (customerId: string | number) => 
    apiRequest<Vehicle[]>(`vehicles/customer/${customerId}`)
};

export const technicianApi = {
  ...createCrudApi<Profile>('technicians'),
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<any> => apiRequest('dashboard/metrics'),
  getRecentWorkOrders: async (limit = 5): Promise<WorkOrder[]> => apiRequest(`dashboard/recent-work-orders?limit=${limit}`),
  getTechnicianStats: async (): Promise<any[]> => apiRequest('dashboard/technician-stats'),
  getMetrics: async () => {
    const summary: Record<string, any> = await apiRequest('dashboard/metrics');
    const recentWorkOrders: WorkOrder[] = await apiRequest('dashboard/recent-work-orders');
    const technicianStats: any[] = await apiRequest('dashboard/technician-stats');
    
    return {
      ...summary,
      recentWorkOrders,
      technicianWorkload: technicianStats
    };
  }
};

export default {
  workOrderApi,
  customerApi,
  vehicleApi,
  technicianApi,
  dashboardApi
};
