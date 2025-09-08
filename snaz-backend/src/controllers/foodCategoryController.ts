import { Request, Response } from 'express';
import FoodCategory from '../models/FoodCategory';
import { validationResult } from 'express-validator';

export const getAllFoodCategories = async (req: Request, res: Response) => {
  try {
    const categories = await FoodCategory.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching food categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFoodCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await FoodCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Food category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching food category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createFoodCategory = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description } = req.body;
    
    const category = new FoodCategory({
      name,
      description
    });

    const savedCategory = await category.save();
    res.status(201).json({ success: true, data: savedCategory });
  } catch (error: any) {
    console.error('Error creating food category:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Food category name already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFoodCategory = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, isActive } = req.body;
    
    const category = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Food category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error: any) {
    console.error('Error updating food category:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Food category name already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteFoodCategory = async (req: Request, res: Response) => {
  try {
    const category = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Food category not found' });
    }

    res.json({ success: true, message: 'Food category deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating food category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};