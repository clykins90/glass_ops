import { Conversation } from '../types/agent';
import { supabase } from '../lib/supabaseClient';

// Base API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  try {
    // Get token from Supabase session
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

// Start a new conversation
export const startConversation = async (): Promise<Conversation> => {
  // Get the current user
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    throw new Error('User not authenticated');
  }
  
  // Get user's profile to get company_id
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', data.user.id)
    .single();
  
  if (error || !profile || !profile.company_id) {
    throw new Error('User does not have a company assigned');
  }
  
  const payload = {
    userId: data.user.id,
    companyId: String(profile.company_id)
  };
  
  return apiRequest<Conversation>('agent/conversations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Get a conversation by ID
export const getConversation = async (id: string): Promise<Conversation> => {
  return apiRequest<Conversation>(`agent/conversations/${id}`);
};

// Send a message to the conversation
export const sendMessage = async (id: string, message: string): Promise<{ message: string; conversation: Conversation }> => {
  return apiRequest<{ message: string; conversation: Conversation }>(`agent/conversations/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

// Create a work order from the conversation
export const createWorkOrder = async (id: string): Promise<any> => {
  return apiRequest<any>(`agent/conversations/${id}/workorders`, {
    method: 'POST'
  });
}; 