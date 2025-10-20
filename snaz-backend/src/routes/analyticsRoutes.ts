import express from 'express';
import { query, body } from 'express-validator';
import * as analyticsController from '../controllers/analyticsController';

const router = express.Router();

// Validation rules
const validateDailyAnalytics = [
  query('date').isISO8601().withMessage('Valid date is required')
];

const validateRangeAnalytics = [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required')
];

const validateCustomerMonthly = [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  query('taxRate').optional().isFloat({ min: 0, max: 1 }).withMessage('Tax rate must be between 0 and 1')
];

const validateProfitAnalysis = [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  query('costPerMeal').optional().isFloat({ min: 0 }).withMessage('Cost per meal must be a positive number')
];

const validateBagFormat = [
  body('bagFormat').trim().isLength({ min: 1 }).withMessage('Bag format is required')
];

// Routes
router.get('/dashboard', analyticsController.getDashboardData);
router.get('/daily', validateDailyAnalytics, analyticsController.getDailyAnalytics);
router.get('/range', validateRangeAnalytics, analyticsController.getRangeAnalytics);
router.get('/customer/:customerId/monthly', validateCustomerMonthly, analyticsController.getCustomerMonthlyReport);
router.get('/profit', validateProfitAnalysis, analyticsController.getProfitAnalysis);
router.post('/validate-bag-format', validateBagFormat, analyticsController.validateBagFormat);

export default router;