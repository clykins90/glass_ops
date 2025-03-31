import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profile';

/**
 * Get all users for the current company
 */
export const getAllUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: false }) // admin first, then others
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a user by ID
 */
export const getUserById = async (id: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }

  return data;
};

/**
 * Get current user's profile
 */
export const getCurrentUserProfile = async (): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  return getUserById(user.id);
};

/**
 * Update current user's profile information
 */
export const updateCurrentUserProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  // Remove fields that shouldn't be updated via this service
  delete profileData.role;
  delete profileData.company_id;
  delete profileData.id;
  delete profileData.createdAt;
  delete profileData.updatedAt;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
};

// Helper function to ensure proper case for user roles
export const capitalizeRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

/**
 * Update a user's role
 */
export const updateUserRole = async (userId: string, role: string) => {
  // Ensure proper case for the role to match the enum
  const capitalizedRole = capitalizeRole(role);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: capitalizedRole })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }

  return data;
};

/**
 * Get all available permissions
 */
export const getAllPermissions = async () => {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })
    .order('action', { ascending: true });

  if (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = async (role: string) => {
  // Ensure first letter is capitalized to match the enum in the database
  const capitalizedRole = capitalizeRole(role);
  
  const { data, error } = await supabase
    .from('role_permissions')
    .select('resource, action')
    .eq('role', capitalizedRole);

  if (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }

  return data || [];
};

/**
 * Add a permission to a role
 */
export const addPermissionToRole = async (role: string, resource: string, action: string) => {
  // Ensure first letter is capitalized to match the enum in the database
  const capitalizedRole = capitalizeRole(role);
  
  const { data, error } = await supabase
    .from('role_permissions')
    .insert([{ role: capitalizedRole, resource, action }]);

  if (error) {
    console.error('Error adding permission to role:', error);
    throw error;
  }

  return data;
};

/**
 * Remove a permission from a role
 */
export const removePermissionFromRole = async (role: string, resource: string, action: string) => {
  // Ensure first letter is capitalized to match the enum in the database
  const capitalizedRole = capitalizeRole(role);
  
  const { data, error } = await supabase
    .from('role_permissions')
    .delete()
    .match({ role: capitalizedRole, resource, action });

  if (error) {
    console.error('Error removing permission from role:', error);
    throw error;
  }

  return data;
}; 