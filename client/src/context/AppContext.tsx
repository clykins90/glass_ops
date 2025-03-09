import React, { ReactNode } from 'react';
import { CustomerProvider } from './CustomerContext';
import { VehicleProvider } from './VehicleContext';
import { WorkOrderProvider } from './WorkOrderContext';
import { TechnicianProvider } from './TechnicianContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <CustomerProvider>
      <VehicleProvider>
        <WorkOrderProvider>
          <TechnicianProvider>
            {children}
          </TechnicianProvider>
        </WorkOrderProvider>
      </VehicleProvider>
    </CustomerProvider>
  );
}; 