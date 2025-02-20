import { Request } from 'express';
import { SupabaseService } from '../services/supabase.service';

export interface SupabaseCredentials {
  url: string;
  serviceKey: string;
}

export type ComplianceStatus = 'pass' | 'fail';

export interface MFACheckResult {
  status: ComplianceStatus;
  details: string;
  users: Array<{
    id: string;
    email: string;
    hasMFA: boolean;
  }>;
  timestamp: string;
}

export interface RLSCheckResult {
  status: ComplianceStatus;
  details: string;
  tables: Array<{
    name: string;
    hasRLS: boolean;
    policies: Array<{
      name: string;
      command: string;
      roles: string[];
    }>;
  }>;
  timestamp: string;
}

export interface PITRProject {
  id: string;
  name: string;
  hasPITR: boolean;
  retentionPeriod?: string;
  lastBackup?: string;
  storageUsed?: string;
}

export interface PITRCheckResult {
  status: ComplianceStatus;
  details: string;
  projects: Array<{
    id: string;
    name: string;
    hasPITR: boolean;
    retentionPeriod: string | null;
  }>;
  timestamp: string;
}

export interface ComplianceReport {
  mfa: MFACheckResult;
  rls: RLSCheckResult;
  pitr: PITRCheckResult;
  overallStatus: 'pass' | 'fail';
  generatedAt: string;
}

export interface FixOptions {
  enableMFA?: boolean;
  enableRLS?: boolean;
  enablePITR?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      supabaseService?: SupabaseService;
    }
  }
}
