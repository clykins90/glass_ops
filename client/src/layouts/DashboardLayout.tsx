import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const DashboardLayout = () => {
  const location = useLocation();
  
  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/customers', label: 'Customers' },
    { path: '/vehicles', label: 'Vehicles' },
    { path: '/work-orders', label: 'Work Orders' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/technicians', label: 'Technicians' }
  ];
  
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
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow h-screen sticky top-0">
          <nav className="mt-5 px-2">
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
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 