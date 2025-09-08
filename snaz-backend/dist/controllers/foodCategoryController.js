"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFoodCategory = exports.updateFoodCategory = exports.createFoodCategory = exports.getFoodCategoryById = exports.getAllFoodCategories = void 0;
const FoodCategory_1 = __importDefault(require("../models/FoodCategory"));
const express_validator_1 = require("express-validator");
const getAllFoodCategories = async (req, res) => {
    try {
        const categories = await FoodCategory_1.default.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        console.error('Error fetching food categories:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllFoodCategories = getAllFoodCategories;
const getFoodCategoryById = async (req, res) => {
    try {
        const category = await FoodCategory_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Food category not found' });
        }
        res.json({ success: true, data: category });
    }
    catch (error) {
        console.error('Error fetching food category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getFoodCategoryById = getFoodCategoryById;
const createFoodCategory = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, description } = req.body;
        const category = new FoodCategory_1.default({
            name,
            description
        });
        const savedCategory = await category.save();
        res.status(201).json({ success: true, data: savedCategory });
    }
    catch (error) {
        console.error('Error creating food category:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Food category name already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createFoodCategory = createFoodCategory;
const updateFoodCategory = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, description, isActive } = req.body;
        const category = await FoodCategory_1.default.findByIdAndUpdate(req.params.id, { name, description, isActive }, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Food category not found' });
        }
        res.json({ success: true, data: category });
    }
    catch (error) {
        console.error('Error updating food category:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Food category name already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateFoodCategory = updateFoodCategory;
const deleteFoodCategory = async (req, res) => {
    try {
        const category = await FoodCategory_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Food category not found' });
        }
        res.json({ success: true, message: 'Food category deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating food category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteFoodCategory = deleteFoodCategory;
//# sourceMappingURL=foodCategoryController.js.map