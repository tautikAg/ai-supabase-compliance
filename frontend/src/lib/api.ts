import { SupabaseCredentials, ComplianceReport, MFAStatus, RLSStatus, PITRStatus, FixOptions, SupabaseManagementConfig } from '@/types';

// Use environment variable consistently
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class APIService {
  private static credentials: SupabaseCredentials | null = null;
  private static managementConfig: SupabaseManagementConfig | null = null;

  static setCredentials(creds: SupabaseCredentials): void {
    this.credentials = creds;
  }

  static setManagementConfig(config: SupabaseManagementConfig): void {
    this.managementConfig = config;
  }

  private static getHeaders(): HeadersInit {
    if (!this.credentials) {
      throw new Error('No credentials set');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.credentials.serviceKey}`,
    };

    // Add management API key if available
    if (this.managementConfig?.managementApiKey) {
      headers['X-Management-Key'] = this.managementConfig.managementApiKey;
    }

    return headers;
  }

  private static getManagementHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.managementConfig?.managementApiKey}`,
    };
  }

  static async verifyCredentials(credentials: SupabaseCredentials): Promise<boolean> {
    console.log('Attempting to verify credentials:', {
      url: credentials.url,
      serviceKeyLength: credentials.serviceKey?.length || 0
    });

    try {
      const response = await fetch(`${API_BASE_URL}/compliance/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Credentials verification response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Credentials verification failed:', errorData);
        throw new Error(errorData.error || 'Failed to verify credentials');
      }

      const data = await response.json();
      console.log('Credentials verification successful:', data);

      // Store credentials if verification was successful
      this.credentials = credentials;
      return true;
    } catch (error: unknown) {
      console.error('Credentials verification error:', {
        name: error instanceof Error ? error.name : 'Unknown error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async getComplianceReport(): Promise<ComplianceReport> {
    const response = await fetch(`${API_BASE_URL}/compliance/report`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch compliance report');
    }

    return response.json();
  }

  static async checkMFA(): Promise<MFAStatus> {
    const response = await fetch(`${API_BASE_URL}/compliance/check/mfa`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check MFA status');
    }

    return response.json();
  }

  static async checkRLS(): Promise<RLSStatus> {
    const response = await fetch(`${API_BASE_URL}/compliance/check/rls`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check RLS status');
    }

    return response.json();
  }

  static async checkPITR(): Promise<PITRStatus> {
    // Check if management API key is configured
    if (!this.managementConfig?.managementApiKey) {
      throw new Error('MANAGEMENT_API_KEY_REQUIRED');
    }

    const response = await fetch(`${API_BASE_URL}/compliance/check/pitr`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Pass through the backend error message if available
      throw new Error(errorData.details || errorData.error || 'Failed to check PITR status');
    }

    return response.json();
  }

  static async fixIssues(options: FixOptions): Promise<{ message: string; results: Record<string, boolean> }> {
    console.log('Fixing issues with options:', options);
    const response = await fetch(`${API_BASE_URL}/compliance/fix`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options),
    });

    console.log('Response status for fixIssues:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fix compliance issues');
    }
    return response.json();
  }

  static async enableMFA(projectRef: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/compliance/fix/mfa/${projectRef}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to enable MFA');
    }
  }

  static async enableRLS(projectRef: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/compliance/fix/rls/${projectRef}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to enable RLS');
    }
  }

  static async enablePITR(projectRef: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/compliance/fix/pitr/${projectRef}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to enable PITR');
    }
  }

  static initializeFromLocalStorage(): void {
    const managementKey = localStorage.getItem('managementApiKey');
    if (managementKey) {
      this.setManagementConfig({ managementApiKey: managementKey, projectRef: '' });
      // Automatically sync with backend
      this.setManagementApiKey(managementKey).catch(console.error);
    }
  }

  static hasManagementKey(): boolean {
    return Boolean(this.managementConfig?.managementApiKey);
  }

  static async setManagementApiKey(key: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compliance/management-key`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error('Failed to set management API key');
      }

      this.setManagementConfig({ managementApiKey: key, projectRef: '' });
      localStorage.setItem('managementApiKey', key);
    } catch (error) {
      console.error('Error setting management API key:', error);
      throw error;
    }
  }

  static async listProjects(): Promise<any[]> {
    if (!this.managementConfig?.managementApiKey) {
      throw new Error('Management API key not configured. Please set it first.');
    }

    const response = await fetch(`${API_BASE_URL}/compliance/projects`, {
      headers: this.getHeaders(),
    });
    console.log('Response status for listProjects:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching projects:', errorData);
      throw new Error(errorData.error || 'Failed to fetch projects');
    }

    const data = await response.json();
    console.log('Response body for listProjects:', data);
    return data;
  }

  static async listFunctions(projectRef: string): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/compliance/projects/${projectRef}/functions`,
      {
        headers: this.getHeaders(),
      }
    );
    console.log('Response status for listFunctions:', response.status);
    console.log('Response body for listFunctions:', await response.json());

    if (!response.ok) {
      throw new Error('Failed to list functions');
    }

    return response.json();
  }

  static async deployFunction(projectRef: string, name: string, code: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/compliance/projects/${projectRef}/functions`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name, code }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to deploy function');
    }

    return response.json();
  }

  static async getAIAssistance(query: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/compliance/ai/assist`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to get AI assistance');
    }

    return response.json();
  }

  static async getAISuggestions(query: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/compliance/ai/suggest`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to get AI suggestions');
    }

    return response.json();
  }
} 