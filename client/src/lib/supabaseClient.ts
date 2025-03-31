// Check if we're in a test environment before using import.meta
const isTest = typeof jest !== 'undefined';

// Use a fallback for tests
const supabaseUrl = isTest ? 'https://test-url.supabase.co' : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = isTest ? 'test-key' : import.meta.env.VITE_SUPABASE_ANON_KEY;

import { createClient } from '@supabase/supabase-js';

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 