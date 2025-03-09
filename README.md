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
3. Set up the PostgreSQL database
4. Run database migrations
5. Start the development servers

Detailed setup instructions are available in the development documentation.

## Development Status

This project is currently in the initial development phase. See [TODO.md](./TODO.md) for the current development plan and progress. 