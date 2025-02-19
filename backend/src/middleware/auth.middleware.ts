import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../services/supabase.service';

declare global {
  namespace Express {
    interface Request {
      supabaseService?: SupabaseService;
    }
  }
}

/**
 * Middleware to ensure Supabase service is initialized
 * This should be used after credentials have been verified
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Auth middleware executing');
  console.log('Headers:', req.headers);
  
  const supabaseService = req.app.get('supabaseService') as SupabaseService | undefined;
  console.log('Supabase service exists:', !!supabaseService);

  if (!supabaseService) {
    console.error('No Supabase service found in request');
    res.status(401).json({ error: 'Please provide credentials first' });
    return;
  }

  req.supabaseService = supabaseService;
  console.log('Supabase service attached to request');
  next();
};
