import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from "../components/ui/use-toast";
import * as userService from '../services/userService';
import { Profile } from '../types/profile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useUsers } from '../context/UserContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { permissions, rolePermissions } = useUsers();
  const [formData, setFormData] = useState<Partial<Profile>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Fetch current user profile
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: userService.getCurrentUserProfile,
    enabled: !!user,
    onSuccess: (data) => {
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });
    }
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: userService.updateCurrentUserProfile,
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update profile: ${(error as Error).message}`,
        variant: 'destructive',
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
  
  // Get user role permissions - ensure lowercase lookup
  const userRole = profile?.role?.toLowerCase();
  const userRolePermissions = userRole ? rolePermissions[userRole] || [] : [];

  // Group permissions by resource
  const permissionsByResource = userRolePermissions.reduce((acc, permission) => {
    const { resource, action } = permission;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(action);
    // Sort actions alphabetically for consistency
    acc[resource].sort(); 
    return acc;
  }, {} as Record<string, string[]>);

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading profile: {(error as Error).message}</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight">
          Your Profile
        </h2>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="permissions">Your Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Profile Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      disabled
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? 'Saving...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Your Permissions</CardTitle>
              <CardDescription className="text-muted-foreground">
                These are the permissions assigned to your role ({profile?.role}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(permissionsByResource).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(permissionsByResource).map(([resource, actions]) => (
                    <div key={resource} className="p-3 border rounded-md bg-muted/50 dark:bg-muted/20">
                      <h3 className="text-md font-semibold capitalize mb-2 text-foreground">{resource}</h3>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                          <Badge key={action} variant="secondary" className="capitalize">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No permissions found for your role.
                </div>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                <p>If you believe you need additional permissions, please contact your system administrator.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage; 