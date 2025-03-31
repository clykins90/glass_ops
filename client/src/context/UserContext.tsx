import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "../components/ui/use-toast";
import { useAuth } from './AuthContext';
import * as userService from '@/services/userService';
import { Profile } from '@/types/profile';

interface Permission {
  id: number;
  resource: string;
  action: string;
  description?: string;
}

interface RolePermission {
  role: string;
  resource: string;
  action: string;
}

interface UserContextType {
  users: Profile[];
  loading: boolean;
  permissions: Permission[];
  rolePermissions: Record<string, RolePermission[]>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  addPermissionToRole: (role: string, resource: string, action: string) => Promise<void>;
  removePermissionFromRole: (role: string, resource: string, action: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermission[]>>({});
  const { toast } = useToast();
  const { session } = useAuth();

  // Fetch users when session is available
  useEffect(() => {
    if (session) {
      refreshUsers();
      refreshPermissions();
    }
  }, [session]);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = async () => {
    try {
      setLoading(true);
      const permissionsData = await userService.getAllPermissions();
      setPermissions(permissionsData);

      // Fetch permissions for each role - use lowercase for internal state keys
      // but our service will properly capitalize for the database
      const roles = ['admin', 'technician', 'customer'];
      const permissionsByRole: Record<string, RolePermission[]> = {};

      for (const role of roles) {
        try {
          const rolePerms = await userService.getRolePermissions(role);
          // Map to ensure all properties are present
          permissionsByRole[role] = rolePerms.map(perm => ({
            role,
            resource: perm.resource,
            action: perm.action
          }));
        } catch (roleError: any) {
          console.error(`Error fetching permissions for role ${role}:`, roleError);
          // Continue with other roles even if one fails
          permissionsByRole[role] = [];
        }
      }

      setRolePermissions(permissionsByRole);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load permissions: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      setLoading(true);
      await userService.updateUserRole(userId, role);
      await refreshUsers();
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPermissionToRole = async (role: string, resource: string, action: string) => {
    try {
      setLoading(true);
      await userService.addPermissionToRole(role, resource, action);
      await refreshPermissions();
      toast({
        title: 'Success',
        description: `Permission added to ${role} role`,
      });
    } catch (error: any) {
      console.error('Error adding permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to add permission: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removePermissionFromRole = async (role: string, resource: string, action: string) => {
    try {
      setLoading(true);
      await userService.removePermissionFromRole(role, resource, action);
      await refreshPermissions();
      toast({
        title: 'Success',
        description: `Permission removed from ${role} role`,
      });
    } catch (error: any) {
      console.error('Error removing permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove permission: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    users,
    loading,
    permissions,
    rolePermissions,
    updateUserRole,
    addPermissionToRole,
    removePermissionFromRole,
    refreshUsers,
    refreshPermissions,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}; 