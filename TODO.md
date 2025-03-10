# GlassOps - Development Plan

## Project Setup Tasks

### Initial Setup
- [x] Create project README.md
- [x] Create detailed TODO.md
- [x] Initialize Git repository
- [x] Set up project structure (client/server folders)
- [x] Configure ESLint and Prettier
- [x] Set up GitHub repository

### Frontend Setup
- [x] Initialize React application with TypeScript
- [x] Install and configure Tailwind CSS
- [x] Set up shadcn/ui component library
- [x] Configure React Router
- [x] Set up React Query
- [x] Create basic layouts and navigation structure
- [x] Set up state management with Context API
- [x] Configure API service layer
- [x] Create missing UI components (tabs, badge, select, toast)

### Backend Setup
- [x] Initialize Node.js application with TypeScript
- [x] Set up Express server
- [x] Configure Prisma ORM
- [x] Set up PostgreSQL database
- [x] Create database connection
- [x] Configure environment variables
- [x] Set up basic API routes
- [x] Configure CORS middleware
- [x] Set up error handling middleware

## Database Design Tasks

### Schema Design
- [x] Define Customer/Lead model
- [x] Define Vehicle model
- [x] Define Work Order model
- [x] Define Technician model
- [x] Define relationships between models
- [x] Create initial Prisma schema
- [x] Set up migrations system
- [x] Run initial migration to create database tables

## API Development Tasks

### Customer/Lead Endpoints
- [x] Create GET /customers endpoint to fetch all customers
- [x] Create GET /customers/:id endpoint to fetch single customer
- [x] Create POST /customers endpoint to create new customer
- [x] Create PUT /customers/:id endpoint to update customer
- [x] Create DELETE /customers/:id endpoint to remove customer
- [x] Create GET /customers/:id/workorders endpoint to fetch customer work orders
- [x] Create GET /customers/:id/vehicles endpoint to fetch customer vehicles
- [ ] Create endpoints for lead management and conversion (skip this for now)

### Vehicle Endpoints
- [x] Create GET /vehicles endpoint to fetch all vehicles
- [x] Create GET /vehicles/:id endpoint to fetch single vehicle
- [x] Create POST /vehicles endpoint to create new vehicle
- [x] Create PUT /vehicles/:id endpoint to update vehicle
- [x] Create DELETE /vehicles/:id endpoint to remove vehicle
- [x] Create GET /customers/:id/vehicles endpoint to fetch customer vehicles

### Work Order Endpoints
- [x] Create GET /workorders endpoint to fetch all work orders
  - [x] Define route
  - [x] Create controller function
  - [x] Implement filtering options (by status, date, technician)
- [x] Create GET /workorders/:id endpoint to fetch single work order
  - [x] Define route
  - [x] Create controller function
  - [x] Include related vehicle and customer data
- [x] Create POST /workorders endpoint to create new work order
  - [x] Define route
  - [x] Create controller function
  - [x] Implement validation
- [x] Create PUT /workorders/:id endpoint to update work order
  - [x] Define route
  - [x] Create controller function
- [x] Create DELETE /workorders/:id endpoint to remove work order
  - [x] Define route
  - [x] Create controller function
- [x] Create endpoints for status updates and assignment
  - [x] Define routes
  - [x] Create controller functions
- [x] Create endpoints for scheduling and filtering
  - [x] Define routes
  - [x] Create controller functions
- [x] Implement materials tracking functionality
  - [x] Define data structure
  - [x] Create API endpoints
- [x] Add payment type and status management
  - [x] Define data structure
  - [x] Create API endpoints
- [x] Create endpoints for warranty information
  - [x] Define data structure
  - [x] Create API endpoints

### Technician Endpoints
- [x] Create GET /technicians endpoint to fetch all technicians
  - [x] Define route
  - [x] Create controller function
  - [x] Implement filtering options (by active status)
- [x] Create GET /technicians/:id endpoint to fetch single technician
  - [x] Define route
  - [x] Create controller function
- [x] Create POST /technicians endpoint to create new technician
  - [x] Define route
  - [x] Create controller function
- [x] Create PUT /technicians/:id endpoint to update technician
  - [x] Define route
  - [x] Create controller function
- [x] Create DELETE /technicians/:id endpoint to remove technician
  - [x] Define route
  - [x] Create controller function
- [x] Create endpoints for availability and scheduling
  - [x] Define routes
  - [x] Create controller functions for fetching work orders and schedule

## Frontend Development Tasks

### Layout and Navigation
- [x] Create main application layout
- [x] Implement responsive sidebar navigation
- [x] Create dashboard layout
- [x] Set up routing configuration
- [ ] Implement authentication screens (placeholder for now)

