import { Router } from 'express';
import { recordPayment, listPayments } from '../controllers/paymentController';
import { 
  recordPaymentDualBilling, 
  getPaymentAuditTrail, 
  getBillsWithDualBilling 
} from '../controllers/paymentControllerEnhanced';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Enhanced routes for dual billing
router.post('/dual-billing', authenticateToken as any, recordPaymentDualBilling as any);
router.get('/audit-trail', authenticateToken as any, getPaymentAuditTrail as any);
router.get('/bills/dual-billing', authenticateToken as any, getBillsWithDualBilling as any);

// Legacy routes (for compatibility)
router.post('/', authenticateToken as any, recordPayment as any);
router.get('/', authenticateToken as any, listPayments as any);

export default router;
