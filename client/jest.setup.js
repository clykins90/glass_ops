// Mock Vite's import.meta
if (typeof global.import === 'undefined') {
  global.import = {};
}

global.import.meta = { 
  env: {
    VITE_SUPABASE_URL: 'https://mock-supabase-url.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
    VITE_API_URL: 'http://test-api-url.com/api',
    MODE: 'test',
    BASE_URL: '/',
    DEV: false,
    PROD: false,
  }
};

// Mock browser APIs
if (typeof window !== 'undefined') {
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
}

// Add other global mocks if needed 