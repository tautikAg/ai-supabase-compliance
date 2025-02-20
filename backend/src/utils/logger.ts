import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'supabase-compliance-checker' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write compliance check results to 'compliance.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'compliance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Create log categories
export const complianceLogger = {
  info: (message: string, meta?: any) => {
    logger.info(message, { category: 'general', ...meta });
  },
  mfa: (message: string, meta?: any) => {
    logger.info(message, { category: 'mfa', ...meta });
  },
  rls: (message: string, meta?: any) => {
    logger.info(message, { category: 'rls', ...meta });
  },
  pitr: (message: string, meta?: any) => {
    logger.info(message, { category: 'pitr', ...meta });
  },
  error: (message: string, error: Error, meta?: any) => {
    logger.error(message, { error: error.stack, ...meta });
  },
};

export default logger; 