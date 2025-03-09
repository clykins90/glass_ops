# GlassOps - Backend

This document provides detailed information about the backend implementation of GlassOps.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL for database
- Prisma as ORM
- RESTful API architecture

## Project Structure

```
server/
├── prisma/               # Database schema and migrations
├── src/
    ├── controllers/      # Request handlers
    ├── middleware/       # Express middleware
    ├── models/           # Data models
    ├── routes/           # API route definitions
    ├── services/         # Business logic
    └── utils/            # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

### Installation

1. Install server dependencies
   ```bash
   cd server
   npm install
   ```

2. Set up the PostgreSQL database
   ```bash
   # Create a database named glass_agent
   createdb glass_agent
   ```

3. Configure environment variables
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit the .env file with your database credentials
   # On macOS, use your system username instead of 'postgres'
   # DATABASE_URL="postgresql://YOUR_USERNAME:@localhost:5432/glass_agent"
   ```

4. Run database migrations
   ```bash
   npm run prisma:migrate
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Data Models

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

## Features

### Customer Management
- CRUD operations for customer records
- Lead tracking and conversion
- Customer history and notes
- Vehicle association

### Vehicle Management
- CRUD operations for vehicle records
- Vehicle details and specifications
- Customer association
- Work order history

### Work Order Management
- CRUD operations for work orders
- Status tracking (scheduled, in-progress, completed, cancelled)
- Technician assignment
- Scheduling functionality
- Materials tracking
- Payment and insurance information
- Warranty management

### Technician Management
- CRUD operations for technician records
- Skills and specialization tracking
- Availability and scheduling
- Work order assignment
- Performance metrics

### Dashboard and Reporting
- Real-time metrics and statistics
- Work order status breakdown
- Service type distribution
- Technician workload analysis
- Recent activity tracking

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

### Work Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workorders | Get all work orders |
| GET | /api/workorders/:id | Get a single work order by ID |
| POST | /api/workorders | Create a new work order |
| PUT | /api/workorders/:id | Update a work order |
| DELETE | /api/workorders/:id | Delete a work order |
| PUT | /api/workorders/:id/status | Update a work order status |
| PUT | /api/workorders/:id/assign | Assign a technician to a work order |
| PUT | /api/workorders/:id/schedule | Schedule a work order |

#### Work Order Object Structure

```json
{
  "id": 1,
  "customerId": 1,
  "vehicleId": 2,
  "technicianId": 3,
  "serviceType": "replacement",
  "glassLocation": "windshield",
  "materialsRequired": "OEM windshield, primer, adhesive",
  "materialsUsed": "OEM windshield, primer, adhesive",
  "scheduledDate": "2023-03-15T10:00:00.000Z",
  "completedDate": "2023-03-15T11:30:00.000Z",
  "status": "completed",
  "price": 350.00,
  "paymentType": "insurance",
  "paymentStatus": "paid",
  "insuranceClaim": true,
  "insuranceInfo": "Policy #12345, Geico",
  "warrantyInfo": "5-year warranty on installation",
  "notes": "Customer requested OEM glass",
  "createdAt": "2023-03-10T00:00:00.000Z",
  "updatedAt": "2023-03-15T11:30:00.000Z"
}
```

### Technician Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/technicians | Get all technicians |
| GET | /api/technicians/:id | Get a single technician by ID |
| POST | /api/technicians | Create a new technician |
| PUT | /api/technicians/:id | Update a technician |
| DELETE | /api/technicians/:id | Delete a technician |
| GET | /api/technicians/:id/workorders | Get all work orders for a technician |
| GET | /api/technicians/:id/schedule | Get the schedule for a technician |

#### Technician Object

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "phone": "555-123-4567",
  "skills": ["windshield replacement", "window repair"],
  "notes": "Certified in all types of auto glass repair",
  "active": true,
  "createdAt": "2023-01-15T08:30:00.000Z",
  "updatedAt": "2023-01-15T08:30:00.000Z"
}
```

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/metrics | Get dashboard metrics and statistics |

#### Dashboard Metrics Response

