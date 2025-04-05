import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CustomerAdd from './pages/CustomerAdd';
import CustomerEdit from './pages/CustomerEdit';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetails from './pages/WorkOrderDetails';
import AddWorkOrder from './pages/AddWorkOrder';
import EditWorkOrder from './pages/EditWorkOrder';
import Technicians from './pages/Technicians';
import TechnicianDetails from './pages/TechnicianDetails';
import AddTechnician from './pages/AddTechnician';
import EditTechnician from './pages/EditTechnician';
import TechnicianSchedule from './pages/admin/TechnicianSchedule';
import Schedule from './pages/Schedule';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import UserManagement from './pages/UserManagement';
import ProfilePage from './pages/ProfilePage';
import SelectCompanyPage from './pages/SelectCompanyPage';
import AgentChat from './pages/AgentChat';

// Context
import { AppProvider } from './context/AppContext';
import { VehicleProvider } from './context/VehicleContext';
import { WorkOrderProvider } from './context/WorkOrderContext';
import { CustomerProvider } from './context/CustomerContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import CompanyRequiredRoute from './components/CompanyRequiredRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds instead of 5 minutes
      retry: 1,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <AppProvider>
            <CustomerProvider>
              <VehicleProvider>
                <WorkOrderProvider>
                  <Router>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignUpPage />} />
                      <Route path="/select-company" element={
                        <ProtectedRoute>
                          <SelectCompanyPage />
                        </ProtectedRoute>
                      } />
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <CompanyRequiredRoute>
                              <DashboardLayout />
                            </CompanyRequiredRoute>
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<Dashboard />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="customers/add" element={<CustomerAdd />} />
                        <Route path="customers/:id" element={<CustomerDetails />} />
                        <Route path="customers/:id/edit" element={<CustomerEdit />} />
                        <Route path="customers/:customerId/vehicles/new" element={<AddVehicle />} />
                        <Route path="vehicles" element={<Vehicles />} />
                        <Route path="vehicles/new" element={<AddVehicle />} />
                        <Route path="vehicles/:id" element={<VehicleDetails />} />
                        <Route path="vehicles/:id/edit" element={<EditVehicle />} />
                        <Route path="work-orders" element={<WorkOrders />} />
                        <Route path="work-orders/add" element={<AddWorkOrder />} />
                        <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                        <Route path="work-orders/:id/edit" element={<EditWorkOrder />} />
                        <Route path="schedule" element={<Schedule />} />
                        <Route path="technicians" element={<Technicians />} />
                        <Route path="technicians/add" element={<AddTechnician />} />
                        <Route path="technicians/:id" element={<TechnicianDetails />} />
                        <Route path="technicians/:id/edit" element={<EditTechnician />} />
                        <Route path="technicians/:id/schedule" element={<TechnicianSchedule />} />
                        <Route path="user-management" element={<UserManagement />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="agent" element={<AgentChat />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </Router>
                </WorkOrderProvider>
              </VehicleProvider>
            </CustomerProvider>
          </AppProvider>
        </UserProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App; 