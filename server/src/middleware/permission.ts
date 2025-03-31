import { Request, Response, NextFunction } from 'express';
import { checkPermission } from '../utils/permissions';

/**
 * Middleware to check if a user has permission to access a resource
 * @param resource Resource name (e.g., 'customers')
 * @param action Action name (e.g., 'create', 'read', 'update', 'delete')
 * @returns Middleware function
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user data exists in the request
      if (!(req as any).user?.id) {
        return res.status(401).json({
          error: 'Authentication required',
          details: 'User information not found - you may need to log in again'
        });
      }

      const hasPermission = await checkPermission(
        (req as any).user.id,
        resource,
        action
      );

      if (!hasPermission) {
        console.log(`Permission denied: ${(req as any).user.id} - ${resource}:${action}`);
        return res.status(403).json({
          error: 'Permission denied',
          details: `You do not have permission to ${action} ${resource}`
        });
      }

      next();
    } catch (error: any) {
      console.error('Permission middleware error:', error.message);
      res.status(500).json({
        error: 'Permission checking error',
        details: 'An error occurred while checking permissions'
      });
    }
  };
}; 