```json
{
  "totalCustomers": 25,
  "activeWorkOrders": 10,
  "scheduledToday": 5,
  "recentWorkOrders": [
    {
      "id": 1,
      "status": "scheduled",
      "serviceType": "replacement",
      "scheduledDate": "2023-06-15T10:00:00.000Z",
      "customer": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "vehicle": {
        "make": "Toyota",
        "model": "Camry"
      },
      "technician": {
        "firstName": "Mike",
        "lastName": "Smith"
      }
    }
  ],
  "workOrdersByStatus": [
    { "status": "scheduled", "count": 5 },
    { "status": "in-progress", "count": 3 },
    { "status": "completed", "count": 12 }
  ],
  "workOrdersByServiceType": [
    { "serviceType": "replacement", "count": 15 },
    { "serviceType": "repair", "count": 5 }
  ],
  "technicianWorkload": [
    {
      "id": 1,
      "firstName": "Mike",
      "lastName": "Smith",
      "_count": {
        "workOrders": 5
      }
    }
  ]
}
```

## Implementation Details

### Routes

The application uses Express Router to organize routes by resource:

- `customer.routes.ts`: Endpoints for customer management
- `vehicle.routes.ts`: Endpoints for vehicle management
- `workOrder.routes.ts`: Endpoints for work order management
- `technician.routes.ts`: Endpoints for technician management
- `dashboard.routes.ts`: Endpoints for dashboard metrics and statistics

### Controllers

Controllers handle the request/response cycle and delegate business logic to services:

- `customer.controller.ts`: Customer-related operations
- `vehicle.controller.ts`: Vehicle-related operations
- `workOrder.controller.ts`: Work order-related operations
- `technician.controller.ts`: Technician-related operations

### Database

The application uses Prisma as the ORM to interact with the PostgreSQL database.

### Dashboard Implementation

The dashboard metrics endpoint (`GET /api/dashboard/metrics`) provides a comprehensive overview of the system's current state. It aggregates data from multiple tables to generate real-time statistics and visualizations.

#### Metrics Calculation

1. **Total Customers**: Simple count of all customer records
   ```typescript
   const totalCustomers = await prisma.customer.count();
   ```

2. **Active Work Orders**: Count of work orders that are not completed or cancelled
   ```typescript
   const activeWorkOrders = await prisma.workOrder.count({
     where: {
       status: {
         notIn: ['completed', 'cancelled']
       }
     }
   });
   ```

3. **Scheduled Today**: Count of work orders scheduled for the current day
   ```typescript
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const tomorrow = new Date(today);
   tomorrow.setDate(tomorrow.getDate() + 1);
   
   const scheduledToday = await prisma.workOrder.count({
     where: {
       scheduledDate: {
         gte: today,
         lt: tomorrow
       }
     }
   });
   ```

4. **Recent Work Orders**: Latest 5 work orders with related customer, vehicle, and technician data
   ```typescript
   const recentWorkOrders = await prisma.workOrder.findMany({
     take: 5,
     orderBy: {
       updatedAt: 'desc'
     },
     include: {
       customer: true,
       vehicle: true,
       technician: true
     }
   });
   ```

5. **Work Orders by Status**: Aggregation of work orders grouped by status
   ```typescript
   const workOrdersByStatus = await prisma.$queryRaw`
     SELECT status, COUNT(*) as count 
     FROM "WorkOrder" 
     GROUP BY status
   `;
   ```

6. **Work Orders by Service Type**: Aggregation of work orders grouped by service type
   ```typescript
   const workOrdersByServiceType = await prisma.$queryRaw`
     SELECT "serviceType", COUNT(*) as count 
     FROM "WorkOrder" 
     GROUP BY "serviceType"
   `;
   ```

7. **Technician Workload**: Count of active work orders assigned to each technician
   ```typescript
   const technicianWorkload = await prisma.technician.findMany({
     where: {
       active: true
     },
     select: {
       id: true,
       firstName: true,
       lastName: true,
       _count: {
         select: {
           workOrders: {
             where: {
               status: {
                 notIn: ['completed', 'cancelled']
               }
             }
           }
         }
       }
     }
   });
   ```

This implementation leverages Prisma's powerful query capabilities to efficiently aggregate data from multiple tables without requiring complex joins or multiple database calls.

## Testing

The backend uses Jest for testing controllers, services, and API endpoints.

For detailed testing documentation, see [TESTING.md](./TESTING.md).

### Running Tests

```bash
cd server
npm test
``` 