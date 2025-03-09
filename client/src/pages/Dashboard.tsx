import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Define types for our dashboard data
interface DashboardMetrics {
  totalCustomers: number;
  activeWorkOrders: number;
  scheduledToday: number;
  recentWorkOrders: Array<{
    id: number;
    status: string;
    serviceType: string;
    scheduledDate: string | null;
    customer: {
      firstName: string;
      lastName: string;
    };
    vehicle?: {
      make: string;
      model: string;
    };
    technician?: {
      firstName: string;
      lastName: string;
    };
  }>;
  workOrdersByStatus: Array<{
    status: string;
    count: number;
  }>;
  workOrdersByServiceType: Array<{
    serviceType: string;
    count: number;
  }>;
  technicianWorkload: Array<{
    id: number;
    firstName: string;
    lastName: string;
    _count: {
      workOrders: number;
    };
  }>;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" data-testid="skeleton" />
            ) : (
              <div className="text-3xl font-bold">{metrics?.totalCustomers || 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/customers" className="text-sm text-blue-600 hover:text-blue-800">
              View all customers
            </Link>
          </CardFooter>
        </Card>
        
        {/* Active Work Orders Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" data-testid="skeleton" />
            ) : (
              <div className="text-3xl font-bold">{metrics?.activeWorkOrders || 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/work-orders" className="text-sm text-blue-600 hover:text-blue-800">
              View all work orders
            </Link>
          </CardFooter>
        </Card>
        
        {/* Scheduled Today Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Scheduled Today</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" data-testid="skeleton" />
            ) : (
              <div className="text-3xl font-bold">{metrics?.scheduledToday || 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/schedule" className="text-sm text-blue-600 hover:text-blue-800">
              View schedule
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Work Orders by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center text-red-500">{error}</div>
            ) : metrics?.workOrdersByStatus && metrics.workOrdersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.workOrdersByStatus}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Work Orders" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No work order data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Work Orders by Service Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Service Type</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center text-red-500">{error}</div>
            ) : metrics?.workOrdersByServiceType && metrics.workOrdersByServiceType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.workOrdersByServiceType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="serviceType"
                  >
                    {metrics.workOrdersByServiceType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No service type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Technician Workload */}
      <Card>
        <CardHeader>
          <CardTitle>Technician Workload</CardTitle>
          <CardDescription>Active work orders assigned to technicians</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : metrics?.technicianWorkload && metrics.technicianWorkload.length > 0 ? (
            <div className="space-y-4">
              {metrics.technicianWorkload.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between">
                  <div className="font-medium">
                    {tech.firstName} {tech.lastName}
                  </div>
                  <div className="flex items-center">
                    <div className="w-64 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (tech._count.workOrders / 10) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">{tech._count.workOrders}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">No technician data available</div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : metrics?.recentWorkOrders && metrics.recentWorkOrders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {metrics.recentWorkOrders.map((order) => (
                <div key={order.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <Link 
                        to={`/work-orders/${order.id}`} 
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {order.customer.firstName} {order.customer.lastName}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {order.vehicle ? `${order.vehicle.make} ${order.vehicle.model}` : 'No vehicle'} • 
                        {order.serviceType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-blue-100 text-blue-800">
                        {order.status}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.scheduledDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">No recent activity</div>
          )}
        </CardContent>
        <CardFooter>
          <Link to="/work-orders" className="text-sm text-blue-600 hover:text-blue-800">
            View all work orders
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard; 