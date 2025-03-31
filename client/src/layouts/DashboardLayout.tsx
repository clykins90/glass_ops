import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types/profile';

const DashboardLayout = () => {
  const location = useLocation();
  const { logout, user, loading } = useAuth();
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">GlassOps</h1>
              </div>
            </div>
            {user && !loading && (
              <div className="flex items-center gap-2 text-sm">
                <div className="text-gray-500">
                  Logged in as: {user.email} {profile?.role ? `(${profile.role})` : user.role && `(${user.role})`}
                </div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  title="View/Edit Profile"
                >
                  <UserCircle size={18} />
                  <span>Profile</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow h-screen sticky top-0 flex flex-col">
          <nav className="mt-5 px-2 flex-grow">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      location.pathname === item.path
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 mt-auto border-t border-gray-200">
             <Button 
               variant="outline" 
               className="w-full" 
               onClick={handleLogout}
               disabled={loading}
             >
               {loading ? 'Logging out...' : 'Logout'}
             </Button>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 py-6 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 