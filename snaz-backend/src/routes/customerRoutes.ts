import express from 'express';
import { body } from 'express-validator';
import * as customerController from '../controllers/customerController';

const router = express.Router();

// Validation rules
const validateCustomer = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and should be 1-100 characters'),
  body('address').trim().isLength({ min: 1, max: 300 }).withMessage('Address is required and should be 1-300 characters'),
  body('phone').optional().trim().isLength({ max: 15 }).withMessage('Phone should be max 15 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('companyId').optional().isMongoId().withMessage('Valid company ID is required'),
  body('driverId').isMongoId().withMessage('Valid driver ID is required'),
  body('packages').isArray({ min: 1 }).withMessage('At least one package is required'),
  body('packages.*.categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('packages.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('billingType').optional().isIn(['individual', 'company']).withMessage('Billing type must be individual or company'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional({ values: 'falsy' }).isISO8601().withMessage('Valid end date is required')
];

// Routes
router.get('/', customerController.getAllCustomers);
router.get('/driver/:driverId', customerController.getCustomersByDriver);
router.get('/:id', customerController.getCustomerById);
router.post('/', validateCustomer, customerController.createCustomer);
router.put('/:id', validateCustomer, customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

// Daily food updates
const validateDailyFoodPatch = [
  body('lunch').optional().isString().withMessage('Lunch must be a string'),
  body('dinner').optional().isString().withMessage('Dinner must be a string'),
];

const validateBulkDailyFood = [
  body('updates').isArray({ min: 1 }).withMessage('Updates array is required'),
  body('updates.*.customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('updates.*.mealType').isIn(['lunch', 'dinner']).withMessage('mealType must be lunch or dinner'),
  body('updates.*.bagFormat').isString().withMessage('bagFormat must be a string'),
];

router.patch('/:id/daily-food', validateDailyFoodPatch, customerController.updateCustomerDailyFood);
router.patch('/bulk-update-daily-food', validateBulkDailyFood, customerController.bulkUpdateCustomerDailyFood);

export default router;
