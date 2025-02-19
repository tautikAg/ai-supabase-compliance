import { Request, Response } from 'express';
import { SupabaseService } from '../services/supabase.service';
import { SupabaseCredentials, FixOptions } from '../types';

export class ComplianceController {
  /**
   * Verify and store Supabase credentials
   */
  async checkCredentials(req: Request, res: Response): Promise<Response> {
    try {
      const credentials: SupabaseCredentials = req.body;
      console.log('Received credentials request:', {
        url: credentials.url,
        serviceKeyLength: credentials.serviceKey?.length || 0
      });

      const supabaseService = new SupabaseService(credentials);
      console.log('Initialized SupabaseService');

      // Test connection by trying to list users
      console.log('Testing connection with MFA check...');
      await supabaseService.checkMFA();
      console.log('MFA check completed successfully');

      // Store the service instance in the app
      req.app.set('supabaseService', supabaseService);
      console.log('Service instance stored in app');

      return res.status(200).json({
        message: 'Credentials verified successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      console.error('Credentials verification failed:', {
        name: error instanceof Error ? error.name : 'Unknown error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateReport(req: Request, res: Response): Promise<Response> {
    try {
      const report = await req.supabaseService!.generateComplianceReport();
      return res.status(200).json(report);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to generate compliance report',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check MFA compliance status
   */
  async checkMFA(req: Request, res: Response): Promise<Response> {
    try {
      const result = await req.supabaseService!.checkMFA();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to check MFA status',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check RLS compliance status
   */
  async checkRLS(req: Request, res: Response): Promise<Response> {
    console.log('RLS check endpoint hit');
    try {
      console.log('Attempting to get supabaseService from request');
      if (!req.supabaseService) {
        console.error('No supabaseService found in request');
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'No Supabase service instance found',
        });
      }

      console.log('Calling checkRLS on supabaseService');
      const result = await req.supabaseService.checkRLS();
      console.log('RLS check result:', result);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to check RLS status:', error);
      return res.status(500).json({
        error: 'Failed to check RLS status',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check PITR compliance status
   */
  async checkPITR(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.supabaseService) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'No Supabase service instance found'
        });
      }

      const result = await req.supabaseService.checkPITR();
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: 'PITR check failed',
          details: error.message
        });
      }
      return res.status(500).json({
        error: 'PITR check failed',
        details: 'An unexpected error occurred'
      });
    }
  }

  /**
   * Fix compliance issues based on provided options
   */
  async fixIssues(req: Request, res: Response): Promise<Response> {
    try {
      const options: FixOptions = req.body;
      const results: { [key: string]: boolean } = {};

      if (options.enableMFA) {
        try {
          const mfaStatus = await req.supabaseService!.checkMFA();
          const usersWithoutMFA = mfaStatus.users.filter((user) => !user.hasMFA);

          for (const user of usersWithoutMFA) {
            await req.supabaseService!.enableMFAForUser(user.id);
          }
          results.mfa = true;
        } catch (error) {
          results.mfa = false;
        }
      }

      if (options.enableRLS) {
        try {
          const rlsStatus = await req.supabaseService!.checkRLS();
          const tablesWithoutRLS = rlsStatus.tables.filter((table) => !table.hasRLS);

          for (const table of tablesWithoutRLS) {
            await req.supabaseService!.enableRLSForTable(table.name);
          }
          results.rls = true;
        } catch (error) {
          results.rls = false;
        }
      }

      if (options.enablePITR) {
        try {
          const pitrStatus = await req.supabaseService!.checkPITR();
          const projectsWithoutPITR = pitrStatus.projects.filter((project) => !project.hasPITR);

          for (const project of projectsWithoutPITR) {
            await req.supabaseService!.enablePITRForProject(project.id);
          }
          results.pitr = true;
        } catch (error) {
          results.pitr = false;
        }
      }

      return res.status(200).json({
        message: 'Fix operation completed',
        results,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to fix compliance issues',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Set Supabase Management API key
   */
  async setManagementApiKey(req: Request, res: Response): Promise<Response> {
    try {
      const { managementApiKey } = req.body;
      
      if (!managementApiKey) {
        return res.status(400).json({
          error: 'Management API key is required'
        });
      }

      if (!req.supabaseService) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'No Supabase service instance found'
        });
      }

      req.supabaseService.setManagementApiKey(managementApiKey);

      return res.status(200).json({
        message: 'Management API key set successfully'
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to set management API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * List Supabase projects
   */
  async listProjects(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.supabaseService) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'No Supabase service instance found'
        });
      }

      const projects = await req.supabaseService.listProjects();
      return res.status(200).json(projects);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Management API key not configured')) {
        return res.status(400).json({
          error: 'Management API key required',
          details: 'Please set the Management API key before listing projects'
        });
      }
      return res.status(500).json({
        error: 'Failed to list projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * List functions for a project
   */
  async listFunctions(req: Request, res: Response): Promise<Response> {
    try {
      const { projectRef } = req.params;
      
      if (!projectRef) {
        return res.status(400).json({
          error: 'Project reference is required'
        });
      }

      if (!req.supabaseService) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'No Supabase service instance found'
        });
      }

      const functions = await req.supabaseService.listFunctions(projectRef);
      return res.status(200).json(functions);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Management API key not configured')) {
        return res.status(400).json({
          error: 'Management API key required',
          details: 'Please set the Management API key before listing functions'
        });
      }
      return res.status(500).json({
        error: 'Failed to list functions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Deploy a function to a project
   */
  async deployFunction(req: Request, res: Response): Promise<Response> {
    try {
      const { projectRef } = req.params;
      const { name, code } = req.body;
      
      if (!projectRef || !name || !code) {
        return res.status(400).json({
          error: 'Project reference, function name, and code are required'
        });
      }

      if (!req.supabaseService) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'No Supabase service instance found'
        });
      }

      const result = await req.supabaseService.deployFunction(projectRef, name, code);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Management API key not configured')) {
        return res.status(400).json({
          error: 'Management API key required',
          details: 'Please set the Management API key before deploying functions'
        });
      }
      return res.status(500).json({
        error: 'Failed to deploy function',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async enableMFA(req: Request, res: Response): Promise<Response> {
    try {
      const { projectRef } = req.params;
      if (!projectRef) {
        return res.status(400).json({
          error: 'Project reference is required'
        });
      }

      await req.supabaseService!.enableMFA(projectRef);
      return res.status(200).json({
        message: 'MFA enabled successfully'
      });
    } catch (error) {
      console.error('Failed to enable MFA:', error);
      return res.status(500).json({
        error: 'Failed to enable MFA',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async enableRLS(req: Request, res: Response): Promise<Response> {
    try {
      const { projectRef } = req.params;
      if (!projectRef) {
        return res.status(400).json({
          error: 'Project reference is required'
        });
      }

      await req.supabaseService!.enableRLS(projectRef);
      return res.status(200).json({
        message: 'RLS enabled successfully'
      });
    } catch (error) {
      console.error('Failed to enable RLS:', error);
      return res.status(500).json({
        error: 'Failed to enable RLS',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async enablePITR(req: Request, res: Response): Promise<Response> {
    try {
      const { projectRef } = req.params;
      if (!projectRef) {
        return res.status(400).json({
          error: 'Project reference is required'
        });
      }

      await req.supabaseService!.enablePITR(projectRef);
      return res.status(200).json({
        message: 'PITR enabled successfully'
      });
    } catch (error) {
      console.error('Failed to enable PITR:', error);
      return res.status(500).json({
        error: 'Failed to enable PITR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
