import React, { useState, useEffect } from 'react';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types/profile';

const UserManagement: React.FC = () => {
  const { users, loading, permissions, rolePermissions, updateUserRole, addPermissionToRole, removePermissionFromRole } = useUsers();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch the user's profile from the profiles table
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Check if current user is admin
  const isAdmin = 
    // Check profile role from database
    profile?.role?.toLowerCase() === 'admin';
  
  if (!isAdmin && !profileLoading) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group permissions by resource
  const permissionsByResource: Record<string, typeof permissions> = {};
  permissions.forEach(permission => {
    if (!permissionsByResource[permission.resource]) {
      permissionsByResource[permission.resource] = [];
    }
    permissionsByResource[permission.resource].push(permission);
  });

  // Check if a role has a specific permission
  const hasPermission = (role: string, resource: string, action: string) => {
    if (!rolePermissions[role]) return false;
    return rolePermissions[role].some(p => p.resource === resource && p.action === action);
  };

  // Toggle permission for a role
  const togglePermission = async (role: string, resource: string, action: string, hasPermission: boolean) => {
    if (hasPermission) {
      await removePermissionFromRole(role, resource, action);
    } else {
      await addPermissionToRole(role, resource, action);
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
  };

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage users in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableCaption>List of all users in your company</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.firstName || user.lastName || 'N/A'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value: string) => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="technician">Technician</SelectItem>
                              <SelectItem value="customer">Customer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {/* Additional actions can be added here */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Configure what each role can do in the system.
              </CardDescription>
              
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant={selectedRole === 'admin' ? 'default' : 'outline'} 
                  onClick={() => setSelectedRole('admin')}
                >
                  Admin
                </Button>
                <Button 
                  variant={selectedRole === 'technician' ? 'default' : 'outline'} 
                  onClick={() => setSelectedRole('technician')}
                >
                  Technician
                </Button>
                <Button 
                  variant={selectedRole === 'customer' ? 'default' : 'outline'} 
                  onClick={() => setSelectedRole('customer')}
                >
                  Customer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionsByResource).map(([resource, perms]) => (
                    <div key={resource} className="space-y-2">
                      <h3 className="text-lg font-medium capitalize">{resource}</h3>
                      <Separator />
                      <div className="space-y-2">
                        {perms.map((permission) => (
                          <div key={`${permission.resource}-${permission.action}`} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${selectedRole}-${permission.resource}-${permission.action}`}
                              checked={hasPermission(selectedRole, permission.resource, permission.action)}
                              onCheckedChange={() => 
                                togglePermission(
                                  selectedRole, 
                                  permission.resource, 
                                  permission.action, 
                                  hasPermission(selectedRole, permission.resource, permission.action)
                                )
                              }
                              // Disable checkboxes if the role is admin (assuming admin has all permissions implicitly or managed differently)
                              // disabled={selectedRole === 'admin'} 
                            />
                            {/* Apply standard label styling */}
                            <label 
                              htmlFor={`${selectedRole}-${permission.resource}-${permission.action}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)} {permission.resource} 
                              {/* (e.g., Create work-orders) */}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement; 