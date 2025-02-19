export interface SupabaseCredentials {
  url: string;
  serviceKey: string;
}

export interface ComplianceStatus {
  status: 'pass' | 'fail';
  details: string;
  timestamp: string;
}

export interface MFAStatus {
  status: 'pass' | 'fail';
  details: string;
  users: Array<{
    id: string;
    email: string;
    hasMFA: boolean;
  }>;
}

export interface RLSStatus {
  compliant: boolean;
  tables: Array<{
    name: string;
    hasRLS: boolean;
    policies?: string[];
  }>;
}

export interface PITRStatus {
  status: 'pass' | 'fail';
  details: string;
  projects: Array<{
    id: string;
    name: string;
    hasPITR: boolean;
  }>;
  timestamp: string;
}

export interface ComplianceReport {
  mfa: MFAStatus;
  rls: RLSStatus;
  pitr: PITRStatus;
  overallStatus: 'pass' | 'fail';
  generatedAt: string;
}

export interface FixOptions {
  enableMFA?: boolean;
  enableRLS?: boolean;
  enablePITR?: boolean;
}

export interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Credentials {
  url: string;
  key: string;
}

export interface SupabaseManagementConfig {
  managementApiKey: string;
  projectRef: string;
} 