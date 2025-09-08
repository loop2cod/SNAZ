import express from 'express';
import { body } from 'express-validator';
import * as foodCategoryController from '../controllers/foodCategoryController';

const router = express.Router();

// Validation rules
const validateFoodCategory = [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name is required and should be 1-50 characters'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description should be max 200 characters')
];

// Routes
router.get('/', foodCategoryController.getAllFoodCategories);
router.get('/:id', foodCategoryController.getFoodCategoryById);
router.post('/', validateFoodCategory, foodCategoryController.createFoodCategory);
router.put('/:id', validateFoodCategory, foodCategoryController.updateFoodCategory);
router.delete('/:id', foodCategoryController.deleteFoodCategory);

export default router;