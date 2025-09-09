import express from 'express';
import { body } from 'express-validator';
import * as companyController from '../controllers/companyController';

const router = express.Router();

// Validation rules
const validateCompany = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and should be 1-100 characters'),
  body('address').trim().isLength({ min: 1, max: 300 }).withMessage('Address is required and should be 1-300 characters'),
  body('phone').optional().trim().isLength({ max: 15 }).withMessage('Phone should be max 15 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('contactPerson').optional().trim().isLength({ max: 100 }).withMessage('Contact person should be max 100 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const validateCompanyUpdate = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and should be 1-100 characters'),
  body('address').trim().isLength({ min: 1, max: 300 }).withMessage('Address is required and should be 1-300 characters'),
  body('phone').optional().trim().isLength({ max: 15 }).withMessage('Phone should be max 15 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('contactPerson').optional().trim().isLength({ max: 100 }).withMessage('Contact person should be max 100 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// Routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.get('/:id/customers', companyController.getCompanyCustomers);
router.post('/', validateCompany, companyController.createCompany);
router.put('/:id', validateCompanyUpdate, companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

export default router;