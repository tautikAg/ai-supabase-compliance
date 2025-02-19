import { SupabaseCredentials, ComplianceReport, MFAStatus, RLSStatus, PITRStatus, FixOptions } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

export class APIService {
  private static credentials: SupabaseCredentials | null = null;

  static setCredentials(creds: SupabaseCredentials): void {
    console.log('Setting credentials:', creds);
    this.credentials = creds;
  }

  private static getHeaders(): HeadersInit {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': this.credentials ? `Bearer ${this.credentials.serviceKey}` : '',
    };
    console.log('Generated headers:', headers);
    return headers;
  }

  static async verifyCredentials(credentials: SupabaseCredentials): Promise<boolean> {
    console.log('Verifying credentials:', credentials, 'to ', `${API_BASE_URL}/compliance/credentials`);
    try {
      const response = await fetch(`${API_BASE_URL}/compliance/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      console.log('Response status for verifyCredentials:', response.status);
      console.log('Response body for verifyCredentials:', await response.json());
      if (!response.ok) throw new Error('Invalid credentials');

      this.setCredentials(credentials);
      return true;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return false;
    }
  }

  static async getComplianceReport(): Promise<ComplianceReport> {
    console.log('Fetching compliance report');
    const response = await fetch(`${API_BASE_URL}/compliance/report`, {
      headers: this.getHeaders(),
    });
    console.log('Response status for getComplianceReport:', response.status);
    if (!response.ok) throw new Error('Failed to fetch compliance report');
    return response.json();
  }

  static async checkMFA(): Promise<MFAStatus> {
    console.log('Checking MFA status');
    const response = await fetch(`${API_BASE_URL}/compliance/check/mfa`, {
      headers: this.getHeaders(),
    });
    console.log('Response status for checkMFA:', response.status);
    if (!response.ok) throw new Error('Failed to check MFA status');
    return response.json();
  }

  static async checkRLS(): Promise<RLSStatus> {
    console.log('Checking RLS status');
    const response = await fetch(`${API_BASE_URL}/compliance/check/rls`, {
      headers: this.getHeaders(),
    });
    console.log('Response status for checkRLS:', response.status);
    if (!response.ok) throw new Error('Failed to check RLS status');
    return response.json();
  }

  static async checkPITR(): Promise<PITRStatus> {
    console.log('Checking PITR status');
    const response = await fetch(`${API_BASE_URL}/compliance/check/pitr`, {
      headers: this.getHeaders(),
    });
    console.log('Response status for checkPITR in the api:', response.status);
    
    if (!response.ok) throw new Error('Failed to check PITR status');
    
    const data = await response.json();
    console.log('Response body for checkPITR in the api:', data);
    return data;
  }

  static async fixIssues(options: FixOptions): Promise<{ message: string; results: Record<string, boolean> }> {
    console.log('Fixing issues with options:', options);
    const response = await fetch(`${API_BASE_URL}/compliance/fix`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options),
    });

    console.log('Response status for fixIssues:', response.status);

    if (!response.ok) throw new Error('Failed to fix compliance issues');
    return response.json();
  }
} 