# Testing Documentation

This document provides detailed information about the testing setup and strategies used in the Auto Glass Service Management System.

## Frontend Testing

### Setup

The frontend testing environment uses:

- **Jest**: JavaScript testing framework
- **React Testing Library**: For rendering and testing React components
- **jest-dom**: Custom matchers for DOM assertions
- **ts-jest**: TypeScript preprocessor for Jest

### Configuration Files

- **jest.config.js**: Main Jest configuration file
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  };
  ```

- **setupTests.ts**: Global test setup
  ```typescript
  // jest-dom adds custom jest matchers for asserting on DOM nodes
  import '@testing-library/jest-dom';
  
  // Mock matchMedia for tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  ```

- **tsconfig.json**: TypeScript configuration for tests
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "esModuleInterop": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }
  ```

### Test File Structure

Tests are organized in `__tests__` directories alongside the components they test:

```
src/
├── components/
│   ├── __tests__/
│   │   └── ConfirmationDialog.test.tsx
│   └── ConfirmationDialog.tsx
├── components/forms/
│   ├── __tests__/
│   │   └── CustomerForm.test.tsx
│   └── CustomerForm.tsx
└── pages/
    ├── __tests__/
    │   └── CustomerDetails.test.tsx
    └── CustomerDetails.tsx
```

### Testing Patterns

#### Component Rendering Tests

```typescript
test('renders dialog with correct content when isOpen is true', () => {
  render(
    <ConfirmationDialog
      isOpen={true}
      title="Test Title"
      message="Test Message"
      onConfirm={jest.fn()}
      onCancel={jest.fn()}
    />
  );
  
  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('Test Message')).toBeInTheDocument();
});
```

#### User Interaction Tests

```typescript
test('calls onConfirm when confirm button is clicked', () => {
  const mockConfirm = jest.fn();
  render(
    <ConfirmationDialog
      isOpen={true}
      title="Test Title"
      message="Test Message"
      onConfirm={mockConfirm}
      onCancel={jest.fn()}
    />
  );
  
  fireEvent.click(screen.getByText('Confirm'));
  expect(mockConfirm).toHaveBeenCalledTimes(1);
});
```

#### Asynchronous Tests

```typescript
test('submits form data and navigates on successful submission', async () => {
  mockCreate.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Doe' });
  
  render(
    <BrowserRouter>
      <CustomerForm />
    </BrowserRouter>
  );
  
  fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
  
  fireEvent.click(screen.getByText('Save'));
  
  await waitFor(() => {
    expect(mockCreate).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/customers');
  });
});
```

#### Mocking External Dependencies

```typescript
// Mock the API and navigation
jest.mock('../../../services/api', () => ({
  customerApi: {
    create: (...args: any[]) => mockCreate(...args),
    update: (...args: any[]) => mockUpdate(...args),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
```

#### Vehicle Form Tests

The VehicleForm component has comprehensive tests that verify its functionality:

```typescript
// Mock the API and navigation
jest.mock('../../../services/api', () => ({
  vehicleApi: {
    create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    update: jest.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  },
}));

test('renders form with empty fields for new vehicle', () => {
  renderWithRouter(<VehicleForm customerId={1} />);
  
  // Check that form fields are rendered
  expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
  // ...
});

test('validates required fields', async () => {
  renderWithRouter(<VehicleForm customerId={1} />);
  
  // Clear required fields
  fireEvent.change(screen.getByLabelText(/make \*/i), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText(/model \*/i), { target: { value: '' } });
  
  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
  
  // Check that validation errors are displayed
  await waitFor(() => {
    expect(screen.getByText(/make is required/i)).toBeInTheDocument();
    expect(screen.getByText(/model is required/i)).toBeInTheDocument();
  });
});

test('submits form for new vehicle', async () => {
  const onSuccessMock = jest.fn();
  (vehicleApi.create as jest.Mock).mockResolvedValue(mockVehicle);
  
  renderWithRouter(<VehicleForm customerId={1} onSuccess={onSuccessMock} />);
  
  // Fill in required fields and submit
  fireEvent.change(screen.getByLabelText(/make \*/i), { target: { value: 'Toyota' } });
  fireEvent.change(screen.getByLabelText(/model \*/i), { target: { value: 'Camry' } });
  fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
  
  // Verify API call and success callback
  await waitFor(() => {
    expect(vehicleApi.create).toHaveBeenCalledWith(expect.objectContaining({
      customerId: 1,
      make: 'Toyota',
      model: 'Camry',
    }));
    expect(onSuccessMock).toHaveBeenCalled();
  });
});
```

These tests ensure that:
1. The form renders correctly with empty fields for new vehicles
2. The form populates with existing data when editing a vehicle
3. Validation works for required fields
4. Form submission correctly calls the API for both new and existing vehicles
5. Success callbacks are triggered after successful submission

#### Test Utilities

```typescript
// Utility for rendering components with providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={['/customers/1']}>
        <Routes>
          <Route path="/customers/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};
```

### Running Tests

- Run all tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run tests for a specific component: `npm test -- --testPathPattern=ComponentName`

### Best Practices

1. **Test Component Behavior, Not Implementation**: Focus on what the component does, not how it does it.
2. **Use Semantic Queries**: Prefer queries like `getByRole`, `getByLabelText`, and `getByText` over `getByTestId`.
3. **Mock External Dependencies**: Use Jest's mocking capabilities to isolate components from external dependencies.
4. **Test User Interactions**: Simulate user interactions using `fireEvent` or `userEvent`.
5. **Handle Asynchronous Operations**: Use `waitFor` or `findBy` queries to handle asynchronous operations.
6. **Keep Tests Independent**: Each test should be independent of others and should not rely on the state from previous tests.
7. **Clean Up After Tests**: Use `afterEach` to clean up any resources created during tests.

## Backend Testing

(Backend testing documentation will be added in a future update) 