import { SupabaseCredentials, ComplianceReport, MFAStatus, RLSStatus, PITRStatus, FixOptions } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class APIService {
  private static credentials: SupabaseCredentials | null = null;

  static setCredentials(creds: SupabaseCredentials): void {
    this.credentials = creds;
  }

  static async verifyCredentials(credentials: SupabaseCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/compliance/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error('Invalid credentials');

      this.setCredentials(credentials);
      return true;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return false;
    }
  }

  static async getComplianceReport(): Promise<ComplianceReport> {
    const response = await fetch(`${API_BASE_URL}/compliance/report`);
    if (!response.ok) throw new Error('Failed to fetch compliance report');
    return response.json();
  }

  static async checkMFA(): Promise<MFAStatus> {
    const response = await fetch(`${API_BASE_URL}/compliance/check/mfa`);
    if (!response.ok) throw new Error('Failed to check MFA status');
    return response.json();
  }

  static async checkRLS(): Promise<RLSStatus> {
    const response = await fetch(`${API_BASE_URL}/compliance/check/rls`);
    if (!response.ok) throw new Error('Failed to check RLS status');
    return response.json();
  }

  static async checkPITR(): Promise<PITRStatus> {
    const response = await fetch(`${API_BASE_URL}/compliance/check/pitr`);
    if (!response.ok) throw new Error('Failed to check PITR status');
    return response.json();
  }

  static async fixIssues(options: FixOptions): Promise<{ message: string; results: Record<string, boolean> }> {
    const response = await fetch(`${API_BASE_URL}/compliance/fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) throw new Error('Failed to fix compliance issues');
    return response.json();
  }
} 