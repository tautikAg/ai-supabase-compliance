import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseCredentials,
  MFACheckResult,
  RLSCheckResult,
  PITRCheckResult,
  ComplianceReport,
  ComplianceStatus,
} from '../types';
import { SQL_COMMANDS } from '../constants/sql-commands';
import { complianceLogger } from '../utils/logger';


export class SupabaseService {
  private client: SupabaseClient;
  private serviceKey: string;
  private managementApiKey: string;
  private url: string;

  constructor(credentials: SupabaseCredentials) {
    this.url = credentials.url;
    this.serviceKey = credentials.serviceKey;
    this.client = createClient(this.url, this.serviceKey);
    complianceLogger.mfa('Initialized SupabaseService', { url: this.url });
    this.managementApiKey = '';
  }

  async checkMFA(): Promise<MFACheckResult> {
    try {
      complianceLogger.mfa('Starting MFA compliance check');
      const { data: users, error } = await this.client.auth.admin.listUsers();
      
      if (error) {
        complianceLogger.error('Failed to fetch users for MFA check', error);
        throw error;
      }

      const usersWithMFAStatus = users.users.map(user => ({
        id: user.id,
        email: user.email || 'no-email',
        hasMFA: Boolean(user.app_metadata?.mfa_enabled)
      }));

      const allEnabled = usersWithMFAStatus.every(user => user.hasMFA);
      const status: ComplianceStatus = allEnabled ? 'pass' : 'fail';
      
      const result: MFACheckResult = {
        status,
        details: allEnabled 
          ? 'All users have MFA enabled' 
          : `${usersWithMFAStatus.filter(u => !u.hasMFA).length} users do not have MFA enabled`,
        users: usersWithMFAStatus,
        timestamp: new Date().toISOString()
      };

      complianceLogger.mfa('MFA check completed', result);
      return result;
    } catch (error) {
      complianceLogger.error('MFA check failed', error as Error);
      throw error;
    }
  }

