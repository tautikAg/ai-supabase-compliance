export interface SupabaseCredentials {
  url: string;
  serviceKey: string;
}

export interface ComplianceStatus {
  status: 'pass' | 'fail';
  details: string;
  timestamp: string;
}

export interface MFAStatus extends ComplianceStatus {
  users: {
    id: string;
    email: string;
    hasMFA: boolean;
  }[];
}

export interface RLSStatus extends ComplianceStatus {
  tables: {
    name: string;
    hasRLS: boolean;
  }[];
}

export interface PITRStatus extends ComplianceStatus {
  projects: {
    id: string;
    name: string;
    hasPITR: boolean;
  }[];
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