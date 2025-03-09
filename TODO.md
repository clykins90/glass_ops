# Auto Glass Service Management System - Development Plan

## Project Setup Tasks

### Initial Setup
- [x] Create project README.md
- [x] Create detailed TODO.md
- [ ] Initialize Git repository
- [ ] Set up project structure (client/server folders)
- [ ] Configure ESLint and Prettier
- [ ] Set up GitHub repository

### Frontend Setup
- [ ] Initialize React application with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Set up shadcn/ui component library
- [ ] Configure React Router
- [ ] Set up React Query
- [ ] Create basic layouts and navigation structure
- [ ] Set up state management with Context API
- [ ] Configure API service layer

### Backend Setup
- [ ] Initialize Node.js application with TypeScript
- [ ] Set up Express server
- [ ] Configure Prisma ORM
- [ ] Set up PostgreSQL database
- [ ] Create database connection
- [ ] Configure environment variables
- [ ] Set up basic API routes
- [ ] Configure CORS middleware
- [ ] Set up error handling middleware

## Database Design Tasks

### Schema Design
- [ ] Define Customer/Lead model
- [ ] Define Vehicle model
- [ ] Define Work Order model
- [ ] Define Technician model
- [ ] Define relationships between models
- [ ] Create initial Prisma schema
- [ ] Set up migrations system
- [ ] Run initial migration to create database tables

## API Development Tasks

### Customer/Lead Endpoints
- [ ] Create GET /customers endpoint to fetch all customers
- [ ] Create GET /customers/:id endpoint to fetch single customer
- [ ] Create POST /customers endpoint to create new customer
- [ ] Create PUT /customers/:id endpoint to update customer
- [ ] Create DELETE /customers/:id endpoint to remove customer
- [ ] Create GET /customers/:id/workorders endpoint to fetch customer work orders
- [ ] Create endpoints for lead management and conversion

### Vehicle Endpoints
- [ ] Create GET /vehicles endpoint to fetch all vehicles
- [ ] Create GET /vehicles/:id endpoint to fetch single vehicle
- [ ] Create POST /vehicles endpoint to create new vehicle
- [ ] Create PUT /vehicles/:id endpoint to update vehicle
- [ ] Create DELETE /vehicles/:id endpoint to remove vehicle
- [ ] Create GET /customers/:id/vehicles endpoint to fetch customer vehicles

### Work Order Endpoints
- [ ] Create GET /workorders endpoint to fetch all work orders
- [ ] Create GET /workorders/:id endpoint to fetch single work order
- [ ] Create POST /workorders endpoint to create new work order
- [ ] Create PUT /workorders/:id endpoint to update work order
- [ ] Create DELETE /workorders/:id endpoint to remove work order
- [ ] Create endpoints for status updates and assignment
- [ ] Create endpoints for scheduling and filtering
- [ ] Implement materials tracking functionality
- [ ] Add payment type and status management
- [ ] Create endpoints for warranty information

### Technician Endpoints
- [ ] Create GET /technicians endpoint to fetch all technicians
- [ ] Create GET /technicians/:id endpoint to fetch single technician
- [ ] Create POST /technicians endpoint to create new technician
- [ ] Create PUT /technicians/:id endpoint to update technician
- [ ] Create DELETE /technicians/:id endpoint to remove technician
- [ ] Create endpoints for availability and scheduling

## Frontend Development Tasks

### Layout and Navigation
- [ ] Create main application layout
- [ ] Implement responsive sidebar navigation
- [ ] Create dashboard layout
- [ ] Set up routing configuration
- [ ] Implement authentication screens (placeholder for now)

### Customer Management
- [ ] Create customers list page
- [ ] Implement customer details view
- [ ] Create customer add/edit forms
- [ ] Implement customer search and filtering
- [ ] Create customer deletion confirmation
- [ ] Implement lead management features

### Vehicle Management
- [ ] Create vehicle components for customer profiles
- [ ] Implement vehicle add/edit forms
- [ ] Create vehicle list view

### Work Order Management
- [ ] Create work orders list page
- [ ] Implement work order details view
- [ ] Create work order add/edit forms
- [ ] Implement work order status workflow
- [ ] Create work order search and filtering
- [ ] Build materials selection and tracking interface
- [ ] Create payment type selection and status tracking UI
- [ ] Implement warranty information management
- [ ] Add payment summary reports

### Scheduling Interface
- [ ] Create calendar view component
- [ ] Implement day, week, month views
- [ ] Create scheduling interface for work orders
- [ ] Implement technician availability visualization
- [ ] Create drag-and-drop scheduling functionality

### Technician Management
- [ ] Create technicians list page
- [ ] Implement technician details view
- [ ] Create technician add/edit forms
- [ ] Implement workload and schedule views

### Reports and Dashboard
- [ ] Create dashboard overview page
- [ ] Implement performance metrics charts
- [ ] Create scheduled work orders summary
- [ ] Implement technician workload visualization

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

## Deployment Preparation Tasks (Future)
- [ ] Set up production build process
- [ ] Configure environment variables for production
- [ ] Set up Docker containerization
- [ ] Create deployment documentation
- [ ] Configure database backup strategy

## Testing Tasks (Future)
- [ ] Set up unit testing framework
- [ ] Create API endpoint tests
- [ ] Create component tests
- [ ] Set up end-to-end testing
- [ ] Implement CI/CD pipeline 