  async checkRLS(): Promise<RLSCheckResult> {
    try {
      complianceLogger.rls('Starting RLS compliance check');
      const { data, error } = await this.client
        .rpc('get_rls_status');
      console.log('Tables data:', data);
      if (error) {
        complianceLogger.error('Failed to fetch tables for RLS check', error as Error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        complianceLogger.error('Invalid response format from get_rls_status', new Error('Invalid response format'));
        throw new Error('Invalid response format from get_rls_status');
      }

      const tablesWithStatus = data.map((table) => ({
        name: table.table_name,
        hasRLS: table.rls_enabled,
        policies: [] // Since we don't have policies in the response yet
      }));

      const allEnabled = tablesWithStatus.every(table => table.hasRLS);
      const status: ComplianceStatus = allEnabled ? 'pass' : 'fail';
      
      const result: RLSCheckResult = {
        status,
        details: allEnabled 
          ? 'All tables have RLS enabled' 
          : `${tablesWithStatus.filter(t => !t.hasRLS).length} tables do not have RLS enabled`,
        tables: tablesWithStatus,
        timestamp: new Date().toISOString()
      };

      complianceLogger.rls('RLS check completed', result);
      return result;
    } catch (error) {
      complianceLogger.error('RLS check failed', error as Error);
      throw error;
    }
  }

  async checkPITR(): Promise<PITRCheckResult> {
    try {
      complianceLogger.pitr('Starting PITR compliance check');
      
      // First check if we have management API key
      if (!this.managementApiKey) {
        throw new Error('Management API key is required for PITR check');
      }

      // Get projects using management API
      const projects = await this.listProjects();
      
      const projectsWithStatus = await Promise.all(
        projects.map(async (project) => {
          try {
            const response = await fetch(
              `https://api.supabase.com/v1/projects/${project.id}/database/backups`,
              {
                headers: this.getManagementHeaders(),
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch backup details for project ${project.name}`);
            }

            const backupDetails = await response.json();
            
            return {
              id: project.id,
              name: project.name,
              hasPITR: backupDetails.pitr_enabled || false,
              retentionPeriod: backupDetails.pitr_retention_days 
                ? `${backupDetails.pitr_retention_days} days` 
                : null
            };
          } catch (error) {
            complianceLogger.error(`Failed to check PITR for project ${project.name}`, error as Error);
            return {
              id: project.id,
              name: project.name,
              hasPITR: false,
              retentionPeriod: null
            };
          }
        })
      );

      const allEnabled = projectsWithStatus.every(project => project.hasPITR);
      const status: ComplianceStatus = allEnabled ? 'pass' : 'fail';
      
      const result: PITRCheckResult = {
        status,
        details: allEnabled 
          ? 'All projects have PITR enabled' 
          : `${projectsWithStatus.filter(p => !p.hasPITR).length} projects do not have PITR enabled`,
        projects: projectsWithStatus,
        timestamp: new Date().toISOString()
      };

      complianceLogger.pitr('PITR check completed', result);
      return result;
    } catch (error) {
      complianceLogger.error('PITR check failed', error as Error);
      throw error;
    }
  }

  async generateComplianceReport(): Promise<ComplianceReport> {
    try {
      // Run MFA and RLS checks in parallel
      const [mfaResult, rlsResult] = await Promise.all([
        this.checkMFA(),
        this.checkRLS()
      ]);

      // Try PITR check, but handle failure gracefully
      let pitrResult: PITRCheckResult;
      try {
        pitrResult = await this.checkPITR();
      } catch (error) {
        if (error instanceof Error && error.message.includes('Management API key')) {
          pitrResult = {
            status: 'fail',
            details: 'Management API key is required for PITR check',
            projects: [],
            timestamp: new Date().toISOString()
          };
        } else {
          throw error;
        }
      }

      // Calculate overall status
      const overallStatus = (mfaResult.status === 'pass' && rlsResult.status === 'pass' && pitrResult.status === 'pass') ? 'pass' : 'fail';

      return {
        mfa: mfaResult,
        rls: rlsResult,
        pitr: pitrResult,
        overallStatus,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      complianceLogger.error('Failed to generate compliance report', error as Error);
      throw error;
    }
  }

  // Methods to fix compliance issues
  async enableMFAForUser(userId: string): Promise<void> {
    try {
      // Check if user exists
      const { data, error: userError } = await this.client.auth.admin.getUserById(userId);

      if (userError || !data?.user) {
        throw new Error(`User not found: ${userError?.message || 'Unknown error'}`);
      }

      // Since we cannot programmatically enable MFA, provide instructions
      console.log(`MFA must be enabled by the user ${data.user.email} through their account settings.`);
      
      // Return success but indicate manual action required
      return Promise.resolve();
    } catch (error) {
      console.error('Error in MFA process:', error);
      throw new Error(`MFA requires manual user action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enableRLSForTable(tableName: string): Promise<void> {
    try {
      await this.client.rpc('enable_rls_for_table', { table_name: tableName });
    } catch (error) {
      throw new Error(`Failed to enable RLS for table ${tableName}: ${error}`);
    }
  }

  async enablePITRForProject(projectId: string): Promise<void> {
    try {
      // Check if management API key is available
      const managementApiKey = process.env.SUPABASE_MANAGEMENT_API_KEY;
      if (!managementApiKey) {
        throw new Error('Supabase Management API key not found. PITR requires a Management API key and a Pro/Enterprise plan.');
      }

      // Get current PITR status
      const statusResponse = await fetch(
        `https://api.supabase.com/v1/projects/${projectId}/database/backups`,
        {
          headers: {
            'Authorization': `Bearer ${managementApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Status response:', statusResponse);

      if (!statusResponse.ok) {
        const errorData = await statusResponse.text();
        throw new Error(`Failed to get PITR status: ${errorData}`);
      }

      const statusData = await statusResponse.json();
      console.log('Current PITR status data:', statusData);

      // If PITR is not enabled, we can't do a restore
      if (!statusData.pitr_enabled) {
        throw new Error('PITR is not enabled for this project. Please enable PITR from the Supabase dashboard first.');
      }

      // Set up a restore point
      const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
      const restoreResponse = await fetch(
        `https://api.supabase.com/v1/projects/${projectId}/database/backups/restore-pitr`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${managementApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recovery_time_target_unix: currentTime
          })
        }
      );
      console.log('Restore response:', restoreResponse);

      if (!restoreResponse.ok) {
        const errorData = await restoreResponse.text();
        throw new Error(`Failed to set up PITR restore point: ${errorData}`);
      }

      console.log(`Successfully set up PITR restore point for project ${projectId}`);
    } catch (error) {
      console.error('Error in PITR operation:', error);
      throw new Error(`PITR operation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Note: PITR requires a Pro/Enterprise plan and must be enabled from the Supabase dashboard.`);
    }
  }

  setManagementApiKey(key: string): void {
    if (!key) {
      throw new Error('Management API key is required');
    }
    this.managementApiKey = key;
  }

  private getManagementHeaders(): HeadersInit {
    if (!this.managementApiKey) {
      throw new Error('Management API key not configured. Please set it first.');
    }
    return {
      'Authorization': `Bearer ${this.managementApiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async listProjects(): Promise<Array<{ id: string; name: string; ref: string }>> {
    try {
      if (!this.managementApiKey) {
        throw new Error('Management API key not configured. Please set it first.');
      }

      console.log('Fetching projects from Supabase Management API');
      const projectsResponse = await fetch('https://api.supabase.com/v1/projects', {
        headers: this.getManagementHeaders(),
      });
      console.log('Projects response:', projectsResponse);

      if (!projectsResponse.ok) {
        throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
      }

      const projects = await projectsResponse.json();
      return projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        ref: project.ref
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async listFunctions(projectRef: string): Promise<any[]> {
    try {
      if (!this.managementApiKey) {
        throw new Error('Management API key not configured. Please set it first.');
      }

      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/functions`,
        {
          headers: this.getManagementHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch functions: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching functions:', error);
      throw error;
    }
  }

  async deployFunction(projectRef: string, name: string, code: string): Promise<any> {
    try {
      if (!this.managementApiKey) {
        throw new Error('Management API key not configured. Please set it first.');
      }

      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/functions`,
        {
          method: 'POST',
          headers: this.getManagementHeaders(),
          body: JSON.stringify({
            name,
            code,
            verify_jwt: true
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to deploy function: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error deploying function:', error);
      throw error;
    }
  }

  async executeSQL(projectRef: string, query: string): Promise<any> {
    try {
      if (!this.managementApiKey) {
        throw new Error('Management API key not configured. Please set it first.');
      }

      console.log('Executing SQL:', query);
      console.log('Project Ref:', projectRef);
      
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
          method: 'POST',
          headers: this.getManagementHeaders(),
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to execute SQL: ${errorData}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }

  async enableMFA(projectRef: string): Promise<void> {
    try {
      await this.executeSQL(projectRef, SQL_COMMANDS.ENABLE_MFA_FOR_USER);
      await this.executeSQL(
        projectRef,
        `DO $$ 
        DECLARE
          user_record RECORD;
        BEGIN
          FOR user_record IN SELECT id FROM auth.users
          LOOP
            PERFORM enable_mfa_for_user(user_record.id);
          END LOOP;
        END;
        $$ LANGUAGE plpgsql;`
      );
    } catch (error) {
      console.error('Error enabling MFA:', error);
      throw error;
    }
  }

  async enableRLS(projectRef: string): Promise<void> {
    try {
      await this.executeSQL(projectRef, SQL_COMMANDS.GET_ALL_TABLES);
      await this.executeSQL(projectRef, SQL_COMMANDS.ENABLE_RLS_FOR_TABLE);
      await this.executeSQL(
        projectRef,
        `DO $$ 
        DECLARE
          table_record RECORD;
        BEGIN
          FOR table_record IN SELECT table_name FROM get_all_tables()
          LOOP
            PERFORM enable_rls_for_table(table_record.table_name);
            
            -- Create default policy
            EXECUTE format(
              'CREATE POLICY "Enable access for authenticated users" ON %I
               FOR ALL
               TO authenticated
               USING (true)
               WITH CHECK (true)',
              table_record.table_name
            );
          END LOOP;
        END;
        $$ LANGUAGE plpgsql;`
      );
    } catch (error) {
      console.error('Error enabling RLS:', error);
      throw error;
    }
  }

  async enablePITR(projectRef: string): Promise<void> {
    try {
      if (!this.managementApiKey) {
        throw new Error('Management API key not configured. Please set it first.');
      }

      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/pitr`,
        {
          method: 'POST',
          headers: this.getManagementHeaders(),
          body: JSON.stringify({
            enabled: true,
            days_retention: 7
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to enable PITR: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error enabling PITR:', error);
      throw error;
    }
  }

  async runComplianceCheck(): Promise<ComplianceReport> {
    try {
      const mfa = await this.checkMFA();
      const rls = await this.checkRLS();
      const pitr = await this.checkPITR();

      // Calculate overall status
      const overallStatus = (mfa.status === 'pass' && rls.status === 'pass' && pitr.status === 'pass') ? 'pass' : 'fail';

      const report: ComplianceReport = {
        mfa,
        rls,
        pitr,
        overallStatus,
        generatedAt: new Date().toISOString()
      };

      return report;
    } catch (error) {
      complianceLogger.error('Failed to run compliance check', error as Error);
      throw error;
    }
  }
}
