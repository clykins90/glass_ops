import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, isAuthError } from '../services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { WorkOrder } from '../types/workOrder'; // Assuming you have this type

// Define types for our dashboard data
interface DashboardMetrics {
  totalCustomers: number;
  activeWorkOrders: number;
  scheduledToday: number;
  recentWorkOrders: Array<WorkOrder & { // Use WorkOrder type and extend as needed
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

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Revert explicit typing, use type assertion on setMetrics
        const data = await dashboardApi.getMetrics();
        setMetrics(data as DashboardMetrics);
        setError(null);
      } catch (err) {
        if (isAuthError(err)) {
          console.log('Authentication required to view dashboard data');
        } else {
          console.error('Error fetching dashboard metrics:', err);
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  // Update formatDate to accept Date objects too
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Not scheduled';
    try {
      // Ensure we pass a value that new Date() can parse
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 p-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Please log in to view dashboard data</p>
        <Button asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" data-testid="skeleton" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{metrics?.totalCustomers ?? 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/customers" className="text-sm text-primary hover:underline">
              View all customers
            </Link>
          </CardFooter>
        </Card>

        {/* Active Work Orders Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" data-testid="skeleton" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{metrics?.activeWorkOrders ?? 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/work-orders" className="text-sm text-primary hover:underline">
              View all work orders
            </Link>
          </CardFooter>
        </Card>

        {/* Scheduled Today Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Today</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" data-testid="skeleton" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{metrics?.scheduledToday ?? 0}</div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/schedule" className="text-sm text-primary hover:underline">
              View schedule
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Section & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Charts Container */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-6">
          {/* Work Orders by Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Work Orders by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center text-destructive">{error}</div>
              ) : metrics?.workOrdersByStatus && metrics.workOrdersByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.workOrdersByStatus}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    barGap={4} // Add some gap between bars
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="status"
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                       cursor={{ fill: 'hsl(var(--muted))' }}
                       contentStyle={{
                         backgroundColor: 'hsl(var(--popover))',
                         borderColor: 'hsl(var(--border))',
                         color: 'hsl(var(--popover-foreground))',
                         borderRadius: 'var(--radius)',
                         boxShadow: 'var(--shadow-md)' // Example: Adjust shadow as needed
                       }}
                       labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                     />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Work Orders" radius={[4, 4, 0, 0]}>
                      {metrics.workOrdersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}-${entry.status}`} fill="hsl(var(--primary))" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No work order data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Orders by Service Type Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Work Orders by Service Type</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center text-destructive">{error}</div>
              ) : metrics?.workOrdersByServiceType && metrics.workOrdersByServiceType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.workOrdersByServiceType}
                      cx="50%"
                      cy="50%"
                      labelLine={false} // Often looks cleaner without lines
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          // Only show label if percent is large enough
                          if ((percent * 100) < 5) return null;
                          return (
                            <text 
                              x={x} 
                              y={y} 
                              fill="hsl(var(--primary-foreground))" // Contrast color for inside slice
                              textAnchor={x > cx ? 'start' : 'end'} 
                              dominantBaseline="central"
                              fontSize={12}
                              fontWeight="medium"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      outerRadius={80}
                      innerRadius={40} // Make it a donut chart
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="serviceType"
                    >
                      {metrics.workOrdersByServiceType.map((entry, index) => (
                        // Use specific chart CSS variables for each cell
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 6) + 1}))`} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{
                         backgroundColor: 'hsl(var(--popover))',
                         borderColor: 'hsl(var(--border))',
                         color: 'hsl(var(--popover-foreground))',
                         borderRadius: 'var(--radius)',
                         boxShadow: 'var(--shadow-md)'
                       }}
                       labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                     />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }} layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No service type data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technician Workload Chart - Spanning full width in this inner grid */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Technician Workload</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : error ? (
                <div className="flex h-full items-center justify-center text-destructive">{error}</div>
              ) : metrics?.technicianWorkload && metrics.technicianWorkload.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.technicianWorkload.map(t => ({ name: `${t.firstName} ${t.lastName}`, workload: t._count.workOrders }))}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                       cursor={{ fill: 'hsl(var(--muted))' }}
                       contentStyle={{
                         backgroundColor: 'hsl(var(--popover))',
                         borderColor: 'hsl(var(--border))',
                         color: 'hsl(var(--popover-foreground))',
                         borderRadius: 'var(--radius)',
                         boxShadow: 'var(--shadow-md)'
                       }}
                       labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                     />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}/>
                    <Bar dataKey="workload" fill="hsl(var(--chart-2))" name="Assigned Work Orders" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No technician data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */} 
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground">Most recently updated work orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : error ? (
               <div className="py-4 text-center text-destructive">{error}</div>
            ) : metrics?.recentWorkOrders && metrics.recentWorkOrders.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentWorkOrders.slice(0, 5).map((order) => ( // Limit to 5 items
                  <div key={order.id} className="p-3 border dark:border-border rounded-md">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex-1 min-w-0">
                        <Link to={`/work-orders/${order.id}`} className="hover:underline">
                          <p className="text-sm font-medium leading-none text-foreground truncate">
                            Work Order #{order.id}
                          </p>
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.vehicle ? `${order.vehicle.make} ${order.vehicle.model}` : 'No vehicle'} • 
                          {order.serviceType}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                         {/* Use a badge component if available, or style manually */}
                         <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${order.status === 'completed' ? 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}> {/* Example styling - adapt as needed */}
                           {order.status}
                         </span>
                         <p className="text-xs text-muted-foreground mt-1">
                           {formatDate(order.scheduledDate)}
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">No recent activity</div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/work-orders" className="text-sm text-primary hover:underline">
              View all work orders
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;