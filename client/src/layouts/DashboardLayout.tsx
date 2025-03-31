import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { UserCircle, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types/profile';
import { useQuery } from '@tanstack/react-query';
import * as userService from '../services/userService';
import { ThemeToggle } from '../components/ThemeToggle';

const DashboardLayout = () => {
  const location = useLocation();
  const { logout, user, loading: authLoading } = useAuth();
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
  
  // Check if user is admin based on profile role
  const isAdmin = profile?.role?.toLowerCase() === 'admin';
  
  // Navigation items - include user management for admin
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/customers', label: 'Customers' },
    { path: '/vehicles', label: 'Vehicles' },
    { path: '/work-orders', label: 'Work Orders' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/technicians', label: 'Technicians' },
    // Only show user management for admins - allow based on profile role
    ...(isAdmin ? [{ path: '/user-management', label: 'User Management' }] : [])
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">GlassOps</h1>
              </div>
            </div>
            {user && !authLoading && (
              <div className="ml-auto flex items-center gap-2 text-sm">
                <div className="text-gray-500 dark:text-gray-400">
                  Logged in as: {user.email} {profile?.role ? `(${profile.role})` : user.role && `(${user.role})`}
                </div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  title="View/Edit Profile"
                >
                  <UserCircle size={18} />
                  <span className="hidden md:inline">Profile</span>
                </Link>
                <Button 
                   variant="ghost"
                   size="sm"
                   className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                   onClick={handleLogout}
                   disabled={authLoading}
                   title="Logout"
                 >
                   <LogOut size={16} />
                   <span className="hidden md:inline">Logout</span>
                 </Button>
                 <ThemeToggle />
              </div>
            )}
            {authLoading && (
              <div className="ml-auto flex items-center gap-2 text-sm">
                <div className="animate-pulse h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="animate-pulse h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="animate-pulse h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="animate-pulse h-8 w-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow h-[calc(100vh-4rem)] sticky top-16 flex flex-col">
          <nav className="mt-5 px-2 flex-grow overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      location.pathname.startsWith(item.path)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 