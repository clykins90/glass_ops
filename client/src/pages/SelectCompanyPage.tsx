import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from "../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2 } from 'lucide-react';

const SelectCompanyPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user already has a company
  useEffect(() => {
    const checkUserCompany = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Check if user profile already has a company
        const { data, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If user already has a company, redirect to dashboard
        if (data?.company_id) {
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error checking user company:', error.message);
        toast({
          title: 'Error',
          description: 'Failed to check company information. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    checkUserCompany();
  }, [user, navigate, toast]);

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({
        title: 'Error',
        description: 'Company name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a company.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Call the function to create company and update profile
      const { data, error } = await supabase.rpc(
        'create_or_join_company',
        { 
          company_name: companyName,
          user_id: user.id
        }
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Company created successfully!',
      });

      // Redirect to dashboard
      navigate('/');
    } catch (error: any) {
      console.error('Error creating company:', error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create company. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <form onSubmit={handleCreateCompany}>
          <CardHeader>
            <CardTitle className="text-xl">Welcome to Glass Repair</CardTitle>
            <CardDescription>
              Create a company to get started with the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Company'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SelectCompanyPage; 