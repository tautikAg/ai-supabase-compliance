import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../services/supabase.service';
import { complianceLogger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      supabaseService?: SupabaseService;
    }
  }
}

/**
 * Middleware to ensure Supabase service is initialized
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const managementApiKey = req.headers['x-management-key'] as string;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const serviceKey = authHeader.split(' ')[1];

  try {
    // Create a new SupabaseService instance with the service key
    const supabaseService = new SupabaseService({
      url: process.env.SUPABASE_URL || '',
      serviceKey: serviceKey,
    });

    // If management API key is provided, set it
    if (managementApiKey) {
      try {
        complianceLogger.mfa(`Setting management API key for request`, { 
          keyProvided: Boolean(managementApiKey)
        });
        supabaseService.setManagementApiKey(managementApiKey);
      } catch (error) {
        complianceLogger.error('Error setting management API key', error as Error);
        return res.status(400).json({
          error: 'Invalid management API key',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    req.supabaseService = supabaseService;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid authorization token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
