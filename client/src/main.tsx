import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { TechnicianProvider } from './context/TechnicianContext';
import { CustomerProvider } from './context/CustomerContext';
import { VehicleProvider } from './context/VehicleContext';
import { WorkOrderProvider } from './context/WorkOrderContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <UserProvider>
            <CustomerProvider>
              <VehicleProvider>
                <TechnicianProvider>
                  <WorkOrderProvider>
                    <App />
                  </WorkOrderProvider>
                </TechnicianProvider>
              </VehicleProvider>
            </CustomerProvider>
          </UserProvider>
        </ThemeProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
); 