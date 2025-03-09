# Auto Glass Service Management System - Backend

This document provides detailed information about the backend implementation of the Auto Glass Service Management System.

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

#### Technician Object Structure

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "phone": "555-987-6543",
  "skills": ["windshield replacement", "side window repair"],
  "notes": "Certified in OEM glass installation",
  "active": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Testing

The backend uses Jest for testing controllers, services, and API endpoints.

For detailed testing documentation, see [TESTING.md](./TESTING.md).

### Running Tests

```bash
cd server
npm test
``` 