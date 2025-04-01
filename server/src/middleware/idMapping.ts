import { Request, Response, NextFunction } from 'express';
import { shortenId, expandId } from '../utils/idShortener';

/**
 * Middleware to handle ID conversion in routes
 * - On request: Converts shortened IDs in params to original UUIDs
 * - On response: Converts UUIDs in response to shortened IDs for URLs
 */

// Parameter names in routes that should be expanded from short ID to UUID
const ID_PARAM_NAMES = ['id', 'technicianId', 'scheduleId', 'timeOffId'];

/**
 * Middleware to expand short IDs in request params to full UUIDs
 */
export const expandIdsMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Convert IDs in route parameters
  if (req.params) {
    for (const paramName in req.params) {
      if (ID_PARAM_NAMES.includes(paramName) || paramName.endsWith('Id')) {
        req.params[paramName] = expandId(req.params[paramName]);
      }
    }
  }
  next();
};

/**
 * Middleware to convert UUIDs to short IDs in response
 * This is typically used for public-facing API endpoints
 */
export const shortenIdsMiddleware = () => {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Save the original json method
    const originalJson = res.json;
    
    // Override the json method
    res.json = function(body: any) {
      // Process the response body to convert UUIDs to short IDs
      const processedBody = shortenIdsInObject(body);
      return originalJson.call(this, processedBody);
    };
    
    next();
  };
};

/**
 * Recursively process an object to shorten all UUID fields
 */
function shortenIdsInObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => shortenIdsInObject(item));
  }
  
  // Handle objects
  const result: any = {};
  for (const key in obj) {
    // If the key is an ID field and the value matches UUID format
    if ((key === 'id' || key.endsWith('Id') || key.endsWith('_id')) && 
        typeof obj[key] === 'string' && 
        (obj[key].includes('-') || obj[key].length > 30)) {
      result[key] = shortenId(obj[key]);
    } 
    // Otherwise recursively process the value
    else {
      result[key] = shortenIdsInObject(obj[key]);
    }
  }
  
  return result;
} 