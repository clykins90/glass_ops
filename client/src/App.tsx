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
import Technicians from './pages/Technicians';
import NotFound from './pages/NotFound';

// Context
import { AppProvider } from './context/AppContext';
import { VehicleProvider } from './context/VehicleContext';

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
                <Route path="technicians" element={<Technicians />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </VehicleProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App; 