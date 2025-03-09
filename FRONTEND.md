# GlassOps - Frontend

This document provides detailed information about the frontend implementation of GlassOps.

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
    │   └── ui/           # shadcn/ui components
    ├── context/          # React context providers
    ├── hooks/            # Custom React hooks
    ├── layouts/          # Page layout components
    ├── lib/              # Utility functions and constants
    ├── pages/            # Page components
    ├── services/         # API services
    └── types/            # TypeScript type definitions
```

## UI Components

The application uses shadcn/ui components, which are built on top of Radix UI primitives. These components are customizable, accessible, and follow modern design principles.

Key UI components include:
- Button - Basic button component with various styles
- Card - Container component for displaying content in a card format
- Tabs - Component for creating tabbed interfaces
- Badge - Small status indicators
- Select - Dropdown selection component
- Toast - Notification system for user feedback

These components are located in `src/components/ui/` and are imported throughout the application.

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
- `Dashboard`: Overview of the system with summary cards, performance metrics charts, scheduled work orders summary, and technician workload visualization. Features include:
  - Real-time metrics for total customers, active work orders, and scheduled appointments
  - Work orders by status chart (bar chart)
  - Work orders by service type chart (pie chart)
  - Technician workload visualization with progress bars
  - Recent work orders list with status indicators
- `Customers`: List of customers with search and filtering
- `CustomerDetails`: Detailed view of a customer with their information, vehicles, and work orders
- `CustomerAdd`: Form for adding a new customer
- `CustomerEdit`: Form for editing an existing customer
- `Vehicles`: List of vehicles with search and filtering
- `VehicleDetails`: Detailed view of a vehicle with its information
- `AddVehicle`: Form for adding a new vehicle (can be accessed from customer details or vehicles list)
- `EditVehicle`: Form for editing an existing vehicle
- `WorkOrders`: List of work orders with search and filtering
- `WorkOrderDetails`: Detailed view of a work order with its information
- `AddWorkOrder`: Form for adding a new work order
- `EditWorkOrder`: Form for editing an existing work order
- `Technicians`: List of technicians with search and filtering
- `TechnicianDetails`: Detailed view of a technician with their information and assigned work orders
- `AddTechnician`: Form for adding a new technician
- `EditTechnician`: Form for editing an existing technician

### Components
- `ConfirmationDialog`: Reusable dialog for confirming actions like deletion
- `CustomerForm`: Form component for creating and editing customers
- `VehicleForm`: Form component for creating and editing vehicles
- `WorkOrderForm`: Form component for creating and editing work orders
- `TechnicianForm`: Form component for creating and editing technicians

### Context
- `AppContext`: Application-wide context for global state
- `VehicleContext`: Context for managing vehicle state and operations
- `WorkOrderContext`: Context for managing work order state and operations

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

### Work Order Management
- View list of all work orders with search and filtering
- View detailed work order information
- Create new work orders
- Edit existing work order details
- Update work order status
- Assign technicians to work orders
- Schedule work orders
- Track materials required and used
- Manage payment information (type, status, insurance, warranty)
- Add notes and additional information

### Technician Management
- View list of all technicians with active status filtering
- View detailed technician information including skills and assigned work orders
- Add new technicians with skills and specializations
- Edit existing technician details
- Delete technicians
- Toggle technician active status
- View technician's assigned work orders

### Dashboard and Reporting
- Overview dashboard with key metrics
- Work orders by status visualization
- Work orders by service type breakdown
- Technician workload monitoring
- Recent activity tracking

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