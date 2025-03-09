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

## Documentation

For more detailed documentation, please refer to the following files:

- [FRONTEND.md](./FRONTEND.md): Detailed documentation about the frontend implementation
- [BACKEND.md](./BACKEND.md): Detailed documentation about the backend implementation
- [TESTING.md](./TESTING.md): Documentation about testing strategies and patterns
- [TODO.md](./TODO.md): Current development plan and progress

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