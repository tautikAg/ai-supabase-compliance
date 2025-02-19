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
      const supabaseService = new SupabaseService(credentials);

      // Test connection by trying to list users
      await supabaseService.checkMFA();

      // Store the service instance in the app
      req.app.set('supabaseService', supabaseService);

      return res.status(200).json({
        message: 'Credentials verified successfully',
      });
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid credentials',
        details: error instanceof Error ? error.message : 'Unknown error',
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
      const result = await req.supabaseService!.checkPITR();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to check PITR status',
        details: error instanceof Error ? error.message : 'Unknown error',
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
}
