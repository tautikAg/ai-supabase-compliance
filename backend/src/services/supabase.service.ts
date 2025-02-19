import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  SupabaseCredentials,
  MFACheckResult,
  RLSCheckResult,
  PITRCheckResult,
  ComplianceReport,
} from '../types';

export class SupabaseService {
  private client: SupabaseClient;
  private serviceKey: string;

  constructor(credentials: SupabaseCredentials) {
    this.client = createClient(credentials.url, credentials.serviceKey);
    this.serviceKey = credentials.serviceKey;
  }

  async checkMFA(): Promise<MFACheckResult> {
    try {
      const { data: users, error } = await this.client.auth.admin.listUsers();

      if (error) throw error;

      const usersWithMFAStatus = users.users.map((user) => ({
        id: user.id,
        email: user.email || '',
        hasMFA: user.factors ? user.factors.length > 0 : false,
      }));

      const allHaveMFA = usersWithMFAStatus.every((user) => user.hasMFA);

      return {
        status: allHaveMFA ? 'pass' : 'fail',
        details: allHaveMFA ? 'All users have MFA enabled' : 'Some users do not have MFA enabled',
        users: usersWithMFAStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to check MFA status: ${error}`);
    }
  }

  async checkRLS(): Promise<RLSCheckResult> {
    console.log('Starting RLS check in SupabaseService');
    try {
      console.log('Calling get_rls_status RPC');
      const { data: tables, error } = await this.client.rpc('get_rls_status');

      if (error) {
        console.error('RPC call failed:', error);
        throw error;
      }

      console.log('Raw tables data:', tables);

      const tablesWithRLSStatus = tables.map((table: any) => ({
        name: table.table_name,
        hasRLS: table.rls_enabled,
      }));

      console.log('Processed tables data:', tablesWithRLSStatus);

      const allHaveRLS = tablesWithRLSStatus.every((table: any) => table.hasRLS);
      console.log('All tables have RLS:', allHaveRLS);

      return {
        status: allHaveRLS ? 'pass' : 'fail',
        details: allHaveRLS ? 'All tables have RLS enabled' : 'Some tables do not have RLS enabled',
        tables: tablesWithRLSStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in checkRLS:', error);
      throw new Error(`Failed to check RLS status: ${error}`);
    }
  }

  async checkPITR(): Promise<PITRCheckResult> {
    console.log('Starting PITR check');
    try {
      // Use the stored service key
      const apiKey = process.env.API_KEY;
      console.log('Using API key for Supabase Management API');

      console.log('Fetching projects from Supabase Management API');
      // Step 1: Retrieve project IDs
      const projectsResponse = await fetch('https://api.supabase.com/v1/projects', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!projectsResponse.ok) {
        throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
      }

      const projects = await projectsResponse.json();
      console.log('Retrieved projects:', projects);

      // Step 2: Check PITR status for each project
      const projectStatuses = await Promise.all(
        projects.map(async (project: { id: string; name: string }) => {
          console.log(`Checking PITR status for project ${project.name}`);
          const backupResponse = await fetch(
            `https://api.supabase.com/v1/projects/${project.id}/database/backups`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!backupResponse.ok) {
            throw new Error(
              `Failed to fetch backup details for project ${project.name}: ${backupResponse.statusText}`
            );
          }

          const backupDetails = await backupResponse.json();
          console.log(`Backup details for ${project.name}:`, backupDetails);

          return {
            id: project.id,
            name: project.name,
            hasPITR: backupDetails.pitr_enabled,
            retentionPeriod: backupDetails.pitr_retention_days ? `${backupDetails.pitr_retention_days} days` : undefined,
            lastBackup: backupDetails.last_backup_time,
            storageUsed: backupDetails.storage_usage ? `${backupDetails.storage_usage} GB` : undefined
          };
        })
      );

      console.log('All project PITR statuses:', projectStatuses);

      const allHavePITR = projectStatuses.every((project) => project.hasPITR);

      return {
        status: allHavePITR ? 'pass' : 'fail',
        details: allHavePITR
          ? 'All projects have PITR enabled'
          : 'Some projects do not have PITR enabled',
        projects: projectStatuses,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in checkPITR:', error);
      throw new Error(`Failed to check PITR status: ${error}`);
    }
  }

  async generateComplianceReport(): Promise<ComplianceReport> {
    const [mfaResult, rlsResult, pitrResult] = await Promise.all([
      this.checkMFA(),
      this.checkRLS(),
      this.checkPITR(),
    ]);

    const overallStatus =
      mfaResult.status === 'pass' && rlsResult.status === 'pass' && pitrResult.status === 'pass'
        ? 'pass'
        : 'fail';

    return {
      mfa: mfaResult,
      rls: rlsResult,
      pitr: pitrResult,
      overallStatus,
      generatedAt: new Date().toISOString(),
    };
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
}
