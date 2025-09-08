"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomersByDriver = exports.getCustomerById = exports.getAllCustomers = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
const express_validator_1 = require("express-validator");
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer_1.default.find({ isActive: true })
            .populate('driverId', 'name route')
            .populate('packages.categoryId', 'name')
            .sort({ name: 1 });
        res.json({ success: true, data: customers });
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllCustomers = getAllCustomers;
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer_1.default.findById(req.params.id)
            .populate('driverId', 'name route')
            .populate('packages.categoryId', 'name');
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: customer });
    }
    catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getCustomerById = getCustomerById;
const getCustomersByDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const customers = await Customer_1.default.find({ driverId, isActive: true })
            .populate('driverId', 'name route')
            .populate('packages.categoryId', 'name')
            .sort({ name: 1 });
        res.json({ success: true, data: customers });
    }
    catch (error) {
        console.error('Error fetching customers by driver:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getCustomersByDriver = getCustomersByDriver;
const createCustomer = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, address, phone, email, driverId, packages, dailyFood, startDate, endDate } = req.body;
        const customer = new Customer_1.default({
            name,
            address,
            phone,
            email,
            driverId,
            packages,
            dailyFood,
            startDate,
            endDate
        });
        const savedCustomer = await customer.save();
        await savedCustomer.populate('driverId', 'name route');
        await savedCustomer.populate('packages.categoryId', 'name');
        res.status(201).json({ success: true, data: savedCustomer });
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, address, phone, email, driverId, packages, dailyFood, startDate, endDate, isActive } = req.body;
        const customer = await Customer_1.default.findByIdAndUpdate(req.params.id, { name, address, phone, email, driverId, packages, dailyFood, startDate, endDate, isActive }, { new: true, runValidators: true }).populate('driverId', 'name route')
            .populate('packages.categoryId', 'name');
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: customer });
    }
    catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, message: 'Customer deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating customer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteCustomer = deleteCustomer;
//# sourceMappingURL=customerController.js.map