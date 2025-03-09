# Auto Glass Service Management System

A comprehensive management system for auto glass replacement and repair services.

## Overview

This application helps auto glass repair companies manage their business operations including:
- Customer and lead management
- Work order creation and tracking
- Scheduling and calendar functionality 
- Technician assignment and management
- Service status tracking

## Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- React Query for data fetching
- Context API for state management

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL for database
- Prisma as ORM
- RESTful API architecture

## Project Structure

```
glass_agent/
├── client/                   # Frontend React application
│   ├── public/
│   └── src/
│       ├── assets/           # Images, icons, etc.
│       ├── components/       # Reusable UI components
│       ├── context/          # React context providers
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Page layout components
│       ├── lib/              # Utility functions and constants
│       ├── pages/            # Page components
│       ├── services/         # API services
│       └── types/            # TypeScript type definitions
│
├── server/                   # Backend Node.js application
│   ├── prisma/               # Database schema and migrations
│   ├── src/
│       ├── controllers/      # Request handlers
│       ├── middleware/       # Express middleware
│       ├── models/           # Data models
│       ├── routes/           # API route definitions
│       ├── services/         # Business logic
│       └── utils/            # Utility functions
│
└── README.md                 # Project documentation
```

## Core Features

### Customer/Lead Management
- Create, view, edit, and delete customer records
- Track customer information and interaction history
- Convert leads to customers
- Search and filter functionality

### Work Order Management
- Create work orders with service details
- Link work orders to customers
- Track work order status
- Include vehicle information and service requirements

### Scheduling
- Calendar view for scheduling work
- Assign time slots for services
- View daily, weekly, and monthly schedules
- Avoid scheduling conflicts

### Technician Management
- Assign work orders to technicians
- Track technician availability
- Manage technician workload

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

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

### Installation
1. Clone the repository
2. Install dependencies for both client and server
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```
3. Set up the PostgreSQL database
   ```bash
   # Create a database named glass_agent
   createdb glass_agent
   ```
4. Configure environment variables
   ```bash
   # Copy the example .env file
   cd server
   cp .env.example .env
   
   # Edit the .env file with your database credentials
   # On macOS, use your system username instead of 'postgres'
   # DATABASE_URL="postgresql://YOUR_USERNAME:@localhost:5432/glass_agent"
   ```
5. Run database migrations
   ```bash
   cd server
   npm run prisma:migrate
   ```
6. Start the development servers
   ```bash
   # Start the server
   cd server
   npm run dev
   
   # In another terminal, start the client
   cd client
   npm run dev
   ```

## Frontend Components

The frontend includes the following main components:

### Layout
- `DashboardLayout`: Main layout with sidebar navigation

### Pages
- `Dashboard`: Overview of the system with summary cards
- `Customers`: List of customers with search and filtering
- `Vehicles`: List of vehicles with search and filtering
- `WorkOrders`: Placeholder for work orders functionality
- `Technicians`: Placeholder for technicians functionality

### Services
- `api.ts`: API service layer for communicating with the backend

## Testing

The project uses Jest for testing both the frontend and backend components.

### Backend Testing

To run backend tests:

```bash
cd server
npm test
```

The backend tests include:
- Unit tests for controllers
- API endpoint tests
- Database integration tests

### Frontend Testing (Coming Soon)

Frontend testing will include:
- Component tests
- Integration tests
- End-to-end tests

## Development Status

This project is currently in the initial development phase. See [TODO.md](./TODO.md) for the current development plan and progress. 

## Version Control

The project uses Git for version control. The following files are excluded from version control:

- **Dependencies**: node_modules directories
- **Environment variables**: .env files
- **Build artifacts**: dist and build directories
- **Database files**: SQLite database files (dev.db)
- **Logs and cache files**

Note that package-lock.json files and Prisma migrations should be committed to version control to ensure dependency and database consistency across environments.

## API Documentation

The backend provides a RESTful API for managing customers, vehicles, work orders, and technicians.

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | Get all customers |
| GET | /api/customers/:id | Get a single customer by ID |
| POST | /api/customers | Create a new customer |
| PUT | /api/customers/:id | Update a customer |
| DELETE | /api/customers/:id | Delete a customer |
| GET | /api/customers/:id/workorders | Get all work orders for a customer |
| GET | /api/customers/:id/vehicles | Get all vehicles for a customer |

#### Customer Object Structure

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zipCode": "12345",
  "isLead": false,
  "notes": "Referred by Jane Smith",
  "source": "Website",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Vehicle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicles | Get all vehicles |
| GET | /api/vehicles/:id | Get a single vehicle by ID |
| POST | /api/vehicles | Create a new vehicle |
| PUT | /api/vehicles/:id | Update a vehicle |
| DELETE | /api/vehicles/:id | Delete a vehicle |

#### Vehicle Object Structure

```json
{
  "id": 1,
  "customerId": 1,
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Silver",
  "vinNumber": "1HGCM82633A123456",
  "licensePlate": "ABC123",
  "glassType": "Laminated",
  "notes": "Previous windshield repair in 2022",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Work Order Endpoints (Coming Soon)

### Technician Endpoints (Coming Soon) 