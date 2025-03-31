# Todo List

## UI Enhancements

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
    - [ ] Add/Review dark mode styles for other specific page content areas (e.g., Forms, `ProfilePage`, other detail views like `WorkOrderDetails`, `TechnicianDetails`, remaining `CustomerDetails` sections).
- Button Consistency:
    - [x] Ensure 'Add Vehicle'/'Add Customer' buttons use standard `<Button>` component.
    - [ ] Review other action buttons (Edit, Delete, etc.) across pages for styling consistency in dark mode.

## Backend

- ... (existing backend tasks)

## Frontend

- ... (existing frontend tasks)

## Documentation

- [x] Update `frontend.md` with details about the new Theme context and dark mode implementation.
- [ ] Review and update documentation (`frontend.md`, `backend.md`, etc.) after dark mode and UI consistency changes are complete.
