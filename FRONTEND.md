# Auto Glass Service Management System - Frontend

This document provides detailed information about the frontend implementation of the Auto Glass Service Management System.

## Technology Stack

- React
- TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- React Query for data fetching
- Context API for state management

## Project Structure

```
client/
├── public/
└── src/
    ├── assets/           # Images, icons, etc.
    ├── components/       # Reusable UI components
    ├── context/          # React context providers
    ├── hooks/            # Custom React hooks
    ├── layouts/          # Page layout components
    ├── lib/              # Utility functions and constants
    ├── pages/            # Page components
    ├── services/         # API services
    └── types/            # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Install client dependencies
   ```bash
   cd client
   npm install
   ```

2. Start the development server
   ```bash
   npm run dev
   ```

## Components

### Layout
- `DashboardLayout`: Main layout with sidebar navigation

### Pages
- `Dashboard`: Overview of the system with summary cards
- `Customers`: List of customers with search and filtering
- `CustomerDetails`: Detailed view of a customer with their information, vehicles, and work orders
- `CustomerAdd`: Form for adding a new customer
- `CustomerEdit`: Form for editing an existing customer
- `Vehicles`: List of vehicles with search and filtering
- `VehicleDetails`: Detailed view of a vehicle with its information
- `AddVehicle`: Form for adding a new vehicle (can be accessed from customer details or vehicles list)
- `EditVehicle`: Form for editing an existing vehicle
- `WorkOrders`: Placeholder for work orders functionality
- `Technicians`: Placeholder for technicians functionality

### Components
- `ConfirmationDialog`: Reusable dialog for confirming actions like deletion
- `CustomerForm`: Form component for creating and editing customers
- `VehicleForm`: Form component for creating and editing vehicles

### Context
- `AppContext`: Application-wide context for global state
- `VehicleContext`: Context for managing vehicle state and operations

### Services
- `api.ts`: API service layer for communicating with the backend

## Features

### Customer Management
- View list of all customers with search and filtering
- View detailed customer information
- Add new customers
- Edit existing customer details
- Delete customers
- View customer's vehicles and work orders

### Vehicle Management
- View list of all vehicles with search and filtering
- View detailed vehicle information
- Add new vehicles (either standalone or associated with a customer)
- Edit existing vehicle details
- Delete vehicles
- View vehicle's owner and work orders

### Work Order Management (Planned)
- View list of all work orders with search and filtering
- View detailed work order information
- Create new work orders
- Edit existing work order details
- Update work order status
- Assign technicians to work orders
- Schedule work orders

### Technician Management (Planned)
- View list of all technicians
- View detailed technician information
- Add new technicians
- Edit existing technician details
- View technician's work orders and schedule

## Data Models

### Customer
- Basic information (name, contact info, address)
- Communication preferences
- History of services
- Status (lead, active, inactive)

### Vehicle
- Make, model, year
- VIN number
- Glass specifications
- Insurance information

### Work Order
- Service type (replacement, repair)
- Glass type and location
- Materials required for service
- Materials used during service
- Pricing information
- Payment details (insurance, warranty, out-of-pocket)
- Payment status tracking
- Status (scheduled, in progress, completed, cancelled)
- Timeline (created, scheduled, completed dates)
- Assigned technician
- Customer and vehicle references

### Technician
- Personal information
- Skills and certifications
- Schedule and availability
- Work history

## Testing

The frontend uses Jest and React Testing Library for testing components and hooks.

For detailed testing documentation, see [TESTING.md](./TESTING.md).

### Running Tests

```bash
cd client
npm test
```

### Running Tests for a Specific Component

```bash
cd client
npm test -- --testPathPattern=ComponentName
``` 