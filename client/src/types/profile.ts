/**
 * Represents a user profile in the system.
 * Corresponds to the 'profiles' table in Supabase.
 */
export interface Profile {
  id: string; // Usually a UUID from auth.users
  company_id: number; // Foreign key to companies table
  role: string; // e.g., 'admin', 'technician', 'manager'
  firstName: string;
  lastName: string;
  email?: string; // May come from auth.users or profile
  phone?: string;
  // Add other fields from your profiles table as needed
  // E.g., avatar_url?: string;
  createdAt: string;
  updatedAt: string;
} 