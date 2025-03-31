import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient'; // Using relative path as alias resolution might still be flaky
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  // Add login/signup functions here if needed globally, 
  // but often they are handled locally in pages.
}

// Provide a default value matching the interface shape
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext initializing");
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial auth session:", session ? "exists" : "none");
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error("Error getting initial auth session:", error);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Supabase auth state changed:', _event, session ? "session exists" : "no session");
        setSession(session);
        setUser(session?.user ?? null);
        // Ensure loading is false after the first check or subsequent changes
        if (loading) setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log("Cleaning up auth listener");
      authListener?.subscription.unsubscribe();
    };
  }, []); // Removed loading dependency to prevent potential re-initialization

  const logout = async () => {
    try {
      setLoading(true);
      console.log("Logging out user");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        // Optionally show a toast notification for logout errors
      } else {
        console.log("User logged out successfully");
      }
    } catch (e) {
      console.error("Unexpected error during logout:", e);
    } finally {
      // User and session state will be cleared by the onAuthStateChange listener
      // No need to manually set user/session to null here
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    logout,
  };

  // Don't render children until the initial session check is complete
  // This prevents flicker or showing protected content momentarily
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 