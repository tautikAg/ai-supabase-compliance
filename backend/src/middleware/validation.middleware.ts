import { Request, Response, NextFunction } from 'express';
import { SupabaseCredentials, FixOptions } from '../types';

/**
 * Validates Supabase credentials in the request body
 */
export const validateCredentials = (req: Request, res: Response, next: NextFunction): void => {
  const credentials = req.body as SupabaseCredentials;

  if (!credentials.url || typeof credentials.url !== 'string') {
    res.status(400).json({ error: 'Invalid or missing Supabase URL' });
    return;
  }

  if (!credentials.serviceKey || typeof credentials.serviceKey !== 'string') {
    res.status(400).json({ error: 'Invalid or missing Supabase service key' });
    return;
  }

  // Validate URL format
  try {
    new URL(credentials.url);
  } catch (error) {
    res.status(400).json({ error: 'Invalid Supabase URL format' });
    return;
  }

  next();
};

/**
 * Validates fix options in the request body
 */
export const validateFixOptions = (req: Request, res: Response, next: NextFunction): void => {
  const options = req.body as FixOptions;

  if (typeof options !== 'object' || options === null) {
    res.status(400).json({ error: 'Fix options must be an object' });
    return;
  }

  if (
    ('enableMFA' in options && typeof options.enableMFA !== 'boolean') ||
    ('enableRLS' in options && typeof options.enableRLS !== 'boolean') ||
    ('enablePITR' in options && typeof options.enablePITR !== 'boolean')
  ) {
    res.status(400).json({ error: 'Invalid fix options format' });
    return;
  }

  next();
};
