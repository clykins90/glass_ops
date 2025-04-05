# Todo List

## UI Enhancements

- [x] Fix header alignment to span full width (GlassOps left, Profile right)
- [x] Fix top nav alignment (bring items closer to center)
- [x] Move logout button from sidebar to header as sub-item under profile
- [x] Implement base dark mode functionality (context, toggle, CSS vars)
- [x] Add dark mode styles to `DashboardLayout`
- [x] Verify/add dark mode styles for core UI components (`Card`, `Button`, `Input` - confirmed OK due to CSS vars)
- [x] Add dark mode styles to `WorkOrders` page (table, inputs, badges, buttons)
- [x] Refactor `ConfirmationDialog` to use `AlertDialog` for dark mode compatibility
- [x] Add/Fix dark mode styles for `Table` components (`ui/table.tsx` and refactor usage).
- [x] Update `Dashboard.tsx` charts to use CSS variables for theme-aware colors.
- [x] Update base dark mode CSS variables for a darker, greyscale theme (`index.css`)
- [ ] Add dark mode styles for other UI components (`Select`, `Toast`, etc.) as needed.
- Specific Page/Component Dark Mode Review:
    - [x] Add/Review dark mode styles for `Technicians.tsx` page content.
    - [x] Add/Review dark mode styles for `CustomerDetails.tsx` vehicles section & button.
    - [x] Add/Review dark mode styles for `Vehicles.tsx` page content & button.
    - [] Add/Review dark mode styles for other specific page content areas (e.g., Forms, `ProfilePage`, other detail views like `WorkOrderDetails`, `TechnicianDetails`, remaining `CustomerDetails` sections).
- Button Consistency:
    - [x] Ensure 'Add Vehicle'/'Add Customer' buttons use standard `<Button>` component.
    - [ ] Review other action buttons (Edit, Delete, etc.) across pages for styling consistency in dark mode.

## AI Agent Implementation

- [x] Set up OpenAI API integration
  - [x] Create API key management system
  - [x] Add environment variables for OpenAI API
  - [x] Create OpenAI service in the backend
- [x] Implement conversation management
  - [x] Create conversation state management
  - [x] Implement message history tracking
  - [x] Add conversation context management
- [x] Create AI Agent frontend
  - [x] Design and implement Agent page UI with chat interface
  - [x] Create message components for conversation display
  - [x] Add input controls for user interaction
  - [x] Implement progress indicators for workflow steps
- [x] Implement backend services
  - [x] Create API endpoints for agent conversation
  - [x] Implement customer information collection logic
  - [x] Implement vehicle information collection logic
  - [x] Implement work order creation logic
  - [x] Implement scheduling availability check logic
- [x] Integration with existing systems
  - [x] Connect agent to customer database
  - [x] Connect agent to vehicle records
  - [x] Connect agent to work order system
  - [x] Connect agent to technician schedule system
- [ ] Implement customer lookup functionality
  - [ ] Create customer search API endpoint
  - [ ] Add vehicle lookup by customer ID
  - [ ] Update agent state management to track existing records
  - [ ] Enhance conversation flow to handle existing customers
  - [ ] Update system prompt to guide AI in handling existing records
- [ ] Testing and validation
  - [ ] Create test scenarios for conversation flows
  - [ ] Add unit tests for agent logic
  - [ ] Implement integration tests for database operations
  - [ ] Add end-to-end tests for complete workflows
  - [ ] Test customer lookup and existing record handling

## Backend

- ... (existing backend tasks)

## Frontend

- ... (existing frontend tasks)

## Technician Scheduling System

### Database Changes
- [x] Create `technician_schedules` table in Supabase
- [x] Create `technician_time_off` table in Supabase
- [x] Add `estimated_duration_minutes` column to `work_orders` table
- [x] Set up appropriate RLS policies for new tables

### Backend Implementation
- [x] Create schedule management API endpoints
  - [x] GET /api/technicians/:id/schedule
  - [x] POST /api/technicians/:id/schedule
  - [x] PUT /api/technicians/:id/schedule/:scheduleId
  - [x] DELETE /api/technicians/:id/schedule/:scheduleId
- [x] Create time off management API endpoints
  - [x] GET /api/technicians/:id/time-off
  - [x] POST /api/technicians/:id/time-off
  - [x] PUT /api/technicians/:id/time-off/:timeOffId
  - [x] DELETE /api/technicians/:id/time-off/:timeOffId
- [x] Create availability checking API endpoints
  - [x] GET /api/availability
  - [x] GET /api/technicians/:id/availability
  - [x] GET /api/technicians/:id/next-available
- [x] Implement scheduleService with business logic
- [x] Implement availabilityService with scheduling algorithms

### Frontend Admin View
- [x] Create TechnicianScheduleForm component
- [x] Create ScheduleCalendar component for week view
- [x] Create TimeOffForm component
- [x] Implement admin schedule management page
- [ ] Add technician filtering and views to the schedule page

### Technician View
- [ ] Create WeeklySchedule component
- [ ] Update TechnicianDashboard with schedule information
- [ ] Implement technician schedule view page

### Work Order Integration
- [x] Add duration field to work order form
- [ ] Create TechnicianAvailabilitySelector component
- [ ] Create TimeSlotPicker component
- [ ] Update work order creation/editing to check availability
- [ ] Implement warnings for scheduling conflicts

### Testing
- [ ] Write unit tests for availability calculation
- [ ] Write integration tests for schedule management endpoints
- [ ] Create E2E tests for the scheduling workflow

## Documentation

- [x] Update `frontend.md` with details about the new Theme context and dark mode implementation.
- [ ] Review and update documentation (`frontend.md`, `backend.md`, etc.) after dark mode and UI consistency changes are complete.
- [x] Create AI agent documentation
  - [x] Document OpenAI API integration details
  - [x] Document conversation flow patterns
  - [x] Document integration with existing systems
  - [x] Document customer lookup implementation
- [x] Create scheduling system documentation
  - [x] Document database schema for scheduling tables
  - [x] Document API requirements for scheduling
  - [x] Document frontend components needed
  - [x] Document integration with work order system

## Current Issues
- [x] Implement customer validation for full names with first and last name required
- [x] Implement phone number validation for 10-digit numbers
- [x] Update all environment files to use gpt-4o-mini model 
- [x] Fix agent chat persistence issue when changing browser tabs
- [x] Improve phone number validation to accept any format (parentheses, spaces, dashes) while still requiring 10 digits
- [x] Fix localStorage serialization issues causing chat reset between tabs
- [ ] ...
