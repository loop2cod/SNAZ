import express from 'express';
import { body } from 'express-validator';
import * as driverController from '../controllers/driverController';

const router = express.Router();

// Validation rules
const validateDriver = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and should be 1-100 characters'),
  body('phone').optional().trim().isLength({ max: 15 }).withMessage('Phone should be max 15 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('route').trim().isLength({ min: 1, max: 200 }).withMessage('Route is required and should be 1-200 characters')
];

// Routes
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', validateDriver, driverController.createDriver);
router.put('/:id', validateDriver, driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

export default router;