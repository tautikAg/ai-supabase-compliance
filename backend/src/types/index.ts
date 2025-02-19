export interface SupabaseCredentials {
  url: string;
  serviceKey: string;
}

export interface ComplianceCheckResult {
  status: 'pass' | 'fail';
  details: string;
  timestamp: string;
}

export interface MFACheckResult extends ComplianceCheckResult {
  users: {
    id: string;
    email: string;
    hasMFA: boolean;
  }[];
}

export interface RLSCheckResult extends ComplianceCheckResult {
  tables: {
    name: string;
    hasRLS: boolean;
  }[];
}

export interface PITRProject {
  id: string;
  name: string;
  hasPITR: boolean;
  retentionPeriod?: string;
  lastBackup?: string;
  storageUsed?: string;
}

export interface PITRCheckResult extends ComplianceCheckResult {
  projects: PITRProject[];
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
