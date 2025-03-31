import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button'; // Assuming Button component exists

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm" // Match size with other header buttons
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100" // Match styles
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" /> // Adjusted size
      ) : (
        <Sun className="h-4 w-4" /> // Adjusted size
      )}
      <span className="sr-only">Toggle theme</span> {/* Accessibility */}
    </Button>
  );
}; 