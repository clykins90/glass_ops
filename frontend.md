# Frontend Documentation

This document provides an overview of the frontend architecture, key libraries, components, and conventions used in the `client` directory.

## Tech Stack

*   **Framework:** React (using Vite for development and build)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui (Radix UI primitives + Tailwind CSS)
*   **Routing:** React Router DOM
*   **State Management:** React Context API (for Auth, Theme, Users), React Query (for server state, caching, async operations)
*   **Charting:** Recharts
*   **Forms:** Standard React state (potentially react-hook-form if complexity grows)
*   **API Client:** Custom wrapper around `fetch` (`client/src/services/api.ts`)

## Project Structure (`client/src`)

```
client/src
├── App.tsx               # Main application component, sets up routing
├── main.tsx              # Entry point, renders App
├── index.css             # Global styles, Tailwind directives, CSS variables
├── assets/               # Static assets (images, etc.)
├── components/
│   ├── auth/             # Authentication related components (Login form, etc.)
│   ├── layout/           # Layout components (Sidebar, Header, DashboardLayout)
│   ├── ui/               # Reusable low-level UI components (generated by shadcn/ui - Button, Card, Input, Table, etc.)
│   ├── shared/           # Other shared components (e.g., ConfirmationDialog, LoadingSpinner)
│   └── forms/            # Form-specific components (e.g., CustomerForm, WorkOrderForm)
├── context/              # React Context providers (AuthContext, ThemeContext, UserContext, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions, Supabase client setup, etc.
│   ├── supabaseClient.ts # Supabase client initialization
│   └── utils.ts          # General utility functions (e.g., `cn` for classnames)
├── pages/                # Page-level components representing different views/routes
│   ├── Dashboard.tsx
│   ├── Customers.tsx
│   ├── CustomerDetails.tsx
│   ├── WorkOrders.tsx
│   ├── Schedule.tsx
│   ├── ... (other pages)
├── services/             # API interaction layer
│   ├── api.ts            # Core API fetching logic, error handling
│   ├── authService.ts    # Auth-related API calls
│   ├── customerService.ts # Customer CRUD operations
│   ├── ... (other service files)
└── types/                # TypeScript type definitions (e.g., profile.ts, workOrder.ts)
```

## Key Components & Patterns

*   **Layout (`DashboardLayout.tsx`):** Provides the consistent structure with sidebar and header for authenticated views.
*   **UI Primitives (`components/ui/`):** Leverages shadcn/ui components built on Radix UI and styled with Tailwind. These are the building blocks for most of the interface.
*   **Table Component (`components/ui/table.tsx`):** A reusable set of components (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) based on shadcn/ui's table, enhanced with dark mode styles using CSS variables.
*   **Charts (`pages/Dashboard.tsx`):** Uses the Recharts library. Chart colors (fills, strokes, text) are styled using CSS variables defined in `index.css` (e.g., `--chart-1`, `--primary`, `--muted-foreground`) to ensure they adapt correctly to the current theme (light/dark).
*   **State Management:**
    *   **Server State:** React Query (`@tanstack/react-query`) is used for fetching, caching, and managing data from the backend API. It handles loading/error states and background updates.
    *   **Global UI State:** React Context (`AuthContext`, `ThemeContext`, `UserContext`) is used for global state like user authentication status, the current theme, and user/permission data.
*   **Routing:** React Router DOM handles client-side navigation between pages.

## Theming (Dark Mode)

*   **Implementation:** Uses CSS variables defined in `index.css` for both light (`:root`) and dark (`.dark`) themes, following the shadcn/ui approach.
*   **Context:** `ThemeContext` (`context/ThemeContext.tsx`) manages the current theme ('light' or 'dark') and provides a function to toggle it.
*   **Toggle:** A button (usually in the header) calls the context's toggle function.
*   **Application:** The `theme` class ('light' or 'dark') is applied to the root HTML element. Tailwind's `dark:` variants in components then automatically apply the correct styles based on the presence of the `.dark` class.
*   **Component Styling:** Most shadcn/ui components automatically adapt due to their use of CSS variables. Custom components or direct Tailwind usage requires adding `dark:` variants as needed (e.g., `text-gray-900 dark:text-white`). Chart colors are explicitly set using `hsl(var(--variable-name))` syntax to reference theme variables.

## Conventions

*   Use TypeScript for type safety.
*   Prefer functional components and hooks.
*   Keep components small and focused.
*   Utilize shadcn/ui components where possible for consistency.
*   Apply Tailwind CSS for styling, using `dark:` variants for theme compatibility.
*   Use React Query for server state management.
*   Use Context for simple global UI state.
*   Structure API calls within the `services` directory. 