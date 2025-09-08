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
  body('driverId').isMongoId().withMessage('Valid driver ID is required'),
  body('packages').isArray({ min: 1 }).withMessage('At least one package is required'),
  body('packages.*.categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('packages.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('dailyFood.lunch').trim().isLength({ min: 1 }).withMessage('Daily lunch is required'),
  body('dailyFood.dinner').trim().isLength({ min: 1 }).withMessage('Daily dinner is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required')
];

// Routes
router.get('/', customerController.getAllCustomers);
router.get('/driver/:driverId', customerController.getCustomersByDriver);
router.get('/:id', customerController.getCustomerById);
router.post('/', validateCustomer, customerController.createCustomer);
router.put('/:id', validateCustomer, customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;