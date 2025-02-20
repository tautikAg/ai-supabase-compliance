import { Router } from 'express';
import { ComplianceController } from '../controllers/compliance.controller';
import { validateCredentials } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { AIService } from '../services/ai/ai.service';

const router = Router();
const complianceController = new ComplianceController();
const aiService = new AIService();

/**
 * @route   POST /api/compliance/credentials
 * @desc    Verify Supabase credentials
 * @access  Public
 */
router.post(
  '/credentials',
  validateCredentials,
  complianceController.checkCredentials.bind(complianceController)
);

/**
 * @route   GET /api/compliance/report
 * @desc    Generate comprehensive compliance report
 * @access  Private
 */
router.get('/report', authenticate, complianceController.generateReport.bind(complianceController));

/**
 * @route   GET /api/compliance/check/mfa
 * @desc    Check MFA compliance status
 * @access  Private
 */
router.get('/check/mfa', authenticate, complianceController.checkMFA.bind(complianceController));

/**
 * @route   GET /api/compliance/check/rls
 * @desc    Check RLS compliance status
 * @access  Private
 */
router.get('/check/rls', authenticate, complianceController.checkRLS.bind(complianceController));

/**
 * @route   GET /api/compliance/check/pitr
 * @desc    Check PITR compliance status
 * @access  Private
 */
router.get('/check/pitr', authenticate, complianceController.checkPITR.bind(complianceController));

/**
 * @route   POST /api/compliance/fix
 * @desc    Fix compliance issues
 * @access  Private
 */
router.post('/fix', authenticate, complianceController.fixIssues.bind(complianceController));

/**
 * @route   POST /api/compliance/management-key
 * @desc    Set Supabase Management API key
 * @access  Private
 */
router.post('/management-key', authenticate, complianceController.setManagementApiKey.bind(complianceController));

/**
 * @route   GET /api/compliance/projects
 * @desc    List Supabase projects
 * @access  Private
 */
router.get('/projects', authenticate, complianceController.listProjects.bind(complianceController));

/**
 * @route   GET /api/compliance/projects/:projectRef/functions
 * @desc    List functions for a project
 * @access  Private
 */
router.get('/projects/:projectRef/functions', authenticate, complianceController.listFunctions.bind(complianceController));

/**
 * @route   POST /api/compliance/projects/:projectRef/functions
 * @desc    Deploy a function to a project
 * @access  Private
 */
router.post('/projects/:projectRef/functions', authenticate, complianceController.deployFunction.bind(complianceController));

/**
 * @route   POST /api/compliance/fix/mfa/:projectRef
 * @desc    Enable MFA for a project
 * @access  Private
 */
router.post('/fix/mfa/:projectRef', authenticate, complianceController.enableMFA.bind(complianceController));

/**
 * @route   POST /api/compliance/fix/rls/:projectRef
 * @desc    Enable RLS for a project
 * @access  Private
 */
router.post('/fix/rls/:projectRef', authenticate, complianceController.enableRLS.bind(complianceController));

/**
 * @route   POST /api/compliance/fix/pitr/:projectRef
 * @desc    Enable PITR for a project
 * @access  Private
 */
router.post('/fix/pitr/:projectRef', authenticate, complianceController.enablePITR.bind(complianceController));

/**
 * @route   POST /api/compliance/ai/assist
 * @desc    Get AI assistance for compliance queries
 * @access  Private
 */
router.post('/ai/assist', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    const context = {
      mfa: await req.supabaseService?.checkMFA(),
      rls: await req.supabaseService?.checkRLS(),
      pitr: await req.supabaseService?.checkPITR()
    };
    
    const assistance = await aiService.getComplianceAssistance(query, context);
    res.json(assistance);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get AI assistance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   POST /api/compliance/ai/suggest
 * @desc    Get AI suggestions for configuration
 * @access  Private
 */
router.post('/ai/suggest', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    const currentConfig = {
      mfa: await req.supabaseService?.checkMFA(),
      rls: await req.supabaseService?.checkRLS(),
      pitr: await req.supabaseService?.checkPITR()
    };
    
    const suggestions = await aiService.getSuggestions(query, currentConfig);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get AI suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
