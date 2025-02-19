import { Router } from 'express';
import { ComplianceController } from '../controllers/compliance.controller';
import { validateCredentials } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const complianceController = new ComplianceController();

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

export default router;
