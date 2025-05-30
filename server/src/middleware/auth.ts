import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/refresh-token',
  '/health'
];

/**
 * Authentication middleware for Express
 * Extracts user information from Supabase cookies and sets it on req.user
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Check if route is public and should bypass authentication
  const path = req.path;
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return next();
  }

  // Special handling for internal server-to-server requests from the agent
  if (req.headers['x-internal-request'] === 'true') {
    // For internal requests, we use custom headers to pass auth context
    const companyId = req.headers['x-company-id'];
    const userId = req.headers['x-user-id'];
    
    if (companyId && userId) {
      console.log(`[AUTH] Processing internal server request with company_id: ${companyId}, user_id: ${userId}`);
      
      // Set user data on the request object for internal requests
      (req as any).user = {
        id: userId,
        email: 'internal@glassops.io', // Placeholder for internal requests
        company_id: companyId,
        role: 'agent' // Special role for agent operations
      };
      
      return next();
    }
  }

  try {
    // Standard authentication for normal client requests
    // Get auth token from cookies or Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'No authentication token provided' 
      });
    }

    // Get user data from token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error?.message || 'Invalid token');
      return res.status(401).json({ 
        error: 'Authentication failed',
        details: error?.message || 'Invalid authentication token' 
      });
    }

    // Get the user's profile including company_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, company_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError?.message || 'Profile not found');
      return res.status(401).json({ 
        error: 'Authentication failed',
        details: 'User profile not found' 
      });
    }

    // Set user data on the request object
    (req as any).user = {
      id: user.id,
      email: user.email,
      company_id: profile.company_id,
      role: profile.role
    };

    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ 
      error: 'Authentication error',
      details: 'An error occurred during authentication'
    });
  }
}; 