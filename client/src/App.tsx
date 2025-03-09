import React from 'react';
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
import Schedule from './pages/Schedule';
import NotFound from './pages/NotFound';

// Context
import { AppProvider } from './context/AppContext';
import { VehicleProvider } from './context/VehicleContext';
import { WorkOrderProvider } from './context/WorkOrderContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <VehicleProvider>
          <WorkOrderProvider>
            <Router>
              <Routes>
                <Route path="/" element={<DashboardLayout />}>
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
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Router>
            <ReactQueryDevtools initialIsOpen={false} />
          </WorkOrderProvider>
        </VehicleProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App; 