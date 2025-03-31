module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Important: Mock supabaseClient to avoid import.meta.env issues
    "^src/lib/supabaseClient$": "<rootDir>/src/lib/__mocks__/supabaseClient.ts",
    // Explicitly direct to mock using absolute paths
    "<rootDir>/src/lib/supabaseClient": "<rootDir>/src/lib/__mocks__/supabaseClient.ts",
    "../../lib/supabaseClient": "<rootDir>/src/lib/__mocks__/supabaseClient.ts",
    "../lib/supabaseClient": "<rootDir>/src/lib/__mocks__/supabaseClient.ts",
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      compiler: 'typescript',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Add transformIgnorePatterns to inform Jest to transform node_modules and specific files
  transformIgnorePatterns: [
    "node_modules/(?!(superjson|uuid|date-fns)/)",
  ],
  // Set up file mocks for Vite/import.meta compatibility
  setupFiles: ['<rootDir>/jest.setup.js'],
}; 