### Customer Management
- [x] Create customers list page
- [x] Implement customer details view
- [x] Create customer add/edit forms
- [x] Create customer deletion confirmation
- [ ] Implement lead management features (skip for now)

### Vehicle Management
- [x] Create vehicle components for customer profiles
- [x] Implement vehicle add/edit forms
- [x] Create vehicle list view
- [x] Implement vehicle details view
- [x] Create vehicle deletion confirmation

### Work Order Management
- [x] Create work orders list page
- [x] Implement work order details view
- [x] Create work order add/edit forms
- [x] Implement work order status workflow
- [x] Create work order search and filtering
- [x] Build materials selection and tracking interface
- [x] Create payment type selection and status tracking UI
- [x] Implement warranty information management
- [ ] Add payment summary reports

### Scheduling Interface
- [x] Create calendar view component
- [x] Implement day, week, month views
- [x] Create scheduling interface for work orders
- [x] Implement technician availability visualization
- [x] Create a work order view that shows unscheduled work orders and allow me to quickly schedule them
- [x] Create a technician view that shows my technicians and their work orders for the day/week 
- [x] Allow me to access the above views from the main scheduling view via tabs or some other UI element
- [ ] Create drag-and-drop scheduling functionality (TBD)

### Technician Management
- [x] Create technicians list page
- [x] Implement technician details view
- [x] Create technician add/edit forms
- [x] Implement workload and schedule views

### Reports and Dashboard
- [x] Create dashboard overview page
- [x] Implement performance metrics charts
- [x] Create scheduled work orders summary
- [x] Implement technician workload visualization

## Data Model Details

### Customer Model
```prisma
model Customer {
  id          Int       @id @default(autoincrement())
  firstName   String
  lastName    String
  email       String?
  phone       String
  address     String?
  city        String?
  state       String?
  zipCode     String?
  isLead      Boolean   @default(true)
  notes       String?
  source      String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  vehicles    Vehicle[]
  workOrders  WorkOrder[]
}
```

### Vehicle Model
```prisma
model Vehicle {
  id          Int       @id @default(autoincrement())
  customerId  Int
  customer    Customer  @relation(fields: [customerId], references: [id])
  make        String
  model       String
  year        Int
  color       String?
  vinNumber   String?
  licensePlate String?
  glassType   String?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workOrders  WorkOrder[]
}
```

### Work Order Model
```prisma
model WorkOrder {
  id            Int       @id @default(autoincrement())
  customerId    Int
  customer      Customer  @relation(fields: [customerId], references: [id])
  vehicleId     Int?
  vehicle       Vehicle?  @relation(fields: [vehicleId], references: [id])
  technicianId  Int?
  technician    Technician? @relation(fields: [technicianId], references: [id])
  serviceType   String    // replacement, repair
  glassLocation String    // windshield, driver window, etc.
  
  // Materials tracking
  materialsRequired String?   // JSON array or comma-separated list of materials
  materialsUsed     String?   // What was actually used during service
  
  // Scheduling
  scheduledDate DateTime?
  completedDate DateTime?
  status        String    // scheduled, in-progress, completed, cancelled
  
  // Financial information
  price         Float?
  paymentType   String?   // insurance, warranty, out-of-pocket
  paymentStatus String?   // pending, paid, partially paid
  insuranceClaim Boolean  @default(false)
  insuranceInfo String?   // Could be JSON with policy number, company, etc.
  warrantyInfo  String?   // Details about warranty coverage if applicable
  
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Technician Model
```prisma
model Technician {
  id          Int       @id @default(autoincrement())
  firstName   String
  lastName    String
  email       String?
  phone       String
  skills      String[]
  notes       String?
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workOrders  WorkOrder[]
}
```

## Testing Tasks
- [x] Set up unit testing framework
- [x] Create test setup file
- [x] Create controller test files
  - [x] Customer controller tests
  - [x] Vehicle controller tests
  - [x] Work Order controller tests
  - [x] Technician controller tests
- [ ] Create API endpoint tests
- [ ] Create component tests
- [ ] Set up end-to-end testing
- [ ] Implement CI/CD pipeline

## Bug Fixes
- [x] Fix dashboard API endpoint not registered in server/src/index.ts
- [x] Fix BigInt serialization error in dashboard metrics API
- [x] Rename application from "Auto Glass Service" to "GlassOps"

## Deployment Preparation Tasks (Future)
- [ ] Set up production build process
- [ ] Configure environment variables for production
- [ ] Set up Docker containerization
- [ ] Create deployment documentation
- [ ] Configure database backup strategy 